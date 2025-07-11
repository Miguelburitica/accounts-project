<template>
  <section aria-labelledby="expense-template-heading">
    <header class="mb-5">
      <h2 id="expense-template-heading" class="font-medium text-3xl text-900 mb-3">Expense Template</h2>
      <p class="text-500">Configure your regular expenses and budget items</p>
    </header>
    
    <Card>
      <template #content>
        <DataTable 
          :value="budgetTemplate" 
          editMode="row" 
          @row-edit-save="onRowEditSave"
          responsiveLayout="scroll"
          :paginator="true" 
          :rows="10"
          role="table"
          aria-label="Expense template table"
        >
          <Column field="category" header="Category" style="width:20%">
            <template #editor="{ data, field }">
              <Dropdown 
                v-model="data[field]" 
                :options="categoryOptions" 
                optionValue="value" 
                optionLabel="label"
                placeholder="Select category"
                @change="onCategoryChange"
                :aria-label="`Edit category for ${data.subcategory || 'budget item'}`"
              >
                <template #footer>
                  <div class="p-2 border-top-1 surface-border">
                    <Button 
                      label="Add New Category" 
                      icon="pi pi-plus" 
                      text 
                      size="small"
                      @click="$emit('add-category')"
                    />
                  </div>
                </template>
              </Dropdown>
            </template>
          </Column>
          <Column field="subcategory" header="Subcategory" style="width:20%">
            <template #editor="{ data, field }">
              <InputText 
                v-model="data[field]" 
                :aria-label="`Edit subcategory for ${data.category}`"
              />
            </template>
          </Column>
          <Column field="amount" header="Amount" style="width:15%">
            <template #body="{ data }">
              {{ formatCurrency(data.amount) }}
            </template>
            <template #editor="{ data, field }">
              <InputNumber 
                v-model="data[field]" 
                mode="currency" 
                currency="COP" 
                :aria-label="`Edit amount for ${data.subcategory || data.category}`"
              />
            </template>
          </Column>
          <Column field="due_date" header="Due Date" style="width:10%">
            <template #editor="{ data, field }">
              <InputNumber 
                v-model="data[field]" 
                :min="1" 
                :max="31" 
                :aria-label="`Edit due date for ${data.subcategory || data.category}`"
              />
            </template>
          </Column>
          <Column field="frequency" header="Frequency" style="width:15%">
            <template #editor="{ data, field }">
              <Dropdown 
                v-model="data[field]" 
                :options="frequencyOptions" 
                optionValue="value" 
                optionLabel="label" 
                :aria-label="`Edit frequency for ${data.subcategory || data.category}`"
              />
            </template>
          </Column>
          <Column field="is_active" header="Active" style="width:10%">
            <template #body="{ data }">
              <i class="pi" :class="{'pi-check text-green-500': data.is_active, 'pi-times text-red-400': !data.is_active}"></i>
            </template>
            <template #editor="{ data, field }">
              <Checkbox 
                v-model="data[field]" 
                binary 
                :aria-label="`Toggle active status for ${data.subcategory || data.category}`"
              />
            </template>
          </Column>
          <Column :rowEditor="true" style="width:8%" bodyStyle="text-align:center"></Column>
          <Column style="width:2%">
            <template #body="{ data }">
              <Button 
                icon="pi pi-trash" 
                severity="danger" 
                outlined 
                @click="onDeleteItem(data.id)"
                :aria-label="`Delete expense ${data.subcategory || data.category}`"
              />
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <Button 
      icon="pi pi-plus" 
      label="Add Budget Item" 
      @click="$emit('add-budget')" 
      class="mt-4"
      aria-label="Add new budget item"
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
import type { BudgetTemplate } from '@/types/financial'

interface Props {
  budgetTemplate: BudgetTemplate[]
  categoryOptions: { label: string; value: string }[]
  frequencyOptions: { label: string; value: string }[]
}

defineProps<Props>()

const emit = defineEmits<{
  'add-budget': []
  'add-category': []
  'row-edit-save': [event: any]
  'delete-item': [id: number]
  'category-change': []
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

function onCategoryChange() {
  emit('category-change')
}
</script>