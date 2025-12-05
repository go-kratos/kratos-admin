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

func (r *authRepo) FindByName(ctx context.Context, name string) (*biz.Admin, error) {
	return &biz.Admin{Name: name, Password: name, Access: "admin"}, nil
}
