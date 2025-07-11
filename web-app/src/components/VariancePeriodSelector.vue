<template>
  <Card>
    <template #content>
      <div class="flex justify-content-between items-center">
        <div class="flex items-center gap-3">
          <label for="period-select" class="font-semibold">Analyze Period:</label>
          <Dropdown 
            id="period-select"
            :model-value="selectedPeriodId" 
            :options="periodOptions" 
            optionValue="value" 
            optionLabel="label"
            placeholder="Select a period"
            class="w-20rem"
            @update:model-value="$emit('update:selectedPeriodId', $event)"
          />
        </div>
        <div class="flex gap-2">
          <Button 
            label="Generate Report" 
            icon="pi pi-file-pdf" 
            @click="$emit('generate-report')"
            :disabled="!hasPeriod"
          />
          <Button 
            label="Export Analysis" 
            icon="pi pi-download" 
            severity="secondary"
            @click="$emit('export-analysis')"
            :disabled="!hasPeriod"
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

interface Props {
  selectedPeriodId: number | null
  periodOptions: Array<{ label: string, value: number }>
  hasPeriod: boolean
}

defineProps<Props>()

defineEmits<{
  'update:selectedPeriodId': [value: number | null]
  'generate-report': []
  'export-analysis': []
}>()
</script>