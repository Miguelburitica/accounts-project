<template>
  <section aria-labelledby="income-template-heading">
    <header class="mb-5">
      <h2 id="income-template-heading" class="font-medium text-3xl text-900 mb-3">Income Template</h2>
      <p class="text-500">Configure your regular income sources</p>
    </header>
    
    <Card class="mb-4">
      <template #content>
        <DataTable 
          :value="incomeTemplate" 
          editMode="row" 
          @row-edit-save="onRowEditSave"
          responsiveLayout="scroll"
          :paginator="true" 
          :rows="10"
          role="table"
          aria-label="Income template table"
        >
          <Column field="source" header="Source" style="width:30%">
            <template #editor="{ data, field }">
              <InputText 
                v-model="data[field]" 
                :aria-label="`Edit source for ${data.source}`"
              />
            </template>
          </Column>
          <Column field="amount" header="Amount" style="width:20%">
            <template #body="{ data }">
              {{ formatCurrency(data.amount) }}
            </template>
            <template #editor="{ data, field }">
              <InputNumber 
                v-model="data[field]" 
                mode="currency" 
                currency="COP" 
                :aria-label="`Edit amount for ${data.source}`"
              />
            </template>
          </Column>
          <Column field="frequency" header="Frequency" style="width:20%">
            <template #editor="{ data, field }">
              <Dropdown 
                v-model="data[field]" 
                :options="frequencyOptions" 
                optionValue="value" 
                optionLabel="label" 
                :aria-label="`Edit frequency for ${data.source}`"
              />
            </template>
          </Column>
          <Column field="is_active" header="Active" style="width:15%">
            <template #body="{ data }">
              <i class="pi" :class="{'pi-check text-green-500': data.is_active, 'pi-times text-red-400': !data.is_active}"></i>
            </template>
            <template #editor="{ data, field }">
              <Checkbox 
                v-model="data[field]" 
                binary 
                :aria-label="`Toggle active status for ${data.source}`"
              />
            </template>
          </Column>
          <Column :rowEditor="true" style="width:10%" bodyStyle="text-align:center"></Column>
          <Column style="width:5%">
            <template #body="{ data }">
              <Button 
                icon="pi pi-trash" 
                severity="danger" 
                outlined 
                @click="onDeleteItem(data.id)"
                :aria-label="`Delete income source ${data.source}`"
              />
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <Button 
      icon="pi pi-plus" 
      label="Add Income Source" 
      @click="$emit('add-income')" 
      class="mb-6"
      aria-label="Add new income source"
    />
  </section>
</template>

<script setup lang="ts">
import Card from 'primevue/card'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Dropdown from 'primevue/dropdown'
import Checkbox from 'primevue/checkbox'
import type { IncomeTemplate } from '@/types/financial'

interface Props {
  incomeTemplate: IncomeTemplate[]
  frequencyOptions: { label: string; value: string }[]
}

defineProps<Props>()

const emit = defineEmits<{
  'add-income': []
  'row-edit-save': [event: any]
  'delete-item': [id: number]
}>()

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(value)
}

function onRowEditSave(event: any) {
  emit('row-edit-save', event)
}

function onDeleteItem(id: number) {
  emit('delete-item', id)
}
</script>