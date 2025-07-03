<template>
  <article class="col-span-1">
    <Card :class="cardClass">
      <template #content>
        <div class="flex justify-between items-start mb-3">
          <div>
            <span class="block text-slate-500 font-medium mb-3">{{ title }}</span>
            <div class="text-slate-900 font-medium text-xl">{{ formattedValue }}</div>
          </div>
          <div class="flex items-center justify-center rounded-lg" 
               :class="iconBgClass"
               style="width:2.5rem;height:2.5rem">
            <i :class="iconClass" aria-hidden="true"></i>
          </div>
        </div>
        <span v-if="subtitle" :class="subtitleClass">{{ subtitle }}</span>
      </template>
    </Card>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Card from 'primevue/card'

interface Props {
  title: string
  value: number | string
  icon: string
  variant?: 'blue' | 'green' | 'orange' | 'red'
  subtitle?: string
  subtitleVariant?: 'success' | 'warning' | 'danger' | 'info'
  formatAsCurrency?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'blue',
  formatAsCurrency: true
})

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(value)
}

const formattedValue = computed(() => {
  if (typeof props.value === 'number' && props.formatAsCurrency) {
    return formatCurrency(props.value)
  }
  return props.value.toString()
})

const cardClass = computed(() => {
  const baseClass = 'border'
  switch (props.variant) {
    case 'blue':
      return `${baseClass} bg-blue-50 border-blue-200`
    case 'green':
      return `${baseClass} bg-green-50 border-green-200`
    case 'orange':
      return `${baseClass} bg-orange-50 border-orange-200`
    case 'red':
      return `${baseClass} bg-red-50 border-red-200`
    default:
      return `${baseClass} bg-blue-50 border-blue-200`
  }
})

const iconBgClass = computed(() => {
  switch (props.variant) {
    case 'blue':
      return 'bg-blue-100'
    case 'green':
      return 'bg-green-100'
    case 'orange':
      return 'bg-orange-100'
    case 'red':
      return 'bg-red-100'
    default:
      return 'bg-blue-100'
  }
})

const iconClass = computed(() => {
  const baseClass = 'pi text-xl'
  const iconName = props.icon
  
  let colorClass = ''
  switch (props.variant) {
    case 'blue':
      colorClass = 'text-blue-500'
      break
    case 'green':
      colorClass = 'text-green-500'
      break
    case 'orange':
      colorClass = 'text-orange-500'
      break
    case 'red':
      colorClass = 'text-red-500'
      break
    default:
      colorClass = 'text-blue-500'
  }
  
  return `${baseClass} ${iconName} ${colorClass}`
})

const subtitleClass = computed(() => {
  if (!props.subtitle) return ''
  
  switch (props.subtitleVariant) {
    case 'success':
      return 'text-green-500 font-medium'
    case 'warning':
      return 'text-orange-500 font-medium'
    case 'danger':
      return 'text-red-500 font-medium'
    case 'info':
      return 'text-slate-500'
    default:
      return 'text-slate-500'
  }
})
</script>