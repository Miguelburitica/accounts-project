<template>
  <Dialog 
    v-model:visible="visible" 
    modal 
    header="Add Variance Explanation" 
    :style="{ width: '500px' }"
    @update:visible="$emit('update:visible', $event)"
  >
    <form @submit.prevent="handleSubmit" role="form" aria-labelledby="variance-note-title">
      <div class="flex flex-column gap-3 mb-3">
        <fieldset>
          <legend class="sr-only">Category Selection</legend>
          <label for="variance-category" class="font-semibold">Category</label>
          <Dropdown 
            id="variance-category"
            v-model="formData.category" 
            :options="categoryOptions" 
            optionValue="value" 
            optionLabel="label"
            class="w-full mt-2"
            required
          />
        </fieldset>
        
        <fieldset>
          <legend class="sr-only">Reason Code</legend>
          <label for="variance-reason" class="font-semibold">Reason Code</label>
          <Dropdown 
            id="variance-reason"
            v-model="formData.reason" 
            :options="reasonOptions" 
            optionValue="value" 
            optionLabel="label"
            class="w-full mt-2"
            required
          />
        </fieldset>
        
        <fieldset>
          <legend class="sr-only">Explanation Details</legend>
          <label for="variance-explanation" class="font-semibold">Explanation</label>
          <Textarea 
            id="variance-explanation"
            v-model="formData.explanation" 
            rows="3"
            class="w-full mt-2"
            placeholder="Explain what caused this variance..."
            required
          />
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
          label="Save Variance" 
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
import Dropdown from 'primevue/dropdown'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'

interface VarianceFormData {
  category: string
  reason: string
  explanation: string
}

interface Props {
  visible: boolean
  categoryOptions: Array<{ label: string, value: string }>
  initialData?: VarianceFormData
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'submit': [data: VarianceFormData]
}>()

const formData = ref<VarianceFormData>({
  category: '',
  reason: '',
  explanation: ''
})

const reasonOptions = [
  { label: 'Unexpected Expense', value: 'unexpected' },
  { label: 'Timing Difference', value: 'timing' },
  { label: 'Budget Underestimate', value: 'underestimate' },
  { label: 'Budget Overestimate', value: 'overestimate' },
  { label: 'Emergency Expense', value: 'emergency' },
  { label: 'Opportunity/Sale', value: 'opportunity' },
  { label: 'Income Variance', value: 'income_variance' },
  { label: 'Other', value: 'other' }
]

watch(() => props.visible, (newValue) => {
  if (newValue) {
    resetForm()
  }
})

watch(() => props.initialData, (newData) => {
  if (newData) {
    formData.value = { ...newData }
  }
}, { immediate: true })

function resetForm() {
  formData.value = props.initialData ? { ...props.initialData } : {
    category: '',
    reason: '',
    explanation: ''
  }
}

function handleSubmit() {
  if (!formData.value.category || !formData.value.reason || !formData.value.explanation) {
    return
  }
  
  emit('submit', { ...formData.value })
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