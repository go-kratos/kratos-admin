package data

import (
	"context"

	"github.com/go-kratos/aip-go/ents"
	"github.com/go-kratos/kratos-admin/internal/biz"
	"github.com/go-kratos/kratos-admin/internal/data/ent"
	"github.com/go-kratos/kratos-admin/internal/data/ent/admin"
	"github.com/go-kratos/kratos-admin/internal/data/ent/predicate"
	"github.com/google/uuid"
)

func convertAdmin(po *ent.Admin) *biz.Admin {
	return &biz.Admin{
		ID:        po.ID,
		Name:      po.Name,
		Email:     po.Email,
		Avatar:    po.Avatar,
		Access:    po.Access,
		Password:  po.Password,
		Status:    biz.AdminStatus(po.Status),
		CreatedAt: po.CreatedAt,
		UpdatedAt: po.UpdatedAt,
	}
}

// notDeleted excludes soft-deleted rows. Every read goes through it, so a
// deleted admin is invisible above `data` without the caller opting in.
func notDeleted() predicate.Admin {
	return admin.StatusNEQ(int32(biz.AdminStatusDeleted))
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

func (r *adminRepo) FindByID(ctx context.Context, id uuid.UUID) (*biz.Admin, error) {
	po, err := r.data.db.Admin.Query().Where(admin.IDEQ(id), notDeleted()).Only(ctx)
	if err != nil {
		if ent.IsNotFound(err) {
			return nil, biz.ErrAdminNotFound
		}
		return nil, err
	}
	return convertAdmin(po), nil
}

func (r *adminRepo) FindByName(ctx context.Context, name string) (*biz.Admin, error) {
	po, err := r.data.db.Admin.Query().Where(admin.NameEQ(name), notDeleted()).Only(ctx)
	if err != nil {
		if ent.IsNotFound(err) {
			return nil, biz.ErrAdminNotFound
		}
		return nil, err
	}
	return convertAdmin(po), nil
}

func (r *adminRepo) FindByEmail(ctx context.Context, email string) (*biz.Admin, error) {
	po, err := r.data.db.Admin.Query().Where(admin.EmailEQ(email), notDeleted()).Only(ctx)
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
		Where(notDeleted(), ents.ApplyFilter(o.Filter)).
		Order(ents.ApplyOrderBy(o.OrderBy)).
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
	create := r.data.db.Admin.Create().
		SetName(admin.Name).
		SetEmail(admin.Email).
		SetAvatar(admin.Avatar).
		SetAccess(admin.Access).
		SetPassword(admin.Password)
	// An unspecified status falls through to the column default.
	if admin.Status != biz.AdminStatusUnspecified {
		create.SetStatus(int32(admin.Status))
	}
	po, err := create.Save(ctx)
	if err != nil {
		return nil, err
	}
	return convertAdmin(po), nil
}

func (r *adminRepo) UpdateAdmin(ctx context.Context, admin *biz.Admin) (*biz.Admin, error) {
	update := r.data.db.Admin.UpdateOneID(admin.ID).
		Where(notDeleted()).
		SetName(admin.Name).
		SetEmail(admin.Email).
		SetAccess(admin.Access).
		SetAvatar(admin.Avatar)
	// Only update the password if it's not empty
	if admin.Password != "" {
		update.SetPassword(admin.Password)
	}
	// An unspecified status leaves the stored one unchanged.
	if admin.Status != biz.AdminStatusUnspecified {
		update.SetStatus(int32(admin.Status))
	}
	po, err := update.Save(ctx)
	if err != nil {
		if ent.IsNotFound(err) {
			return nil, biz.ErrAdminNotFound
		}
		return nil, err
	}
	return convertAdmin(po), nil
}

// DeleteAdmin soft-deletes the row: the record stays in storage with a
// DELETED status, which every read in this repo filters out.
func (r *adminRepo) DeleteAdmin(ctx context.Context, id uuid.UUID) error {
	err := r.data.db.Admin.UpdateOneID(id).
		Where(notDeleted()).
		SetStatus(int32(biz.AdminStatusDeleted)).
		Exec(ctx)
	if ent.IsNotFound(err) {
		return biz.ErrAdminNotFound
	}
	return err
}
