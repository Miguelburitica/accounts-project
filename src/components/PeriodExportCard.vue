<template>
  <Card>
    <template #title>
      <div class="flex items-center">
        <i class="pi pi-download text-orange-500 text-2xl mr-2" aria-hidden="true"></i>
        <h2 class="text-xl font-semibold">Export & Backup</h2>
      </div>
    </template>
    <template #content>
      <div class="grid grid-cols-1 gap-2" role="group" aria-label="Export Options">
        
        <!-- Current Period Export -->
        <section class="export-section" aria-labelledby="current-period-export-heading">
          <h3 id="current-period-export-heading" class="sr-only">Current Period Export</h3>
          <div class="export-header">
            <Button 
              label="Current Period Data" 
              icon="pi pi-file-export" 
              severity="help" 
              @click="$emit('export-current-period')"
              class="export-button"
              :disabled="!hasCurrentPeriod"
            />
          </div>
          <div class="export-files">
            <div class="text-sm text-500 mb-1">Downloads:</div>
            <div class="file-list">
              <span class="file-item">📄 period_{{ currentPeriodId || 'X' }}_YYYY-MM-DD.csv</span>
              <span class="file-item">📊 period_{{ currentPeriodId || 'X' }}_transactions_YYYY-MM-DD.csv</span>
              <span class="file-item">⚠️ period_{{ currentPeriodId || 'X' }}_variances_YYYY-MM-DD.csv</span>
            </div>
            <div class="text-xs text-400 mt-1">* Only downloads files with data</div>
          </div>
        </section>

        <!-- Periods History Export -->
        <section class="export-section" aria-labelledby="periods-history-export-heading">
          <h3 id="periods-history-export-heading" class="sr-only">Periods History Export</h3>
          <div class="export-header">
            <Button 
              label="All Periods History" 
              icon="pi pi-history" 
              severity="help" 
              @click="$emit('export-periods-history')"
              class="export-button"
            />
          </div>
          <div class="export-files">
            <div class="text-sm text-500 mb-1">Downloads:</div>
            <div class="file-list">
              <span class="file-item">📋 periods_YYYY-MM-DD.csv</span>
            </div>
          </div>
        </section>

        <!-- Complete Backup Export -->
        <section class="export-section" aria-labelledby="complete-backup-export-heading">
          <h3 id="complete-backup-export-heading" class="sr-only">Complete Backup Export</h3>
          <div class="export-header">
            <Button 
              label="Complete Data Backup" 
              icon="pi pi-database" 
              severity="warning" 
              @click="$emit('export-full-backup')"
              class="export-button"
            />
          </div>
          <div class="export-files">
            <div class="text-sm text-500 mb-1">Downloads (9 files):</div>
            <div class="file-list">
              <span class="file-item">📋 periods_YYYY-MM-DD.csv</span>
              <span class="file-item">🏦 accounts_YYYY-MM-DD.csv</span>
              <span class="file-item">💰 receivables_YYYY-MM-DD.csv</span>
              <span class="file-item">📝 budget_template_YYYY-MM-DD.csv</span>
              <span class="file-item">💵 income_template_YYYY-MM-DD.csv</span>
              <span class="file-item">🔄 receivable_payments_YYYY-MM-DD.csv</span>
              <span class="file-item">📊 transactions_YYYY-MM-DD.csv</span>
              <span class="file-item">⚠️ variances_YYYY-MM-DD.csv</span>
              <span class="file-item">🎯 goals_YYYY-MM-DD.csv</span>
            </div>
            <div class="text-xs text-400 mt-1">* Complete backup of all your financial data</div>
          </div>
        </section>

      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import Card from 'primevue/card'
import Button from 'primevue/button'
import Divider from 'primevue/divider'

interface Props {
  hasCurrentPeriod: boolean
  currentPeriodId?: number | null
}

defineProps<Props>()

defineEmits<{
  'export-current-period': []
  'export-periods-history': []
  'export-full-backup': []
}>()
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

.export-section {
  @apply col-span-1;
}

.export-header {
  display: flex;
  align-items: center;
}

.export-button {
  width: 100%;
}

.export-files {
  padding-left: 1rem;
  border-left: 3px solid var(--surface-border);
  background: var(--surface-50);
  padding: 0.75rem;
  border-radius: 6px;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.file-item {
  font-size: 0.875rem;
  color: var(--text-color-secondary);
  font-family: 'Courier New', monospace;
  background: var(--surface-0);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border: 1px solid var(--surface-border);
}
</style>