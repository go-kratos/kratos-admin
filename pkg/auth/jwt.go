package auth

import (
	"time"

	"github.com/go-kratos/kratos/v2/errors"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

var (
	// ErrUnauthorized indicates that the token is invalid.
	ErrUnauthorized = errors.Unauthorized("UNAUTHORIZED", "Token is invalid")
)

// GenerateToken generates a JWT token for the given username.
func GenerateToken(username, secret string) (string, error) {
	now := time.Now()
	claims := Auth{
		Username: username,
		RegisteredClaims: jwt.RegisteredClaims{
			ID:        uuid.NewString(),
			Issuer:    "kratos",
			Subject:   username,
			Audience:  []string{"admin"},
			IssuedAt:  jwt.NewNumericDate(now),
			NotBefore: jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(7 * 24 * time.Hour)),
		},
	}
	tokenStr, err := jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString(secret)
	if err != nil {
		return "", err
	}
	return tokenStr, nil
}

// ParseToken parses the JWT token string and returns the Auth claims.
func ParseToken(tokenStr, secret string) (*Auth, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &Auth{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(secret), nil
	})
	if err != nil {
		return nil, err
	}
	if !token.Valid {
		return nil, ErrUnauthorized
	}
	auth, ok := token.Claims.(*Auth)
	if !ok {
		return nil, ErrUnauthorized
	}
	return auth, nil
}
