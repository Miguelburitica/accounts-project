<template>
  <main class="surface-ground px-4 py-8 md:px-6 lg:px-8">
    <header class="mb-4">
      <h1 class="text-900 font-bold text-6xl mb-4 text-center">Period Management</h1>
      <p class="text-700 text-xl mb-6 text-center line-height-3">
        Manage your 15-day financial cycles
      </p>
    </header>

    <CurrentPeriodCard 
      :current-period="currentPeriod"
      @close-period="showClosePeriodDialog = true"
      @add-note="showAddNoteDialog = true"
      @start-new-period="showNewPeriodDialog = true"
    />

    <section class="grid grid-cols-12 gap-6 mb-6" aria-label="Period Management Actions">
      <div class="col-span-12 md:col-span-6">
        <PeriodExportCard 
          :has-current-period="!!currentPeriod"
          :current-period-id="currentPeriod?.id"
          @export-current-period="exportCurrentPeriod"
          @export-periods-history="exportPeriodsHistory"
          @export-full-backup="exportFullBackup"
        />
      </div>

      <div class="col-span-12 md:col-span-6">
        <PeriodQuickActions 
          @start-new-period="showNewPeriodDialog = true"
          @generate-report="generatePeriodReport"
        />
      </div>
    </section>

    <section class="mb-6" aria-label="Period History">
      <PeriodHistoryTable 
        :periods-history="periodsHistory"
        @view-period-details="viewPeriodDetails"
      />
    </section>
  </main>

  <NewPeriodDialog
    :visible="showNewPeriodDialog"
    @update:visible="showNewPeriodDialog = $event"
    @submit="handleNewPeriodSubmit"
  />

  <ClosePeriodDialog
    :visible="showClosePeriodDialog"
    @update:visible="showClosePeriodDialog = $event"
    @submit="handleClosePeriodSubmit"
  />

  <PeriodNoteDialog
    :visible="showAddNoteDialog"
    @update:visible="showAddNoteDialog = $event"
    @submit="handlePeriodNoteSubmit"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useFinancialStore } from '@/stores/financial'
import type { Period } from '@/types/financial'

import CurrentPeriodCard from '@/components/CurrentPeriodCard.vue'
import PeriodQuickActions from '@/components/PeriodQuickActions.vue'
import PeriodExportCard from '@/components/PeriodExportCard.vue'
import PeriodHistoryTable from '@/components/PeriodHistoryTable.vue'
import NewPeriodDialog from '@/components/NewPeriodDialog.vue'
import ClosePeriodDialog from '@/components/ClosePeriodDialog.vue'
import PeriodNoteDialog from '@/components/PeriodNoteDialog.vue'

const financialStore = useFinancialStore()

const showNewPeriodDialog = ref(false)
const showClosePeriodDialog = ref(false)
const showAddNoteDialog = ref(false)

const currentPeriod = computed(() => financialStore.currentPeriod)
const periodsHistory = computed(() => financialStore.periods)

function handleNewPeriodSubmit(data: any) {
  financialStore.createNewPeriod({
    start_date: data.start_date.toISOString().split('T')[0],
    end_date: data.end_date.toISOString().split('T')[0],
    liquid_assets_start: data.liquid_assets_start,
    applyTemplate: data.applyTemplate
  })
}

function handleClosePeriodSubmit(data: any) {
  if (currentPeriod.value) {
    financialStore.closePeriod({
      liquid_assets_end: data.liquid_assets_end,
      notes: data.notes
    })
  }
}

function handlePeriodNoteSubmit(note: string) {
  if (currentPeriod.value) {
    financialStore.updatePeriodNotes(currentPeriod.value.id, note)
  }
}

function viewPeriodDetails(period: Period) {
  // TODO: Navigate to period details view or show detailed dialog
  console.log('View period details:', period)
}

function generatePeriodReport() {
  // TODO: Generate and show period analysis report
  console.log('Generate period report')
}

function exportCurrentPeriod() {
  if (currentPeriod.value) {
    financialStore.exportPeriodData(currentPeriod.value.id)
  }
}

function exportPeriodsHistory() {
  financialStore.exportPeriodsOnly()
}

function exportFullBackup() {
  financialStore.exportAllCSV()
}

onMounted(() => {
  financialStore.loadFromLocalStorage()
})
</script>

<style scoped>
</style>