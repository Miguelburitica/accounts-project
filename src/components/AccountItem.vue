<template>
  <div class="flex justify-between items-center py-3 border-b border-slate-200">
    <div class="flex items-center">
      <i :class="accountIconClass" aria-hidden="true"></i>
      <div>
        <div class="font-medium text-slate-900">{{ account.name }}</div>
        <div class="text-slate-500 text-sm capitalize">{{ formattedAccountType }}</div>
      </div>
    </div>
    <div class="text-right">
      <div class="font-bold text-slate-900">{{ formatCurrency(account.current_balance) }}</div>
      <div class="text-slate-500 text-xs">
        <time :datetime="account.last_updated">{{ formatDate(account.last_updated) }}</time>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Account } from '@/types/financial'

interface Props {
  account: Account
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

const accountIconClass = computed(() => {
  const baseClass = 'pi mr-3 text-xl'
  
  const iconMap = {
    'cash': 'pi-wallet text-green-500',
    'bank': 'pi-building text-blue-500',
    'digital_wallet': 'pi-mobile text-purple-500',
    'salary_account': 'pi-briefcase text-orange-500',
    'investment': 'pi-chart-line text-teal-500',
    'credit': 'pi-credit-card text-red-500'
  }
  
  const iconClass = iconMap[props.account.type] || 'pi-wallet text-gray-500'
  return `${baseClass} ${iconClass}`
})

const formattedAccountType = computed(() => {
  return props.account.type.replace('_', ' ')
})
</script>