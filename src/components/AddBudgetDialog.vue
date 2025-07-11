<template>
  <Dialog 
    :visible="visible" 
    modal 
    header="Add Budget Item" 
    :style="{ width: '450px' }"
    @update:visible="$emit('update:visible', $event)"
  >
    <div class="flex flex-column gap-3 mb-3">
      <fieldset>
        <legend class="sr-only">Budget Item Details</legend>
        <div>
          <label for="budget-category" class="font-semibold w-6rem">Category</label>
          <Dropdown 
            id="budget-category" 
            v-model="formData.category" 
            :options="categoryOptions" 
            optionValue="value" 
            optionLabel="label"
            placeholder="Select category"
            class="w-full mt-2"
            required
          >
            <template #footer>
              <div class="p-2 border-top-1 surface-border">
                <Button 
                  label="Add New Category" 
                  icon="pi pi-plus" 
                  text 
                  size="small"
                  @click="$emit('add-category')"
                />
              </div>
            </template>
          </Dropdown>
        </div>
        
        <div>
          <label for="budget-subcategory" class="font-semibold w-6rem">Subcategory</label>
          <InputText 
            id="budget-subcategory" 
            v-model="formData.subcategory" 
            placeholder="Specific item (optional)" 
            class="w-full mt-2"
          />
        </div>
        
        <div>
          <label for="budget-amount" class="font-semibold w-6rem">Amount</label>
          <InputNumber 
            id="budget-amount" 
            v-model="formData.amount" 
            mode="currency" 
            currency="COP" 
            class="w-full mt-2"
            required
          />
        </div>
        
        <div>
          <label for="budget-due-date" class="font-semibold w-6rem">Due Date</label>
          <InputNumber 
            id="budget-due-date" 
            v-model="formData.due_date" 
            placeholder="Day of month (optional)" 
            :min="1" 
            :max="31" 
            class="w-full mt-2"
          />
        </div>
        
        <div>
          <label for="budget-frequency" class="font-semibold w-6rem">Frequency</label>
          <Dropdown 
            id="budget-frequency" 
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

interface BudgetData {
  category: string
  subcategory: string
  amount: number
  due_date: number | undefined
  frequency: 'biweekly' | 'monthly' | 'irregular'
  is_active: boolean
}

interface Props {
  visible: boolean
  categoryOptions: { label: string; value: string }[]
  frequencyOptions: { label: string; value: string }[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'submit': [data: BudgetData]
  'add-category': []
}>()

const formData = ref<BudgetData>({
  category: '',
  subcategory: '',
  amount: 0,
  due_date: undefined,
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
    category: '',
    subcategory: '',
    amount: 0,
    due_date: undefined,
    frequency: 'biweekly',
    is_active: true
  }
}

function handleSubmit() {
  if (formData.value.category && formData.value.amount > 0) {
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