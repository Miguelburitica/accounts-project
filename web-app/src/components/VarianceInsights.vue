<template>
  <section class="grid grid-cols-12 gap-6 mb-6" aria-label="Variance Insights">
    <article class="col-span-12 lg:col-span-6">
      <Card>
        <template #title>
          <h2 class="text-xl font-semibold">Variance Insights</h2>
        </template>
        <template #content>
          <div class="flex flex-column gap-4">
            
            <!-- Biggest Overruns -->
            <section v-if="biggestOverruns.length > 0" aria-labelledby="overruns-heading">
              <h3 id="overruns-heading" class="font-medium text-900 mb-3 flex align-items-center">
                <i class="pi pi-exclamation-triangle text-red-500 mr-2"></i>
                Biggest Budget Overruns
              </h3>
              <div v-for="item in biggestOverruns" :key="item.category" 
                   class="flex justify-content-between align-items-center p-3 surface-border border-1 border-round mb-2"
                   role="listitem">
                <div>
                  <div class="font-medium text-900">{{ item.category }}</div>
                  <div class="text-500 text-sm">Budget: {{ formatCurrency(item.budgeted_amount) }}</div>
                </div>
                <div class="text-right">
                  <div class="text-red-600 font-bold">{{ formatCurrency(Math.abs(item.variance_amount)) }} over</div>
                  <div class="text-red-500 text-sm">{{ item.variance_percentage.toFixed(1) }}% over budget</div>
                </div>
              </div>
            </section>

            <!-- Biggest Savings -->
            <section v-if="biggestSavings.length > 0" aria-labelledby="savings-heading">
              <h3 id="savings-heading" class="font-medium text-900 mb-3 flex align-items-center">
                <i class="pi pi-check-circle text-green-500 mr-2"></i>
                Biggest Budget Savings
              </h3>
              <div v-for="item in biggestSavings" :key="item.category" 
                   class="flex justify-content-between align-items-center p-3 surface-border border-1 border-round mb-2"
                   role="listitem">
                <div>
                  <div class="font-medium text-900">{{ item.category }}</div>
                  <div class="text-500 text-sm">Budget: {{ formatCurrency(item.budgeted_amount) }}</div>
                </div>
                <div class="text-right">
                  <div class="text-green-600 font-bold">{{ formatCurrency(item.variance_amount) }} saved</div>
                  <div class="text-green-500 text-sm">{{ item.variance_percentage.toFixed(1) }}% under budget</div>
                </div>
              </div>
            </section>

            <!-- No Variances -->
            <section v-if="biggestOverruns.length === 0 && biggestSavings.length === 0" 
                 class="text-center py-4 text-500"
                 role="status">
              <i class="pi pi-info-circle text-3xl mb-3"></i>
              <p>No significant variances detected for this period.</p>
            </section>

          </div>
        </template>
      </Card>
    </article>

    <article class="col-span-12 lg:col-span-6">
      <Card>
        <template #title>
          <h2 class="text-xl font-semibold">Variance Distribution</h2>
        </template>
        <template #content>
          <div class="flex flex-column gap-4">
            
            <!-- Variance Summary -->
            <section class="text-center mb-4" aria-labelledby="summary-heading">
              <h3 id="summary-heading" class="sr-only">Categories Summary</h3>
              <div class="text-3xl font-bold text-900 mb-2">{{ totalCategories }}</div>
              <div class="text-500">Categories Analyzed</div>
            </section>

            <Divider />

            <!-- Variance Categories -->
            <section class="grid text-center" aria-labelledby="distribution-heading">
              <h3 id="distribution-heading" class="sr-only">Variance Distribution</h3>
              <div class="col-4">
                <div class="text-2xl font-bold text-red-500">{{ overBudgetCount }}</div>
                <div class="text-500 text-sm">Over Budget</div>
              </div>
              <div class="col-4">
                <div class="text-2xl font-bold text-green-500">{{ underBudgetCount }}</div>
                <div class="text-500 text-sm">Under Budget</div>
              </div>
              <div class="col-4">
                <div class="text-2xl font-bold text-blue-500">{{ onBudgetCount }}</div>
                <div class="text-500 text-sm">On Target</div>
              </div>
            </section>

            <Divider />

            <!-- Accuracy Score -->
            <section class="text-center" aria-labelledby="accuracy-heading">
              <h3 id="accuracy-heading" class="text-500 mb-2">Budget Accuracy Score</h3>
              <div class="text-3xl font-bold" :class="accuracyScoreColor">{{ accuracyScore }}%</div>
              <ProgressBar 
                :value="accuracyScore" 
                :showValue="false"
                class="mt-3"
                :class="accuracyScore >= 80 ? '' : 'p-progressbar-danger'"
                :aria-label="`Budget accuracy score: ${accuracyScore}%`"
              />
            </section>

          </div>
        </template>
      </Card>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Card from 'primevue/card'
import Divider from 'primevue/divider'
import ProgressBar from 'primevue/progressbar'

interface CategoryVariance {
  category: string
  budgeted_amount: number
  actual_amount: number
  variance_amount: number
  variance_percentage: number
  reason: string
  explanation: string
}

interface Props {
  categoryVariances: CategoryVariance[]
  accuracyScore: number
}

const props = defineProps<Props>()

const biggestOverruns = computed(() => {
  return props.categoryVariances
    .filter(v => v.variance_amount < -50000) // Significant overruns
    .slice(0, 3)
})

const biggestSavings = computed(() => {
  return props.categoryVariances
    .filter(v => v.variance_amount > 50000) // Significant savings
    .slice(0, 3)
})

const totalCategories = computed(() => props.categoryVariances.length)

const overBudgetCount = computed(() => {
  return props.categoryVariances.filter(v => v.variance_amount < -10000).length
})

const underBudgetCount = computed(() => {
  return props.categoryVariances.filter(v => v.variance_amount > 10000).length
})

const onBudgetCount = computed(() => {
  return props.categoryVariances.filter(v => Math.abs(v.variance_amount) <= 10000).length
})

const accuracyScoreColor = computed(() => {
  const score = props.accuracyScore
  if (score >= 80) return 'text-green-500'
  if (score >= 60) return 'text-orange-500'
  return 'text-red-500'
})

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(value)
}
</script>

<style scoped>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>