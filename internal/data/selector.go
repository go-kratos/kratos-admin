package data

import (
	"fmt"
	"strings"

	"entgo.io/ent/dialect/sql"
	"github.com/go-kratos/kratos-admin/internal/data/ent"
	"go.einride.tech/aip/filtering"
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

// selectorByExpr converts an expression to a SQL selector function.
func selectorByExpr(currExpr, parentExpr *expr.Expr) func(*sql.Selector) {
	call := currExpr.GetCallExpr()
	if call == nil {
		return nil
	}
	return func(s *sql.Selector) {
		fmt.Println("call.Function:", call.Function, call.Args)
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
			return
		}
		if parentExpr == nil {
			s.Where(predicate)
			return
		}
		/*
			if parentCall := parentExpr.GetCallExpr(); parentCall != nil {
				switch parentCall.Function {
				case "AND":
					s.Where(sql.And(predicate))
				case "OR":
					s.Where(sql.Or(predicate))
				}
			}
		*/
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
				s.Where(predicate)
				return true
			}
			if parentCall := parentExpr.GetCallExpr(); parentCall != nil {
				switch parentCall.Function {
				case "AND":
					s.Where(sql.And(predicate))
				case "OR":
					s.Where(sql.Or(predicate))
				}
			}
			return true
		}, filter.CheckedExpr.Expr)
	}
}

// orderBy builds a SQL order function from an orderBy string.
// Exmaple: name asc/name desc
func orderBy(orderBy string) func(s *sql.Selector) {
	if orderBy == "" {
		return func(*sql.Selector) {}
	}
	orders := strings.Split(orderBy, " ")
	if len(orders) > 1 {
		switch strings.ToUpper(orders[1]) {
		case "ASC":
			return ent.Asc(orders[0])
		}
	}
	// by default is desc
	return ent.Desc(orders[0])
}
