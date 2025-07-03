<template>
  <div class="periods-view">
    <div class="surface-ground px-4 py-8 md:px-6 lg:px-8">
      <div class="text-900 font-bold text-6xl mb-4 text-center">Period Management</div>
      <div class="text-700 text-xl mb-6 text-center line-height-3">
        Manage your 15-day financial cycles
      </div>

      <!-- Current Period Card -->
      <Card v-if="currentPeriod" class="mb-6">
        <template #title>
          <div class="flex justify-content-between align-items-center">
            <span>Current Period</span>
            <Tag :value="currentPeriod.status" :severity="currentPeriod.status === 'active' ? 'success' : 'info'" />
          </div>
        </template>
        <template #content>
          <div class="grid">
            <div class="col-12 md:col-6">
              <div class="text-500 font-medium mb-2">Period Dates</div>
              <div class="text-900 font-bold text-xl mb-3">
                {{ formatDate(currentPeriod.start_date) }} - {{ formatDate(currentPeriod.end_date) }}
              </div>
              <div class="text-500 mb-2">Days Remaining</div>
              <div class="text-900 font-bold text-lg">{{ daysRemaining }} days</div>
            </div>
            <div class="col-12 md:col-6">
              <div class="text-500 font-medium mb-2">Financial Summary</div>
              <div class="grid">
                <div class="col-6">
                  <div class="text-500 text-sm">Budget</div>
                  <div class="text-900 font-bold">{{ formatCurrency(currentPeriod.total_budget) }}</div>
                </div>
                <div class="col-6">
                  <div class="text-500 text-sm">Actual</div>
                  <div class="text-900 font-bold">{{ formatCurrency(currentPeriod.total_actual) }}</div>
                </div>
                <div class="col-6">
                  <div class="text-500 text-sm">Variance</div>
                  <div class="font-bold" :class="currentPeriod.variance >= 0 ? 'text-green-500' : 'text-red-500'">
                    {{ formatCurrency(currentPeriod.variance) }}
                  </div>
                </div>
                <div class="col-6">
                  <div class="text-500 text-sm">Net Assets</div>
                  <div class="text-900 font-bold">{{ formatCurrency(currentPeriod.liquid_assets_end || currentPeriod.liquid_assets_start) }}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="flex gap-2 mt-4">
            <Button 
              label="Close Period" 
              icon="pi pi-check" 
              @click="showClosePeriodDialog = true"
              :disabled="currentPeriod.status !== 'active'"
            />
            <Button 
              label="Add Note" 
              icon="pi pi-comment" 
              severity="secondary"
              @click="showAddNoteDialog = true"
            />
          </div>
        </template>
      </Card>

      <!-- No Current Period -->
      <Card v-else class="mb-6">
        <template #title>No Active Period</template>
        <template #content>
          <p class="text-500 mb-4">You don't have an active period. Start a new 15-day cycle to begin tracking your finances.</p>
          <Button 
            label="Start New Period" 
            icon="pi pi-plus" 
            @click="showNewPeriodDialog = true"
          />
        </template>
      </Card>

      <!-- Quick Actions -->
      <div class="grid mb-6">
        <div class="col-12 md:col-6">
          <Card>
            <template #title>
              <div class="flex align-items-center">
                <i class="pi pi-cog text-blue-500 text-2xl mr-2"></i>
                Period Management
              </div>
            </template>
            <template #content>
              <div class="flex flex-column gap-2">
                <Button 
                  label="Start New Period" 
                  icon="pi pi-plus" 
                  @click="showNewPeriodDialog = true"
                  class="w-full"
                />
                <Button 
                  label="Generate Period Report" 
                  icon="pi pi-chart-line" 
                  severity="secondary" 
                  @click="generatePeriodReport"
                  class="w-full"
                />
              </div>
            </template>
          </Card>
        </div>
        
        <div class="col-12 md:col-6">
          <Card>
            <template #title>
              <div class="flex align-items-center">
                <i class="pi pi-download text-orange-500 text-2xl mr-2"></i>
                Export & Backup
              </div>
            </template>
            <template #content>
              <div class="flex flex-column gap-4">
                
                <!-- Current Period Export -->
                <div class="export-section">
                  <div class="export-header">
                    <Button 
                      label="Current Period Data" 
                      icon="pi pi-file-export" 
                      severity="help" 
                      @click="exportCurrentPeriod"
                      class="export-button"
                      :disabled="!currentPeriod"
                    />
                  </div>
                  <div class="export-files">
                    <div class="text-sm text-500 mb-1">Downloads:</div>
                    <div class="file-list">
                      <span class="file-item">📄 period_{{ currentPeriod?.id || 'X' }}_YYYY-MM-DD.csv</span>
                      <span class="file-item">📊 period_{{ currentPeriod?.id || 'X' }}_transactions_YYYY-MM-DD.csv</span>
                      <span class="file-item">⚠️ period_{{ currentPeriod?.id || 'X' }}_variances_YYYY-MM-DD.csv</span>
                    </div>
                    <div class="text-xs text-400 mt-1">* Only downloads files with data</div>
                  </div>
                </div>

                <Divider />

                <!-- Periods History Export -->
                <div class="export-section">
                  <div class="export-header">
                    <Button 
                      label="All Periods History" 
                      icon="pi pi-history" 
                      severity="help" 
                      @click="exportPeriodsHistory"
                      class="export-button"
                    />
                  </div>
                  <div class="export-files">
                    <div class="text-sm text-500 mb-1">Downloads:</div>
                    <div class="file-list">
                      <span class="file-item">📋 periods_YYYY-MM-DD.csv</span>
                    </div>
                  </div>
                </div>

                <Divider />

                <!-- Complete Backup Export -->
                <div class="export-section">
                  <div class="export-header">
                    <Button 
                      label="Complete Data Backup" 
                      icon="pi pi-database" 
                      severity="warning" 
                      @click="exportFullBackup"
                      class="export-button"
                    />
                  </div>
                  <div class="export-files">
                    <div class="text-sm text-500 mb-1">Downloads (9 files):</div>
                    <div class="file-list">
                      <span class="file-item">📋 periods_YYYY-MM-DD.csv</span>
                      <span class="file-item">🏦 accounts_YYYY-MM-DD.csv</span>
                      <span class="file-item">💰 receivables_YYYY-MM-DD.csv</span>
                      <span class="file-item">📝 budget_template_YYYY-MM-DD.csv</span>
                      <span class="file-item">💵 income_template_YYYY-MM-DD.csv</span>
                      <span class="file-item">🔄 receivable_payments_YYYY-MM-DD.csv</span>
                      <span class="file-item">📊 transactions_YYYY-MM-DD.csv</span>
                      <span class="file-item">⚠️ variances_YYYY-MM-DD.csv</span>
                      <span class="file-item">🎯 goals_YYYY-MM-DD.csv</span>
                    </div>
                    <div class="text-xs text-400 mt-1">* Complete backup of all your financial data</div>
                  </div>
                </div>

              </div>
            </template>
          </Card>
        </div>
      </div>

      <!-- Periods History -->
      <Card>
        <template #title>Period History</template>
        <template #content>
          <DataTable 
            :value="periodsHistory" 
            responsiveLayout="scroll"
            :paginator="true" 
            :rows="10"
            sortField="start_date"
            :sortOrder="-1"
          >
            <Column field="id" header="ID" style="width:5%"></Column>
            <Column field="start_date" header="Start Date" style="width:15%">
              <template #body="{ data }">
                {{ formatDate(data.start_date) }}
              </template>
            </Column>
            <Column field="end_date" header="End Date" style="width:15%">
              <template #body="{ data }">
                {{ formatDate(data.end_date) }}
              </template>
            </Column>
            <Column field="status" header="Status" style="width:10%">
              <template #body="{ data }">
                <Tag :value="data.status" :severity="data.status === 'active' ? 'success' : 'info'" />
              </template>
            </Column>
            <Column field="total_budget" header="Budget" style="width:15%">
              <template #body="{ data }">
                {{ formatCurrency(data.total_budget) }}
              </template>
            </Column>
            <Column field="total_actual" header="Actual" style="width:15%">
              <template #body="{ data }">
                {{ formatCurrency(data.total_actual) }}
              </template>
            </Column>
            <Column field="variance" header="Variance" style="width:15%">
              <template #body="{ data }">
                <span :class="data.variance >= 0 ? 'text-green-500' : 'text-red-500'">
                  {{ formatCurrency(data.variance) }}
                </span>
              </template>
            </Column>
            <Column style="width:10%">
              <template #body="{ data }">
                <Button 
                  icon="pi pi-eye" 
                  severity="secondary" 
                  outlined 
                  @click="viewPeriodDetails(data)"
                />
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>
    </div>

    <!-- New Period Dialog -->
    <Dialog v-model:visible="showNewPeriodDialog" modal header="Start New Period" :style="{ width: '500px' }">
      <div class="flex flex-column gap-3 mb-3">
        <div>
          <label for="period-start" class="font-semibold w-6rem">Start Date</label>
          <Calendar 
            id="period-start" 
            v-model="newPeriod.start_date" 
            dateFormat="yy-mm-dd"
            showIcon
            class="w-full mt-2"
          />
        </div>
        
        <div>
          <label for="period-end" class="font-semibold w-6rem">End Date</label>
          <Calendar 
            id="period-end" 
            v-model="newPeriod.end_date" 
            dateFormat="yy-mm-dd"
            showIcon
            class="w-full mt-2"
            :disabled="true"
          />
          <small class="text-500">Automatically calculated as 15 days from start date</small>
        </div>
        
        <div>
          <label for="starting-assets" class="font-semibold w-6rem">Starting Liquid Assets</label>
          <InputNumber 
            id="starting-assets" 
            v-model="newPeriod.liquid_assets_start" 
            mode="currency" 
            currency="COP"
            class="w-full mt-2"
          />
        </div>
        
        <div>
          <label for="apply-template" class="font-semibold w-6rem">Apply Budget Template</label>
          <Checkbox v-model="newPeriod.applyTemplate" binary class="mt-2" />
          <small class="text-500 ml-2">Apply your saved budget template to this period</small>
        </div>
      </div>
      
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" text @click="showNewPeriodDialog = false" />
        <Button label="Start Period" icon="pi pi-check" @click="createNewPeriod" />
      </template>
    </Dialog>

    <!-- Close Period Dialog -->
    <Dialog v-model:visible="showClosePeriodDialog" modal header="Close Current Period" :style="{ width: '450px' }">
      <div class="flex flex-column gap-3 mb-3">
        <p class="text-500">Are you sure you want to close the current period? This action cannot be undone.</p>
        
        <div>
          <label for="ending-assets" class="font-semibold w-6rem">Ending Liquid Assets</label>
          <InputNumber 
            id="ending-assets" 
            v-model="closePeriodData.liquid_assets_end" 
            mode="currency" 
            currency="COP"
            class="w-full mt-2"
          />
        </div>
        
        <div>
          <label for="close-notes" class="font-semibold w-6rem">Final Notes</label>
          <Textarea 
            id="close-notes" 
            v-model="closePeriodData.notes" 
            rows="3"
            class="w-full mt-2"
            placeholder="Add any final notes for this period..."
          />
        </div>
      </div>
      
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" text @click="showClosePeriodDialog = false" />
        <Button label="Close Period" icon="pi pi-check" severity="danger" @click="closePeriod" />
      </template>
    </Dialog>

    <!-- Add Note Dialog -->
    <Dialog v-model:visible="showAddNoteDialog" modal header="Add Period Note" :style="{ width: '450px' }">
      <div class="flex flex-column gap-3 mb-3">
        <Textarea 
          v-model="periodNote" 
          rows="4"
          class="w-full"
          placeholder="Add notes about this period..."
        />
      </div>
      
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" text @click="showAddNoteDialog = false" />
        <Button label="Save Note" icon="pi pi-check" @click="savePeriodNote" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useFinancialStore } from '@/stores/financial'
