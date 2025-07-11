<template>
  <Dialog 
    :visible="visible" 
    modal 
    header="Start New Period" 
    :style="{ width: '500px' }"
    @update:visible="$emit('update:visible', $event)"
  >
    <div class="flex flex-column gap-3 mb-3">
      <fieldset>
        <legend class="sr-only">Period Dates</legend>
        <div>
          <label for="period-start" class="font-semibold w-6rem">Start Date</label>
          <Calendar 
            id="period-start" 
            v-model="formData.start_date" 
            dateFormat="yy-mm-dd"
            showIcon
            class="w-full mt-2"
            required
          />
        </div>
        
        <div>
          <label for="period-end" class="font-semibold w-6rem">End Date</label>
          <Calendar 
            id="period-end" 
            v-model="formData.end_date" 
            dateFormat="yy-mm-dd"
            showIcon
            class="w-full mt-2"
            :disabled="true"
          />
          <small class="text-500">Automatically calculated as 15 days from start date</small>
        </div>
      </fieldset>
      
      <fieldset>
        <legend class="sr-only">Financial Settings</legend>
        <div>
          <label for="starting-assets" class="font-semibold w-6rem">Starting Liquid Assets</label>
          <InputNumber 
            id="starting-assets" 
            v-model="formData.liquid_assets_start" 
            mode="currency" 
            currency="COP"
            class="w-full mt-2"
            required
          />
        </div>
        
        <div>
          <label for="apply-template" class="font-semibold w-6rem">Apply Budget Template</label>
          <div class="flex items-center gap-2 mt-2">
            <Checkbox 
              id="apply-template"
              v-model="formData.applyTemplate" 
              binary 
            />
            <label for="apply-template" class="text-500">Apply your saved budget template to this period</label>
          </div>
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
        label="Start Period" 
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
import Calendar from 'primevue/calendar'
import InputNumber from 'primevue/inputnumber'
import Checkbox from 'primevue/checkbox'
import Button from 'primevue/button'

interface NewPeriodData {
  start_date: Date
  end_date: Date
  liquid_assets_start: number
  applyTemplate: boolean
}

interface Props {
  visible: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'submit': [data: NewPeriodData]
}>()

const formData = ref<NewPeriodData>({
  start_date: new Date(),
  end_date: new Date(),
  liquid_assets_start: 0,
  applyTemplate: true
})

// Watch start date to auto-calculate end date
watch(() => formData.value.start_date, (newStartDate) => {
  if (newStartDate) {
    const endDate = new Date(newStartDate)
    endDate.setDate(endDate.getDate() + 14) // 15 days total (including start day)
    formData.value.end_date = endDate
  }
})

watch(() => props.visible, (newValue) => {
  if (newValue) {
    resetForm()
  }
})

function resetForm() {
  const startDate = new Date()
  const endDate = new Date()
  endDate.setDate(endDate.getDate() + 14)
  
  formData.value = {
    start_date: startDate,
    end_date: endDate,
    liquid_assets_start: 0,
    applyTemplate: true
  }
}

function handleSubmit() {
  if (formData.value.start_date && formData.value.liquid_assets_start >= 0) {
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