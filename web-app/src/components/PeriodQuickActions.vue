<template>
  <Card>
    <template #title>
      <div class="flex items-center">
        <i class="pi pi-cog text-blue-500 text-2xl mr-2" aria-hidden="true"></i>
        <h2 class="text-xl font-semibold">Period Management</h2>
      </div>
    </template>
    <template #content>
      <div class="flex flex-column gap-2" role="group" aria-label="Period Management Actions">
        <Button 
          label="Start New Period" 
          icon="pi pi-plus" 
          @click="$emit('start-new-period')"
          class="w-full"
        />
        <Button 
          label="Generate Period Report" 
          icon="pi pi-chart-line" 
          severity="secondary" 
          @click="$emit('generate-report')"
          class="w-full"
        />
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import Card from 'primevue/card'
import Button from 'primevue/button'

defineEmits<{
  'start-new-period': []
  'generate-report': []
}>()
</script>