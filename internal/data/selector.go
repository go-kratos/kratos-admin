package data

import (
	"fmt"

	"entgo.io/ent/dialect/sql"
	"github.com/go-kratos/kratos-admin/internal/data/ent"
	"go.einride.tech/aip/filtering"
	"go.einride.tech/aip/ordering"
	expr "google.golang.org/genproto/googleapis/api/expr/v1alpha1"
)

// constToValue converts a Constant expression to its Go value.
func constToValue(constExpr *expr.Constant) any {
	switch constExpr.ConstantKind.(type) {
	case *expr.Constant_BoolValue:
		return constExpr.GetBoolValue()
	case *expr.Constant_StringValue:
		return constExpr.GetStringValue()
	case *expr.Constant_Int64Value:
		return constExpr.GetInt64Value()
	case *expr.Constant_DoubleValue:
		return constExpr.GetDoubleValue()
	case *expr.Constant_DurationValue:
		return constExpr.GetDurationValue()
	case *expr.Constant_TimestampValue:
		return constExpr.GetTimestampValue()
	default:
		return nil
	}
}

// queryBy builds a SQL selector from a filtering.Filter.
// Exmaple: name="value" AND age>18
// More detail in [AIP-160](https://google.aip.dev/160).
func queryBy(filter filtering.Filter) func(*sql.Selector) {
	if filter.CheckedExpr == nil || filter.CheckedExpr.Expr == nil {
		return nil
	}
	return func(s *sql.Selector) {
		var and, or []*sql.Predicate
		filtering.Walk(func(currExpr, parentExpr *expr.Expr) bool {
			call := currExpr.GetCallExpr()
			if call == nil {
				return true
			}
			var predicate *sql.Predicate
			switch call.Function {
			case "=":
				predicate = sql.EQ(call.Args[0].GetIdentExpr().Name, constToValue(call.Args[1].GetConstExpr()))
			case "!=":
				predicate = sql.NEQ(call.Args[0].GetIdentExpr().Name, constToValue(call.Args[1].GetConstExpr()))
			case ">":
				predicate = sql.GT(call.Args[0].GetIdentExpr().Name, constToValue(call.Args[1].GetConstExpr()))
			case "<":
				predicate = sql.LT(call.Args[0].GetIdentExpr().Name, constToValue(call.Args[1].GetConstExpr()))
			case ">=":
				predicate = sql.GTE(call.Args[0].GetIdentExpr().Name, constToValue(call.Args[1].GetConstExpr()))
			case "<=":
				predicate = sql.LTE(call.Args[0].GetIdentExpr().Name, constToValue(call.Args[1].GetConstExpr()))
			}
			if predicate == nil {
				return true
			}
			if parentExpr == nil {
				and = append(and, predicate)
				return true
			}
			if parentCall := parentExpr.GetCallExpr(); parentCall != nil {
				fmt.Println("parentCall.Function:", parentCall.Function)
				switch parentCall.Function {
				case "AND":
					and = append(and, predicate)
				case "OR":
					or = append(or, predicate)
				}
			}
			return true
		}, filter.CheckedExpr.Expr)
		// Combine AND and OR predicates
		if len(and) > 0 {
			s.Where(sql.And(and...))
		}
		if len(or) > 0 {
			s.Where(sql.Or(or...))
		}
	}
}

// orderBy builds a SQL order function from an orderBy string.
// Exmaple: foo,bar asc/desc
func orderBy(orderBy ordering.OrderBy) func(s *sql.Selector) {
	for _, field := range orderBy.Fields {
		if field.Desc {
			return ent.Desc(field.Path)
		} else {
			return ent.Asc(field.Path)
		}
	}
	return func(*sql.Selector) {}
}
