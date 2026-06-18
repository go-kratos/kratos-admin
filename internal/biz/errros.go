package biz

import "github.com/go-kratos/kratos/v3/errors"

var (
	// ErrAdminNotFound error admin not found.
	ErrAdminNotFound = errors.NotFound("ADMIN", "admin not found")
)
