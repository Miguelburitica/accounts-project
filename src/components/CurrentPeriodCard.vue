<template>
  <section v-if="currentPeriod" class="mb-6" aria-label="Current Period Information">
    <Card>
      <template #title>
        <div class="flex justify-content-between items-center">
          <h2 class="text-xl font-semibold mr-2">Current Period</h2>
          <Tag :value="currentPeriod.status" :severity="currentPeriod.status === 'active' ? 'success' : 'info'" />
        </div>
      </template>
      <template #content>
        <div class="grid">
          <div class="col-12 md:col-6">
            <section aria-labelledby="period-dates-heading">
              <h3 id="period-dates-heading" class="text-500 font-medium mb-2">Period Dates</h3>
              <div class="text-900 font-bold text-xl mb-3">
                {{ formatDate(currentPeriod.start_date) }} - {{ formatDate(currentPeriod.end_date) }}
              </div>
              <div class="text-500 mb-2">Days Remaining</div>
              <div class="text-900 font-bold text-lg">{{ daysRemaining }} days</div>
            </section>
          </div>
          <div class="col-12 md:col-6">
            <section aria-labelledby="financial-summary-heading">
              <h3 id="financial-summary-heading" class="text-500 font-medium mb-2">Financial Summary</h3>
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
            </section>
          </div>
        </div>
        
        <div class="flex gap-2 mt-4" role="group" aria-label="Period Actions">
          <Button 
            label="Close Period" 
            icon="pi pi-check" 
            @click="$emit('close-period')"
            :disabled="currentPeriod.status !== 'active'"
          />
          <Button 
            label="Add Note" 
            icon="pi pi-comment" 
            severity="secondary"
            @click="$emit('add-note')"
          />
        </div>
      </template>
    </Card>
  </section>

  <section v-else class="mb-6" aria-label="No Current Period">
    <Card>
      <template #title>
        <h2 class="text-xl font-semibold">No Active Period</h2>
      </template>
      <template #content>
        <p class="text-500 mb-4">You don't have an active period. Start a new 15-day cycle to begin tracking your finances.</p>
        <Button 
          label="Start New Period" 
          icon="pi pi-plus" 
          @click="$emit('start-new-period')"
        />
      </template>
    </Card>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import type { Period } from '@/types/financial'

interface Props {
  currentPeriod: Period | null
}

const props = defineProps<Props>()

defineEmits<{
  'close-period': []
  'add-note': []
  'start-new-period': []
}>()

const daysRemaining = computed(() => {
  if (!props.currentPeriod) return 0
  const endDate = new Date(props.currentPeriod.end_date)
  const today = new Date()
  const diffTime = endDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
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
</script>