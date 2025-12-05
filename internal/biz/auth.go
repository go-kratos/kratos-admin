package biz

import (
	"context"
	"time"

	"github.com/go-kratos/kratos-admin/pkg/auth"
	"github.com/go-kratos/kratos/v2/errors"
	"github.com/go-kratos/kratos/v2/log"
)

// Admin is a Admin model.
type Admin struct {
	ID         int64
	Name       string
	Email      string
	Avatar     string
	Password   string
	Access     string
	CreateTime time.Time
	UpdateTime time.Time
}

// AuthRepo is a Greater repo.
type AuthRepo interface {
	FindByName(context.Context, string) (*Admin, error)
}

// AuthUsecase is a Auth usecase.
type AuthUsecase struct {
	repo AuthRepo
}

// NewAuthUsecase new a Auth usecase.
func NewAuthUsecase(repo AuthRepo) *AuthUsecase {
	return &AuthUsecase{repo: repo}
}

// Current returns the current logged in user.
func (uc *AuthUsecase) Current(ctx context.Context) (*Admin, error) {
	a, ok := auth.FromContext(ctx)
	if !ok {
		return nil, auth.ErrUnauthorized
	}
	return uc.repo.FindByName(ctx, a.Username)
}

// Login logs in with username and password.
func (uc *AuthUsecase) Login(ctx context.Context, username, password string) (*Admin, error) {
	user, err := uc.repo.FindByName(ctx, username)
	if err != nil {
		return nil, err
	}
	// Here you would normally check the password hash
	if user.Password != password {
		return nil, errors.Unauthorized("AUTH", "invalid credentials")
	}
	return user, nil
}

// Logout logs out the current user.
func (uc *AuthUsecase) Logout(ctx context.Context) error {
	a, ok := auth.FromContext(ctx)
	if !ok {
		return auth.ErrUnauthorized
	}
	log.Infof("user %s logged out", a.Username)
	return nil
}
