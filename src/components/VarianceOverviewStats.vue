<template>
  <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6" aria-label="Variance Overview Statistics">
    <StatCard
      title="Total Budget"
      :value="period.total_budget"
      icon="pi-chart-pie"
      variant="blue"
      subtitle="Planned spending"
      subtitle-variant="info"
    />
    
    <StatCard
      title="Actual Spending"
      :value="period.total_actual"
      icon="pi-shopping-cart"
      variant="orange"
      subtitle="Reality check"
      subtitle-variant="info"
    />

    <StatCard
      :title="period.variance >= 0 ? 'Budget Savings' : 'Budget Overrun'"
      :value="Math.abs(period.variance)"
      :icon="period.variance >= 0 ? 'pi-trending-up' : 'pi-trending-down'"
      :variant="period.variance >= 0 ? 'green' : 'red'"
      :subtitle="period.variance >= 0 ? 'Under budget' : 'Over budget'"
      :subtitle-variant="period.variance >= 0 ? 'success' : 'danger'"
    />

    <StatCard
      title="Variance Percentage"
      :value="variancePercentage"
      icon="pi-percentage"
      variant="purple"
      subtitle="Budget accuracy"
      subtitle-variant="info"
      :format-as-currency="false"
      suffix="%"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import StatCard from '@/components/StatCard.vue'
import type { Period } from '@/types/financial'

interface Props {
  period: Period
}

const props = defineProps<Props>()

const variancePercentage = computed(() => {
  if (props.period.total_budget === 0) return 0
  return Math.abs((props.period.variance / props.period.total_budget) * 100).toFixed(1)
})
</script>