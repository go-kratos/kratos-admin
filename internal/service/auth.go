package service

import (
	"context"
	"time"

	"github.com/go-kratos/kratos-admin/internal/biz"
	"github.com/go-kratos/kratos-admin/pkg/auth"
	"google.golang.org/protobuf/types/known/emptypb"
	"google.golang.org/protobuf/types/known/timestamppb"

	v1 "github.com/go-kratos/kratos-admin/api/kratos/admin/v1"
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

// AuthService is a greeter service.
type AuthService struct {
	v1.UnimplementedAuthServer

	uc *biz.AuthUsecase
}

// NewAuthService new a greeter service.
func NewAuthService(uc *biz.AuthUsecase) *AuthService {
	return &AuthService{uc: uc}
}

func (s *AuthService) Current(ctx context.Context, req *emptypb.Empty) (*v1.Admin, error) {
	a, ok := auth.FromContext(ctx)
	if !ok {
		return nil, auth.ErrUnauthorized
	}
	admin, err := s.uc.GetAdmin(ctx, a.Username)
	if err != nil {
		return nil, err
	}
	return convertAdmin(admin), nil
}

// Login implements auth login.
func (s *AuthService) Login(ctx context.Context, req *v1.LoginRequest) (*v1.Admin, error) {
	admin, err := s.uc.Login(ctx, req.Username, req.Password)
	if err != nil {
		return nil, err
	}
	if err := auth.SetLoginCookie(ctx, admin.Name, time.Now().Add(7*24*time.Hour)); err != nil {
		return nil, err
	}
	return convertAdmin(admin), nil
}

// Logout implements auth logout.
func (s *AuthService) Logout(ctx context.Context, req *emptypb.Empty) (*emptypb.Empty, error) {
	a, ok := auth.FromContext(ctx)
	if !ok {
		return nil, auth.ErrUnauthorized
	}
	if err := s.uc.Logout(ctx, a.Username); err != nil {
		return nil, err
	}
	if err := auth.SetLogoutCookie(ctx); err != nil {
		return nil, err
	}
	return &emptypb.Empty{}, nil
}
