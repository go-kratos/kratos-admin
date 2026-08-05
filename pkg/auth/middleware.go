package auth

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/go-kratos/kratos/v3/errors"
	"github.com/go-kratos/kratos/v3/transport"
	httpm "github.com/go-kratos/kratos/v3/transport/http"
)

// Error reasons reported by this middleware. They mirror the wire-visible names
// in api/<domain>/<version>/error_reason.proto, but are declared here so `pkg`
// does not depend on a domain's generated proto. TestReasonsMatchAPIEnum pins
// the two together so they cannot drift.
const (
	reasonUnauthenticated  = "UNAUTHENTICATED"
	reasonPermissionDenied = "PERMISSION_DENIED"
)

var (
	// noAuthPaths defines the paths that do not require authentication.
	noAuthPaths = map[string]struct{}{
		"/v1/admins/login": {},
	}
	// authSecretKey is the secret key used for signing JWT tokens.
	authSecretKey = authSecretFromEnv("KRATOS_AUTH_SECRET")
	// cookieName is the name of the cookie that stores the authorization token.
	cookieName = cookieNameFromEnv("KRATOS_AUTH_COOKIE")
	// ErrUnauthenticated indicates that the request carried no usable credential.
	ErrUnauthenticated = errors.Unauthorized(reasonUnauthenticated, "Token is invalid")
	// ErrPermissionDenied indicates that the caller lacks the required access.
	ErrPermissionDenied = errors.Forbidden(reasonPermissionDenied, "Access denied")
)

// Middleware is an authentication middleware for HTTP servers.
func Middleware() httpm.FilterFunc {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if _, ok := noAuthPaths[r.URL.Path]; ok {
				next.ServeHTTP(w, r)
				return
			}
			// This filter runs outside the kratos handler chain, so the error
			// encoder has to be invoked explicitly. Writing plain text here
			// instead would leave clients unable to read code / reason.
			cookie, err := r.Cookie(cookieName)
			if err != nil {
				httpm.DefaultErrorEncoder(w, r, ErrUnauthenticated)
				return
			}
			auth, err := ParseToken(cookie.Value, authSecretKey)
			if err != nil {
				httpm.DefaultErrorEncoder(w, r, err)
				return
			}
			ctx := NewContext(r.Context(), auth)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// SetCookie sets the login cookie in the HTTP response.
func SetCookie(ctx context.Context, userID int64, access string, expiresAt time.Time) error {
	tr, ok := transport.FromServerContext(ctx)
	if !ok {
		return fmt.Errorf("failed to get transport from context")
	}
	token, err := GenerateToken(userID, access, authSecretKey, expiresAt)
	if err != nil {
		return err
	}
	cookie := &http.Cookie{
		Name:    cookieName,
		Value:   token,
		Path:    "/",
		Expires: expiresAt,
	}
	tr.ReplyHeader().Add("Set-Cookie", cookie.String())
	return nil
}

// DeleteCookie clears the login cookie in the HTTP response.
func DeleteCookie(ctx context.Context) error {
	tr, ok := transport.FromServerContext(ctx)
	if !ok {
		return fmt.Errorf("failed to get transport from context")
	}
	expires := time.Now().AddDate(0, 0, -1)
	cookie := &http.Cookie{
		Name:    cookieName,
		Value:   "",
		Path:    "/",
		Expires: expires,
	}
	tr.ReplyHeader().Add("Set-Cookie", cookie.String())
	return nil
}
