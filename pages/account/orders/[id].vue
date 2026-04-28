
<template>
  <v-container class="py-8">
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card v-if="order" class="pa-6">
          <v-row align="center" justify="space-between">
            <v-col cols="8">
              <h1 class="text-h5 font-weight-bold">Order #{{ order.id }}</h1>
            </v-col>
            <v-col cols="4" class="d-flex justify-end">
              <NuxtLink to="/account/orders">
                <v-btn color="primary" variant="tonal" prepend-icon="mdi-arrow-left">Back to Orders</v-btn>
              </NuxtLink>
            </v-col>
          </v-row>
          <v-divider class="my-4" />
          <v-row>
            <v-col cols="12" md="6">
              <v-list density="compact">
                <v-list-item>
                  <v-list-item-title>Date</v-list-item-title>
                  <v-list-item-subtitle>{{ formatDate(order.createdAt) }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>Status</v-list-item-title>
                  <v-list-item-subtitle>
                    <v-chip :color="statusColor(order.status)" dark>{{ order.status }}</v-chip>
                  </v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>Lab Location</v-list-item-title>
                  <v-list-item-subtitle>{{ order.labLocation }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>Amount</v-list-item-title>
                  <v-list-item-subtitle>{{ order.amount.toFixed(2) }} zł</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-col>
            <v-col cols="12" md="6">
              <v-card class="mb-2" variant="outlined">
                <v-card-title>Items</v-card-title>
                <v-divider />
                <v-list density="compact">
                  <v-list-item v-for="item in order.items" :key="item.testId">
                    <v-list-item-title>{{ item.testName }}</v-list-item-title>
                    <v-list-item-subtitle>x{{ item.quantity }} ({{ item.price.toFixed(2) }} zł)</v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-card>
              <v-alert v-if="order.status === 'ready' && order.resultPdf" type="success" class="mb-2">
                <a :href="order.resultPdf" target="_blank" rel="noopener" download>Download Result PDF</a>
              </v-alert>
              <v-alert v-if="order.status === 'pending_payment'" type="warning" class="mb-2">
                <v-btn color="warning" @click="retryPayment">Retry Payment</v-btn>
              </v-alert>
            </v-col>
          </v-row>
        </v-card>
        <v-alert v-else type="error" class="mt-8">Order not found.</v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">

import { useRoute, useRouter } from 'vue-router'
import { useOrdersStore } from '~/stores/orders'
import { onMounted, ref } from 'vue'

const route = useRoute()
const router = useRouter()
const store = useOrdersStore()
const order = ref()

onMounted(async () => {
  if (store.orders.length === 0) {
    const res = await fetch('/orders.json')
    const data = await res.json()
    store.setOrders(data)
  }
  order.value = store.getOrderById(route.params.id as string)
})


function retryPayment() {
  alert('Payment retry simulated!')
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

function formatDate(date: string) {
  return new Date(date).toLocaleDateString()
}
</script>


<style scoped>
.v-container {
  max-width: 900px;
}
</style>
