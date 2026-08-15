package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/field"
)

// statusActive mirrors kratos.admin.v1.Admin.Status.ACTIVE. The column stores
// the enum's numeric value, so `data` converts by cast rather than by lookup.
const statusActive = 1

// Admin holds the schema definition for the Admin entity.
type Admin struct {
	ent.Schema
}

// Mixin of the Admin.
func (Admin) Mixin() []ent.Mixin {
	return []ent.Mixin{
		IDMixin{},
		TimeMixin{},
	}
}

// Fields of the Admin.
func (Admin) Fields() []ent.Field {
	return []ent.Field{
		field.String("name").Default(""),
		field.String("email").Default(""),
		field.String("avatar").Default(""),
		field.String("access").Default(""),
		field.String("password").Default(""),
		// DELETED is the soft-delete marker; reads filter it out.
		field.Int32("status").Default(statusActive),
	}
}
