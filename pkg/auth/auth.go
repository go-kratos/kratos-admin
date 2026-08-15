package auth

import (
	"context"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

// Auth user auth.
type Auth struct {
	UserID uuid.UUID `json:"id"`
	Access string    `json:"access"`
	jwt.RegisteredClaims
}

// HasAdminAccess checks if the user has admin access.
func (a *Auth) HasAdminAccess() bool {
	return a.Access == "admin"
}

type authKey struct{}

// NewContext returns a new Context that carries value.
func NewContext(ctx context.Context, auth *Auth) context.Context {
	return context.WithValue(ctx, authKey{}, auth)
}

// FromContext returns the Auth value stored in ctx, if any.
func FromContext(ctx context.Context) (auth *Auth, ok bool) {
	auth, ok = ctx.Value(authKey{}).(*Auth)
	return
}
