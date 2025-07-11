<template>
  <Dialog 
    :visible="visible" 
    modal 
    header="Close Current Period" 
    :style="{ width: '450px' }"
    @update:visible="$emit('update:visible', $event)"
  >
    <div class="flex flex-column gap-3 mb-3">
      <div role="alert" class="text-500">
        Are you sure you want to close the current period? This action cannot be undone.
      </div>
      
      <fieldset>
        <legend class="sr-only">Period Closing Information</legend>
        <div>
          <label for="ending-assets" class="font-semibold w-6rem">Ending Liquid Assets</label>
          <InputNumber 
            id="ending-assets" 
            v-model="formData.liquid_assets_end" 
            mode="currency" 
            currency="COP"
            class="w-full mt-2"
            required
          />
        </div>
        
        <div>
          <label for="close-notes" class="font-semibold w-6rem">Final Notes</label>
          <Textarea 
            id="close-notes" 
            v-model="formData.notes" 
            rows="3"
            class="w-full mt-2"
            placeholder="Add any final notes for this period..."
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
        label="Close Period" 
        icon="pi pi-check" 
        severity="danger" 
        @click="handleSubmit"
        type="submit"
      />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import InputNumber from 'primevue/inputnumber'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'

interface ClosePeriodData {
  liquid_assets_end: number
  notes: string
}

interface Props {
  visible: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'submit': [data: ClosePeriodData]
}>()

const formData = ref<ClosePeriodData>({
  liquid_assets_end: 0,
  notes: ''
})

watch(() => props.visible, (newValue) => {
  if (newValue) {
    resetForm()
  }
})

function resetForm() {
  formData.value = {
    liquid_assets_end: 0,
    notes: ''
  }
}

function handleSubmit() {
  if (formData.value.liquid_assets_end >= 0) {
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