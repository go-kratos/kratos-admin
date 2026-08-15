package auth

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	v1 "github.com/go-kratos/kratos-admin/api/kratos/admin/v1"
	"github.com/google/uuid"
)

// errorBody mirrors the wire shape of kratos errors.Status.
type errorBody struct {
	Code    int32  `json:"code"`
	Reason  string `json:"reason"`
	Message string `json:"message"`
}

// serve runs the middleware over a handler that records whether it was reached.
func serve(t *testing.T, req *http.Request) (*httptest.ResponseRecorder, bool) {
	t.Helper()
	reached := false
	handler := Middleware()(http.HandlerFunc(func(http.ResponseWriter, *http.Request) {
		reached = true
	}))
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)
	return rec, reached
}

// The middleware runs outside the kratos handler chain, so it has to invoke the
// error encoder itself. These tests pin the body down as structured protojson:
// writing plain text here would leave clients unable to read code / reason.
func TestMiddlewareRejectsMissingCookie(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/v1/admins/current", nil)
	req.Header.Set("Accept", "application/protojson")

	rec, reached := serve(t, req)

	if reached {
		t.Fatal("handler was reached without a credential")
	}
	if rec.Code != http.StatusUnauthorized {
		t.Fatalf("status = %d, want %d", rec.Code, http.StatusUnauthorized)
	}
	if ct := rec.Header().Get("Content-Type"); ct != "application/protojson" {
		t.Fatalf("Content-Type = %q, want application/protojson", ct)
	}
	var body errorBody
	if err := json.Unmarshal(rec.Body.Bytes(), &body); err != nil {
		t.Fatalf("body is not JSON (%v): %s", err, rec.Body.String())
	}
	if body.Code != http.StatusUnauthorized {
		t.Errorf("body code = %d, want %d", body.Code, http.StatusUnauthorized)
	}
	if want := v1.ErrorReason_UNAUTHENTICATED.String(); body.Reason != want {
		t.Errorf("body reason = %q, want %q", body.Reason, want)
	}
}

func TestMiddlewareRejectsInvalidToken(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/v1/admins/current", nil)
	req.Header.Set("Accept", "application/protojson")
	req.AddCookie(&http.Cookie{Name: cookieName, Value: "not-a-jwt"})

	rec, reached := serve(t, req)

	if reached {
		t.Fatal("handler was reached with an invalid token")
	}
	if rec.Code != http.StatusUnauthorized {
		t.Fatalf("status = %d, want %d", rec.Code, http.StatusUnauthorized)
	}
	if ct := rec.Header().Get("Content-Type"); ct != "application/protojson" {
		t.Fatalf("Content-Type = %q, want application/protojson", ct)
	}
	var body errorBody
	if err := json.Unmarshal(rec.Body.Bytes(), &body); err != nil {
		t.Fatalf("body is not JSON (%v): %s", err, rec.Body.String())
	}
	if body.Code != http.StatusUnauthorized {
		t.Errorf("body code = %d, want %d", body.Code, http.StatusUnauthorized)
	}
	if want := v1.ErrorReason_UNAUTHENTICATED.String(); body.Reason != want {
		t.Errorf("body reason = %q, want %q", body.Reason, want)
	}
}

// The reason constants in this package are declared locally so `pkg` stays free
// of any domain's generated proto. That freedom is only safe if the two stay in
// step, which is what this test enforces.
func TestReasonsMatchAPIEnum(t *testing.T) {
	if want := v1.ErrorReason_UNAUTHENTICATED.String(); reasonUnauthenticated != want {
		t.Errorf("reasonUnauthenticated = %q, want %q", reasonUnauthenticated, want)
	}
	if want := v1.ErrorReason_PERMISSION_DENIED.String(); reasonPermissionDenied != want {
		t.Errorf("reasonPermissionDenied = %q, want %q", reasonPermissionDenied, want)
	}
}

func TestMiddlewareAllowsValidToken(t *testing.T) {
	token, err := GenerateToken(uuid.New(), "admin", authSecretKey, time.Now().Add(time.Hour))
	if err != nil {
		t.Fatalf("GenerateToken: %v", err)
	}
	req := httptest.NewRequest(http.MethodGet, "/v1/admins/current", nil)
	req.AddCookie(&http.Cookie{Name: cookieName, Value: token})

	rec, reached := serve(t, req)

	if !reached {
		t.Fatalf("handler was not reached, status = %d body = %s", rec.Code, rec.Body.String())
	}
}

func TestMiddlewareSkipsNoAuthPaths(t *testing.T) {
	req := httptest.NewRequest(http.MethodPost, "/v1/admins/login", nil)

	_, reached := serve(t, req)

	if !reached {
		t.Fatal("login path should not require authentication")
	}
}
