package data

import (
	"context"
	"time"

	"github.com/go-kratos/kit/container/maps"
	"github.com/go-kratos/kit/pagination"
	"github.com/go-kratos/kratos-admin/internal/biz"
)

type adminRepo struct {
	data  *Data
	store *maps.Map[int64, *biz.Admin]
}

// NewAdminRepo .
func NewAdminRepo(data *Data) biz.AdminRepo {
	return &adminRepo{
		data: data,
		store: maps.New(map[int64]*biz.Admin{
			1: {
				ID:         1,
				Name:       "user",
				Access:     "user",
				CreateTime: time.Now(),
				UpdateTime: time.Now(),
			},
			2: {
				ID:         2,
				Name:       "admin",
				Access:     "admin",
				CreateTime: time.Now(),
				UpdateTime: time.Now(),
			},
		}),
	}
}

func (r *adminRepo) FindByID(ctx context.Context, id int64) (*biz.Admin, error) {
	admin, ok := r.store.Load(id)
	if !ok {
		return nil, biz.ErrAdminNotFound
	}
	return admin, nil
}

func (r *adminRepo) FindByName(ctx context.Context, name string) (*biz.Admin, error) {
	var res *biz.Admin
	r.store.Range(func(key int64, admin *biz.Admin) bool {
		if admin.Name == name {
			res = admin
			return false
		}
		return true
	})
	if res == nil {
		return nil, biz.ErrAdminNotFound
	}
	return res, nil
}

func (r *adminRepo) ListAdmins(ctx context.Context, pageRange pagination.Range) ([]*biz.Admin, int32, error) {
	var admins []*biz.Admin
	r.store.Range(func(key int64, admin *biz.Admin) bool {
		admins = append(admins, admin)
		return true
	})
	total := int32(len(admins))
	start := pageRange.Offset
	end := start + pageRange.Limit
	if end > total {
		end = total
	}
	return admins[start:end], total, nil
}

func (r *adminRepo) CreateAdmin(ctx context.Context, admin *biz.Admin) (*biz.Admin, error) {
	admin.ID = time.Now().Unix()
	r.store.Store(admin.ID, admin)
	return admin, nil
}

func (r *adminRepo) UpdateAdmin(ctx context.Context, admin *biz.Admin, fields []string) (*biz.Admin, error) {
	r.store.Store(admin.ID, admin)
	return admin, nil
}

func (r *adminRepo) DeleteAdmin(ctx context.Context, id int64) error {
	r.store.Delete(id)
	return nil
}
