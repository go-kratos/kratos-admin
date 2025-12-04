package biz

import (
	"context"

	"github.com/go-kratos/kratos/v2/errors"
)

// User is a User model.
type User struct {
	ID       int64
	Name     string
	Email    string
	Avatar   string
	Password string
}

// AuthRepo is a Greater repo.
type AuthRepo interface {
	FindByUsername(context.Context, string) (*User, error)
}

// AuthUsecase is a Auth usecase.
type AuthUsecase struct {
	repo AuthRepo
}

// NewAuthUsecase new a Auth usecase.
func NewAuthUsecase(repo AuthRepo) *AuthUsecase {
	return &AuthUsecase{repo: repo}
}

func (uc *AuthUsecase) Login(ctx context.Context, username, password string) (*User, error) {
	user, err := uc.repo.FindByUsername(ctx, username)
	if err != nil {
		return nil, err
	}
	// Here you would normally check the password hash
	if user.Password != password {
		return nil, errors.Unauthorized("AUTH", "invalid credentials")
	}
	return user, nil
}
