<template>
  <Card>
    <template #title>
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold">Current Period Status</h2>
        <Tag 
          v-if="currentPeriod" 
          :value="currentPeriod.status" 
          :severity="currentPeriod.status === 'active' ? 'success' : 'info'" 
        />
        <Tag v-else value="No Active Period" severity="warning" />
      </div>
    </template>
    <template #content>
      <div v-if="currentPeriod">
        <div class="grid grid-cols-12 gap-4">
          <div class="col-span-12 md:col-span-6">
            <div class="text-slate-500 font-medium mb-2">Period Duration</div>
            <div class="text-slate-900 font-bold text-lg mb-3">
              <time :datetime="currentPeriod.start_date">{{ formatDate(currentPeriod.start_date) }}</time> - 
              <time :datetime="currentPeriod.end_date">{{ formatDate(currentPeriod.end_date) }}</time>
            </div>
            <div class="flex items-center gap-2">
              <i class="pi pi-clock text-orange-500" aria-hidden="true"></i>
              <span class="text-slate-500">{{ daysRemaining }} days remaining</span>
            </div>
          </div>
          <div class="col-span-12 md:col-span-6">
            <div class="text-slate-500 font-medium mb-2">Budget Progress</div>
            <ProgressBar 
              :value="budgetProgressPercentage" 
              :showValue="false"
              class="mb-3"
              :class="budgetProgressPercentage > 100 ? 'p-progressbar-danger' : ''"
              :aria-label="`Budget progress: ${budgetProgressPercentage.toFixed(1)}%`"
            />
            <div class="flex justify-between text-sm">
              <span class="text-slate-500">{{ budgetProgressPercentage.toFixed(1) }}% of budget used</span>
              <span :class="currentPeriodVariance >= 0 ? 'text-green-500' : 'text-red-500'">
                {{ formatCurrency(currentPeriodVariance) }} {{ currentPeriodVariance >= 0 ? 'remaining' : 'over' }}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-center py-4">
        <i class="pi pi-info-circle text-yellow-500 text-3xl mb-3" aria-hidden="true"></i>
        <p class="text-slate-500 mb-4">No active period found. Start a new 15-day cycle to begin tracking.</p>
        <Button label="Start New Period" icon="pi pi-plus" @click="navigateToPeriodsPage" />
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import Card from 'primevue/card'
import Tag from 'primevue/tag'
import ProgressBar from 'primevue/progressbar'
import Button from 'primevue/button'
import type { Period } from '@/types/financial'

interface Props {
  currentPeriod: Period | null
  daysRemaining: number
  budgetProgressPercentage: number
  currentPeriodVariance: number
}

const props = defineProps<Props>()
const router = useRouter()

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(value)
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const navigateToPeriodsPage = () => {
  router.push('/periods')
}
</script>