<template>
  <div class="budget-template-view">
    <div class="surface-ground px-4 py-8 md:px-6 lg:px-8">
      <div class="text-900 font-bold text-6xl mb-4 text-center">Budget Template</div>
      <div class="text-700 text-xl mb-6 text-center line-height-3">
        Manage your recurring income and expenses for the 15-day cycle
      </div>

      <div class="surface-section">
        <div class="font-medium text-3xl text-900 mb-3">Income Template</div>
        <div class="text-500 mb-5">Configure your regular income sources</div>
        
        <Card class="mb-4">
          <template #content>
            <DataTable 
              :value="incomeTemplate" 
              editMode="row" 
              @row-edit-save="onIncomeRowEditSave"
              responsiveLayout="scroll"
              :paginator="true" 
              :rows="10"
            >
              <Column field="source" header="Source" style="width:30%">
                <template #editor="{ data, field }">
                  <InputText v-model="data[field]" />
                </template>
              </Column>
              <Column field="amount" header="Amount" style="width:20%">
                <template #body="{ data }">
                  {{ formatCurrency(data.amount) }}
                </template>
                <template #editor="{ data, field }">
                  <InputNumber v-model="data[field]" mode="currency" currency="COP" />
                </template>
              </Column>
              <Column field="frequency" header="Frequency" style="width:20%">
                <template #editor="{ data, field }">
                  <Dropdown v-model="data[field]" :options="frequencyOptions" optionValue="value" optionLabel="label" />
                </template>
              </Column>
              <Column field="is_active" header="Active" style="width:15%">
                <template #body="{ data }">
                  <i class="pi" :class="{'pi-check text-green-500': data.is_active, 'pi-times text-red-400': !data.is_active}"></i>
                </template>
                <template #editor="{ data, field }">
                  <Checkbox v-model="data[field]" binary />
                </template>
              </Column>
              <Column :rowEditor="true" style="width:10%" bodyStyle="text-align:center"></Column>
              <Column style="width:5%">
                <template #body="{ data }">
                  <Button icon="pi pi-trash" severity="danger" outlined @click="deleteIncomeItem(data.id)" />
                </template>
              </Column>
            </DataTable>
          </template>
        </Card>

        <Button 
          icon="pi pi-plus" 
          label="Add Income Source" 
          @click="showIncomeDialog = true" 
          class="mb-6"
        />

        <div class="font-medium text-3xl text-900 mb-3">Expense Template</div>
        <div class="text-500 mb-5">Configure your regular expenses and budget items</div>
        
        <Card>
          <template #content>
            <DataTable 
              :value="budgetTemplate" 
              editMode="row" 
              @row-edit-save="onBudgetRowEditSave"
              responsiveLayout="scroll"
              :paginator="true" 
              :rows="10"
            >
              <Column field="category" header="Category" style="width:20%">
                <template #editor="{ data, field }">
                  <Dropdown 
                    v-model="data[field]" 
                    :options="categoryOptions" 
                    optionValue="value" 
                    optionLabel="label"
                    placeholder="Select category"
                    @change="onCategoryChange"
                  >
                    <template #footer>
                      <div class="p-2 border-top-1 surface-border">
                        <Button 
                          label="Add New Category" 
                          icon="pi pi-plus" 
                          text 
                          size="small"
                          @click="showAddCategoryDialog = true"
                        />
                      </div>
                    </template>
                  </Dropdown>
                </template>
              </Column>
              <Column field="subcategory" header="Subcategory" style="width:20%">
                <template #editor="{ data, field }">
                  <InputText v-model="data[field]" />
                </template>
              </Column>
              <Column field="amount" header="Amount" style="width:15%">
                <template #body="{ data }">
                  {{ formatCurrency(data.amount) }}
                </template>
                <template #editor="{ data, field }">
                  <InputNumber v-model="data[field]" mode="currency" currency="COP" />
                </template>
              </Column>
              <Column field="due_date" header="Due Date" style="width:10%">
                <template #editor="{ data, field }">
                  <InputNumber v-model="data[field]" :min="1" :max="31" />
                </template>
              </Column>
              <Column field="frequency" header="Frequency" style="width:15%">
                <template #editor="{ data, field }">
                  <Dropdown v-model="data[field]" :options="frequencyOptions" optionValue="value" optionLabel="label" />
                </template>
              </Column>
              <Column field="is_active" header="Active" style="width:10%">
                <template #body="{ data }">
                  <i class="pi" :class="{'pi-check text-green-500': data.is_active, 'pi-times text-red-400': !data.is_active}"></i>
                </template>
                <template #editor="{ data, field }">
                  <Checkbox v-model="data[field]" binary />
                </template>
              </Column>
              <Column :rowEditor="true" style="width:8%" bodyStyle="text-align:center"></Column>
              <Column style="width:2%">
                <template #body="{ data }">
                  <Button icon="pi pi-trash" severity="danger" outlined @click="deleteBudgetItem(data.id)" />
                </template>
              </Column>
            </DataTable>
          </template>
        </Card>

        <Button 
          icon="pi pi-plus" 
          label="Add Budget Item" 
          @click="showBudgetDialog = true" 
          class="mt-4"
        />
      </div>

      <!-- Summary Cards -->
      <div class="grid mt-6">
        <div class="col-12 lg:col-6">
          <Card>
            <template #title>Total Budget Income</template>
            <template #content>
              <div class="text-3xl font-bold text-green-500">
                {{ formatCurrency(totalIncomeTemplate) }}
              </div>
              <div class="text-500">Per 15-day period</div>
            </template>
          </Card>
        </div>
        <div class="col-12 lg:col-6">
          <Card>
            <template #title>Total Budget Expenses</template>
            <template #content>
              <div class="text-3xl font-bold text-red-500">
                {{ formatCurrency(totalBudgetTemplate) }}
              </div>
              <div class="text-500">Per 15-day period</div>
            </template>
          </Card>
        </div>
      </div>
    </div>

    <!-- Add Income Dialog -->
    <Dialog v-model:visible="showIncomeDialog" modal header="Add Income Source" :style="{ width: '450px' }">
      <div class="flex flex-column gap-3 mb-3">
        <label for="income-source" class="font-semibold w-6rem">Source</label>
        <InputText id="income-source" v-model="newIncome.source" placeholder="Income source name" />
        
        <label for="income-amount" class="font-semibold w-6rem">Amount</label>
        <InputNumber id="income-amount" v-model="newIncome.amount" mode="currency" currency="COP" />
        
        <label for="income-frequency" class="font-semibold w-6rem">Frequency</label>
        <Dropdown id="income-frequency" v-model="newIncome.frequency" :options="frequencyOptions" optionValue="value" optionLabel="label" />
      </div>
      
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" text @click="showIncomeDialog = false" />
        <Button label="Save" icon="pi pi-check" @click="addIncomeSource" />
      </template>
    </Dialog>

    <!-- Add Budget Dialog -->
    <Dialog v-model:visible="showBudgetDialog" modal header="Add Budget Item" :style="{ width: '450px' }">
      <div class="flex flex-column gap-3 mb-3">
        <label for="budget-category" class="font-semibold w-6rem">Category</label>
        <Dropdown 
          id="budget-category" 
          v-model="newBudget.category" 
          :options="categoryOptions" 
          optionValue="value" 
          optionLabel="label"
          placeholder="Select category"
        >
          <template #footer>
            <div class="p-2 border-top-1 surface-border">
              <Button 
                label="Add New Category" 
                icon="pi pi-plus" 
                text 
                size="small"
                @click="showAddCategoryDialog = true"
              />
            </div>
          </template>
        </Dropdown>
        
        <label for="budget-subcategory" class="font-semibold w-6rem">Subcategory</label>
        <InputText id="budget-subcategory" v-model="newBudget.subcategory" placeholder="Specific item (optional)" />
        
        <label for="budget-amount" class="font-semibold w-6rem">Amount</label>
        <InputNumber id="budget-amount" v-model="newBudget.amount" mode="currency" currency="COP" />
        
        <label for="budget-due-date" class="font-semibold w-6rem">Due Date</label>
        <InputNumber id="budget-due-date" v-model="newBudget.due_date" placeholder="Day of month (optional)" :min="1" :max="31" />
        
        <label for="budget-frequency" class="font-semibold w-6rem">Frequency</label>
        <Dropdown id="budget-frequency" v-model="newBudget.frequency" :options="frequencyOptions" optionValue="value" optionLabel="label" />
      </div>
      
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" text @click="showBudgetDialog = false" />
        <Button label="Save" icon="pi pi-check" @click="addBudgetSource" />
      </template>
    </Dialog>

    <!-- Add Category Dialog -->
    <Dialog v-model:visible="showAddCategoryDialog" modal header="Add New Category" :style="{ width: '400px' }">
      <div class="flex flex-column gap-3 mb-3">
        <label for="new-category" class="font-semibold">Category Name</label>
        <InputText 
          id="new-category" 
          v-model="newCategoryName" 
          placeholder="Enter category name"
          @keyup.enter="addNewCategory"
        />
      </div>
      
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" text @click="showAddCategoryDialog = false" />
        <Button label="Add" icon="pi pi-check" @click="addNewCategory" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useFinancialStore } from '@/stores/financial'
