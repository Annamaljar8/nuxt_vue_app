
import { defineStore } from 'pinia'
import type { Order, OrderStatus, OrdersState } from '@/types/order.types';

export const useOrdersStore = defineStore('orders', {
  state: (): OrdersState => ({
    orders: [],
    filters: { status: null },
    pagination: { currentPage: 1, perPage: 5 },
  }),
  getters: {
    filteredOrders: (state) => {
      if (!state.filters.status) return state.orders
      return state.orders.filter(o => o.status === state.filters.status)
    },

    totalPages: (state) => {
      return Math.ceil(
        state.orders.length / state.pagination.perPage
      )
    },

    paginatedOrders: (state) => {
      const start =
        (state.pagination.currentPage - 1) * state.pagination.perPage

      const filtered = state.filters.status
        ? state.orders.filter(o => o.status === state.filters.status)
        : state.orders

      return filtered.slice(start, start + state.pagination.perPage)
    },

    getOrderById: (state) => {
      return (id: string) => state.orders.find(o => o.id === id)
    }
  },
  actions: {
    setOrders(orders: Order[]) {
      this.orders = orders
    },
    setStatusFilter(status: OrderStatus | null) {
      this.filters.status = status
      this.pagination.currentPage = 1
    },
    setPage(page: number) {
      this.pagination.currentPage = page
    },
  },
})
