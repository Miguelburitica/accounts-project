<template>
  <div class="variance-view">
    <div class="surface-ground px-4 py-8 md:px-6 lg:px-8">
      <div class="text-900 font-bold text-6xl mb-4 text-center">Variance Analysis</div>
      <div class="text-700 text-xl mb-6 text-center line-height-3">
        Understand your budget vs actual spending patterns
      </div>

      <!-- Period Selection -->
      <Card class="mb-6">
        <template #content>
          <div class="flex justify-content-between align-items-center">
            <div class="flex align-items-center gap-3">
              <label for="period-select" class="font-semibold">Analyze Period:</label>
              <Dropdown 
                id="period-select"
                v-model="selectedPeriodId" 
                :options="periodOptions" 
                optionValue="value" 
                optionLabel="label"
                placeholder="Select a period"
                class="w-20rem"
              />
            </div>
            <div class="flex gap-2">
              <Button 
                label="Generate Report" 
                icon="pi pi-file-pdf" 
                @click="generateVarianceReport"
                :disabled="!selectedPeriod"
              />
              <Button 
                label="Export Analysis" 
                icon="pi pi-download" 
                severity="secondary"
                @click="exportVarianceData"
                :disabled="!selectedPeriod"
              />
            </div>
          </div>
        </template>
      </Card>

      <!-- Period Overview -->
      <div v-if="selectedPeriod" class="grid mb-6">
        <div class="col-12 lg:col-3 md:col-6">
          <Card class="bg-blue-100 border-blue-200">
            <template #content>
              <div class="flex justify-content-between mb-3">
                <div>
                  <span class="block text-500 font-medium mb-3">Total Budget</span>
                  <div class="text-900 font-medium text-xl">{{ formatCurrency(selectedPeriod.total_budget) }}</div>
                </div>
                <div class="flex align-items-center justify-content-center bg-blue-100 border-round" style="width:2.5rem;height:2.5rem">
                  <i class="pi pi-chart-pie text-blue-500 text-xl"></i>
                </div>
              </div>
              <span class="text-500">Planned spending</span>
            </template>
          </Card>
        </div>
        
        <div class="col-12 lg:col-3 md:col-6">
          <Card class="bg-orange-100 border-orange-200">
            <template #content>
              <div class="flex justify-content-between mb-3">
                <div>
                  <span class="block text-500 font-medium mb-3">Actual Spending</span>
                  <div class="text-900 font-medium text-xl">{{ formatCurrency(selectedPeriod.total_actual) }}</div>
                </div>
                <div class="flex align-items-center justify-content-center bg-orange-100 border-round" style="width:2.5rem;height:2.5rem">
                  <i class="pi pi-shopping-cart text-orange-500 text-xl"></i>
                </div>
              </div>
              <span class="text-500">Reality check</span>
            </template>
          </Card>
        </div>

        <div class="col-12 lg:col-3 md:col-6">
          <Card :class="selectedPeriod.variance >= 0 ? 'bg-green-100 border-green-200' : 'bg-red-100 border-red-200'">
            <template #content>
              <div class="flex justify-content-between mb-3">
                <div>
                  <span class="block text-500 font-medium mb-3">Total Variance</span>
                  <div class="text-900 font-medium text-xl">{{ formatCurrency(Math.abs(selectedPeriod.variance)) }}</div>
                </div>
                <div class="flex align-items-center justify-content-center border-round" 
                     :class="selectedPeriod.variance >= 0 ? 'bg-green-100' : 'bg-red-100'"
                     style="width:2.5rem;height:2.5rem">
                  <i class="pi text-xl" 
                     :class="selectedPeriod.variance >= 0 ? 'pi-trending-up text-green-500' : 'pi-trending-down text-red-500'"></i>
                </div>
              </div>
              <span :class="selectedPeriod.variance >= 0 ? 'text-green-500' : 'text-red-500'">
                {{ selectedPeriod.variance >= 0 ? 'Under budget' : 'Over budget' }}
              </span>
            </template>
          </Card>
        </div>

        <div class="col-12 lg:col-3 md:col-6">
          <Card class="bg-purple-100 border-purple-200">
            <template #content>
              <div class="flex justify-content-between mb-3">
                <div>
                  <span class="block text-500 font-medium mb-3">Variance %</span>
                  <div class="text-900 font-medium text-xl">{{ variancePercentage }}%</div>
                </div>
                <div class="flex align-items-center justify-content-center bg-purple-100 border-round" style="width:2.5rem;height:2.5rem">
                  <i class="pi pi-percentage text-purple-500 text-xl"></i>
                </div>
              </div>
              <span class="text-500">Budget accuracy</span>
            </template>
          </Card>
        </div>
      </div>

      <!-- Category Variance Analysis -->
      <Card v-if="selectedPeriod" class="mb-6">
        <template #title>
          <div class="flex justify-content-between align-items-center">
            <span>Category Variance Analysis</span>
            <div class="flex gap-2">
              <Button 
                label="Add Variance Note" 
                icon="pi pi-plus" 
                size="small"
                @click="showAddVarianceDialog = true"
              />
              <Button 
                label="Auto-Detect Variances" 
                icon="pi pi-search" 
                severity="secondary"
                size="small"
                @click="autoDetectVariances"
              />
            </div>
          </div>
        </template>
        <template #content>
          <DataTable 
            :value="categoryVariances" 
            responsiveLayout="scroll"
            sortField="variance_amount"
            :sortOrder="-1"
            stripedRows
          >
            <Column field="category" header="Category" style="width:20%" sortable>
              <template #body="{ data }">
                <div class="font-medium">{{ data.category }}</div>
              </template>
            </Column>
            
            <Column field="budgeted_amount" header="Budget" style="width:15%" sortable>
              <template #body="{ data }">
                {{ formatCurrency(data.budgeted_amount) }}
              </template>
            </Column>

            <Column field="actual_amount" header="Actual" style="width:15%" sortable>
              <template #body="{ data }">
                {{ formatCurrency(data.actual_amount) }}
              </template>
            </Column>

            <Column field="variance_amount" header="Variance" style="width:15%" sortable>
              <template #body="{ data }">
                <span :class="data.variance_amount >= 0 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'">
                  {{ data.variance_amount >= 0 ? '+' : '' }}{{ formatCurrency(data.variance_amount) }}
                </span>
              </template>
            </Column>

            <Column field="variance_percentage" header="%" style="width:10%" sortable>
              <template #body="{ data }">
                <Tag 
                  :value="`${data.variance_percentage >= 0 ? '+' : ''}${data.variance_percentage.toFixed(1)}%`"
                  :severity="data.variance_percentage >= 0 ? 'success' : 'danger'"
                />
              </template>
            </Column>

            <Column field="status" header="Status" style="width:12%">
              <template #body="{ data }">
                <Tag 
                  :value="getVarianceStatus(data.variance_percentage)"
                  :severity="getVarianceStatusSeverity(data.variance_percentage)"
                />
              </template>
            </Column>

            <Column field="notes" header="Notes" style="width:13%">
              <template #body="{ data }">
                <Button 
                  :label="data.explanation ? 'View Note' : 'Add Note'"
                  :icon="data.explanation ? 'pi pi-eye' : 'pi pi-plus'"
                  size="small"
                  text
                  @click="editVarianceNote(data)"
                />
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>

      <!-- Variance Trends -->
      <div v-if="selectedPeriod" class="grid mb-6">
        <div class="col-12 lg:col-6">
          <Card>
            <template #title>Variance Insights</template>
            <template #content>
              <div class="flex flex-column gap-4">
                
                <!-- Biggest Overruns -->
                <div v-if="biggestOverruns.length > 0">
                  <div class="font-medium text-900 mb-3 flex align-items-center">
                    <i class="pi pi-exclamation-triangle text-red-500 mr-2"></i>
                    Biggest Budget Overruns
                  </div>
                  <div v-for="item in biggestOverruns" :key="item.category" 
                       class="flex justify-content-between align-items-center p-3 surface-border border-1 border-round mb-2">
                    <div>
                      <div class="font-medium text-900">{{ item.category }}</div>
                      <div class="text-500 text-sm">Budget: {{ formatCurrency(item.budgeted_amount) }}</div>
                    </div>
                    <div class="text-right">
                      <div class="text-red-600 font-bold">{{ formatCurrency(Math.abs(item.variance_amount)) }} over</div>
                      <div class="text-red-500 text-sm">{{ item.variance_percentage.toFixed(1) }}% over budget</div>
                    </div>
                  </div>
                </div>

                <!-- Biggest Savings -->
                <div v-if="biggestSavings.length > 0">
                  <div class="font-medium text-900 mb-3 flex align-items-center">
                    <i class="pi pi-check-circle text-green-500 mr-2"></i>
                    Biggest Budget Savings
                  </div>
                  <div v-for="item in biggestSavings" :key="item.category" 
                       class="flex justify-content-between align-items-center p-3 surface-border border-1 border-round mb-2">
                    <div>
                      <div class="font-medium text-900">{{ item.category }}</div>
                      <div class="text-500 text-sm">Budget: {{ formatCurrency(item.budgeted_amount) }}</div>
                    </div>
                    <div class="text-right">
                      <div class="text-green-600 font-bold">{{ formatCurrency(item.variance_amount) }} saved</div>
                      <div class="text-green-500 text-sm">{{ item.variance_percentage.toFixed(1) }}% under budget</div>
                    </div>
                  </div>
                </div>

                <!-- No Variances -->
                <div v-if="biggestOverruns.length === 0 && biggestSavings.length === 0" 
                     class="text-center py-4 text-500">
                  <i class="pi pi-info-circle text-3xl mb-3"></i>
                  <p>No significant variances detected for this period.</p>
                </div>

              </div>
            </template>
          </Card>
        </div>

        <div class="col-12 lg:col-6">
          <Card>
            <template #title>Variance Distribution</template>
            <template #content>
              <div class="flex flex-column gap-4">
                
                <!-- Variance Summary -->
                <div class="text-center mb-4">
                  <div class="text-3xl font-bold text-900 mb-2">{{ categoryVariances.length }}</div>
                  <div class="text-500">Categories Analyzed</div>
                </div>

                <Divider />

                <!-- Variance Categories -->
                <div class="grid text-center">
                  <div class="col-4">
                    <div class="text-2xl font-bold text-red-500">{{ overBudgetCount }}</div>
                    <div class="text-500 text-sm">Over Budget</div>
                  </div>
                  <div class="col-4">
                    <div class="text-2xl font-bold text-green-500">{{ underBudgetCount }}</div>
                    <div class="text-500 text-sm">Under Budget</div>
                  </div>
                  <div class="col-4">
                    <div class="text-2xl font-bold text-blue-500">{{ onBudgetCount }}</div>
                    <div class="text-500 text-sm">On Target</div>
                  </div>
                </div>

                <Divider />

                <!-- Accuracy Score -->
                <div class="text-center">
                  <div class="text-500 mb-2">Budget Accuracy Score</div>
                  <div class="text-3xl font-bold" :class="accuracyScoreColor">{{ accuracyScore }}%</div>
                  <ProgressBar 
                    :value="accuracyScore" 
                    :showValue="false"
                    class="mt-3"
                    :class="accuracyScore >= 80 ? '' : 'p-progressbar-danger'"
                  />
                </div>

              </div>
            </template>
          </Card>
        </div>
      </div>

      <!-- Historical Comparison -->
      <Card v-if="selectedPeriod && historicalVariances.length > 0" class="mb-6">
        <template #title>Historical Variance Trends</template>
        <template #content>
          <div class="text-500 mb-4">Compare this period's variances with previous periods</div>
          <DataTable 
            :value="historicalVariances" 
            responsiveLayout="scroll"
            :paginator="true"
            :rows="5"
          >
            <Column field="period_label" header="Period" style="width:25%"></Column>
            <Column field="total_budget" header="Budget" style="width:20%">
              <template #body="{ data }">
                {{ formatCurrency(data.total_budget) }}
              </template>
            </Column>
            <Column field="total_actual" header="Actual" style="width:20%">
              <template #body="{ data }">
                {{ formatCurrency(data.total_actual) }}
              </template>
            </Column>
            <Column field="variance" header="Variance" style="width:20%">
              <template #body="{ data }">
                <span :class="data.variance >= 0 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'">
                  {{ data.variance >= 0 ? '+' : '' }}{{ formatCurrency(data.variance) }}
                </span>
              </template>
            </Column>
            <Column field="accuracy" header="Accuracy" style="width:15%">
              <template #body="{ data }">
                <Tag 
                  :value="`${data.accuracy}%`"
                  :severity="data.accuracy >= 80 ? 'success' : data.accuracy >= 60 ? 'warning' : 'danger'"
                />
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>

      <!-- No Period Selected -->
      <Card v-if="!selectedPeriod" class="text-center">
        <template #content>
          <i class="pi pi-chart-bar text-6xl text-400 mb-4"></i>
          <div class="text-900 font-medium text-xl mb-3">Select a Period to Analyze</div>
          <div class="text-500 mb-4">Choose a completed period to see detailed variance analysis and insights.</div>
        </template>
      </Card>
    </div>

    <!-- Add Variance Note Dialog -->
    <Dialog v-model:visible="showAddVarianceDialog" modal header="Add Variance Explanation" :style="{ width: '500px' }">
      <div class="flex flex-column gap-3 mb-3">
        <div>
          <label for="variance-category" class="font-semibold">Category</label>
          <Dropdown 
            id="variance-category"
            v-model="varianceForm.category" 
            :options="categoryOptions" 
            optionValue="value" 
            optionLabel="label"
            class="w-full mt-2"
          />
        </div>
        
        <div>
          <label for="variance-reason" class="font-semibold">Reason Code</label>
          <Dropdown 
            id="variance-reason"
            v-model="varianceForm.reason" 
            :options="reasonOptions" 
            optionValue="value" 
            optionLabel="label"
            class="w-full mt-2"
          />
        </div>
        
        <div>
          <label for="variance-explanation" class="font-semibold">Explanation</label>
          <Textarea 
            id="variance-explanation"
            v-model="varianceForm.explanation" 
            rows="3"
            class="w-full mt-2"
            placeholder="Explain what caused this variance..."
          />
        </div>
      </div>
      
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" text @click="showAddVarianceDialog = false" />
        <Button label="Save Variance" icon="pi pi-check" @click="saveVarianceNote" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useFinancialStore } from '@/stores/financial'
