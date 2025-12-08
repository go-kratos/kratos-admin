package biz

import "github.com/go-kratos/kratos/v2/errors"

var (
	// ErrAdminNotFound error admin not found.
	ErrAdminNotFound = errors.NotFound("ADMIN", "admin not found")
)
