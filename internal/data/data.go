package data

import (
	"context"
	"log"
	"os"

	"github.com/go-kratos/kratos-admin/internal/conf"
	"github.com/go-kratos/kratos-admin/internal/data/ent"
	"github.com/go-kratos/kratos-admin/internal/data/ent/migrate"
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
	db, err := ent.Open(c.Database.Driver, c.Database.Source)
	if err != nil {
		log.Fatalf("failed opening connection to database: %v", err)
	}
	if os.Getenv("DEPLOY_ENV") == "dev" {
		// Enable debug mode for detailed logging.
		db = db.Debug()
		// Run the auto migration tool.
		if err = db.Schema.Create(context.Background(), migrate.WithDropIndex(true)); err != nil {
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
