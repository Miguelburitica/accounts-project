<template>
  <Dialog 
    v-model:visible="visible" 
    modal 
    header="Add New Transaction" 
    :style="{ width: '500px' }"
    @update:visible="$emit('update:visible', $event)"
  >
    <form @submit.prevent="handleSubmit" role="form" aria-labelledby="add-transaction-title">
      <div class="flex flex-column gap-3 mb-3">
        <fieldset class="grid">
          <legend class="sr-only">Transaction Date and Type</legend>
          <div class="col-6">
            <label for="new-date" class="font-semibold">Date</label>
            <Calendar 
              id="new-date"
              v-model="transactionData.date" 
              dateFormat="yy-mm-dd"
              showIcon
              class="w-full mt-1"
              required
            />
          </div>
          <div class="col-6">
            <label for="new-type" class="font-semibold">Type</label>
            <Dropdown 
              id="new-type"
              v-model="transactionData.type" 
              :options="typeOptions" 
              optionValue="value" 
              optionLabel="label"
              class="w-full mt-1"
              required
            />
          </div>
        </fieldset>

        <fieldset class="grid">
          <legend class="sr-only">Amount and Period</legend>
          <div class="col-6">
            <label for="new-amount" class="font-semibold">Amount</label>
            <InputNumber 
              id="new-amount"
              v-model="transactionData.amount" 
              mode="currency" 
              currency="COP"
              class="w-full mt-1"
              required
            />
          </div>
          <div class="col-6">
            <label for="new-period" class="font-semibold">Period</label>
            <Dropdown 
              id="new-period"
              v-model="transactionData.period_id" 
              :options="periodOptions" 
              optionValue="value" 
              optionLabel="label"
              class="w-full mt-1"
              required
            />
          </div>
        </fieldset>

        <fieldset class="grid">
          <legend class="sr-only">Category and Subcategory</legend>
          <div class="col-6">
            <label for="new-category" class="font-semibold">Category</label>
            <Dropdown 
              id="new-category"
              v-model="transactionData.category" 
              :options="categoryOptions" 
              optionValue="value" 
              optionLabel="label"
              class="w-full mt-1"
              required
            />
          </div>
          <div class="col-6">
            <label for="new-subcategory" class="font-semibold">Subcategory</label>
            <InputText 
              id="new-subcategory"
              v-model="transactionData.subcategory" 
              class="w-full mt-1"
              placeholder="Optional"
            />
          </div>
        </fieldset>

        <div>
          <label for="new-description" class="font-semibold">Description</label>
          <InputText 
            id="new-description"
            v-model="transactionData.description" 
            class="w-full mt-1"
            placeholder="Transaction description..."
          />
        </div>

        <div class="flex align-items-center gap-2">
          <Checkbox 
            id="new-variance-flag"
            v-model="transactionData.variance_flag" 
            binary 
          />
          <label for="new-variance-flag" class="font-semibold">Mark as budget variance</label>
        </div>
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
          label="Add Transaction" 
          icon="pi pi-check" 
          @click="handleSubmit"
          type="submit"
        />
      </template>
    </form>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

import Dialog from 'primevue/dialog'
import Calendar from 'primevue/calendar'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Dropdown from 'primevue/dropdown'
import Checkbox from 'primevue/checkbox'
import Button from 'primevue/button'

interface TransactionData {
  date: Date
  type: 'income' | 'expense'
  amount: number
  period_id: number | null
  category: string
  subcategory: string
  description: string
  variance_flag: boolean
}

interface Props {
  visible: boolean
  periodOptions: Array<{ label: string, value: number }>
  categoryOptions: Array<{ label: string, value: string }>
  currentPeriodId?: number | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'submit': [transaction: TransactionData]
}>()

const transactionData = ref<TransactionData>({
  date: new Date(),
  type: 'expense',
  amount: 0,
  period_id: null,
  category: '',
  subcategory: '',
  description: '',
  variance_flag: false
})

const typeOptions = [
  { label: 'Income', value: 'income' },
  { label: 'Expense', value: 'expense' }
]

watch(() => props.visible, (newValue) => {
  if (newValue) {
    resetForm()
  }
})

function resetForm() {
  transactionData.value = {
    date: new Date(),
    type: 'expense',
    amount: 0,
    period_id: props.currentPeriodId || null,
    category: '',
    subcategory: '',
    description: '',
    variance_flag: false
  }
}

function handleSubmit() {
  if (!transactionData.value.amount || !transactionData.value.category || !transactionData.value.period_id) {
    return
  }
  
  emit('submit', { ...transactionData.value })
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
</style>