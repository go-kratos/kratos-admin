package data

import (
	"context"
	"time"

	"github.com/go-kratos/kit/container/maps"
	"github.com/go-kratos/kratos-admin/internal/biz"
)

type adminRepo struct {
	data  *Data
	store *maps.Map[string, *biz.Admin]
}

// NewAdminRepo .
func NewAdminRepo(data *Data) biz.AdminRepo {
	return &adminRepo{
		data: data,
		store: maps.New(map[string]*biz.Admin{
			"user": {
				ID:         2,
				Name:       "user",
				Access:     "user",
				CreateTime: time.Now(),
				UpdateTime: time.Now(),
			},
			"admin": {
				ID:         1,
				Name:       "admin",
				Access:     "admin",
				CreateTime: time.Now(),
				UpdateTime: time.Now(),
			},
		}),
	}
}

func (r *adminRepo) FindByName(ctx context.Context, name string) (*biz.Admin, error) {
	admin, ok := r.store.Load(name)
	if !ok {
		return nil, biz.ErrAdminNotFound
	}
	return admin, nil
}
