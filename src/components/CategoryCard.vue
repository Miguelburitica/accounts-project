<template>
  <article class="col-span-12 md:col-span-6 lg:col-span-4 mb-4">
    <div class="bg-white p-4 rounded-lg border border-slate-200">
      <div class="flex justify-between items-start mb-3">
        <h3 class="text-slate-900 font-medium">{{ category.name }}</h3>
        <Tag :value="`${category.percentage.toFixed(0)}%`" severity="info" />
      </div>
      <div class="text-xl font-bold text-slate-900 mb-2">{{ formatCurrency(category.budgeted) }}</div>
      <div class="text-slate-500 text-sm mb-3">
        Spent: {{ formatCurrency(category.actual) }}
      </div>
      <ProgressBar 
        :value="category.spentPercentage" 
        :showValue="false"
        :class="category.spentPercentage > 100 ? 'p-progressbar-danger' : ''"
        :aria-label="`${category.name} spending progress: ${category.spentPercentage.toFixed(1)}%`"
      />
      <div class="text-xs text-slate-500 mt-1">
        {{ category.spentPercentage.toFixed(1) }}% used
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import Tag from 'primevue/tag'
import ProgressBar from 'primevue/progressbar'

interface CategoryBreakdown {
  name: string
  budgeted: number
  actual: number
  percentage: number
  spentPercentage: number
}

interface Props {
  category: CategoryBreakdown
}

const props = defineProps<Props>()

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(value)
}
</script>