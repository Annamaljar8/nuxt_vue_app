

<template>
  <v-container class="py-8">
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <v-card elevation="4" class="pa-0">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title class="text-h5">Order History</v-toolbar-title>
            <v-spacer />
            <v-btn icon @click="logout" aria-label="Logout">
              <v-icon>mdi-logout</v-icon>
            </v-btn>
          </v-toolbar>
          <v-divider />
          <v-row class="px-4 pt-4" align="center">
            <v-col cols="12" md="4">
              <v-select
                v-model="statusFilter"
                :items="[{ title: 'All', value: '' }, ...statuses.map(s => ({ title: s, value: s }))]"
                label="Status"
                item-title="title"
                item-value="value"
                density="comfortable"
                variant="outlined"
                hide-details
                clearable
              />
            </v-col>
          </v-row>
          <v-divider />
          <v-card-text>
            <v-skeleton-loader v-if="loading" type="table" class="my-8" />
            <v-alert v-else-if="orders.length === 0" type="info" border="start" color="primary" variant="tonal" class="my-8">
              No orders found.
            </v-alert>
            <v-data-table
              v-else
              :headers="headers"
              :items="paginatedOrders"
              :items-per-page="store.pagination.perPage"
              :page.sync="currentPage"
              :footer-props="{ 'items-per-page-options': [5] }"
              class="elevation-0"
              hide-default-footer
              density="comfortable"
              hover
            >
              <template #item.id="{ item }">
                <NuxtLink :to="`/account/orders/${item.id}`" class="font-weight-bold text-primary">#{{ item.id }}</NuxtLink>
              </template>
              <template #item.createdAt="{ item }">
                {{ formatDate(item.createdAt) }}
              </template>
              <template #item.status="{ item }">
                <v-chip :color="statusColor(item.status)" dark>{{ item.status }}</v-chip>
              </template>
              <template #item.amount="{ item }">
                {{ item.amount.toFixed(2) }} zł
              </template>
            </v-data-table>
            <v-pagination
              v-if="totalPages > 1"
              v-model="currentPage"
              :length="totalPages"
              class="mt-4"
              color="primary"
              size="large"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">

import { ref, onMounted, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useOrdersStore, OrderStatus } from '~/stores/orders'
import { useAuthStore } from '~/stores/auth'

const store = useOrdersStore()
const auth = useAuthStore()
const router = useRouter()
const route = useRoute()


const loading = ref(true)
const statuses: OrderStatus[] = [
  'pending_payment', 'processing', 'awaiting_sample', 'in_lab', 'ready', 'cancelled'
]
const statusFilter = ref<string | null>(route.query.status as string || '')
const currentPage = ref(Number(route.query.page) || 1)

const headers = [
  { title: 'Order ID', value: 'id', sortable: false },
  { title: 'Date', value: 'createdAt', sortable: false },
  { title: 'Status', value: 'status', sortable: false },
  { title: 'Amount', value: 'amount', sortable: false },
]

onMounted(async () => {
  auth.hydrate()
  if (store.orders.length === 0) {
    const res = await fetch('/orders.json')
    const data = await res.json()
    store.setOrders(data)
  }
  loading.value = false
})

watch(statusFilter, (val) => {
  store.setStatusFilter(val ? val as OrderStatus : null)
  router.replace({ query: { ...route.query, status: val, page: 1 } })
})

watch(currentPage, (val) => {
  store.setPage(val)
  router.replace({ query: { ...route.query, page: val } })
})

watch(() => route.query.page, (val) => {
  if (val) currentPage.value = Number(val)
})


const orders = computed(() => store.filteredOrders)
const paginatedOrders = computed(() => store.paginatedOrders)
const totalPages = computed(() => store.totalPages)


function setPage(page: number) {
  currentPage.value = page
}

function statusColor(status: string) {
  switch (status) {
    case 'ready': return 'success'
    case 'cancelled': return 'error'
    case 'processing': return 'info'
    case 'in_lab': return 'primary'
    case 'awaiting_sample': return 'warning'
    case 'pending_payment': return 'orange'
    default: return 'grey'
  }
}

function logout() {
  auth.logout()
  router.push('/login')
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString()
}
</script>


<style scoped>
.v-container {
  max-width: 1000px;
}
.v-card {
  border-radius: 18px;
}
.v-toolbar {
  border-top-left-radius: 18px;
  border-top-right-radius: 18px;
}
.v-card-text {
  min-height: 400px;
}
</style>
