<template>
  <Card>
    <template #title>
      <h2 class="text-xl font-semibold">{{ title }}</h2>
    </template>
    <template #content>
      <apexchart 
        :type="chartType" 
        :height="height"
        :options="options" 
        :series="series"
        :aria-label="`${title} Chart`"
      />
    </template>
  </Card>
</template>

<script setup lang="ts">
import Card from 'primevue/card'
import VueApexCharts from 'vue3-apexcharts'

const apexchart = VueApexCharts

interface Props {
  title: string
  chartType: 'bar' | 'line' | 'donut' | 'pie' | 'area'
  height: string | number
  options: any
  series: any[]
}

const props = defineProps<Props>()
</script>