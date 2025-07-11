<template>
  <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6" aria-label="Transaction Summary Statistics">
    <StatCard
      title="Total Income"
      :value="summaryStats.totalIncome"
      icon="pi-arrow-up"
      variant="green"
      :subtitle="`${summaryStats.incomeCount} transactions`"
      subtitle-variant="info"
    />
    
    <StatCard
      title="Total Expenses"
      :value="summaryStats.totalExpenses"
      icon="pi-arrow-down"
      variant="red"
      :subtitle="`${summaryStats.expenseCount} transactions`"
      subtitle-variant="info"
    />

    <StatCard
      title="Net Flow"
      :value="summaryStats.netFlow"
      icon="pi-arrows-h"
      variant="blue"
      subtitle="Income - Expenses"
      subtitle-variant="info"
    />

    <StatCard
      title="Variance Items"
      :value="summaryStats.varianceCount"
      icon="pi-exclamation-triangle"
      variant="orange"
      subtitle="Budget variances"
      subtitle-variant="info"
    />
  </section>
</template>

<script setup lang="ts">
import StatCard from '@/components/StatCard.vue'

interface SummaryStats {
  totalIncome: number
  totalExpenses: number
  netFlow: number
  incomeCount: number
  expenseCount: number
  varianceCount: number
}

interface Props {
  summaryStats: SummaryStats
}

defineProps<Props>()
</script>