package data

import (
	"context"
	"time"

	"github.com/go-kratos/kit/pagination"
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

// NewAdminRepo .
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

func (r *adminRepo) ListAdmins(ctx context.Context, pageRange pagination.Range) ([]*biz.Admin, int32, error) {
	pos, err := r.data.db.Admin.Query().
		Offset(int(pageRange.Offset)).
		Limit(int(pageRange.Limit)).
		All(ctx)
	if err != nil {
		return nil, 0, err
	}
	total, err := r.data.db.Admin.Query().Count(ctx)
	if err != nil {
		return nil, 0, err
	}
	var admins []*biz.Admin
	for _, po := range pos {
		admins = append(admins, convertAdmin(po))
	}
	return admins, int32(total), nil
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

func (r *adminRepo) UpdateAdmin(ctx context.Context, admin *biz.Admin, fields []string) (*biz.Admin, error) {
	update := r.data.db.Admin.UpdateOneID(admin.ID).SetUpdateTime(time.Now())
	for _, field := range fields {
		switch field {
		case "name":
			update.SetName(admin.Name)
		case "email":
			update.SetEmail(admin.Email)
		case "avatar":
			update.SetAvatar(admin.Avatar)
		case "access":
			update.SetAccess(admin.Access)
		case "password":
			update.SetPassword(admin.Password)
		}
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
