package data

import (
	"context"
	"time"

	"github.com/go-kratos/kratos-admin/internal/biz"
	"github.com/go-kratos/kratos-admin/internal/data/ent"
	"github.com/go-kratos/kratos-admin/internal/data/ent/admin"
)

func convertAdmin(po *ent.Admin) *biz.Admin {
	return &biz.Admin{
		ID:         po.ID,
		Name:       po.Name,
		Email:      po.Email,
		Avatar:     po.Avatar,
		Access:     po.Access,
		Password:   po.Password,
		CreateTime: po.CreateTime,
		UpdateTime: po.UpdateTime,
	}
}

type adminRepo struct {
	data *Data
}

// NewAdminRepo creates a new AdminRepo instance.
func NewAdminRepo(data *Data) biz.AdminRepo {
	return &adminRepo{
		data: data,
	}
}

func (r *adminRepo) FindByID(ctx context.Context, id int64) (*biz.Admin, error) {
	po, err := r.data.db.Admin.Get(ctx, id)
	if err != nil {
		if ent.IsNotFound(err) {
			return nil, biz.ErrAdminNotFound
		}
		return nil, err
	}
	return convertAdmin(po), nil
}

func (r *adminRepo) FindByName(ctx context.Context, name string) (*biz.Admin, error) {
	po, err := r.data.db.Admin.Query().Where(admin.NameEQ(name)).Only(ctx)
	if err != nil {
		if ent.IsNotFound(err) {
			return nil, biz.ErrAdminNotFound
		}
		return nil, err
	}
	return convertAdmin(po), nil
}

func (r *adminRepo) ListAdmins(ctx context.Context, opts ...biz.ListOption) ([]*biz.Admin, error) {
	o := biz.ListOptions{Limit: 20}
	for _, opt := range opts {
		opt(&o)
	}
	pos, err := r.data.db.Admin.Query().
		Where(QueryBy(o.Filter)).
		Order(OrderBy(o.OrderBy)).
		Offset(o.Offset).
		Limit(o.Limit).
		All(ctx)
	if err != nil {
		return nil, err
	}
	var admins []*biz.Admin
	for _, po := range pos {
		admins = append(admins, convertAdmin(po))
	}
	return admins, nil
}

func (r *adminRepo) CreateAdmin(ctx context.Context, admin *biz.Admin) (*biz.Admin, error) {
	po, err := r.data.db.Admin.Create().
		SetName(admin.Name).
		SetEmail(admin.Email).
		SetAvatar(admin.Avatar).
		SetAccess(admin.Access).
		SetPassword(admin.Password).
		SetCreateTime(time.Now()).
		SetUpdateTime(time.Now()).
		Save(ctx)
	if err != nil {
		return nil, err
	}
	return convertAdmin(po), nil
}

func (r *adminRepo) UpdateAdmin(ctx context.Context, admin *biz.Admin) (*biz.Admin, error) {
	update := r.data.db.Admin.UpdateOneID(admin.ID).
		SetName(admin.Name).
		SetEmail(admin.Email).
		SetAvatar(admin.Avatar).
		SetAccess(admin.Access).
		SetPassword(admin.Password).
		SetUpdateTime(time.Now())
	// Only update the password if it's not empty
	if admin.Password != "" {
		update.SetPassword(admin.Password)
	}
	po, err := update.Save(ctx)
	if err != nil {
		return nil, err
	}
	return convertAdmin(po), nil
}

func (r *adminRepo) DeleteAdmin(ctx context.Context, id int64) error {
	return r.data.db.Admin.DeleteOneID(id).Exec(ctx)
}
