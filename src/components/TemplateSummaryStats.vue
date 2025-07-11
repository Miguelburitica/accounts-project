<template>
  <section class="grid mt-6" aria-label="Budget Template Summary">
    <div class="col-span-12 lg:col-span-6">
      <Card>
        <template #title>
          <h3 class="flex items-center">
            <i class="pi pi-plus-circle text-green-500 text-xl mr-2"></i>
            Total Budget Income
          </h3>
        </template>
        <template #content>
          <div class="text-3xl font-bold text-green-500">
            {{ formatCurrency(totalIncome) }}
          </div>
          <div class="text-500">Per 15-day period</div>
          <div class="mt-2 text-sm text-600">
            From {{ activeIncomeCount }} active income sources
          </div>
        </template>
      </Card>
    </div>
    
    <div class="col-span-12 lg:col-span-6">
      <Card>
        <template #title>
          <h3 class="flex items-center">
            <i class="pi pi-minus-circle text-red-500 text-xl mr-2"></i>
            Total Budget Expenses
          </h3>
        </template>
        <template #content>
          <div class="text-3xl font-bold text-red-500">
            {{ formatCurrency(totalExpenses) }}
          </div>
          <div class="text-500">Per 15-day period</div>
          <div class="mt-2 text-sm text-600">
            From {{ activeExpenseCount }} active budget items
          </div>
        </template>
      </Card>
    </div>
    
    <div class="col-span-12 mt-4">
      <Card>
        <template #title>
          <h3 class="flex items-center">
            <i class="pi pi-chart-line text-blue-500 text-xl mr-2"></i>
            Net Budget Balance
          </h3>
        </template>
        <template #content>
          <div class="text-3xl font-bold" :class="netBalance >= 0 ? 'text-green-500' : 'text-red-500'">
            {{ formatCurrency(netBalance) }}
          </div>
          <div class="text-500">Expected balance per 15-day period</div>
          <div class="mt-2 text-sm" :class="netBalance >= 0 ? 'text-green-600' : 'text-red-600'">
            {{ netBalance >= 0 ? 'Positive cash flow projected' : 'Budget deficit - review expenses' }}
          </div>
        </template>
      </Card>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Card from 'primevue/card'
import type { BudgetTemplate, IncomeTemplate } from '@/types/financial'

interface Props {
  incomeTemplate: IncomeTemplate[]
  budgetTemplate: BudgetTemplate[]
}

const props = defineProps<Props>()

const totalIncome = computed(() => {
  return props.incomeTemplate
    .filter(item => item.is_active)
    .reduce((total, item) => total + item.amount, 0)
})

const totalExpenses = computed(() => {
  return props.budgetTemplate
    .filter(item => item.is_active)
    .reduce((total, item) => total + item.amount, 0)
})

const netBalance = computed(() => {
  return totalIncome.value - totalExpenses.value
})

const activeIncomeCount = computed(() => {
  return props.incomeTemplate.filter(item => item.is_active).length
})

const activeExpenseCount = computed(() => {
  return props.budgetTemplate.filter(item => item.is_active).length
})

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(value)
}
</script>