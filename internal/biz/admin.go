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
	Password   string
	Access     string
	Avatar     string
	CreateTime time.Time
	UpdateTime time.Time
}

// AdminRepo is a Greater repo.
type AdminRepo interface {
	FindByID(context.Context, int64) (*Admin, error)
	FindByName(context.Context, string) (*Admin, error)
	FindByEmail(context.Context, string) (*Admin, error)
	ListAdmins(context.Context, ...ListOption) ([]*Admin, error)
	CreateAdmin(context.Context, *Admin) (*Admin, error)
	UpdateAdmin(context.Context, *Admin) (*Admin, error)
	DeleteAdmin(context.Context, int64) error
}

// AdminUsecase is a Admin usecase.
type AdminUsecase struct {
	admin AdminRepo
}

// NewAdminUsecase new a Admin usecase.
func NewAdminUsecase(repo AdminRepo) *AdminUsecase {
	return &AdminUsecase{admin: repo}
}

// LoginByUsername logs in a user by username and password.
func (uc *AdminUsecase) LoginByUsername(ctx context.Context, username, password string) (*Admin, error) {
	user, err := uc.admin.FindByName(ctx, username)
	if err != nil {
		return nil, err
	}
	if user.Password != password {
		return nil, errors.Unauthorized("AUTH", "invalid credentials")
	}
	return user, nil
}

// LoginByEmail logs in a user by email and password.
func (uc *AdminUsecase) LoginByEmail(ctx context.Context, username, password string) (*Admin, error) {
	user, err := uc.admin.FindByEmail(ctx, username)
	if err != nil {
		return nil, err
	}
	if user.Password != password {
		return nil, errors.Unauthorized("AUTH", "invalid credentials")
	}
	return user, nil
}

// Logout logs out the current user.
func (uc *AdminUsecase) Logout(ctx context.Context, adminID int64) error {
	admin, err := uc.admin.FindByID(ctx, adminID)
	if err != nil {
		return err
	}
	log.Infof("admin %s logged out", admin.Name)
	return nil
}

// Current returns the current logged in user.
func (uc *AdminUsecase) GetAdmin(ctx context.Context, id int64) (*Admin, error) {
	return uc.admin.FindByID(ctx, id)
}

// ListAdmins lists admin users with pagination.
func (uc *AdminUsecase) ListAdmins(ctx context.Context, opts ...ListOption) ([]*Admin, error) {
	admins, err := uc.admin.ListAdmins(ctx, opts...)
	if err != nil {
		return nil, err
	}
	return admins, nil
}

// CreateAdmin creates a new admin user.
func (uc *AdminUsecase) CreateAdmin(ctx context.Context, admin *Admin) (*Admin, error) {
	return uc.admin.CreateAdmin(ctx, admin)
}

// UpdateAdmin updates an existing admin user.
func (uc *AdminUsecase) UpdateAdmin(ctx context.Context, admin *Admin) (*Admin, error) {
	return uc.admin.UpdateAdmin(ctx, admin)
}

// DeleteAdmin deletes an admin user by ID.
func (uc *AdminUsecase) DeleteAdmin(ctx context.Context, id int64) error {
	return uc.admin.DeleteAdmin(ctx, id)
}
