<template>
  <Dialog 
    v-model:visible="dialogVisible"
    modal 
    header="Bulk Import Transactions" 
    :style="{ width: '600px' }"
  >
    <div class="flex flex-column gap-3 mb-3" role="group" aria-labelledby="import-instructions">
      <div id="import-instructions" class="text-500 mb-2">
        Upload a CSV file with columns: date, type, category, subcategory, amount, description, variance_flag
      </div>
      
      <section aria-labelledby="file-upload-section">
        <h3 id="file-upload-section" class="sr-only">File Upload</h3>
        <FileUpload
          mode="basic"
          name="transactions"
          accept=".csv"
          :maxFileSize="1000000"
          @select="handleFileSelect"
          :auto="false"
          chooseLabel="Select CSV File"
          aria-label="Select CSV file for transaction import"
        />
      </section>
      
      <section v-if="previewData.length > 0" class="mt-3" aria-labelledby="preview-section">
        <h3 id="preview-section" class="text-600 font-medium mb-2">Preview (first 5 rows):</h3>
        <div class="overflow-auto">
          <DataTable 
            :value="previewData.slice(0, 5)" 
            size="small"
            responsiveLayout="scroll"
            aria-label="Import preview table"
          >
            <Column field="date" header="Date" style="min-width: 100px"></Column>
            <Column field="type" header="Type" style="min-width: 80px"></Column>
            <Column field="category" header="Category" style="min-width: 120px"></Column>
            <Column field="amount" header="Amount" style="min-width: 100px"></Column>
            <Column field="description" header="Description" style="min-width: 150px"></Column>
          </DataTable>
        </div>
        <div class="text-500 text-sm mt-2" role="status" aria-live="polite">
          Total rows to import: {{ previewData.length }}
        </div>
      </section>
    </div>
    
    <template #footer>
      <Button 
        label="Cancel" 
        icon="pi pi-times" 
        text 
        @click="handleCancel"
        type="button"
      />
      <Button 
        label="Import Transactions" 
        icon="pi pi-upload" 
        @click="handleImport"
        :disabled="previewData.length === 0"
        type="button"
      />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import FileUpload from 'primevue/fileupload'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

interface ImportTransaction {
  date: string
  type: string
  category: string
  subcategory?: string
  amount: number
  description: string
  variance_flag: boolean
}

interface Props {
  visible: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'import': [transactions: ImportTransaction[]]
}>()

const previewData = ref<ImportTransaction[]>([])
const dialogVisible = computed({
  get: () => props.visible,
  set: (newVal) => {
    emit('update:visible', newVal)
  }
})

watch(() => props.visible, (newValue) => {
  if (newValue) {
    resetImport()
  }
})

function resetImport() {
  previewData.value = []
}

function handleFileSelect(event: any) {
  const file = event.files[0]
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = (e) => {
    const csv = e.target?.result as string
    previewData.value = parseCSV(csv)
  }
  reader.readAsText(file)
}

function parseCSV(csvText: string): ImportTransaction[] {
  const lines = csvText.trim().split('\n')
  if (lines.length < 2) return []
  
  const headers = lines[0].split(',').map(h => h.trim())
  const data: ImportTransaction[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim())
    const row: any = {}
    
    headers.forEach((header, index) => {
      const value = values[index] || ''
      if (header === 'amount' && !isNaN(Number(value))) {
        row[header] = Number(value)
      } else if (header === 'variance_flag') {
        row[header] = value.toLowerCase() === 'true'
      } else {
        row[header] = value
      }
    })
    
    data.push(row as ImportTransaction)
  }
  
  return data
}

function handleImport() {
  if (previewData.value.length === 0) return
  
  emit('import', previewData.value)
  emit('update:visible', false)
}

function handleCancel() {
  emit('update:visible', false)
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

.overflow-auto {
  overflow: auto;
  max-height: 300px;
}
</style>