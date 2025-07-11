<template>
  <Dialog 
    :visible="visible" 
    modal 
    header="Add Income Source" 
    :style="{ width: '450px' }"
    @update:visible="$emit('update:visible', $event)"
  >
    <div class="flex flex-column gap-3 mb-3">
      <fieldset>
        <legend class="sr-only">Income Source Details</legend>
        <div>
          <label for="income-source" class="font-semibold w-6rem">Source</label>
          <InputText 
            id="income-source" 
            v-model="formData.source" 
            placeholder="Income source name" 
            class="w-full mt-2"
            required
          />
        </div>
        
        <div>
          <label for="income-amount" class="font-semibold w-6rem">Amount</label>
          <InputNumber 
            id="income-amount" 
            v-model="formData.amount" 
            mode="currency" 
            currency="COP" 
            class="w-full mt-2"
            required
          />
        </div>
        
        <div>
          <label for="income-frequency" class="font-semibold w-6rem">Frequency</label>
          <Dropdown 
            id="income-frequency" 
            v-model="formData.frequency" 
            :options="frequencyOptions" 
            optionValue="value" 
            optionLabel="label" 
            class="w-full mt-2"
            required
          />
        </div>
      </fieldset>
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
        label="Save" 
        icon="pi pi-check" 
        @click="handleSubmit"
        type="submit"
      />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Dropdown from 'primevue/dropdown'
import Button from 'primevue/button'

interface IncomeData {
  source: string
  amount: number
  frequency: 'biweekly' | 'monthly' | 'irregular'
  is_active: boolean
}

interface Props {
  visible: boolean
  frequencyOptions: { label: string; value: string }[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'submit': [data: IncomeData]
}>()

const formData = ref<IncomeData>({
  source: '',
  amount: 0,
  frequency: 'biweekly',
  is_active: true
})

watch(() => props.visible, (newValue) => {
  if (newValue) {
    resetForm()
  }
})

function resetForm() {
  formData.value = {
    source: '',
    amount: 0,
    frequency: 'biweekly',
    is_active: true
  }
}

function handleSubmit() {
  if (formData.value.source && formData.value.amount > 0) {
    emit('submit', { ...formData.value })
    emit('update:visible', false)
  }
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