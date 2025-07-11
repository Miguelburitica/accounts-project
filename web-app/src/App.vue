<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'
import { ref } from 'vue'
import Menubar from 'primevue/menubar'

const router = useRouter()

const items = ref([
  {
    label: 'Dashboard',
    icon: 'pi pi-home',
    command: () => router.push('/')
  },
  {
    label: 'Transactions',
    icon: 'pi pi-money-bill',
    command: () => router.push('/transactions')
  },
  {
    label: 'Variance Analysis',
    icon: 'pi pi-chart-bar',
    command: () => router.push('/variance')
  },
  {
    label: 'Periods',
    icon: 'pi pi-calendar',
    command: () => router.push('/periods')
  },
  {
    label: 'Budget Template',
    icon: 'pi pi-list',
    command: () => router.push('/budget-template')
  },
  {
    label: 'About',
    icon: 'pi pi-info-circle',
    command: () => router.push('/about')
  }
])
</script>

<template>
  <div class="layout-wrapper">
    <Menubar :model="items" class="mb-4 sticky top-0 left-0">
      <template #start>
        <div class="flex items-center gap-2">
          <i class="pi pi-calculator text-2xl text-primary"></i>
          <span class="font-bold text-xl text-primary">Financial Manager</span>
        </div>
      </template>
    </Menubar>
    <RouterView />
  </div>
</template>

<style scoped>
.layout-wrapper {
  width: 100%;
  position: relative;
  background-color: var(--surface-ground);
}
</style>
