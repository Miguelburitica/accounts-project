<template>
  <Dialog 
    v-model:visible="isVisible" 
    modal 
    header="Update Account Balances" 
    :style="{ width: '500px' }"
    @hide="onCancel"
  >
    <div class="text-slate-500 mb-4">Quickly update your account balances</div>
    
    <div v-if="accounts.length > 0">
      <div 
        v-for="account in accounts" 
        :key="account.id" 
        class="flex items-center justify-between mb-3 p-3 border border-slate-200 rounded-lg"
      >
        <div>
          <div class="font-medium text-slate-900">{{ account.name }}</div>
          <div class="text-slate-500 text-sm">Current: {{ formatCurrency(account.current_balance) }}</div>
        </div>
        <div class="w-32">
          <InputNumber 
            v-model="accountUpdates[account.id]" 
            mode="currency" 
            currency="COP"
            class="w-full"
            :placeholder="account.current_balance.toString()"
          />
        </div>
      </div>
    </div>
    
    <div v-else class="text-center py-4 text-slate-500">
      No accounts configured
    </div>
    
    <template #footer>
      <Button label="Cancel" icon="pi pi-times" text @click="onCancel" />
      <Button 
        label="Update Balances" 
        icon="pi pi-check" 
        @click="onSubmit"
        :disabled="!hasChanges"
      />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputNumber from 'primevue/inputnumber'
import type { Account } from '@/types/financial'

interface Props {
  visible: boolean
  accounts: Account[]
}

interface Emits {
  'update:visible': [value: boolean]
  'submit': [updates: Record<number, number>]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const accountUpdates = ref<Record<number, number>>({})

const isVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const hasChanges = computed(() => {
  return Object.keys(accountUpdates.value).some(accountId => {
    const newBalance = accountUpdates.value[parseInt(accountId)]
    return newBalance !== undefined && newBalance !== null && newBalance > 0
  })
})

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(value)
}

const onSubmit = () => {
  if (hasChanges.value) {
    const validUpdates: Record<number, number> = {}
    
    // Only include valid updates
    Object.entries(accountUpdates.value).forEach(([accountId, newBalance]) => {
      if (newBalance !== undefined && newBalance !== null && newBalance > 0) {
        validUpdates[parseInt(accountId)] = newBalance
      }
    })
    
    emit('submit', validUpdates)
    resetForm()
    emit('update:visible', false)
  }
}

const onCancel = () => {
  resetForm()
  emit('update:visible', false)
}

const resetForm = () => {
  accountUpdates.value = {}
}

// Reset form when dialog is opened
watch(() => props.visible, (newValue) => {
  if (newValue) {
    resetForm()
  }
})
</script>