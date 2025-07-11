import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { 
  AppState, 
  Period, 
  Account, 
  BudgetTemplate, 
  IncomeTemplate, 
  Transaction,
  Variance,
  Goal,
  Receivable,
  ReceivablePayment,
  CSVFileStructure 
} from '@/types/financial'

export const useFinancialStore = defineStore('financial', () => {
  // State
  const currentPeriod = ref<Period | null>(null)
  const periods = ref<Period[]>([])
  const accounts = ref<Account[]>([])
  const receivables = ref<Receivable[]>([])
  const budgetTemplate = ref<BudgetTemplate[]>([])
  const incomeTemplate = ref<IncomeTemplate[]>([])
  const receivablePayments = ref<ReceivablePayment[]>([])
  const transactions = ref<Transaction[]>([])
  const variances = ref<Variance[]>([])
  const goals = ref<Goal[]>([])
  const lastUpdated = ref<string>(new Date().toISOString())
  
  // Categories for better organization
  const expenseCategories = ref<string[]>([
    'Transportes',
    'Suscripciones', 
    'Servicios',
    'Hogar',
    'Salidas',
    'Credito',
    'Ahorro',
    'Salud',
    'Entretenimiento',
    'Educacion'
  ])

  // Computed
  const totalLiquidAssets = computed(() => {
    return accounts.value.reduce((total, account) => total + account.current_balance, 0)
  })

  const totalReceivables = computed(() => {
    return receivables.value.reduce((total, receivable) => total + receivable.current_balance, 0)
  })

  const totalNetWorth = computed(() => {
    return totalLiquidAssets.value + totalReceivables.value
  })

  const currentPeriodBudget = computed(() => {
    return budgetTemplate.value
      .filter(item => item.is_active)
      .reduce((total, item) => total + item.amount, 0)
  })

  const currentPeriodActual = computed(() => {
    if (!currentPeriod.value) return 0
    return transactions.value
      .filter(t => t.period_id === currentPeriod.value!.id && t.type === 'expense')
      .reduce((total, t) => total + t.amount, 0)
  })

  const currentPeriodVariance = computed(() => {
    return currentPeriodBudget.value - currentPeriodActual.value
  })

  // Actions
  function loadFromLocalStorage() {
    try {
      const data = localStorage.getItem('financial-data')
      if (data) {
        const parsed: AppState = JSON.parse(data)
        currentPeriod.value = parsed.currentPeriod
        periods.value = parsed.periods
        accounts.value = parsed.accounts
        receivables.value = parsed.receivables
        budgetTemplate.value = parsed.budgetTemplate
        incomeTemplate.value = parsed.incomeTemplate
        receivablePayments.value = parsed.receivablePayments
        transactions.value = parsed.transactions
        variances.value = parsed.variances
        goals.value = parsed.goals
        lastUpdated.value = parsed.lastUpdated
        if (parsed.expenseCategories) {
          expenseCategories.value = parsed.expenseCategories
        }
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error)
    }
  }

  function saveToLocalStorage() {
    try {
      const data: AppState = {
        currentPeriod: currentPeriod.value,
        periods: periods.value,
        accounts: accounts.value,
        receivables: receivables.value,
        budgetTemplate: budgetTemplate.value,
        incomeTemplate: incomeTemplate.value,
        receivablePayments: receivablePayments.value,
        transactions: transactions.value,
        variances: variances.value,
        goals: goals.value,
        lastUpdated: new Date().toISOString(),
        expenseCategories: expenseCategories.value
      }
      localStorage.setItem('financial-data', JSON.stringify(data))
      lastUpdated.value = data.lastUpdated
    } catch (error) {
      console.error('Error saving to localStorage:', error)
    }
  }

  // CSV Import/Export Functions
  function parseCSV(csvText: string): any[] {
    const lines = csvText.trim().split('\n')
    if (lines.length < 2) return []
    
    const headers = parseCSVLine(lines[0])
    const data = []
    
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i])
      const row: any = {}
      
      headers.forEach((header, index) => {
        const value = values[index] || ''
        // Try to parse numbers and booleans
        if (value === 'true') row[header] = true
        else if (value === 'false') row[header] = false
        else if (!isNaN(Number(value)) && value !== '') row[header] = Number(value)
        else row[header] = value
      })
      
      data.push(row)
    }
    
    return data
  }

  function parseCSVLine(line: string): string[] {
    const result = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      const nextChar = line[i + 1]
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Double quote - add single quote to result
          current += '"'
          i++ // Skip next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        // Field separator
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    
    // Add the last field
    result.push(current.trim())
    
    return result
  }

  function convertToCSV(data: any[], filename: string): string {
    if (data.length === 0) return ''
    
    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header]
          // Handle null/undefined values
          if (value === null || value === undefined) return ''
          
          const stringValue = String(value)
          // Escape quotes and commas in CSV values
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`
          }
          return stringValue
        }).join(',')
      )
    ].join('\n')
    
    return csvContent
  }

  function downloadCSV(filename: string, csvContent: string) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  function importCSVData(files: { [key: string]: string }) {
    try {
      if (files.periods) periods.value = parseCSV(files.periods)
      if (files.accounts) accounts.value = parseCSV(files.accounts)
      if (files.receivables) receivables.value = parseCSV(files.receivables)
      if (files.budget_template) budgetTemplate.value = parseCSV(files.budget_template)
      if (files.income_template) incomeTemplate.value = parseCSV(files.income_template)
      if (files.receivable_payments) receivablePayments.value = parseCSV(files.receivable_payments)
      if (files.transactions) transactions.value = parseCSV(files.transactions)
      if (files.variances) variances.value = parseCSV(files.variances)
      if (files.goals) goals.value = parseCSV(files.goals)
      
      // Set current period to the active one
      currentPeriod.value = periods.value.find(p => p.status === 'active') || null
      
      saveToLocalStorage()
    } catch (error) {
      console.error('Error importing CSV data:', error)
      throw error
    }
  }

  function exportAllCSV() {
    const timestamp = new Date().toISOString().split('T')[0]
    
    downloadCSV(`periods_${timestamp}.csv`, convertToCSV(periods.value, 'periods'))
    downloadCSV(`accounts_${timestamp}.csv`, convertToCSV(accounts.value, 'accounts'))
    downloadCSV(`receivables_${timestamp}.csv`, convertToCSV(receivables.value, 'receivables'))
    downloadCSV(`budget_template_${timestamp}.csv`, convertToCSV(budgetTemplate.value, 'budget_template'))
    downloadCSV(`income_template_${timestamp}.csv`, convertToCSV(incomeTemplate.value, 'income_template'))
    downloadCSV(`receivable_payments_${timestamp}.csv`, convertToCSV(receivablePayments.value, 'receivable_payments'))
    downloadCSV(`transactions_${timestamp}.csv`, convertToCSV(transactions.value, 'transactions'))
    downloadCSV(`variances_${timestamp}.csv`, convertToCSV(variances.value, 'variances'))
    downloadCSV(`goals_${timestamp}.csv`, convertToCSV(goals.value, 'goals'))
  }

  function exportPeriodsOnly() {
    const timestamp = new Date().toISOString().split('T')[0]
    downloadCSV(`periods_${timestamp}.csv`, convertToCSV(periods.value, 'periods'))
  }

  function exportPeriodData(periodId: number) {
    const timestamp = new Date().toISOString().split('T')[0]
    const period = periods.value.find(p => p.id === periodId)
    
    if (!period) return

    // Export period data and related transactions/variances
    const periodTransactions = transactions.value.filter(t => t.period_id === periodId)
    const periodVariances = variances.value.filter(v => v.period_id === periodId)
    
    downloadCSV(`period_${periodId}_${timestamp}.csv`, convertToCSV([period], 'period'))
    
    if (periodTransactions.length > 0) {
      downloadCSV(`period_${periodId}_transactions_${timestamp}.csv`, convertToCSV(periodTransactions, 'transactions'))
    }
    
    if (periodVariances.length > 0) {
      downloadCSV(`period_${periodId}_variances_${timestamp}.csv`, convertToCSV(periodVariances, 'variances'))
    }
  }

  // Budget Template Management
  function addBudgetItem(item: Omit<BudgetTemplate, 'id'>) {
    const newId = Math.max(...budgetTemplate.value.map(b => b.id), 0) + 1
    budgetTemplate.value.push({ ...item, id: newId })
    saveToLocalStorage()
  }

  function updateBudgetItem(id: number, updates: Partial<BudgetTemplate>) {
    const index = budgetTemplate.value.findIndex(b => b.id === id)
    if (index !== -1) {
      budgetTemplate.value[index] = { ...budgetTemplate.value[index], ...updates }
      saveToLocalStorage()
    }
  }

  function deleteBudgetItem(id: number) {
    budgetTemplate.value = budgetTemplate.value.filter(b => b.id !== id)
    saveToLocalStorage()
  }

  // Income Template Management
  function addIncomeItem(item: Omit<IncomeTemplate, 'id'>) {
    const newId = Math.max(...incomeTemplate.value.map(i => i.id), 0) + 1
    incomeTemplate.value.push({ ...item, id: newId })
    saveToLocalStorage()
  }

  function updateIncomeItem(id: number, updates: Partial<IncomeTemplate>) {
    const index = incomeTemplate.value.findIndex(i => i.id === id)
    if (index !== -1) {
      incomeTemplate.value[index] = { ...incomeTemplate.value[index], ...updates }
      saveToLocalStorage()
    }
  }

  function deleteIncomeItem(id: number) {
    incomeTemplate.value = incomeTemplate.value.filter(i => i.id !== id)
    saveToLocalStorage()
  }

  // Category Management
  function addExpenseCategory(category: string) {
    if (category && !expenseCategories.value.includes(category)) {
      expenseCategories.value.push(category)
      expenseCategories.value.sort()
      saveToLocalStorage()
    }
  }

  function getExpenseCategoryOptions() {
    return expenseCategories.value.map(cat => ({ label: cat, value: cat }))
  }

  // Period Management
  function createNewPeriod(data: {
    start_date: string
    end_date: string
    liquid_assets_start: number
    applyTemplate: boolean
  }) {
    // Close any existing active period first
    const activePeriod = periods.value.find(p => p.status === 'active')
    if (activePeriod) {
      activePeriod.status = 'completed'
      if (activePeriod.liquid_assets_end === 0) {
        activePeriod.liquid_assets_end = activePeriod.liquid_assets_start
      }
    }

    // Calculate budget total if applying template
    let totalBudget = 0
    if (data.applyTemplate) {
      totalBudget = budgetTemplate.value
        .filter(item => item.is_active)
        .reduce((sum, item) => sum + item.amount, 0)
    }

    // Create new period
    const newId = Math.max(...periods.value.map(p => p.id), 0) + 1
    const newPeriod: Period = {
      id: newId,
      start_date: data.start_date,
      end_date: data.end_date,
      status: 'active',
      liquid_assets_start: data.liquid_assets_start,
      liquid_assets_end: 0,
      total_receivables: totalReceivables.value,
      total_budget: totalBudget,
      total_actual: 0,
      variance: totalBudget,
      notes: ''
    }

    periods.value.push(newPeriod)
    currentPeriod.value = newPeriod
    saveToLocalStorage()
  }

  function closePeriod(data: {
    liquid_assets_end: number
    notes?: string
  }) {
    if (!currentPeriod.value) return

    // Update current period
    currentPeriod.value.status = 'completed'
    currentPeriod.value.liquid_assets_end = data.liquid_assets_end
    if (data.notes) {
      currentPeriod.value.notes = data.notes
    }

    // Update variance calculation
    currentPeriod.value.variance = currentPeriod.value.total_budget - currentPeriod.value.total_actual

    // Clear current period
    currentPeriod.value = null

    saveToLocalStorage()
  }

  function updatePeriodNotes(periodId: number, notes: string) {
    const period = periods.value.find(p => p.id === periodId)
    if (period) {
      period.notes = notes
      saveToLocalStorage()
    }
  }

  function updatePeriodActuals() {
    if (!currentPeriod.value) return

    // Calculate total actual expenses for current period
    const totalActual = transactions.value
      .filter(t => t.period_id === currentPeriod.value!.id && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    currentPeriod.value.total_actual = totalActual
    currentPeriod.value.variance = currentPeriod.value.total_budget - totalActual
    saveToLocalStorage()
  }

  // Transaction Management
  function addTransaction(transaction: Omit<Transaction, 'id'>) {
    const newId = Math.max(...transactions.value.map(t => t.id), 0) + 1
    transactions.value.push({ ...transaction, id: newId })
    
    // Update period actuals if this is for the current period
    if (currentPeriod.value && transaction.period_id === currentPeriod.value.id) {
      updatePeriodActuals()
    }
    
    saveToLocalStorage()
  }

  function updateTransaction(id: number, updates: Partial<Transaction>) {
    const index = transactions.value.findIndex(t => t.id === id)
    if (index !== -1) {
      transactions.value[index] = { ...transactions.value[index], ...updates }
      
      // Update period actuals if this affects the current period
      if (currentPeriod.value && 
          (transactions.value[index].period_id === currentPeriod.value.id || 
           updates.period_id === currentPeriod.value.id)) {
        updatePeriodActuals()
      }
      
      saveToLocalStorage()
    }
  }

  function deleteTransaction(id: number) {
    const transaction = transactions.value.find(t => t.id === id)
    transactions.value = transactions.value.filter(t => t.id !== id)
    
    // Update period actuals if this was for the current period
    if (currentPeriod.value && transaction && transaction.period_id === currentPeriod.value.id) {
      updatePeriodActuals()
    }
    
    saveToLocalStorage()
  }

  // Account Management
  function updateAccountBalance(accountId: number, newBalance: number) {
    const account = accounts.value.find(a => a.id === accountId)
    if (account) {
      account.current_balance = newBalance
      account.last_updated = new Date().toISOString().split('T')[0]
      saveToLocalStorage()
    }
  }

  function addAccount(account: Omit<Account, 'id'>) {
    const newId = Math.max(...accounts.value.map(a => a.id), 0) + 1
    accounts.value.push({ ...account, id: newId })
    saveToLocalStorage()
  }

  // Variance Management
  function addVariance(variance: Omit<Variance, 'id'>) {
    const newId = Math.max(...variances.value.map(v => v.id), 0) + 1
    variances.value.push({ ...variance, id: newId })
    saveToLocalStorage()
  }

  function updateVariance(id: number, updates: Partial<Variance>) {
    const index = variances.value.findIndex(v => v.id === id)
    if (index !== -1) {
      variances.value[index] = { ...variances.value[index], ...updates }
      saveToLocalStorage()
    }
  }

  function deleteVariance(id: number) {
    variances.value = variances.value.filter(v => v.id !== id)
    saveToLocalStorage()
  }

  return {
    // State
    currentPeriod,
    periods,
    accounts,
    receivables,
    budgetTemplate,
    incomeTemplate,
    receivablePayments,
    transactions,
    variances,
    goals,
    lastUpdated,
    expenseCategories,
    
    // Computed
    totalLiquidAssets,
    totalReceivables,
    totalNetWorth,
    currentPeriodBudget,
    currentPeriodActual,
    currentPeriodVariance,
    
    // Actions
    loadFromLocalStorage,
    saveToLocalStorage,
    importCSVData,
    exportAllCSV,
    exportPeriodsOnly,
    exportPeriodData,
    addBudgetItem,
    updateBudgetItem,
    deleteBudgetItem,
    addIncomeItem,
    updateIncomeItem,
    deleteIncomeItem,
    addExpenseCategory,
    getExpenseCategoryOptions,
    createNewPeriod,
    closePeriod,
    updatePeriodNotes,
    updatePeriodActuals,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    updateAccountBalance,
    addAccount,
    addVariance,
    updateVariance,
    deleteVariance,
    parseCSV,
    convertToCSV
  }
})