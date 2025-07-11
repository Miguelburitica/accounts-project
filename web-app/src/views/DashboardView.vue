<template>
  <main class="surface-ground px-4 py-8 md:px-6 lg:px-8">
    <header class="mb-4">
      <h1 class="text-900 font-bold text-6xl mb-4 text-center">Financial Dashboard</h1>
      <p class="text-700 text-xl mb-6 text-center line-height-3">
        Your 15-day financial overview at a glance
      </p>
    </header>

    <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-6" aria-label="Financial Overview Cards">
      <StatCard
        title="Total Net Worth"
        :value="totalNetWorth"
        icon="pi-wallet"
        variant="blue"
        :subtitle="`${formatCurrency(totalLiquidAssets)} liquid + ${formatCurrency(totalReceivables)} receivables`"
        subtitle-variant="info"
      />
      
      <StatCard
        title="Period Budget"
        :value="currentPeriodBudget"
        icon="pi-chart-pie"
        variant="green"
        subtitle="Allocated for this period"
        subtitle-variant="info"
      />

      <StatCard
        title="Actual Spending"
        :value="currentPeriodActual"
        icon="pi-shopping-cart"
        variant="orange"
        subtitle="Spent so far"
        subtitle-variant="info"
      />

      <StatCard
        title="Budget Variance"
        :value="Math.abs(currentPeriodVariance)"
        :icon="currentPeriodVariance >= 0 ? 'pi-arrow-up-right' : 'pi-arrow-down-right'"
        :variant="currentPeriodVariance >= 0 ? 'green' : 'red'"
        :subtitle="currentPeriodVariance >= 0 ? 'Under budget' : 'Over budget'"
        :subtitle-variant="currentPeriodVariance >= 0 ? 'success' : 'danger'"
      />
    </section>

    <section class="grid grid-cols-12 gap-6 mb-6" aria-label="Current Period Status and Quick Actions">
      <article class="col-span-12 lg:col-span-8">
        <PeriodStatusCard 
          :current-period="currentPeriod"
          :days-remaining="daysRemaining"
          :budget-progress-percentage="budgetProgressPercentage"
          :current-period-variance="currentPeriodVariance"
        />
      </article>

      <aside class="col-span-12 lg:col-span-4">
        <QuickActionsCard 
          :has-current-period="!!currentPeriod"
          @add-transaction="showTransactionDialog = true"
          @update-accounts="showAccountsDialog = true"
        />
      </aside>
    </section>

    <section class="grid grid-cols-12 gap-6 mb-6" aria-label="Recent Activity">
      <article class="col-span-12 lg:col-span-6">
        <Card>
          <template #title>
            <h2 class="text-xl font-semibold">Recent Transactions</h2>
          </template>
          <template #content>
            <div v-if="recentTransactions.length > 0">
              <TransactionItem 
                v-for="transaction in recentTransactions" 
                :key="transaction.id"
                :transaction="transaction"
              />
            </div>
            <div v-else class="text-center py-4 text-slate-500">
              No transactions yet
            </div>
          </template>
        </Card>
      </article>

      <article class="col-span-12 lg:col-span-6">
        <Card>
          <template #title>
            <h2 class="text-xl font-semibold">Account Balances</h2>
          </template>
          <template #content>
            <div v-if="accounts.length > 0">
              <AccountItem 
                v-for="account in accounts" 
                :key="account.id"
                :account="account"
              />
            </div>
            <div v-else class="text-center py-4 text-slate-500">
              No accounts configured
            </div>
          </template>
        </Card>
      </article>
    </section>

    <section v-if="currentPeriod" class="grid grid-cols-12 gap-6 mb-6" aria-label="Financial Charts">
      <article class="col-span-12 lg:col-span-8">
        <ChartCard
          title="Budget vs Actual Spending"
          chart-type="bar"
          height="350"
          :options="budgetVsActualChartOptions"
          :series="budgetVsActualChartSeries"
        />
      </article>
      
      <article class="col-span-12 lg:col-span-4">
        <ChartCard
          title="Spending by Category"
          chart-type="donut"
          height="350"
          :options="categoryChartOptions"
          :series="categoryChartSeries"
        />
      </article>
    </section>

    <section v-if="periods.length > 1" class="mb-6" aria-label="Period Trends">
      <ChartCard
        title="Period Trends"
        chart-type="line"
        height="300"
        :options="periodTrendsChartOptions"
        :series="periodTrendsChartSeries"
      />
    </section>

    <section v-if="currentPeriod" class="mb-6" aria-label="Budget Categories Overview">
      <Card>
        <template #title>
          <h2 class="text-xl font-semibold">Budget Categories This Period</h2>
        </template>
        <template #content>
          <div class="grid grid-cols-12 gap-4">
            <CategoryCard 
              v-for="category in categoryBreakdown" 
              :key="category.name"
              :category="category"
            />
          </div>
        </template>
      </Card>
    </section>
  </main>

  <QuickTransactionDialog
    v-model:visible="showTransactionDialog"
    :category-options="categoryOptions"
    @submit="handleTransactionSubmit"
  />

  <QuickAccountsDialog
    v-model:visible="showAccountsDialog"
    :accounts="accounts"
    @submit="handleAccountUpdates"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useFinancialStore } from '@/stores/financial'

