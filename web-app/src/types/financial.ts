// Financial Management App - Data Types

export interface Period {
  id: number
  start_date: string
  end_date: string
  status: 'active' | 'completed'
  liquid_assets_start: number
  liquid_assets_end: number
  total_receivables: number
  total_budget: number
  total_actual: number
  variance: number
  notes: string
}

export interface Account {
  id: number
  name: string
  type: 'cash' | 'bank' | 'digital_wallet' | 'salary_account' | 'investment' | 'credit'
  current_balance: number
  last_updated: string
  period_id: number
}

export interface Receivable {
  id: number
  debtor_name: string
  original_amount: number
  current_balance: number
  loan_date: string
  expected_payment_date: string
  payment_frequency: 'biweekly' | 'monthly' | 'lump_sum' | 'irregular'
  status: 'active' | 'paid' | 'overdue' | 'written_off'
  notes: string
}

export interface BudgetTemplate {
  id: number
  category: string
  subcategory?: string
  amount: number
  due_date?: number
  frequency: 'biweekly' | 'monthly'
  is_active: boolean
}

export interface IncomeTemplate {
  id: number
  source: string
  amount: number
  frequency: 'biweekly' | 'monthly' | 'irregular'
  is_active: boolean
}

export interface ReceivablePayment {
  id: number
  receivable_id: number
  period_id: number
  payment_date: string
  amount_received: number
  remaining_balance: number
  notes: string
}

export interface Transaction {
  id: number
  period_id: number
  date: string
  type: 'income' | 'expense'
  category: string
  subcategory?: string
  amount: number
  description: string
  variance_flag: boolean
}

export interface Variance {
  id: number
  period_id: number
  category: string
  budgeted_amount: number
  actual_amount: number
  variance_amount: number
  reason: string
  explanation: string
}

export interface Goal {
  id: number
  name: string
  target_amount: number
  current_amount: number
  target_date: string
  priority: 'high' | 'medium' | 'low'
  status: 'active' | 'completed' | 'paused'
}

// Utility types for CSV operations
export type CSVData = Record<string, any>[]

export interface CSVFileStructure {
  periods: Period[]
  accounts: Account[]
  receivables: Receivable[]
  budget_template: BudgetTemplate[]
  income_template: IncomeTemplate[]
  receivable_payments: ReceivablePayment[]
  transactions: Transaction[]
  variances: Variance[]
  goals: Goal[]
}

// Application state interface
export interface AppState {
  currentPeriod: Period | null
  periods: Period[]
  accounts: Account[]
  receivables: Receivable[]
  budgetTemplate: BudgetTemplate[]
  incomeTemplate: IncomeTemplate[]
  receivablePayments: ReceivablePayment[]
  transactions: Transaction[]
  variances: Variance[]
  goals: Goal[]
  lastUpdated: string
  expenseCategories: string[]
}