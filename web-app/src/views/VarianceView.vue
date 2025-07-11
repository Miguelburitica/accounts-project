<template>
  <main class="surface-ground px-4 py-8 md:px-6 lg:px-8">
    <header class="mb-4">
      <h1 class="text-900 font-bold text-6xl mb-4 text-center">Variance Analysis</h1>
      <p class="text-700 text-xl mb-6 text-center line-height-3">
        Understand your budget vs actual spending patterns
      </p>
    </header>

    <section class="mb-6" aria-label="Period Selection">
      <VariancePeriodSelector
        v-model:selected-period-id="selectedPeriodId"
        :period-options="periodOptions"
        :has-period="!!selectedPeriod"
        @generate-report="generateVarianceReport"
        @export-analysis="exportVarianceData"
      />
    </section>

    <VarianceOverviewStats
      v-if="selectedPeriod"
      :period="selectedPeriod"
    />

    <section v-if="selectedPeriod" class="mb-6" aria-label="Category Variance Analysis">
      <VarianceCategoryTable
        :category-variances="categoryVariances"
        @add-variance-note="showAddVarianceDialog = true"
        @auto-detect="autoDetectVariances"
        @edit-variance-note="editVarianceNote"
      />
    </section>

    <VarianceInsights
      v-if="selectedPeriod"
      :category-variances="categoryVariances"
      :accuracy-score="accuracyScore"
    />

    <VarianceHistoricalTrends
      v-if="selectedPeriod && historicalVariances.length > 0"
      :historical-variances="historicalVariances"
    />

    <section v-if="!selectedPeriod" class="text-center" aria-label="No Period Selected">
      <Card>
        <template #content>
          <i class="pi pi-chart-bar text-6xl text-400 mb-4" aria-hidden="true"></i>
          <h2 class="text-900 font-medium text-xl mb-3">Select a Period to Analyze</h2>
          <p class="text-500 mb-4">Choose a completed period to see detailed variance analysis and insights.</p>
        </template>
      </Card>
    </section>
  </main>

  <VarianceNoteDialog
    v-model:visible="showAddVarianceDialog"
    :category-options="categoryOptions"
    :initial-data="varianceForm"
    @submit="handleVarianceNoteSubmit"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useFinancialStore } from '@/stores/financial'
import type { Variance } from '@/types/financial'

import Card from 'primevue/card'

import VariancePeriodSelector from '@/components/VariancePeriodSelector.vue'
import VarianceOverviewStats from '@/components/VarianceOverviewStats.vue'
import VarianceCategoryTable from '@/components/VarianceCategoryTable.vue'
import VarianceInsights from '@/components/VarianceInsights.vue'
import VarianceHistoricalTrends from '@/components/VarianceHistoricalTrends.vue'
import VarianceNoteDialog from '@/components/VarianceNoteDialog.vue'

const financialStore = useFinancialStore()

const selectedPeriodId = ref<number | null>(null)
const showAddVarianceDialog = ref(false)

const varianceForm = ref({
  category: '',
  reason: '',
  explanation: ''
})

// Computed properties
const periods = computed(() => financialStore.periods.filter(p => p.status === 'completed'))
const selectedPeriod = computed(() => periods.value.find(p => p.id === selectedPeriodId.value))
const categoryOptions = computed(() => financialStore.getExpenseCategoryOptions())

const periodOptions = computed(() => {
  return periods.value.map(period => ({
    label: `Period ${period.id} (${formatDate(period.start_date)} - ${formatDate(period.end_date)})`,
    value: period.id
  }))
})


const categoryVariances = computed(() => {
  if (!selectedPeriod.value) return []
  
  // Get budget by category for selected period
  const budgetByCategory = new Map<string, number>()
  financialStore.budgetTemplate
    .filter(item => item.is_active)
    .forEach(item => {
      const current = budgetByCategory.get(item.category) || 0
      budgetByCategory.set(item.category, current + item.amount)
    })
  
  // Get actual spending by category for selected period
  const actualByCategory = new Map<string, number>()
  financialStore.transactions
    .filter(t => t.period_id === selectedPeriod.value!.id && t.type === 'expense')
    .forEach(transaction => {
      const current = actualByCategory.get(transaction.category) || 0
      actualByCategory.set(transaction.category, current + transaction.amount)
    })
  
  // Get existing variance explanations
  const varianceExplanations = new Map<string, Variance>()
  financialStore.variances
    .filter(v => v.period_id === selectedPeriod.value!.id)
    .forEach(variance => {
      varianceExplanations.set(variance.category, variance)
    })
  
  // Create variance analysis
  const result = []
  const allCategories = new Set([...budgetByCategory.keys(), ...actualByCategory.keys()])
  
  for (const category of allCategories) {
    const budgeted = budgetByCategory.get(category) || 0
    const actual = actualByCategory.get(category) || 0
    const variance = budgeted - actual
    const explanation = varianceExplanations.get(category)
    
    if (budgeted > 0 || actual > 0) { // Only show categories with activity
      result.push({
        category,
        budgeted_amount: budgeted,
        actual_amount: actual,
        variance_amount: variance,
        variance_percentage: budgeted > 0 ? (variance / budgeted) * 100 : 0,
        reason: explanation?.reason || '',
        explanation: explanation?.explanation || ''
      })
    }
  }
  
  return result.sort((a, b) => Math.abs(b.variance_amount) - Math.abs(a.variance_amount))
})

