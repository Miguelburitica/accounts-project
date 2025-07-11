<template>
  <main class="surface-ground px-4 py-8 md:px-6 lg:px-8">
    <header class="mb-4">
      <h1 class="text-900 font-bold text-6xl mb-4 text-center">Transactions</h1>
      <p class="text-700 text-xl mb-6 text-center line-height-3">
        Manage your income and expenses across all periods
      </p>
    </header>

    <section class="mb-6" aria-label="Transaction Filters and Actions">
      <TransactionFiltersCard
        :filters="filters"
        :period-options="periodOptions"
        :category-options="categoryOptions"
        :has-active-filters="hasActiveFilters"
        @update:period-id="filters.periodId = $event"
        @update:type="filters.type = $event"
        @update:category="filters.category = $event"
        @update:variance-flag="filters.varianceFlag = $event"
        @add-transaction="showAddDialog = true"
        @bulk-import="showImportDialog = true"
        @export-filtered="exportFilteredTransactions"
        @clear-filters="clearFilters"
      />
    </section>

    <TransactionSummaryStats
      :summary-stats="summaryStats"
    />

    <section class="mb-6" aria-label="Transactions Table">
      <TransactionTable
        :transactions="filteredTransactions"
        :loading="loading"
        :period-options="periodOptions"
        :category-options="categoryOptions"
        @row-edit-save="onRowEditSave"
        @delete-transaction="deleteTransaction"
      />
    </section>
  </main>

  <AddTransactionDialog
    v-model:visible="showAddDialog"
    :period-options="periodOptions"
    :category-options="categoryOptions"
    :current-period-id="currentPeriod?.id"
    @submit="handleAddTransaction"
  />

  <BulkImportDialog
    v-model:visible="showImportDialog"
    @import="handleBulkImport"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useFinancialStore } from '@/stores/financial'

import TransactionFiltersCard from '@/components/TransactionFiltersCard.vue'
import TransactionSummaryStats from '@/components/TransactionSummaryStats.vue'
import TransactionTable from '@/components/TransactionTable.vue'
import AddTransactionDialog from '@/components/AddTransactionDialog.vue'
import BulkImportDialog from '@/components/BulkImportDialog.vue'

const financialStore = useFinancialStore()

const loading = ref(false)
const showAddDialog = ref(false)
const showImportDialog = ref(false)

const filters = ref({
  periodId: null as number | null,
  type: null as 'income' | 'expense' | null,
  category: null as string | null,
  varianceFlag: null as boolean | null
})

// Computed properties
const transactions = computed(() => financialStore.transactions)
const periods = computed(() => financialStore.periods)
const currentPeriod = computed(() => financialStore.currentPeriod)
const categoryOptions = computed(() => financialStore.getExpenseCategoryOptions())

const periodOptions = computed(() => {
  return periods.value.map(period => ({
    label: `Period ${period.id} (${formatDate(period.start_date)} - ${formatDate(period.end_date)})`,
    value: period.id
  }))
})


const filteredTransactions = computed(() => {
  let filtered = [...transactions.value]

  if (filters.value.periodId) {
    filtered = filtered.filter(t => t.period_id === filters.value.periodId)
  }
  if (filters.value.type) {
    filtered = filtered.filter(t => t.type === filters.value.type)
  }
  if (filters.value.category) {
    filtered = filtered.filter(t => t.category === filters.value.category)
  }
  if (filters.value.varianceFlag !== null) {
    filtered = filtered.filter(t => t.variance_flag === filters.value.varianceFlag)
  }

  return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

const summaryStats = computed(() => {
  const filtered = filteredTransactions.value
  
  const income = filtered.filter(t => t.type === 'income')
  const expenses = filtered.filter(t => t.type === 'expense')
  const variances = filtered.filter(t => t.variance_flag)
  
  const totalIncome = income.reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0)
  
  return {
    totalIncome,
    totalExpenses,
    netFlow: totalIncome - totalExpenses,
    incomeCount: income.length,
    expenseCount: expenses.length,
    varianceCount: variances.length
  }
})

const hasActiveFilters = computed(() => {
  return filters.value.periodId !== null || 
         filters.value.type !== null || 
         filters.value.category !== null || 
         filters.value.varianceFlag !== null
})

// Methods

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function handleAddTransaction(transaction: any) {
  financialStore.addTransaction({
    period_id: transaction.period_id,
    date: transaction.date.toISOString().split('T')[0],
    type: transaction.type,
    category: transaction.category,
    subcategory: transaction.subcategory || undefined,
    amount: transaction.amount,
    description: transaction.description,
    variance_flag: transaction.variance_flag
  })
}

function onRowEditSave(event: any) {
  const { newData } = event
  financialStore.updateTransaction(newData.id, newData)
}

function deleteTransaction(id: number) {
  financialStore.deleteTransaction(id)
}

function clearFilters() {
  filters.value = {
    periodId: null,
    type: null,
    category: null,
    varianceFlag: null
  }
}

function exportFilteredTransactions() {
  const timestamp = new Date().toISOString().split('T')[0]
  const csvContent = convertToCSV(filteredTransactions.value)
  downloadCSV(`transactions_filtered_${timestamp}.csv`, csvContent)
}

function convertToCSV(data: any[]): string {
  if (data.length === 0) return ''
  
  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header]
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`
        }
        return value
      }).join(',')
    )
  ].join('\n')
  
  return csvContent
}

function downloadCSV(filename: string, csvContent: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function handleBulkImport(transactions: any[]) {
  transactions.forEach(transaction => {
    if (transaction.amount && transaction.category) {
      financialStore.addTransaction({
        period_id: transaction.period_id || currentPeriod.value?.id || 1,
        date: transaction.date || new Date().toISOString().split('T')[0],
        type: transaction.type || 'expense',
        category: transaction.category,
        subcategory: transaction.subcategory,
        amount: Number(transaction.amount),
        description: transaction.description || '',
        variance_flag: Boolean(transaction.variance_flag)
      })
    }
  })
}

onMounted(() => {
  financialStore.loadFromLocalStorage()
  // Set default period filter to current period if exists
  if (currentPeriod.value) {
    filters.value.periodId = currentPeriod.value.id
  }
})
</script>

<style scoped>
</style>