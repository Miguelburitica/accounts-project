<template>
  <div class="transactions-view">
    <div class="surface-ground px-4 py-8 md:px-6 lg:px-8">
      <div class="text-900 font-bold text-6xl mb-4 text-center">Transactions</div>
      <div class="text-700 text-xl mb-6 text-center line-height-3">
        Manage your income and expenses across all periods
      </div>

      <!-- Filter and Actions Bar -->
      <Card class="mb-6">
        <template #content>
          <div class="grid">
            <div class="col-12 lg:col-3 md:col-6">
              <label for="period-filter" class="font-semibold text-sm">Period</label>
              <Dropdown 
                id="period-filter"
                v-model="filters.periodId" 
                :options="periodOptions" 
                optionValue="value" 
                optionLabel="label"
                placeholder="All Periods"
                class="w-full mt-1"
                showClear
              />
            </div>
            <div class="col-12 lg:col-3 md:col-6">
              <label for="type-filter" class="font-semibold text-sm">Type</label>
              <Dropdown 
                id="type-filter"
                v-model="filters.type" 
                :options="typeOptions" 
                optionValue="value" 
                optionLabel="label"
                placeholder="All Types"
                class="w-full mt-1"
                showClear
              />
            </div>
            <div class="col-12 lg:col-3 md:col-6">
              <label for="category-filter" class="font-semibold text-sm">Category</label>
              <Dropdown 
                id="category-filter"
                v-model="filters.category" 
                :options="categoryOptions" 
                optionValue="value" 
                optionLabel="label"
                placeholder="All Categories"
                class="w-full mt-1"
                showClear
              />
            </div>
            <div class="col-12 lg:col-3 md:col-6">
              <label for="variance-filter" class="font-semibold text-sm">Variance</label>
              <Dropdown 
                id="variance-filter"
                v-model="filters.varianceFlag" 
                :options="varianceOptions" 
                optionValue="value" 
                optionLabel="label"
                placeholder="All Transactions"
                class="w-full mt-1"
                showClear
              />
            </div>
          </div>
          
          <div class="flex justify-content-between align-items-center mt-4">
            <div class="flex gap-2">
              <Button 
                label="Add Transaction" 
                icon="pi pi-plus" 
                @click="showAddDialog = true"
              />
              <Button 
                label="Bulk Import" 
                icon="pi pi-upload" 
                severity="secondary"
                @click="showImportDialog = true"
              />
            </div>
            <div class="flex gap-2">
              <Button 
                label="Export Current View" 
                icon="pi pi-download" 
                severity="help"
                @click="exportFilteredTransactions"
              />
              <Button 
                label="Clear Filters" 
                icon="pi pi-filter-slash" 
                severity="warning"
                @click="clearFilters"
                :disabled="!hasActiveFilters"
              />
            </div>
          </div>
        </template>
      </Card>

      <!-- Summary Cards -->
      <div class="grid mb-6">
        <div class="col-12 lg:col-3 md:col-6">
          <Card class="bg-green-100 border-green-200">
            <template #content>
              <div class="flex justify-content-between mb-3">
                <div>
                  <span class="block text-500 font-medium mb-3">Total Income</span>
                  <div class="text-900 font-medium text-xl">{{ formatCurrency(summaryStats.totalIncome) }}</div>
                </div>
                <div class="flex align-items-center justify-content-center bg-green-100 border-round" style="width:2.5rem;height:2.5rem">
                  <i class="pi pi-arrow-up text-green-500 text-xl"></i>
                </div>
              </div>
              <span class="text-500">{{ summaryStats.incomeCount }} transactions</span>
            </template>
          </Card>
        </div>
        
        <div class="col-12 lg:col-3 md:col-6">
          <Card class="bg-red-100 border-red-200">
            <template #content>
              <div class="flex justify-content-between mb-3">
                <div>
                  <span class="block text-500 font-medium mb-3">Total Expenses</span>
                  <div class="text-900 font-medium text-xl">{{ formatCurrency(summaryStats.totalExpenses) }}</div>
                </div>
                <div class="flex align-items-center justify-content-center bg-red-100 border-round" style="width:2.5rem;height:2.5rem">
                  <i class="pi pi-arrow-down text-red-500 text-xl"></i>
                </div>
              </div>
              <span class="text-500">{{ summaryStats.expenseCount }} transactions</span>
            </template>
          </Card>
        </div>

        <div class="col-12 lg:col-3 md:col-6">
          <Card class="bg-blue-100 border-blue-200">
            <template #content>
              <div class="flex justify-content-between mb-3">
                <div>
                  <span class="block text-500 font-medium mb-3">Net Flow</span>
                  <div class="text-900 font-medium text-xl">{{ formatCurrency(summaryStats.netFlow) }}</div>
                </div>
                <div class="flex align-items-center justify-content-center bg-blue-100 border-round" style="width:2.5rem;height:2.5rem">
                  <i class="pi pi-arrows-h text-blue-500 text-xl"></i>
                </div>
              </div>
              <span class="text-500">Income - Expenses</span>
            </template>
          </Card>
        </div>

        <div class="col-12 lg:col-3 md:col-6">
          <Card class="bg-orange-100 border-orange-200">
            <template #content>
              <div class="flex justify-content-between mb-3">
                <div>
                  <span class="block text-500 font-medium mb-3">Variance Items</span>
                  <div class="text-900 font-medium text-xl">{{ summaryStats.varianceCount }}</div>
                </div>
                <div class="flex align-items-center justify-content-center bg-orange-100 border-round" style="width:2.5rem;height:2.5rem">
                  <i class="pi pi-exclamation-triangle text-orange-500 text-xl"></i>
                </div>
              </div>
              <span class="text-500">Budget variances</span>
            </template>
          </Card>
        </div>
      </div>

      <!-- Transactions Table -->
      <Card>
        <template #title>
          <div class="flex justify-content-between align-items-center">
            <span>All Transactions</span>
            <Tag :value="`${filteredTransactions.length} items`" />
          </div>
        </template>
        <template #content>
          <DataTable 
            :value="filteredTransactions" 
            editMode="row" 
            @row-edit-save="onRowEditSave"
            responsiveLayout="scroll"
            :paginator="true" 
            :rows="15"
            sortField="date"
            :sortOrder="-1"
            stripedRows
            :loading="loading"
          >
            <Column field="date" header="Date" style="width:12%" sortable>
              <template #body="{ data }">
                {{ formatDate(data.date) }}
              </template>
              <template #editor="{ data, field }">
                <Calendar v-model="data[field]" dateFormat="yy-mm-dd" showIcon />
              </template>
            </Column>
            
            <Column field="type" header="Type" style="width:8%">
              <template #body="{ data }">
                <Tag 
                  :value="data.type" 
                  :severity="data.type === 'income' ? 'success' : 'danger'"
                  :icon="data.type === 'income' ? 'pi pi-arrow-up' : 'pi pi-arrow-down'"
                />
              </template>
              <template #editor="{ data, field }">
                <Dropdown v-model="data[field]" :options="typeOptions" optionValue="value" optionLabel="label" />
              </template>
            </Column>

            <Column field="category" header="Category" style="width:15%">
              <template #editor="{ data, field }">
                <Dropdown v-model="data[field]" :options="categoryOptions" optionValue="value" optionLabel="label" />
              </template>
            </Column>

            <Column field="subcategory" header="Subcategory" style="width:12%">
              <template #editor="{ data, field }">
                <InputText v-model="data[field]" />
              </template>
            </Column>

            <Column field="amount" header="Amount" style="width:12%" sortable>
              <template #body="{ data }">
                <span :class="data.type === 'income' ? 'text-green-600 font-bold' : 'text-red-600 font-bold'">
                  {{ data.type === 'income' ? '+' : '-' }}{{ formatCurrency(data.amount) }}
                </span>
              </template>
              <template #editor="{ data, field }">
                <InputNumber v-model="data[field]" mode="currency" currency="COP" />
              </template>
            </Column>

            <Column field="description" header="Description" style="width:20%">
              <template #editor="{ data, field }">
                <InputText v-model="data[field]" />
              </template>
            </Column>

            <Column field="period_id" header="Period" style="width:8%">
              <template #body="{ data }">
                <Tag :value="`P${data.period_id}`" severity="info" />
              </template>
              <template #editor="{ data, field }">
                <Dropdown v-model="data[field]" :options="periodOptions" optionValue="value" optionLabel="label" />
              </template>
            </Column>

            <Column field="variance_flag" header="Variance" style="width:8%">
              <template #body="{ data }">
                <i v-if="data.variance_flag" class="pi pi-exclamation-triangle text-orange-500" title="Budget variance"></i>
                <span v-else class="text-500">-</span>
              </template>
              <template #editor="{ data, field }">
                <Checkbox v-model="data[field]" binary />
              </template>
            </Column>

            <Column :rowEditor="true" style="width:8%" bodyStyle="text-align:center"></Column>
            
            <Column style="width:5%">
              <template #body="{ data }">
                <Button 
                  icon="pi pi-trash" 
                  severity="danger" 
                  outlined 
                  size="small"
                  @click="deleteTransaction(data.id)" 
                />
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>
    </div>

    <!-- Add Transaction Dialog -->
    <Dialog v-model:visible="showAddDialog" modal header="Add New Transaction" :style="{ width: '500px' }">
      <div class="flex flex-column gap-3 mb-3">
        <div class="grid">
          <div class="col-6">
            <label for="new-date" class="font-semibold">Date</label>
            <Calendar 
              id="new-date"
              v-model="newTransaction.date" 
              dateFormat="yy-mm-dd"
              showIcon
              class="w-full mt-1"
            />
          </div>
          <div class="col-6">
            <label for="new-type" class="font-semibold">Type</label>
            <Dropdown 
              id="new-type"
              v-model="newTransaction.type" 
              :options="typeOptions" 
              optionValue="value" 
              optionLabel="label"
              class="w-full mt-1"
            />
          </div>
        </div>

        <div class="grid">
          <div class="col-6">
            <label for="new-amount" class="font-semibold">Amount</label>
            <InputNumber 
              id="new-amount"
              v-model="newTransaction.amount" 
              mode="currency" 
              currency="COP"
              class="w-full mt-1"
            />
          </div>
          <div class="col-6">
            <label for="new-period" class="font-semibold">Period</label>
            <Dropdown 
              id="new-period"
              v-model="newTransaction.period_id" 
              :options="periodOptions" 
              optionValue="value" 
              optionLabel="label"
              class="w-full mt-1"
            />
          </div>
        </div>

        <div class="grid">
          <div class="col-6">
            <label for="new-category" class="font-semibold">Category</label>
            <Dropdown 
              id="new-category"
              v-model="newTransaction.category" 
              :options="categoryOptions" 
              optionValue="value" 
              optionLabel="label"
              class="w-full mt-1"
            />
          </div>
          <div class="col-6">
            <label for="new-subcategory" class="font-semibold">Subcategory</label>
            <InputText 
              id="new-subcategory"
              v-model="newTransaction.subcategory" 
              class="w-full mt-1"
              placeholder="Optional"
            />
          </div>
        </div>

        <div>
          <label for="new-description" class="font-semibold">Description</label>
          <InputText 
            id="new-description"
            v-model="newTransaction.description" 
            class="w-full mt-1"
            placeholder="Transaction description..."
          />
        </div>

        <div class="flex align-items-center gap-2">
          <Checkbox v-model="newTransaction.variance_flag" binary />
          <label class="font-semibold">Mark as budget variance</label>
        </div>
      </div>
      
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" text @click="showAddDialog = false" />
        <Button label="Add Transaction" icon="pi pi-check" @click="addTransaction" />
      </template>
    </Dialog>

    <!-- Bulk Import Dialog -->
    <Dialog v-model:visible="showImportDialog" modal header="Bulk Import Transactions" :style="{ width: '600px' }">
      <div class="flex flex-column gap-3 mb-3">
        <div class="text-500 mb-2">
          Upload a CSV file with columns: date, type, category, subcategory, amount, description, variance_flag
        </div>
        
        <FileUpload
          mode="basic"
          name="transactions"
          accept=".csv"
          :maxFileSize="1000000"
          @select="onFileSelect"
          :auto="false"
          chooseLabel="Select CSV File"
        />
        
        <div v-if="importPreview.length > 0" class="mt-3">
          <div class="text-600 font-medium mb-2">Preview (first 5 rows):</div>
          <DataTable :value="importPreview.slice(0, 5)" size="small">
            <Column field="date" header="Date"></Column>
            <Column field="type" header="Type"></Column>
            <Column field="category" header="Category"></Column>
            <Column field="amount" header="Amount"></Column>
            <Column field="description" header="Description"></Column>
          </DataTable>
          <div class="text-500 text-sm mt-2">Total rows to import: {{ importPreview.length }}</div>
        </div>
      </div>
      
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" text @click="showImportDialog = false" />
        <Button 
          label="Import Transactions" 
          icon="pi pi-upload" 
          @click="importTransactions"
          :disabled="importPreview.length === 0"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useFinancialStore } from '@/stores/financial'
