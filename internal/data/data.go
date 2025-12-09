package data

import (
	"github.com/go-kratos/kratos-admin/internal/conf"
	"github.com/go-kratos/kratos-admin/internal/data/ent"
	"github.com/go-kratos/kratos/v2/log"
	"github.com/google/wire"
)

// ProviderSet is data providers.
var ProviderSet = wire.NewSet(NewData, NewAdminRepo)

// Data .
type Data struct {
	db *ent.Client
}

// NewData .
func NewData(c *conf.Data) (*Data, func(), error) {
	db, err := ent.Open(c.Database.Driver, c.Database.Source)
	if err != nil {
		log.Fatalf("failed opening connection to database: %v", err)
	}
	cleanup := func() {
		db.Close()
	}
	return &Data{
		db: db,
	}, cleanup, nil
}
