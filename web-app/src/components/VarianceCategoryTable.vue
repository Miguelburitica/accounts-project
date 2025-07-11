<template>
  <Card>
    <template #title>
      <div class="flex justify-content-between items-center">
        <h2 class="text-xl font-semibold">Category Variance Analysis</h2>
        <div class="flex gap-2">
          <Button 
            label="Add Variance Note" 
            icon="pi pi-plus" 
            size="small"
            @click="$emit('add-variance-note')"
          />
          <Button 
            label="Auto-Detect Variances" 
            icon="pi pi-search" 
            severity="secondary"
            size="small"
            @click="$emit('auto-detect')"
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
        tableStyle="min-width: 50rem"
        role="table"
        aria-label="Category variance analysis table"
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
              @click="$emit('edit-variance-note', data)"
              :aria-label="`${data.explanation ? 'View' : 'Add'} variance note for ${data.category}`"
            />
          </template>
        </Column>
      </DataTable>
    </template>
  </Card>
</template>

<script setup lang="ts">
import Card from 'primevue/card'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Tag from 'primevue/tag'

interface CategoryVariance {
  category: string
  budgeted_amount: number
  actual_amount: number
  variance_amount: number
  variance_percentage: number
  reason: string
  explanation: string
}

interface Props {
  categoryVariances: CategoryVariance[]
}

defineProps<Props>()

defineEmits<{
  'add-variance-note': []
  'auto-detect': []
  'edit-variance-note': [variance: CategoryVariance]
}>()

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(value)
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
</script>