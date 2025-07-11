<template>
  <Card>
    <template #title>
      <div class="flex justify-content-between align-items-center">
        <h2 class="text-xl font-semibold">All Transactions</h2>
        <Tag :value="`${transactions.length} items`" />
      </div>
    </template>
    <template #content>
      <DataTable 
        :value="transactions" 
        edit-mode="row" 
        @row-edit-save="$emit('row-edit-save', $event)"
        responsive-layout="scroll"
        :paginator="true" 
        :rows="15"
        sort-field="date"
        :sort-order="-1"
        striped-rows
        :loading="loading"
        table-style="min-width: 50rem"
      >
        <Column field="date" header="Date" style="width:12%" sortable>
          <template #body="{ data }">
            {{ formatDate(data.date) }}
          </template>
          <template #editor="{ data, field }">
            <Calendar v-model="data[field]" date-format="yy-mm-dd" show-icon />
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
            <Dropdown v-model="data[field]" :options="typeOptions" option-value="value" option-label="label" />
          </template>
        </Column>

        <Column field="category" header="Category" style="width:15%">
          <template #editor="{ data, field }">
            <Dropdown v-model="data[field]" :options="categoryOptions" option-value="value" option-label="label" />
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
            <Dropdown v-model="data[field]" :options="periodOptions" option-value="value" option-label="label" />
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

        <Column :row-editor="true" style="width:8%" body-style="text-align:center"></Column>
        
        <Column style="width:5%">
          <template #body="{ data }">
            <Button 
              icon="pi pi-trash" 
              severity="danger" 
              outlined 
              size="small"
              @click="$emit('delete-transaction', data.id)" 
              :aria-label="`Delete transaction ${data.description}`"
            />
          </template>
        </Column>
      </DataTable>
    </template>
  </Card>
</template>

<script setup lang="ts">
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
import Tag from 'primevue/tag'

interface Props {
  transactions: Transaction[]
  loading?: boolean
  periodOptions: Array<{ label: string, value: number }>
  categoryOptions: Array<{ label: string, value: string }>
}

defineProps<Props>()

defineEmits<{
  'row-edit-save': [event: any]
  'delete-transaction': [id: number]
}>()

const typeOptions = [
  { label: 'Income', value: 'income' },
  { label: 'Expense', value: 'expense' }
]

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
</script>