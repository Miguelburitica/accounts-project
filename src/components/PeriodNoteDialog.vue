<template>
  <Dialog 
    :visible="visible" 
    modal 
    header="Add Period Note" 
    :style="{ width: '450px' }"
    @update:visible="$emit('update:visible', $event)"
  >
    <div class="flex flex-column gap-3 mb-3">
      <fieldset>
        <legend class="sr-only">Period Note</legend>
        <label for="period-note" class="font-semibold">Note</label>
        <Textarea 
          id="period-note"
          v-model="noteText" 
          rows="4"
          class="w-full mt-2"
          placeholder="Add notes about this period..."
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
        label="Save Note" 
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
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'

interface Props {
  visible: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'submit': [note: string]
}>()

const noteText = ref('')

watch(() => props.visible, (newValue) => {
  if (newValue) {
    resetForm()
  }
})

function resetForm() {
  noteText.value = ''
}

function handleSubmit() {
  if (noteText.value.trim()) {
    emit('submit', noteText.value.trim())
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