import type { Period, Variance } from '@/types/financial'

import Card from 'primevue/card'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Dropdown from 'primevue/dropdown'
import Tag from 'primevue/tag'
import Dialog from 'primevue/dialog'
import Textarea from 'primevue/textarea'
import ProgressBar from 'primevue/progressbar'
import Divider from 'primevue/divider'

const financialStore = useFinancialStore()

const selectedPeriodId = ref<number | null>(null)
const showAddVarianceDialog = ref(false)

const varianceForm = ref({
  category: '',
  reason: '',
  explanation: ''
})

const reasonOptions = [
  { label: 'Unexpected Expense', value: 'unexpected' },
  { label: 'Timing Difference', value: 'timing' },
  { label: 'Budget Underestimate', value: 'underestimate' },
  { label: 'Budget Overestimate', value: 'overestimate' },
  { label: 'Emergency Expense', value: 'emergency' },
  { label: 'Opportunity/Sale', value: 'opportunity' },
  { label: 'Income Variance', value: 'income_variance' },
  { label: 'Other', value: 'other' }
]

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

const variancePercentage = computed(() => {
  if (!selectedPeriod.value || selectedPeriod.value.total_budget === 0) return 0
  return ((selectedPeriod.value.variance / selectedPeriod.value.total_budget) * 100).toFixed(1)
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

const biggestOverruns = computed(() => {
  return categoryVariances.value
    .filter(v => v.variance_amount < -50000) // Significant overruns
    .slice(0, 3)
})

const biggestSavings = computed(() => {
  return categoryVariances.value
    .filter(v => v.variance_amount > 50000) // Significant savings
    .slice(0, 3)
})

const overBudgetCount = computed(() => {
  return categoryVariances.value.filter(v => v.variance_amount < -10000).length
})

const underBudgetCount = computed(() => {
  return categoryVariances.value.filter(v => v.variance_amount > 10000).length
})

const onBudgetCount = computed(() => {
  return categoryVariances.value.filter(v => Math.abs(v.variance_amount) <= 10000).length
})

const accuracyScore = computed(() => {
  if (!selectedPeriod.value || selectedPeriod.value.total_budget === 0) return 0
  const accuracy = 100 - Math.abs((selectedPeriod.value.variance / selectedPeriod.value.total_budget) * 100)
  return Math.max(0, Math.round(accuracy))
})

const accuracyScoreColor = computed(() => {
  const score = accuracyScore.value
  if (score >= 80) return 'text-green-500'
  if (score >= 60) return 'text-orange-500'
  return 'text-red-500'
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
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(value)
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function getVarianceStatus(percentage: number): string {
  if (Math.abs(percentage) <= 5) return 'On Target'
  if (percentage > 5) return 'Under Budget'
  if (percentage < -5 && percentage >= -15) return 'Slight Overrun'
  return 'Major Overrun'
}

function getVarianceStatusSeverity(percentage: number): string {
  if (Math.abs(percentage) <= 5) return 'success'
  if (percentage > 5) return 'info'
  if (percentage < -5 && percentage >= -15) return 'warning'
  return 'danger'
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

function saveVarianceNote() {
  if (!selectedPeriod.value || !varianceForm.value.category) return
  
  const variance = categoryVariances.value.find(v => v.category === varianceForm.value.category)
  if (!variance) return
  
  // Check if variance record already exists
  const existingVariance = financialStore.variances.find(
    v => v.period_id === selectedPeriod.value!.id && v.category === varianceForm.value.category
  )
  
  if (existingVariance) {
    financialStore.updateVariance(existingVariance.id, {
      reason: varianceForm.value.reason,
      explanation: varianceForm.value.explanation
    })
  } else {
    financialStore.addVariance({
      period_id: selectedPeriod.value.id,
      category: varianceForm.value.category,
      budgeted_amount: variance.budgeted_amount,
      actual_amount: variance.actual_amount,
      variance_amount: variance.variance_amount,
      reason: varianceForm.value.reason,
      explanation: varianceForm.value.explanation
    })
  }
  
  // Reset form
  varianceForm.value = {
    category: '',
    reason: '',
    explanation: ''
  }
  showAddVarianceDialog.value = false
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
.variance-view {
  min-height: 100vh;
}
</style>