import type { Transaction } from '@/types/financial'

import Card from 'primevue/card'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Calendar from 'primevue/calendar'
import Checkbox from 'primevue/checkbox'
import Dialog from 'primevue/dialog'
import Tag from 'primevue/tag'
import FileUpload from 'primevue/fileupload'

const financialStore = useFinancialStore()

const loading = ref(false)
const showAddDialog = ref(false)
const showImportDialog = ref(false)
const importPreview = ref<any[]>([])

const filters = ref({
  periodId: null as number | null,
  type: null as 'income' | 'expense' | null,
  category: null as string | null,
  varianceFlag: null as boolean | null
})

const newTransaction = ref({
  date: new Date(),
  type: 'expense' as 'income' | 'expense',
  amount: 0,
  period_id: null as number | null,
  category: '',
  subcategory: '',
  description: '',
  variance_flag: false
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

const typeOptions = [
  { label: 'Income', value: 'income' },
  { label: 'Expense', value: 'expense' }
]

const varianceOptions = [
  { label: 'Variance Items Only', value: true },
  { label: 'Regular Items Only', value: false }
]

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

function addTransaction() {
  if (!newTransaction.value.amount || !newTransaction.value.category || !newTransaction.value.period_id) return
  
  financialStore.addTransaction({
    period_id: newTransaction.value.period_id,
    date: newTransaction.value.date.toISOString().split('T')[0],
    type: newTransaction.value.type,
    category: newTransaction.value.category,
    subcategory: newTransaction.value.subcategory || undefined,
    amount: newTransaction.value.amount,
    description: newTransaction.value.description,
    variance_flag: newTransaction.value.variance_flag
  })
  
  // Reset form
  newTransaction.value = {
    date: new Date(),
    type: 'expense',
    amount: 0,
    period_id: currentPeriod.value?.id || null,
    category: '',
    subcategory: '',
    description: '',
    variance_flag: false
  }
  showAddDialog.value = false
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

function onFileSelect(event: any) {
  const file = event.files[0]
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = (e) => {
    const csv = e.target?.result as string
    importPreview.value = parseCSV(csv)
  }
  reader.readAsText(file)
}

function parseCSV(csvText: string): any[] {
  const lines = csvText.trim().split('\n')
  if (lines.length < 2) return []
  
  const headers = lines[0].split(',').map(h => h.trim())
  const data = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim())
    const row: any = {}
    
    headers.forEach((header, index) => {
      const value = values[index] || ''
      if (header === 'amount' && !isNaN(Number(value))) {
        row[header] = Number(value)
      } else if (header === 'variance_flag') {
        row[header] = value.toLowerCase() === 'true'
      } else {
        row[header] = value
      }
    })
    
    data.push(row)
  }
  
  return data
}

function importTransactions() {
  if (importPreview.value.length === 0) return
  
  importPreview.value.forEach(transaction => {
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
  
  importPreview.value = []
  showImportDialog.value = false
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
.transactions-view {
  min-height: 100vh;
}
</style>