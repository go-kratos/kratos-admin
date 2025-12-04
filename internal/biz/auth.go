package biz

import (
	"context"
)

// Auth is a Auth model.
type Auth struct {
	Username string
	Password string
}

// AuthRepo is a Greater repo.
type AuthRepo interface {
	FindByUsername(context.Context, string) (*Auth, error)
}

// AuthUsecase is a Auth usecase.
type AuthUsecase struct {
	repo AuthRepo
}

// NewAuthUsecase new a Auth usecase.
func NewAuthUsecase(repo AuthRepo) *AuthUsecase {
	return &AuthUsecase{repo: repo}
}