import Card from 'primevue/card'

import StatCard from '@/components/StatCard.vue'
import TransactionItem from '@/components/TransactionItem.vue'
import AccountItem from '@/components/AccountItem.vue'
import CategoryCard from '@/components/CategoryCard.vue'
import ChartCard from '@/components/ChartCard.vue'
import PeriodStatusCard from '@/components/PeriodStatusCard.vue'
import QuickActionsCard from '@/components/QuickActionsCard.vue'
import QuickTransactionDialog from '@/components/QuickTransactionDialog.vue'
import QuickAccountsDialog from '@/components/QuickAccountsDialog.vue'

const financialStore = useFinancialStore()

const showTransactionDialog = ref(false)
const showAccountsDialog = ref(false)

// Computed properties
const currentPeriod = computed(() => financialStore.currentPeriod)
const accounts = computed(() => financialStore.accounts)
const totalLiquidAssets = computed(() => financialStore.totalLiquidAssets)
const totalReceivables = computed(() => financialStore.totalReceivables)
const totalNetWorth = computed(() => financialStore.totalNetWorth)
const currentPeriodBudget = computed(() => financialStore.currentPeriodBudget)
const currentPeriodActual = computed(() => financialStore.currentPeriodActual)
const currentPeriodVariance = computed(() => financialStore.currentPeriodVariance)
const categoryOptions = computed(() => financialStore.getExpenseCategoryOptions())

const daysRemaining = computed(() => {
  if (!currentPeriod.value) return 0
  const endDate = new Date(currentPeriod.value.end_date)
  const today = new Date()
  const diffTime = endDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
})

const budgetProgressPercentage = computed(() => {
  if (currentPeriodBudget.value === 0) return 0
  return (currentPeriodActual.value / currentPeriodBudget.value) * 100
})

const recentTransactions = computed(() => {
  if (!currentPeriod.value) return []
  return financialStore.transactions
    .filter(t => t.period_id === currentPeriod.value!.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
})

const categoryBreakdown = computed(() => {
  if (!currentPeriod.value) return []
  
  const budgetByCategory = new Map<string, number>()
  const actualByCategory = new Map<string, number>()
  
  // Get budget amounts by category
  financialStore.budgetTemplate
    .filter(item => item.is_active)
    .forEach(item => {
      const current = budgetByCategory.get(item.category) || 0
      budgetByCategory.set(item.category, current + item.amount)
    })
  
  // Get actual spending by category
  financialStore.transactions
    .filter(t => t.period_id === currentPeriod.value!.id && t.type === 'expense')
    .forEach(transaction => {
      const current = actualByCategory.get(transaction.category) || 0
      actualByCategory.set(transaction.category, current + transaction.amount)
    })
  
  const totalBudget = currentPeriodBudget.value
  
  return Array.from(budgetByCategory.entries()).map(([category, budgeted]) => {
    const actual = actualByCategory.get(category) || 0
    return {
      name: category,
      budgeted,
      actual,
      percentage: totalBudget > 0 ? (budgeted / totalBudget) * 100 : 0,
      spentPercentage: budgeted > 0 ? (actual / budgeted) * 100 : 0
    }
  }).sort((a, b) => b.budgeted - a.budgeted)
})

const periods = computed(() => financialStore.periods)

// Chart Data and Options
const budgetVsActualChartSeries = computed(() => {
  if (!currentPeriod.value || categoryBreakdown.value.length === 0) return []
  
  return [
    {
      name: 'Budget',
      data: categoryBreakdown.value.map(cat => cat.budgeted)
    },
    {
      name: 'Actual',
      data: categoryBreakdown.value.map(cat => cat.actual)
    }
  ]
})

const budgetVsActualChartOptions = computed(() => ({
  chart: {
    type: 'bar',
    toolbar: {
      show: false
    }
  },
  colors: ['#10b981', '#ef4444'],
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '55%',
    },
  },
  dataLabels: {
    enabled: false
  },
  stroke: {
    show: true,
    width: 2,
    colors: ['transparent']
  },
  xaxis: {
    categories: categoryBreakdown.value.map(cat => cat.name),
    labels: {
      style: {
        fontSize: '12px'
      }
    }
  },
  yaxis: {
    title: {
      text: 'Amount (COP)'
    },
    labels: {
      formatter: (value: number) => formatCurrency(value)
    }
  },
  fill: {
    opacity: 1
  },
  tooltip: {
    y: {
      formatter: (val: number) => formatCurrency(val)
    }
  },
  legend: {
    position: 'top',
    horizontalAlign: 'left'
  }
}))

