package server

import (
	v1 "github.com/go-kratos/kratos-admin/api/kratos/admin/v1"
	"github.com/go-kratos/kratos-admin/internal/conf"
	"github.com/go-kratos/kratos-admin/internal/service"
	"github.com/go-kratos/kratos-admin/pkg/validate"

	"github.com/go-kratos/kratos/v2/middleware/recovery"
	"github.com/go-kratos/kratos/v2/transport/grpc"
)

// NewGRPCServer new a gRPC server.
func NewGRPCServer(c *conf.Server, admin *service.AdminService) *grpc.Server {
	var opts = []grpc.ServerOption{
		grpc.Middleware(
			recovery.Recovery(),
			validate.Middleware(),
		),
	}
	if c.Grpc.Network != "" {
		opts = append(opts, grpc.Network(c.Grpc.Network))
	}
	if c.Grpc.Addr != "" {
		opts = append(opts, grpc.Address(c.Grpc.Addr))
	}
	if c.Grpc.Timeout != nil {
		opts = append(opts, grpc.Timeout(c.Grpc.Timeout.AsDuration()))
	}
	srv := grpc.NewServer(opts...)
	v1.RegisterAdminServiceServer(srv, admin)
	return srv
}
