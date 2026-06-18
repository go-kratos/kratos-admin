package biz

import (
	"context"
	"time"

	"github.com/go-kratos/kratos/v3/errors"
	"github.com/go-kratos/kratos/v3/log"
	"golang.org/x/crypto/bcrypt"
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

// errInvalidCredentials is returned for any failed login, regardless of
// whether the user exists, to avoid leaking which accounts are registered.
var errInvalidCredentials = errors.Unauthorized("AUTH", "invalid credentials")

// dummyHash is a valid bcrypt hash compared against when the user is not
// found, so that the failure path costs the same as a real password check
// and does not expose a timing side channel.
const dummyHash = "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"

// login finds an admin via the given finder and verifies the password.
// It returns the same opaque error for "not found" and "wrong password".
func (uc *AdminUsecase) login(
	ctx context.Context,
	find func(context.Context, string) (*Admin, error),
	identity, password string,
) (*Admin, error) {
	user, err := find(ctx, identity)
	if err != nil {
		if errors.Is(err, ErrAdminNotFound) {
			// Spend the same work as a real comparison, then fail uniformly.
			_ = bcrypt.CompareHashAndPassword([]byte(dummyHash), []byte(password))
			return nil, errInvalidCredentials
		}
		return nil, err
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		return nil, errInvalidCredentials
	}
	return user, nil
}

// LoginByUsername logs in a user by username and password.
func (uc *AdminUsecase) LoginByUsername(ctx context.Context, username, password string) (*Admin, error) {
	return uc.login(ctx, uc.admin.FindByName, username, password)
}

// LoginByEmail logs in a user by email and password.
func (uc *AdminUsecase) LoginByEmail(ctx context.Context, email, password string) (*Admin, error) {
	return uc.login(ctx, uc.admin.FindByEmail, email, password)
}

// Logout logs out the current user.
func (uc *AdminUsecase) Logout(ctx context.Context, adminID int64) error {
	admin, err := uc.admin.FindByID(ctx, adminID)
	if err != nil {
		return err
	}
	log.InfoContext(ctx, "admin logged out", "name", admin.Name)
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
	if admin.Password != "" {
		hashed, err := hashPassword(admin.Password)
		if err != nil {
			return nil, err
		}
		admin.Password = hashed
	}
	return uc.admin.CreateAdmin(ctx, admin)
}

// UpdateAdmin updates an existing admin user.
func (uc *AdminUsecase) UpdateAdmin(ctx context.Context, admin *Admin) (*Admin, error) {
	// Empty password means "leave unchanged"; only hash when a new one is set.
	if admin.Password != "" {
		hashed, err := hashPassword(admin.Password)
		if err != nil {
			return nil, err
		}
		admin.Password = hashed
	}
	return uc.admin.UpdateAdmin(ctx, admin)
}

// hashPassword hashes a plaintext password using bcrypt.
func hashPassword(password string) (string, error) {
	hashed, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hashed), nil
}

// DeleteAdmin deletes an admin user by ID.
func (uc *AdminUsecase) DeleteAdmin(ctx context.Context, id int64) error {
	return uc.admin.DeleteAdmin(ctx, id)
}
