<template>
  <Dialog 
    :visible="visible" 
    modal 
    header="Add New Category" 
    :style="{ width: '400px' }"
    @update:visible="$emit('update:visible', $event)"
  >
    <div class="flex flex-column gap-3 mb-3">
      <fieldset>
        <legend class="sr-only">Category Information</legend>
        <div>
          <label for="new-category" class="font-semibold">Category Name</label>
          <InputText 
            id="new-category" 
            v-model="categoryName" 
            placeholder="Enter category name"
            class="w-full mt-2"
            @keyup.enter="handleSubmit"
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
        label="Add" 
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
import Button from 'primevue/button'

interface Props {
  visible: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'submit': [categoryName: string]
}>()

const categoryName = ref('')

watch(() => props.visible, (newValue) => {
  if (newValue) {
    resetForm()
  }
})

function resetForm() {
  categoryName.value = ''
}

function handleSubmit() {
  if (categoryName.value.trim()) {
    emit('submit', categoryName.value.trim())
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