import type { BudgetTemplate, IncomeTemplate } from '@/types/financial'

import Card from 'primevue/card'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Dropdown from 'primevue/dropdown'
import Checkbox from 'primevue/checkbox'
import Dialog from 'primevue/dialog'

const financialStore = useFinancialStore()

const showIncomeDialog = ref(false)
const showBudgetDialog = ref(false)
const showAddCategoryDialog = ref(false)
const newCategoryName = ref('')

const newIncome = ref({
  source: '',
  amount: 0,
  frequency: 'biweekly' as const,
  is_active: true
})

const newBudget = ref({
  category: '',
  subcategory: '',
  amount: 0,
  due_date: undefined as number | undefined,
  frequency: 'biweekly' as const,
  is_active: true
})

const frequencyOptions = [
  { label: 'Biweekly', value: 'biweekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Irregular', value: 'irregular' }
]

const incomeTemplate = computed(() => financialStore.incomeTemplate)
const budgetTemplate = computed(() => financialStore.budgetTemplate)
const categoryOptions = computed(() => financialStore.getExpenseCategoryOptions())

const totalIncomeTemplate = computed(() => {
  return financialStore.incomeTemplate
    .filter(item => item.is_active)
    .reduce((total, item) => total + item.amount, 0)
})

const totalBudgetTemplate = computed(() => {
  return financialStore.budgetTemplate
    .filter(item => item.is_active)
    .reduce((total, item) => total + item.amount, 0)
})

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(value)
}

