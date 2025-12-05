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
		"/v1/auth/login": {},
	}
	// jwtSecretKey is the secret key used for signing JWT tokens.
	jwtSecretKey = authSecretFromEnv("KRATOS_AUTH_SECRET")
	// cookieTokenName is the name of the cookie that stores the authorization token.
	cookieTokenName = cookieNameFromEnv("KRATOS_AUTH_COOKIE")
	// ErrUnauthorized indicates that the token is invalid.
	ErrUnauthorized = errors.Unauthorized("UNAUTHORIZED", "Token is invalid")
)

// Middleware is an authentication middleware for HTTP servers.
func Middleware() httpm.FilterFunc {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if _, ok := noAuthPaths[r.URL.Path]; ok {
				next.ServeHTTP(w, r)
				return
			}
			cookie, err := r.Cookie(cookieTokenName)
			if err != nil {
				http.Error(w, "Unauthorized", http.StatusUnauthorized)
				return
			}
			auth, err := ParseToken(cookie.Value, jwtSecretKey)
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

// SetLoginCookie sets the login cookie in the HTTP response.
func SetLoginCookie(ctx context.Context, token string, expiresAt time.Time) error {
	tr, ok := transport.FromServerContext(ctx)
	if !ok {
		return fmt.Errorf("failed to get transport from context")
	}
	cookie := &http.Cookie{
		Name:    cookieTokenName,
		Value:   token,
		Path:    "/",
		Expires: expiresAt,
	}
	tr.ReplyHeader().Add("Set-Cookie", cookie.String())
	return nil
}

// SetLogoutCookie clears the login cookie in the HTTP response.
func SetLogoutCookie(ctx context.Context) error {
	tr, ok := transport.FromServerContext(ctx)
	if !ok {
		return fmt.Errorf("failed to get transport from context")
	}
	expires := time.Now().AddDate(0, 0, -1)
	cookie := &http.Cookie{
		Name:    cookieTokenName,
		Value:   "",
		Path:    "/",
		Expires: expires,
	}
	tr.ReplyHeader().Add("Set-Cookie", cookie.String())
	return nil
}
