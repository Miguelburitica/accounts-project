<template>
  <Dialog 
    v-model:visible="isVisible" 
    modal 
    header="Quick Add Transaction" 
    :style="{ width: '450px' }"
    @hide="onCancel"
  >
    <div class="flex flex-col gap-3 mb-3">
      <div>
        <label for="transaction-type" class="font-semibold">Type</label>
        <Dropdown 
          id="transaction-type" 
          v-model="form.type" 
          :options="transactionTypeOptions" 
          optionValue="value" 
          optionLabel="label"
          class="w-full mt-2"
        />
      </div>
      
      <div>
        <label for="transaction-amount" class="font-semibold">Amount</label>
        <InputNumber 
          id="transaction-amount" 
          v-model="form.amount" 
          mode="currency" 
          currency="COP"
          class="w-full mt-2"
        />
      </div>
      
      <div>
        <label for="transaction-category" class="font-semibold">Category</label>
        <Dropdown 
          id="transaction-category" 
          v-model="form.category" 
          :options="categoryOptions" 
          optionValue="value" 
          optionLabel="label"
          class="w-full mt-2"
        />
      </div>
      
      <div>
        <label for="transaction-description" class="font-semibold">Description</label>
        <InputText 
          id="transaction-description" 
          v-model="form.description" 
          class="w-full mt-2"
          placeholder="Brief description..."
        />
      </div>
    </div>
    
    <template #footer>
      <Button label="Cancel" icon="pi pi-times" text @click="onCancel" />
      <Button 
        label="Add Transaction" 
        icon="pi pi-check" 
        @click="onSubmit"
        :disabled="!isFormValid"
      />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Dropdown from 'primevue/dropdown'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'

interface TransactionFormData {
  type: 'income' | 'expense'
  amount: number
  category: string
  description: string
}

interface CategoryOption {
  label: string
  value: string
}

interface Props {
  visible: boolean
  categoryOptions: CategoryOption[]
}

interface Emits {
  'update:visible': [value: boolean]
  'submit': [transaction: TransactionFormData]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const form = ref<TransactionFormData>({
  type: 'expense',
  amount: 0,
  category: '',
  description: ''
})

const transactionTypeOptions = [
  { label: 'Expense', value: 'expense' },
  { label: 'Income', value: 'income' }
]

const isVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const isFormValid = computed(() => {
  return form.value.amount > 0 && form.value.category.length > 0
})

const onSubmit = () => {
  if (isFormValid.value) {
    emit('submit', { ...form.value })
    resetForm()
    emit('update:visible', false)
  }
}

const onCancel = () => {
  resetForm()
  emit('update:visible', false)
}

const resetForm = () => {
  form.value = {
    type: 'expense',
    amount: 0,
    category: '',
    description: ''
  }
}

// Reset form when dialog is opened
watch(() => props.visible, (newValue) => {
  if (newValue) {
    resetForm()
  }
})
</script>