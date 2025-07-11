<template>
  <main class="surface-ground px-4 py-8 md:px-6 lg:px-8">
    <header class="mb-6">
      <h1 class="text-900 font-bold text-6xl mb-4 text-center">Budget Template</h1>
      <p class="text-700 text-xl mb-6 text-center line-height-3">
        Manage your recurring income and expenses for the 15-day cycle
      </p>
    </header>

    <div class="surface-section">
      <IncomeTemplateCard 
        :income-template="incomeTemplate"
        :frequency-options="frequencyOptions"
        @add-income="showIncomeDialog = true"
        @row-edit-save="onIncomeRowEditSave"
        @delete-item="deleteIncomeItem"
      />

      <ExpenseTemplateCard 
        :budget-template="budgetTemplate"
        :category-options="categoryOptions"
        :frequency-options="frequencyOptions"
        @add-budget="showBudgetDialog = true"
        @add-category="showAddCategoryDialog = true"
        @row-edit-save="onBudgetRowEditSave"
        @delete-item="deleteBudgetItem"
        @category-change="onCategoryChange"
      />
    </div>

    <TemplateSummaryStats 
      :income-template="incomeTemplate"
      :budget-template="budgetTemplate"
    />
  </main>

  <AddIncomeDialog
    :visible="showIncomeDialog"
    :frequency-options="frequencyOptions"
    @update:visible="showIncomeDialog = $event"
    @submit="handleIncomeSubmit"
  />

  <AddBudgetDialog
    :visible="showBudgetDialog"
    :category-options="categoryOptions"
    :frequency-options="frequencyOptions"
    @update:visible="showBudgetDialog = $event"
    @submit="handleBudgetSubmit"
    @add-category="showAddCategoryDialog = true"
  />

  <AddCategoryDialog
    :visible="showAddCategoryDialog"
    @update:visible="showAddCategoryDialog = $event"
    @submit="handleCategorySubmit"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useFinancialStore } from '@/stores/financial'

import IncomeTemplateCard from '@/components/IncomeTemplateCard.vue'
import ExpenseTemplateCard from '@/components/ExpenseTemplateCard.vue'
import TemplateSummaryStats from '@/components/TemplateSummaryStats.vue'
import AddIncomeDialog from '@/components/AddIncomeDialog.vue'
import AddBudgetDialog from '@/components/AddBudgetDialog.vue'
import AddCategoryDialog from '@/components/AddCategoryDialog.vue'

const financialStore = useFinancialStore()

const showIncomeDialog = ref(false)
const showBudgetDialog = ref(false)
const showAddCategoryDialog = ref(false)

const frequencyOptions = [
  { label: 'Biweekly', value: 'biweekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Irregular', value: 'irregular' }
]

const incomeTemplate = computed(() => financialStore.incomeTemplate)
const budgetTemplate = computed(() => financialStore.budgetTemplate)
const categoryOptions = computed(() => financialStore.getExpenseCategoryOptions())

function handleIncomeSubmit(data: any) {
  financialStore.addIncomeItem(data)
}

function handleBudgetSubmit(data: any) {
  financialStore.addBudgetItem({
    category: data.category,
    subcategory: data.subcategory || undefined,
    amount: data.amount,
    due_date: data.due_date,
    frequency: data.frequency,
    is_active: data.is_active
  })
}

function handleCategorySubmit(categoryName: string) {
  financialStore.addExpenseCategory(categoryName)
}

function onIncomeRowEditSave(event: any) {
  const { newData } = event
  financialStore.updateIncomeItem(newData.id, newData)
}

function onBudgetRowEditSave(event: any) {
  const { newData } = event
  financialStore.updateBudgetItem(newData.id, newData)
}

function deleteIncomeItem(id: number) {
  financialStore.deleteIncomeItem(id)
}

function deleteBudgetItem(id: number) {
  financialStore.deleteBudgetItem(id)
}

function onCategoryChange() {
  // This function can be used for additional logic when category changes
}

onMounted(() => {
  financialStore.loadFromLocalStorage()
})
</script>

<style scoped>
</style>