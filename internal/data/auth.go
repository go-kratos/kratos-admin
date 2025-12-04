package data

import (
	"context"

	"github.com/go-kratos/kratos-admin/internal/biz"
)

type authRepo struct {
	data *Data
}

// NewAuthRepo .
func NewAuthRepo(data *Data) biz.AuthRepo {
	return &authRepo{
		data: data,
	}
}

func (r *authRepo) FindByUsername(ctx context.Context, username string) (*biz.User, error) {
	return &biz.User{Name: username, Password: username}, nil
}
