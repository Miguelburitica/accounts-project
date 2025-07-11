<template>
  <Card>
    <template #content>
      <div class="grid" role="group" aria-labelledby="filter-heading">
        <div class="col-12 lg:col-3 md:col-6">
          <label for="period-filter" class="font-semibold text-sm">Period</label>
          <Dropdown 
            id="period-filter"
            :model-value="filters.periodId" 
            :options="periodOptions" 
            optionValue="value" 
            optionLabel="label"
            placeholder="All Periods"
            class="w-full mt-1"
            showClear
            @update:model-value="$emit('update:periodId', $event)"
          />
        </div>
        <div class="col-12 lg:col-3 md:col-6">
          <label for="type-filter" class="font-semibold text-sm">Type</label>
          <Dropdown 
            id="type-filter"
            :model-value="filters.type" 
            :options="typeOptions" 
            optionValue="value" 
            optionLabel="label"
            placeholder="All Types"
            class="w-full mt-1"
            showClear
            @update:model-value="$emit('update:type', $event)"
          />
        </div>
        <div class="col-12 lg:col-3 md:col-6">
          <label for="category-filter" class="font-semibold text-sm">Category</label>
          <Dropdown 
            id="category-filter"
            :model-value="filters.category" 
            :options="categoryOptions" 
            optionValue="value" 
            optionLabel="label"
            placeholder="All Categories"
            class="w-full mt-1"
            showClear
            @update:model-value="$emit('update:category', $event)"
          />
        </div>
        <div class="col-12 lg:col-3 md:col-6">
          <label for="variance-filter" class="font-semibold text-sm">Variance</label>
          <Dropdown 
            id="variance-filter"
            :model-value="filters.varianceFlag" 
            :options="varianceOptions" 
            optionValue="value" 
            optionLabel="label"
            placeholder="All Transactions"
            class="w-full mt-1"
            showClear
            @update:model-value="$emit('update:varianceFlag', $event)"
          />
        </div>
      </div>
      
      <div class="flex justify-content-between items-center mt-4">
        <div class="flex gap-2">
          <Button 
            label="Add Transaction" 
            icon="pi pi-plus" 
            @click="$emit('add-transaction')"
          />
          <Button 
            label="Bulk Import" 
            icon="pi pi-upload" 
            severity="secondary"
            @click="$emit('bulk-import')"
          />
        </div>
        <div class="flex gap-2">
          <Button 
            label="Export Current View" 
            icon="pi pi-download" 
            severity="help"
            @click="$emit('export-filtered')"
          />
          <Button 
            label="Clear Filters" 
            icon="pi pi-filter-slash" 
            severity="warning"
            @click="$emit('clear-filters')"
            :disabled="!hasActiveFilters"
          />
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import Card from 'primevue/card'
import Dropdown from 'primevue/dropdown'
import Button from 'primevue/button'

interface Filters {
  periodId: number | null
  type: 'income' | 'expense' | null
  category: string | null
  varianceFlag: boolean | null
}

interface Props {
  filters: Filters
  periodOptions: Array<{ label: string, value: number }>
  categoryOptions: Array<{ label: string, value: string }>
  hasActiveFilters: boolean
}

defineProps<Props>()

defineEmits<{
  'update:periodId': [value: number | null]
  'update:type': [value: 'income' | 'expense' | null]
  'update:category': [value: string | null]
  'update:varianceFlag': [value: boolean | null]
  'add-transaction': []
  'bulk-import': []
  'export-filtered': []
  'clear-filters': []
}>()

const typeOptions = [
  { label: 'Income', value: 'income' },
  { label: 'Expense', value: 'expense' }
]

const varianceOptions = [
  { label: 'Variance Items Only', value: true },
  { label: 'Regular Items Only', value: false }
]
</script>