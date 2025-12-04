package service

import (
	"github.com/go-kratos/kratos-admin/internal/biz"

	v1 "github.com/go-kratos/kratos-admin/api/kratos/admin/v1"
)

// AuthService is a greeter service.
type AuthService struct {
	v1.UnimplementedAuthServer

	uc *biz.AuthUsecase
}

// NewAuthService new a greeter service.
func NewAuthService(uc *biz.AuthUsecase) *AuthService {
	return &AuthService{uc: uc}
}
