package biz

import (
	v1 "github.com/go-kratos/kratos-admin/api/kratos/admin/v1"
	"github.com/go-kratos/kratos/v3/errors"
)

var (
	// ErrAdminNotFound error admin not found.
	ErrAdminNotFound = errors.NotFound(v1.ErrorReason_ADMIN_NOT_FOUND.String(), "admin not found")
	// ErrInvalidCredentials is returned for any failed login, regardless of
	// whether the user exists, to avoid leaking which accounts are registered.
	ErrInvalidCredentials = errors.Unauthorized(v1.ErrorReason_INVALID_CREDENTIALS.String(), "invalid credentials")
)
