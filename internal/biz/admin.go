package biz

import (
	"context"
	"time"

	"github.com/go-kratos/kratos/v2/errors"
	"github.com/go-kratos/kratos/v2/log"
)

// Admin is a Admin model.
type Admin struct {
	ID         int64
	Name       string
	Email      string
	Avatar     string
	Access     string
	CreateTime time.Time
	UpdateTime time.Time
}

// AdminRepo is a Greater repo.
type AdminRepo interface {
	FindByName(context.Context, string) (*Admin, error)
}

// AdminUsecase is a Admin usecase.
type AdminUsecase struct {
	repo AdminRepo
}

// NewAdminUsecase new a Admin usecase.
func NewAdminUsecase(repo AdminRepo) *AdminUsecase {
	return &AdminUsecase{repo: repo}
}

// Current returns the current logged in user.
func (uc *AdminUsecase) GetAdmin(ctx context.Context, username string) (*Admin, error) {
	return uc.repo.FindByName(ctx, username)
}

// Login logs in with username and password.
func (uc *AdminUsecase) Login(ctx context.Context, username, password string) (*Admin, error) {
	user, err := uc.repo.FindByName(ctx, username)
	if err != nil {
		return nil, err
	}
	// Here you would normally check the password hash
	if user.Name != password {
		return nil, errors.Unauthorized("AUTH", "invalid credentials")
	}
	return user, nil
}

// Logout logs out the current user.
func (uc *AdminUsecase) Logout(ctx context.Context, username string) error {
	log.Infof("user %s logged out", username)
	return nil
}
