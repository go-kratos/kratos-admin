package data

import (
	"context"
	"log"

	"github.com/go-kratos/kratos-admin/internal/conf"
	"github.com/go-kratos/kratos-admin/internal/data/ent"
	_ "github.com/go-sql-driver/mysql"
	"github.com/google/wire"
)

// ProviderSet is data providers.
var ProviderSet = wire.NewSet(NewData, NewAdminRepo)

// Data is a struct that contains the database client.
type Data struct {
	db *ent.Client
}

// NewData creates a new Data instance.
func NewData(c *conf.Data) (*Data, func(), error) {
	dc := c.GetDatabase()
	db, err := ent.Open(dc.Driver, dc.Source)
	if err != nil {
		log.Fatalf("failed opening connection to database: %v", err)
	}
	if dc.GetDebug() {
		db = db.Debug()
	}
	// Auto migration is a convenience for local development. In production,
	// apply schema changes as a separate reviewed step instead.
	if dc.GetAutoMigrate() {
		if err := db.Schema.Create(context.Background()); err != nil {
			db.Close()
			return nil, nil, err
		}
	}
	cleanup := func() {
		db.Close()
	}
	return &Data{
		db: db,
	}, cleanup, nil
}
