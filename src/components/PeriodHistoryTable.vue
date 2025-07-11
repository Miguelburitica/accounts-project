<template>
  <Card>
    <template #title>
      <h2 class="text-xl font-semibold">Period History</h2>
    </template>
    <template #content>
      <DataTable 
        :value="periodsHistory" 
        responsiveLayout="scroll"
        :paginator="true" 
        :rows="10"
        sortField="start_date"
        :sortOrder="-1"
        tableStyle="min-width: 50rem"
        role="table"
        aria-label="Period history table"
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
              @click="$emit('view-period-details', data)"
              :aria-label="`View details for period ${data.id}`"
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
import type { Period } from '@/types/financial'

interface Props {
  periodsHistory: Period[]
}

defineProps<Props>()

defineEmits<{
  'view-period-details': [period: Period]
}>()

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
</script>