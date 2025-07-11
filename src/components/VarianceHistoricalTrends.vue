<template>
  <section class="mb-6" aria-label="Historical Variance Trends">
    <Card>
      <template #title>
        <h2 class="text-xl font-semibold">Historical Variance Trends</h2>
      </template>
      <template #content>
        <p class="text-500 mb-4">Compare this period's variances with previous periods</p>
        <DataTable 
          :value="historicalVariances" 
          responsiveLayout="scroll"
          :paginator="true"
          :rows="5"
          tableStyle="min-width: 50rem"
          role="table"
          aria-label="Historical variance comparison table"
        >
          <Column field="period_label" header="Period" style="width:25%"></Column>
          <Column field="total_budget" header="Budget" style="width:20%">
            <template #body="{ data }">
              {{ formatCurrency(data.total_budget) }}
            </template>
          </Column>
          <Column field="total_actual" header="Actual" style="width:20%">
            <template #body="{ data }">
              {{ formatCurrency(data.total_actual) }}
            </template>
          </Column>
          <Column field="variance" header="Variance" style="width:20%">
            <template #body="{ data }">
              <span :class="data.variance >= 0 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'">
                {{ data.variance >= 0 ? '+' : '' }}{{ formatCurrency(data.variance) }}
              </span>
            </template>
          </Column>
          <Column field="accuracy" header="Accuracy" style="width:15%">
            <template #body="{ data }">
              <Tag 
                :value="`${data.accuracy}%`"
                :severity="data.accuracy >= 80 ? 'success' : data.accuracy >= 60 ? 'warning' : 'danger'"
              />
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>
  </section>
</template>

<script setup lang="ts">
import Card from 'primevue/card'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'

interface HistoricalVariance {
  period_label: string
  total_budget: number
  total_actual: number
  variance: number
  accuracy: number
}

interface Props {
  historicalVariances: HistoricalVariance[]
}

defineProps<Props>()

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(value)
}
</script>