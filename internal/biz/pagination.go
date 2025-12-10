package biz

import "go.einride.tech/aip/filtering"

type ListOption func(*ListOptions)

type ListOptions struct {
	Filter  filtering.Filter
	OrderBy string
	Offset  int
	Limit   int
}

func ListFilter(filter filtering.Filter) ListOption {
	return func(o *ListOptions) {
		o.Filter = filter
	}
}

func ListOrderBy(orderBy string) ListOption {
	return func(o *ListOptions) {
		o.OrderBy = orderBy
	}
}

func ListOffset(offset int) ListOption {
	return func(o *ListOptions) {
		o.Offset = offset
	}
}

func ListLimit(limit int) ListOption {
	return func(o *ListOptions) {
		o.Limit = limit
	}
}