const categoryChartSeries = computed(() => {
  return categoryBreakdown.value.map(cat => cat.actual).filter(amount => amount > 0)
})

const categoryChartOptions = computed(() => ({
  chart: {
    type: 'donut',
  },
  labels: categoryBreakdown.value.filter(cat => cat.actual > 0).map(cat => cat.name),
  colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'],
  plotOptions: {
    pie: {
      donut: {
        size: '70%'
      }
    }
  },
  dataLabels: {
    enabled: true,
    formatter: (val: number) => `${val.toFixed(1)}%`
  },
  tooltip: {
    y: {
      formatter: (val: number) => formatCurrency(val)
    }
  },
  legend: {
    position: 'bottom'
  }
}))

const periodTrendsChartSeries = computed(() => {
  const completedPeriods = periods.value.filter(p => p.status === 'completed').slice(-6)
  
  return [
    {
      name: 'Budget',
      data: completedPeriods.map(p => ({ x: p.start_date, y: p.total_budget }))
    },
    {
      name: 'Actual',
      data: completedPeriods.map(p => ({ x: p.start_date, y: p.total_actual }))
    },
    {
      name: 'Variance',
      data: completedPeriods.map(p => ({ x: p.start_date, y: p.variance }))
    }
  ]
})

const periodTrendsChartOptions = computed(() => ({
  chart: {
    type: 'line',
    toolbar: {
      show: false
    }
  },
  colors: ['#10b981', '#ef4444', '#3b82f6'],
  stroke: {
    width: 3,
    curve: 'smooth'
  },
  dataLabels: {
    enabled: false
  },
  xaxis: {
    type: 'datetime',
    labels: {
      format: 'MMM dd'
    }
  },
  yaxis: {
    title: {
      text: 'Amount (COP)'
    },
    labels: {
      formatter: (value: number) => formatCurrency(value)
    }
  },
  tooltip: {
    x: {
      format: 'dd MMM yyyy'
    },
    y: {
      formatter: (val: number) => formatCurrency(val)
    }
  },
  legend: {
    position: 'top',
    horizontalAlign: 'left'
  },
  grid: {
    borderColor: '#e5e7eb'
  }
}))

// Methods
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(value)
}

function handleTransactionSubmit(transaction: any) {
  if (!currentPeriod.value) return
  
  financialStore.addTransaction({
    period_id: currentPeriod.value.id,
    date: new Date().toISOString().split('T')[0],
    type: transaction.type,
    category: transaction.category,
    amount: transaction.amount,
    description: transaction.description,
    variance_flag: false
  })
}

function handleAccountUpdates(updates: Record<number, number>) {
  Object.entries(updates).forEach(([accountId, newBalance]) => {
    financialStore.updateAccountBalance(parseInt(accountId), newBalance)
  })
}

onMounted(() => {
  financialStore.loadFromLocalStorage()
})
</script>

<style scoped>
.p-progressbar-danger .p-progressbar-value {
  background: var(--red-500);
}
</style>