const accuracyScore = computed(() => {
  if (!selectedPeriod.value || selectedPeriod.value.total_budget === 0) return 0
  const accuracy = 100 - Math.abs((selectedPeriod.value.variance / selectedPeriod.value.total_budget) * 100)
  return Math.max(0, Math.round(accuracy))
})

const historicalVariances = computed(() => {
  return periods.value
    .filter(p => p.id !== selectedPeriodId.value)
    .map(period => ({
      period_label: `Period ${period.id}`,
      total_budget: period.total_budget,
      total_actual: period.total_actual,
      variance: period.variance,
      accuracy: period.total_budget > 0 ? Math.max(0, Math.round(100 - Math.abs((period.variance / period.total_budget) * 100))) : 0
    }))
    .sort((a, b) => b.period_label.localeCompare(a.period_label))
    .slice(0, 5)
})

// Methods
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function autoDetectVariances() {
  if (!selectedPeriod.value) return
  
  // Auto-create variance records for significant variances
  categoryVariances.value.forEach(variance => {
    if (Math.abs(variance.variance_percentage) > 15) { // 15% threshold
      const existingVariance = financialStore.variances.find(
        v => v.period_id === selectedPeriod.value!.id && v.category === variance.category
      )
      
      if (!existingVariance) {
        financialStore.addVariance({
          period_id: selectedPeriod.value!.id,
          category: variance.category,
          budgeted_amount: variance.budgeted_amount,
          actual_amount: variance.actual_amount,
          variance_amount: variance.variance_amount,
          reason: variance.variance_amount < 0 ? 'unexpected' : 'opportunity',
          explanation: `Auto-detected ${Math.abs(variance.variance_percentage).toFixed(1)}% variance`
        })
      }
    }
  })
}

function editVarianceNote(variance: any) {
  varianceForm.value = {
    category: variance.category,
    reason: variance.reason || '',
    explanation: variance.explanation || ''
  }
  showAddVarianceDialog.value = true
}

function handleVarianceNoteSubmit(data: any) {
  if (!selectedPeriod.value) return
  
  const variance = categoryVariances.value.find(v => v.category === data.category)
  if (!variance) return
  
  // Check if variance record already exists
  const existingVariance = financialStore.variances.find(
    v => v.period_id === selectedPeriod.value!.id && v.category === data.category
  )
  
  if (existingVariance) {
    financialStore.updateVariance(existingVariance.id, {
      reason: data.reason,
      explanation: data.explanation
    })
  } else {
    financialStore.addVariance({
      period_id: selectedPeriod.value.id,
      category: data.category,
      budgeted_amount: variance.budgeted_amount,
      actual_amount: variance.actual_amount,
      variance_amount: variance.variance_amount,
      reason: data.reason,
      explanation: data.explanation
    })
  }
}

function generateVarianceReport() {
  // TODO: Generate PDF report with variance analysis
  console.log('Generate variance report for period:', selectedPeriod.value)
}

function exportVarianceData() {
  if (!selectedPeriod.value) return
  
  const timestamp = new Date().toISOString().split('T')[0]
  const csvContent = convertToCSV(categoryVariances.value)
  downloadCSV(`variance_analysis_period_${selectedPeriod.value.id}_${timestamp}.csv`, csvContent)
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

// Watch for current period change
watch(() => financialStore.currentPeriod, (newPeriod) => {
  if (newPeriod && newPeriod.status === 'completed' && !selectedPeriodId.value) {
    selectedPeriodId.value = newPeriod.id
  }
}, { immediate: true })

onMounted(() => {
  financialStore.loadFromLocalStorage()
  
  // Auto-select most recent completed period
  if (periods.value.length > 0 && !selectedPeriodId.value) {
    selectedPeriodId.value = periods.value[0].id
  }
})
</script>

<style scoped>
</style>