function addIncomeSource() {
  if (newIncome.value.source && newIncome.value.amount > 0) {
    financialStore.addIncomeItem({
      source: newIncome.value.source,
      amount: newIncome.value.amount,
      frequency: newIncome.value.frequency,
      is_active: newIncome.value.is_active
    })
    
    // Reset form
    newIncome.value = {
      source: '',
      amount: 0,
      frequency: 'biweekly',
      is_active: true
    }
    showIncomeDialog.value = false
  }
}

function addBudgetSource() {
  if (newBudget.value.category && newBudget.value.amount > 0) {
    financialStore.addBudgetItem({
      category: newBudget.value.category,
      subcategory: newBudget.value.subcategory || undefined,
      amount: newBudget.value.amount,
      due_date: newBudget.value.due_date,
      frequency: newBudget.value.frequency,
      is_active: newBudget.value.is_active
    })
    
    // Reset form
    newBudget.value = {
      category: '',
      subcategory: '',
      amount: 0,
      due_date: undefined,
      frequency: 'biweekly',
      is_active: true
    }
    showBudgetDialog.value = false
  }
}

function onIncomeRowEditSave(event: any) {
  const { newData, index } = event
  financialStore.updateIncomeItem(newData.id, newData)
}

function onBudgetRowEditSave(event: any) {
  const { newData, index } = event
  financialStore.updateBudgetItem(newData.id, newData)
}

function deleteIncomeItem(id: number) {
  financialStore.deleteIncomeItem(id)
}

function deleteBudgetItem(id: number) {
  financialStore.deleteBudgetItem(id)
}

function addNewCategory() {
  if (newCategoryName.value.trim()) {
    financialStore.addExpenseCategory(newCategoryName.value.trim())
    newCategoryName.value = ''
    showAddCategoryDialog.value = false
  }
}

function onCategoryChange() {
  // This function can be used for additional logic when category changes
}

onMounted(() => {
  financialStore.loadFromLocalStorage()
})
</script>

<style scoped>
.budget-template-view {
  min-height: 100vh;
}
</style>