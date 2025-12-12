package auth

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/go-kratos/kratos/v2/errors"
	"github.com/go-kratos/kratos/v2/transport"
	httpm "github.com/go-kratos/kratos/v2/transport/http"
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
	// ErrUnauthorized indicates that the token is invalid.
	ErrUnauthorized = errors.Unauthorized("UNAUTHORIZED", "Token is invalid")
	// ErrForbidden indicates that access is denied.
	ErrForbidden = errors.Forbidden("FORBIDDEN", "Access denied")
)

// Middleware is an authentication middleware for HTTP servers.
func Middleware() httpm.FilterFunc {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if _, ok := noAuthPaths[r.URL.Path]; ok {
				next.ServeHTTP(w, r)
				return
			}
			cookie, err := r.Cookie(cookieName)
			if err != nil {
				http.Error(w, "Unauthorized", http.StatusUnauthorized)
				return
			}
			auth, err := ParseToken(cookie.Value, authSecretKey)
			if err != nil {
				ec := errors.FromError(err)
				http.Error(w, ec.Message, int(ec.Code))
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