import type { Period } from '@/types/financial'

import Card from 'primevue/card'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Calendar from 'primevue/calendar'
import InputNumber from 'primevue/inputnumber'
import Checkbox from 'primevue/checkbox'
import Textarea from 'primevue/textarea'
import Tag from 'primevue/tag'
import Divider from 'primevue/divider'

const financialStore = useFinancialStore()

const showNewPeriodDialog = ref(false)
const showClosePeriodDialog = ref(false)
const showAddNoteDialog = ref(false)

const newPeriod = ref({
  start_date: new Date(),
  end_date: new Date(),
  liquid_assets_start: 0,
  applyTemplate: true
})

const closePeriodData = ref({
  liquid_assets_end: 0,
  notes: ''
})

const periodNote = ref('')

const currentPeriod = computed(() => financialStore.currentPeriod)
const periodsHistory = computed(() => financialStore.periods)

const daysRemaining = computed(() => {
  if (!currentPeriod.value) return 0
  const endDate = new Date(currentPeriod.value.end_date)
  const today = new Date()
  const diffTime = endDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
})

// Watch start date to auto-calculate end date
watch(() => newPeriod.value.start_date, (newStartDate) => {
  if (newStartDate) {
    const endDate = new Date(newStartDate)
    endDate.setDate(endDate.getDate() + 14) // 15 days total (including start day)
    newPeriod.value.end_date = endDate
  }
})

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(value)
}

