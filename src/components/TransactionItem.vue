<template>
  <div class="flex justify-between items-center py-3 border-b border-slate-200">
    <div>
      <div class="font-medium text-slate-900">{{ transaction.description }}</div>
      <div class="text-slate-500 text-sm">
        {{ transaction.category }} • 
        <time :datetime="transaction.date">{{ formatDate(transaction.date) }}</time>
      </div>
    </div>
    <div class="text-right">
      <div class="font-bold" :class="amountColorClass">
        {{ amountPrefix }}{{ formatCurrency(transaction.amount) }}
      </div>
      <div v-if="transaction.variance_flag" class="text-xs text-orange-500">
        <i class="pi pi-exclamation-triangle" aria-hidden="true"></i> Variance
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Transaction } from '@/types/financial'

interface Props {
  transaction: Transaction
}

const props = defineProps<Props>()

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(value)
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const amountColorClass = computed(() => {
  return props.transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
})

const amountPrefix = computed(() => {
  return props.transaction.type === 'income' ? '+' : '-'
})
</script>