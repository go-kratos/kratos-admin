package service

import (
	"context"
	"time"

	v1 "github.com/go-kratos/kratos-admin/api/kratos/admin/v1"
	"github.com/go-kratos/kratos-admin/internal/biz"
	"github.com/go-kratos/kratos-admin/pkg/auth"

	"go.einride.tech/aip/fieldmask"
	"go.einride.tech/aip/filtering"
	"go.einride.tech/aip/ordering"
	"go.einride.tech/aip/pagination"
	"google.golang.org/protobuf/types/known/emptypb"
	"google.golang.org/protobuf/types/known/timestamppb"
)

func convertAdmin(m *biz.Admin) *v1.Admin {
	return &v1.Admin{
		Id:         m.ID,
		Name:       m.Name,
		Email:      m.Email,
		Avatar:     m.Avatar,
		Access:     m.Access,
		CreateTime: timestamppb.New(m.CreateTime),
		UpdateTime: timestamppb.New(m.UpdateTime),
	}
}

// AdminService is a greeter service.
type AdminService struct {
	v1.UnimplementedAdminServiceServer

	uc *biz.AdminUsecase
}

// NewAdminService new a greeter service.
func NewAdminService(uc *biz.AdminUsecase) *AdminService {
	return &AdminService{uc: uc}
}

func (s *AdminService) Current(ctx context.Context, req *emptypb.Empty) (*v1.Admin, error) {
	a, ok := auth.FromContext(ctx)
	if !ok {
		return nil, auth.ErrUnauthorized
	}
	admin, err := s.uc.GetAdmin(ctx, a.UserID)
	if err != nil {
		return nil, err
	}
	return convertAdmin(admin), nil
}

// Login implements auth login.
func (s *AdminService) Login(ctx context.Context, req *v1.LoginRequest) (*v1.Admin, error) {
	admin, err := s.uc.Login(ctx, req.Username, req.Password)
	if err != nil {
		return nil, err
	}
	if err := auth.SetLoginCookie(ctx, admin.ID, admin.Access, time.Now().Add(7*24*time.Hour)); err != nil {
		return nil, err
	}
	return convertAdmin(admin), nil
}

// Logout implements auth logout.
func (s *AdminService) Logout(ctx context.Context, req *emptypb.Empty) (*emptypb.Empty, error) {
	a, ok := auth.FromContext(ctx)
	if !ok {
		return nil, auth.ErrUnauthorized
	}
	if err := s.uc.Logout(ctx, a.UserID); err != nil {
		return nil, err
	}
	if err := auth.SetLogoutCookie(ctx); err != nil {
		return nil, err
	}
	return &emptypb.Empty{}, nil
}

// CreateAdmin implements admin creation.
func (s *AdminService) CreateAdmin(ctx context.Context, req *v1.CreateAdminRequest) (*v1.Admin, error) {
	a, ok := auth.FromContext(ctx)
	if !ok {
		return nil, auth.ErrUnauthorized
	}
	if !a.HasAdminAccess() {
		return nil, auth.ErrForbidden
	}
	admin, err := s.uc.CreateAdmin(ctx, &biz.Admin{
		Name:     req.Admin.Name,
		Email:    req.Admin.Email,
		Password: req.Admin.Password,
		Avatar:   req.Admin.Avatar,
		Access:   req.Admin.Access,
	})
	if err != nil {
		return nil, err
	}
	return convertAdmin(admin), nil
}

// UpdateAdmin implements admin update.
func (s *AdminService) UpdateAdmin(ctx context.Context, req *v1.UpdateAdminRequest) (*v1.Admin, error) {
	a, ok := auth.FromContext(ctx)
	if !ok {
		return nil, auth.ErrUnauthorized
	}
	if !a.HasAdminAccess() {
		return nil, auth.ErrForbidden
	}
	admin, err := s.GetAdmin(ctx, &v1.GetAdminRequest{Id: a.UserID})
	if err != nil {
		return nil, err
	}
	fieldmask.Update(req.UpdateMask, admin, req.Admin)
	updated, err := s.uc.UpdateAdmin(ctx, &biz.Admin{
		ID:       admin.Id,
		Name:     admin.Name,
		Email:    admin.Email,
		Password: admin.Password,
		Avatar:   admin.Avatar,
		Access:   admin.Access,
	})
	if err != nil {
		return nil, err
	}
	return convertAdmin(updated), nil
}

func (s *AdminService) DeleteAdmin(ctx context.Context, req *v1.DeleteAdminRequest) (*emptypb.Empty, error) {
	a, ok := auth.FromContext(ctx)
	if !ok {
		return nil, auth.ErrUnauthorized
	}
	if !a.HasAdminAccess() {
		return nil, auth.ErrForbidden
	}
	if err := s.uc.DeleteAdmin(ctx, req.Id); err != nil {
		return nil, err
	}
	return &emptypb.Empty{}, nil
}

// GetAdmin implements admin retrieval.
func (s *AdminService) GetAdmin(ctx context.Context, req *v1.GetAdminRequest) (*v1.Admin, error) {
	a, ok := auth.FromContext(ctx)
	if !ok {
		return nil, auth.ErrUnauthorized
	}
	if !a.HasAdminAccess() {
		return nil, auth.ErrForbidden
	}
	admin, err := s.uc.GetAdmin(ctx, req.Id)
	if err != nil {
		return nil, err
	}
	return convertAdmin(admin), nil
}

func (s *AdminService) ListAdmins(ctx context.Context, req *v1.ListAdminsRequest) (*v1.AdminSet, error) {
	/*
		a, ok := auth.FromContext(ctx)
		if !ok {
			return nil, auth.ErrUnauthorized
		}
		if !a.HasAdminAccess() {
			return nil, auth.ErrForbidden
		}
	*/
	declarations, err := filtering.NewDeclarations(
		filtering.DeclareStandardFunctions(),
		filtering.DeclareIdent("name", filtering.TypeString),
		filtering.DeclareIdent("create_time", filtering.TypeTimestamp),
	)
	if err != nil {
		return nil, err
	}
	filter, err := filtering.ParseFilter(req, declarations)
	if err != nil {
		return nil, err
	}
	pageToken, err := pagination.ParsePageToken(req)
	if err != nil {
		return nil, err
	}
	orderBy, err := ordering.ParseOrderBy(req)
	if err != nil {
		return nil, err
	}
	admins, err := s.uc.ListAdmins(ctx,
		biz.ListFilter(filter),
		biz.ListOrderBy(orderBy),
		biz.ListLimit(int(req.PageSize)),
		biz.ListOffset(int(pageToken.Offset)),
	)
	if err != nil {
		return nil, err
	}
	adminSet := &v1.AdminSet{
		NextPageToken: pageToken.Next(req).String(),
		Items:         make([]*v1.Admin, 0, len(admins)),
	}
	for _, admin := range admins {
		adminSet.Items = append(adminSet.Items, convertAdmin(admin))
	}
	return adminSet, nil
}