function createNewPeriod() {
  if (newPeriod.value.start_date && newPeriod.value.liquid_assets_start >= 0) {
    financialStore.createNewPeriod({
      start_date: newPeriod.value.start_date.toISOString().split('T')[0],
      end_date: newPeriod.value.end_date.toISOString().split('T')[0],
      liquid_assets_start: newPeriod.value.liquid_assets_start,
      applyTemplate: newPeriod.value.applyTemplate
    })
    
    // Reset form
    newPeriod.value = {
      start_date: new Date(),
      end_date: new Date(),
      liquid_assets_start: 0,
      applyTemplate: true
    }
    showNewPeriodDialog.value = false
  }
}

function closePeriod() {
  if (currentPeriod.value && closePeriodData.value.liquid_assets_end >= 0) {
    financialStore.closePeriod({
      liquid_assets_end: closePeriodData.value.liquid_assets_end,
      notes: closePeriodData.value.notes
    })
    
    // Reset form
    closePeriodData.value = {
      liquid_assets_end: 0,
      notes: ''
    }
    showClosePeriodDialog.value = false
  }
}

function savePeriodNote() {
  if (currentPeriod.value && periodNote.value.trim()) {
    financialStore.updatePeriodNotes(currentPeriod.value.id, periodNote.value.trim())
    periodNote.value = ''
    showAddNoteDialog.value = false
  }
}

function viewPeriodDetails(period: Period) {
  // TODO: Navigate to period details view or show detailed dialog
  console.log('View period details:', period)
}

function generatePeriodReport() {
  // TODO: Generate and show period analysis report
  console.log('Generate period report')
}

function exportCurrentPeriod() {
  if (currentPeriod.value) {
    financialStore.exportPeriodData(currentPeriod.value.id)
  }
}

function exportPeriodsHistory() {
  financialStore.exportPeriodsOnly()
}

function exportFullBackup() {
  financialStore.exportAllCSV()
}

onMounted(() => {
  financialStore.loadFromLocalStorage()
})
</script>

<style scoped>
.periods-view {
  min-height: 100vh;
}

.export-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.export-header {
  display: flex;
  align-items: center;
}

.export-button {
  width: 100%;
}

.export-files {
  padding-left: 1rem;
  border-left: 3px solid var(--surface-border);
  background: var(--surface-50);
  padding: 0.75rem;
  border-radius: 6px;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.file-item {
  font-size: 0.875rem;
  color: var(--text-color-secondary);
  font-family: 'Courier New', monospace;
  background: var(--surface-0);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border: 1px solid var(--surface-border);
}
</style>