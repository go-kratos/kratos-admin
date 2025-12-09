package biz

import (
	"context"
	"time"

	"github.com/go-kratos/kit/pagination"
	"github.com/go-kratos/kratos/v2/errors"
	"github.com/go-kratos/kratos/v2/log"
)

// Admin is a Admin model.
type Admin struct {
	ID         int64
	Name       string
	Email      string
	Password   string
	Avatar     string
	Access     string
	CreateTime time.Time
	UpdateTime time.Time
}

// AdminRepo is a Greater repo.
type AdminRepo interface {
	FindByID(context.Context, int64) (*Admin, error)
	FindByName(context.Context, string) (*Admin, error)
	ListAdmins(context.Context, pagination.Range) ([]*Admin, int32, error)
	CreateAdmin(context.Context, *Admin) (*Admin, error)
	UpdateAdmin(context.Context, *Admin, []string) (*Admin, error)
	DeleteAdmin(context.Context, int64) error
}

// AdminUsecase is a Admin usecase.
type AdminUsecase struct {
	repo AdminRepo
}

// NewAdminUsecase new a Admin usecase.
func NewAdminUsecase(repo AdminRepo) *AdminUsecase {
	return &AdminUsecase{repo: repo}
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
func (uc *AdminUsecase) Logout(ctx context.Context, userID int64) error {
	user, err := uc.repo.FindByID(ctx, userID)
	if err != nil {
		return err
	}
	log.Infof("user %s logged out", user.Name)
	return nil
}

// Current returns the current logged in user.
func (uc *AdminUsecase) GetAdmin(ctx context.Context, id int64) (*Admin, error) {
	return uc.repo.FindByID(ctx, id)
}

// ListAdmins lists admin users with pagination.
func (uc *AdminUsecase) ListAdmins(ctx context.Context, pageRange pagination.Range) ([]*Admin, int32, error) {
	admins, total, err := uc.repo.ListAdmins(ctx, pageRange)
	if err != nil {
		return nil, 0, err
	}
	return admins, total, nil
}

// CreateAdmin creates a new admin user.
func (uc *AdminUsecase) CreateAdmin(ctx context.Context, admin *Admin) (*Admin, error) {
	return uc.repo.CreateAdmin(ctx, admin)
}

// UpdateAdmin updates an existing admin user.
func (uc *AdminUsecase) UpdateAdmin(ctx context.Context, admin *Admin, fields []string) (*Admin, error) {
	return uc.repo.UpdateAdmin(ctx, admin, fields)
}

// DeleteAdmin deletes an admin user by ID.
func (uc *AdminUsecase) DeleteAdmin(ctx context.Context, id int64) error {
	return uc.repo.DeleteAdmin(ctx, id)
}
