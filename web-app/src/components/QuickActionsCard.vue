<template>
  <Card>
    <template #title>
      <h2 class="text-xl font-semibold">Quick Actions</h2>
    </template>
    <template #content>
      <nav class="flex flex-col gap-3">
        <Button 
          label="Add Transaction" 
          icon="pi pi-plus" 
          @click="$emit('addTransaction')"
          class="w-full"
          :disabled="!hasCurrentPeriod"
        />
        <Button 
          label="Update Account Balances" 
          icon="pi pi-refresh" 
          severity="secondary"
          @click="$emit('updateAccounts')"
          class="w-full"
        />
        <Button 
          label="View Budget Template" 
          icon="pi pi-list" 
          severity="help"
          @click="navigateToBudgetTemplate"
          class="w-full"
        />
        <Button 
          label="Manage Periods" 
          icon="pi pi-calendar" 
          severity="info"
          @click="navigateToPeriodsPage"
          class="w-full"
        />
      </nav>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import Card from 'primevue/card'
import Button from 'primevue/button'

interface Props {
  hasCurrentPeriod: boolean
}

interface Emits {
  addTransaction: []
  updateAccounts: []
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const router = useRouter()

const navigateToBudgetTemplate = () => {
  router.push('/budget-template')
}

const navigateToPeriodsPage = () => {
  router.push('/periods')
}
</script>