package service

import (
	"context"

	"github.com/go-kratos/kratos-admin/internal/biz"

	v1 "github.com/go-kratos/kratos-admin/api/kratos/admin/v1"
)

func convertUser(u *biz.User) *v1.User {
	return &v1.User{
		Id:     u.ID,
		Name:   u.Name,
		Email:  u.Email,
		Avatar: u.Avatar,
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

// Login implements auth login.
func (s *AuthService) Login(ctx context.Context, req *v1.LoginRequest) (*v1.User, error) {
	user, err := s.uc.Login(ctx, req.Username, req.Password)
	if err != nil {
		return nil, err
	}
	return convertUser(user), nil
}
