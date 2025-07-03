import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useFinancialStore } from '../financial'
import type { Period, BudgetTemplate, Transaction, Account } from '@/types/financial'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('Financial Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorageMock.getItem.mockClear()
    localStorageMock.setItem.mockClear()
  })

  describe('CSV Import/Export Functions', () => {
    it('should correctly parse CSV data', () => {
      const store = useFinancialStore()
      const csvText = `id,name,amount
1,Test Item,1000
2,Another Item,2500`

      const result = store.parseCSV(csvText)

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        id: 1,
        name: 'Test Item',
        amount: 1000
      })
      expect(result[1]).toEqual({
        id: 2,
        name: 'Another Item',
        amount: 2500
      })
    })

    it('should handle empty CSV data', () => {
      const store = useFinancialStore()
      const result = store.parseCSV('')
      expect(result).toHaveLength(0)
    })

    it('should handle CSV with only headers', () => {
      const store = useFinancialStore()
      const result = store.parseCSV('id,name,amount')
      expect(result).toHaveLength(0)
    })

    it('should correctly convert data to CSV', () => {
      const store = useFinancialStore()
      const data = [
        { id: 1, name: 'Test', amount: 1000 },
        { id: 2, name: 'Test Two', amount: 2000 }
      ]

      const csvResult = store.convertToCSV(data, 'test')

      expect(csvResult).toBe('id,name,amount\n1,Test,1000\n2,Test Two,2000')
    })

    it('should handle empty data array for CSV conversion', () => {
      const store = useFinancialStore()
      const result = store.convertToCSV([], 'test')
      expect(result).toBe('')
    })

    it('should escape commas in CSV values', () => {
      const store = useFinancialStore()
      const data = [{ name: 'Test, with comma', value: 100 }]

      const csvResult = store.convertToCSV(data, 'test')

      expect(csvResult).toBe('name,value\n"Test, with comma",100')
    })
  })

  describe('Financial Calculations', () => {
    it('should calculate total liquid assets correctly', () => {
      const store = useFinancialStore()
      
      store.accounts = [
        { id: 1, name: 'Cash', type: 'cash', current_balance: 100000, last_updated: '2024-01-01', period_id: 1 },
        { id: 2, name: 'Bank', type: 'bank', current_balance: 500000, last_updated: '2024-01-01', period_id: 1 },
        { id: 3, name: 'Credit', type: 'credit', current_balance: 200000, last_updated: '2024-01-01', period_id: 1 }
      ]

      expect(store.totalLiquidAssets).toBe(800000)
    })

    it('should calculate total receivables correctly', () => {
      const store = useFinancialStore()
      
      store.receivables = [
        { id: 1, debtor_name: 'Client A', original_amount: 1000000, current_balance: 800000, loan_date: '2024-01-01', expected_payment_date: '2024-02-01', payment_frequency: 'monthly', status: 'active', notes: '' },
        { id: 2, debtor_name: 'Client B', original_amount: 500000, current_balance: 300000, loan_date: '2024-01-01', expected_payment_date: '2024-02-01', payment_frequency: 'monthly', status: 'active', notes: '' }
      ]

      expect(store.totalReceivables).toBe(1100000)
    })

    it('should calculate total net worth correctly', () => {
      const store = useFinancialStore()
      
      store.accounts = [
        { id: 1, name: 'Cash', type: 'cash', current_balance: 100000, last_updated: '2024-01-01', period_id: 1 }
      ]
      store.receivables = [
        { id: 1, debtor_name: 'Client', original_amount: 500000, current_balance: 500000, loan_date: '2024-01-01', expected_payment_date: '2024-02-01', payment_frequency: 'monthly', status: 'active', notes: '' }
      ]

      expect(store.totalNetWorth).toBe(600000)
    })

    it('should calculate current period budget correctly', () => {
      const store = useFinancialStore()
      
      store.budgetTemplate = [
        { id: 1, category: 'Food', amount: 300000, frequency: 'biweekly', is_active: true },
        { id: 2, category: 'Transport', amount: 150000, frequency: 'biweekly', is_active: true },
        { id: 3, category: 'Inactive', amount: 100000, frequency: 'biweekly', is_active: false }
      ]

      expect(store.currentPeriodBudget).toBe(450000) // Only active items
    })

    it('should calculate current period actual spending correctly', () => {
      const store = useFinancialStore()
      
      store.currentPeriod = { id: 1, start_date: '2024-01-01', end_date: '2024-01-15', status: 'active', liquid_assets_start: 1000000, liquid_assets_end: 0, total_receivables: 0, total_budget: 500000, total_actual: 0, variance: 0, notes: '' }
      store.transactions = [
        { id: 1, period_id: 1, date: '2024-01-05', type: 'expense', category: 'Food', amount: 150000, description: 'Groceries', variance_flag: false },
        { id: 2, period_id: 1, date: '2024-01-10', type: 'expense', category: 'Transport', amount: 50000, description: 'Bus', variance_flag: false },
        { id: 3, period_id: 1, date: '2024-01-12', type: 'income', category: 'Salary', amount: 1000000, description: 'Salary', variance_flag: false },
        { id: 4, period_id: 2, date: '2024-01-20', type: 'expense', category: 'Food', amount: 100000, description: 'Other period', variance_flag: false }
      ]

      expect(store.currentPeriodActual).toBe(200000) // Only expenses from current period
    })

    it('should calculate variance correctly', () => {
      const store = useFinancialStore()
      
      store.currentPeriod = { id: 1, start_date: '2024-01-01', end_date: '2024-01-15', status: 'active', liquid_assets_start: 1000000, liquid_assets_end: 0, total_receivables: 0, total_budget: 500000, total_actual: 0, variance: 0, notes: '' }
      store.budgetTemplate = [
        { id: 1, category: 'Food', amount: 300000, frequency: 'biweekly', is_active: true }
      ]
      store.transactions = [
        { id: 1, period_id: 1, date: '2024-01-05', type: 'expense', category: 'Food', amount: 250000, description: 'Groceries', variance_flag: false }
      ]

      expect(store.currentPeriodVariance).toBe(50000) // Budget 300k - Actual 250k = 50k under budget
    })
  })

  describe('Period Management', () => {
    it('should create a new period correctly', () => {
      const store = useFinancialStore()
      
      store.budgetTemplate = [
        { id: 1, category: 'Food', amount: 300000, frequency: 'biweekly', is_active: true },
        { id: 2, category: 'Transport', amount: 150000, frequency: 'biweekly', is_active: true }
      ]

      const periodData = {
        start_date: '2024-01-01',
        end_date: '2024-01-15',
        liquid_assets_start: 1000000,
        applyTemplate: true
      }

      store.createNewPeriod(periodData)

      expect(store.periods).toHaveLength(1)
      expect(store.currentPeriod).toBeTruthy()
      expect(store.currentPeriod?.total_budget).toBe(450000) // Sum of active budget items
      expect(store.currentPeriod?.status).toBe('active')
      expect(store.currentPeriod?.liquid_assets_start).toBe(1000000)
    })

    it('should close an existing active period when creating new one', () => {
      const store = useFinancialStore()
      
      // Create first period
      store.periods = [{
        id: 1,
        start_date: '2024-01-01',
        end_date: '2024-01-15',
        status: 'active',
        liquid_assets_start: 1000000,
        liquid_assets_end: 0,
        total_receivables: 0,
        total_budget: 500000,
        total_actual: 300000,
        variance: 200000,
        notes: ''
      }]
      store.currentPeriod = store.periods[0]

      // Create second period
      const periodData = {
        start_date: '2024-01-16',
        end_date: '2024-01-31',
        liquid_assets_start: 1200000,
        applyTemplate: false
      }

      store.createNewPeriod(periodData)

      expect(store.periods).toHaveLength(2)
      expect(store.periods[0].status).toBe('completed') // First period should be closed
      expect(store.currentPeriod?.id).toBe(2) // New period should be current
    })

    it('should close a period correctly', () => {
      const store = useFinancialStore()
      
      const period = {
        id: 1,
        start_date: '2024-01-01',
        end_date: '2024-01-15',
        status: 'active' as const,
        liquid_assets_start: 1000000,
        liquid_assets_end: 0,
        total_receivables: 0,
        total_budget: 500000,
        total_actual: 300000,
        variance: 200000,
        notes: ''
      }
      
      store.currentPeriod = period
      store.periods = [period] // Add period to periods array

      store.closePeriod({
        liquid_assets_end: 1200000,
        notes: 'Period completed successfully'
      })

      expect(store.currentPeriod).toBe(null) // No active period
      expect(store.periods[0].status).toBe('completed')
      expect(store.periods[0].liquid_assets_end).toBe(1200000)
      expect(store.periods[0].notes).toBe('Period completed successfully')
    })
  })

  describe('Transaction Management', () => {
    it('should add transaction and update period actuals', () => {
      const store = useFinancialStore()
      
      const period = {
        id: 1,
        start_date: '2024-01-01',
        end_date: '2024-01-15',
        status: 'active' as const,
        liquid_assets_start: 1000000,
        liquid_assets_end: 0,
        total_receivables: 0,
        total_budget: 500000,
        total_actual: 0,
        variance: 500000,
        notes: ''
      }
      
      store.currentPeriod = period
      store.periods = [period]

      store.addTransaction({
        period_id: 1,
        date: '2024-01-05',
        type: 'expense',
        category: 'Food',
        amount: 150000,
        description: 'Groceries',
        variance_flag: false
      })

      expect(store.transactions).toHaveLength(1)
      expect(store.currentPeriod.total_actual).toBe(150000)
      expect(store.currentPeriod.variance).toBe(350000) // 500k budget - 150k actual
    })

    it('should update transaction and recalculate period actuals', () => {
      const store = useFinancialStore()
      
      const period = {
        id: 1,
        start_date: '2024-01-01',
        end_date: '2024-01-15',
        status: 'active' as const,
        liquid_assets_start: 1000000,
        liquid_assets_end: 0,
        total_receivables: 0,
        total_budget: 500000,
        total_actual: 150000,
        variance: 350000,
        notes: ''
      }
      
      store.currentPeriod = period
      store.periods = [period]

      store.transactions = [{
        id: 1,
        period_id: 1,
        date: '2024-01-05',
        type: 'expense',
        category: 'Food',
        amount: 150000,
        description: 'Groceries',
        variance_flag: false
      }]

      store.updateTransaction(1, { amount: 200000 })

      expect(store.transactions[0].amount).toBe(200000)
      expect(store.currentPeriod.total_actual).toBe(200000)
      expect(store.currentPeriod.variance).toBe(300000) // 500k budget - 200k actual
    })

    it('should delete transaction and recalculate period actuals', () => {
      const store = useFinancialStore()
      
      const period = {
        id: 1,
        start_date: '2024-01-01',
        end_date: '2024-01-15',
        status: 'active' as const,
        liquid_assets_start: 1000000,
        liquid_assets_end: 0,
        total_receivables: 0,
        total_budget: 500000,
        total_actual: 150000,
        variance: 350000,
        notes: ''
      }
      
      store.currentPeriod = period
      store.periods = [period]

      store.transactions = [{
        id: 1,
        period_id: 1,
        date: '2024-01-05',
        type: 'expense',
        category: 'Food',
        amount: 150000,
        description: 'Groceries',
        variance_flag: false
      }]

      store.deleteTransaction(1)

      expect(store.transactions).toHaveLength(0)
      expect(store.currentPeriod.total_actual).toBe(0)
      expect(store.currentPeriod.variance).toBe(500000) // Back to full budget
    })
  })

  describe('Account Management', () => {
    it('should update account balance correctly', () => {
      const store = useFinancialStore()
      
      store.accounts = [{
        id: 1,
        name: 'Test Account',
        type: 'bank',
        current_balance: 500000,
        last_updated: '2024-01-01',
        period_id: 1
      }]

      store.updateAccountBalance(1, 750000)

      expect(store.accounts[0].current_balance).toBe(750000)
      expect(store.accounts[0].last_updated).toBe(new Date().toISOString().split('T')[0])
    })

    it('should not update non-existent account', () => {
      const store = useFinancialStore()
      
      store.accounts = [{
        id: 1,
        name: 'Test Account',
        type: 'bank',
        current_balance: 500000,
        last_updated: '2024-01-01',
        period_id: 1
      }]

      store.updateAccountBalance(999, 750000)

      expect(store.accounts[0].current_balance).toBe(500000) // Should remain unchanged
    })
  })

  describe('Budget Template Management', () => {
    it('should add budget item correctly', () => {
      const store = useFinancialStore()

      store.addBudgetItem({
        category: 'Food',
        amount: 300000,
        frequency: 'biweekly',
        is_active: true
      })

      expect(store.budgetTemplate).toHaveLength(1)
      expect(store.budgetTemplate[0].category).toBe('Food')
      expect(store.budgetTemplate[0].amount).toBe(300000)
      expect(store.budgetTemplate[0].id).toBe(1) // Auto-generated ID
    })

    it('should generate incremental IDs for budget items', () => {
      const store = useFinancialStore()

      store.budgetTemplate = [
        { id: 5, category: 'Existing', amount: 100000, frequency: 'biweekly', is_active: true }
      ]

      store.addBudgetItem({
        category: 'Food',
        amount: 300000,
        frequency: 'biweekly',
        is_active: true
      })

      expect(store.budgetTemplate[1].id).toBe(6) // Should be max existing ID + 1
    })

    it('should update budget item correctly', () => {
      const store = useFinancialStore()

      store.budgetTemplate = [
        { id: 1, category: 'Food', amount: 300000, frequency: 'biweekly', is_active: true }
      ]

      store.updateBudgetItem(1, { amount: 350000, is_active: false })

      expect(store.budgetTemplate[0].amount).toBe(350000)
      expect(store.budgetTemplate[0].is_active).toBe(false)
      expect(store.budgetTemplate[0].category).toBe('Food') // Should remain unchanged
    })

    it('should delete budget item correctly', () => {
      const store = useFinancialStore()

      store.budgetTemplate = [
        { id: 1, category: 'Food', amount: 300000, frequency: 'biweekly', is_active: true },
        { id: 2, category: 'Transport', amount: 150000, frequency: 'biweekly', is_active: true }
      ]

      store.deleteBudgetItem(1)

      expect(store.budgetTemplate).toHaveLength(1)
      expect(store.budgetTemplate[0].id).toBe(2)
      expect(store.budgetTemplate[0].category).toBe('Transport')
    })
  })

  describe('Data Validation', () => {
    it('should handle invalid CSV data gracefully', () => {
      const store = useFinancialStore()
      const invalidCSV = 'incomplete,csv\nrow,with,too,many,columns'

      const result = store.parseCSV(invalidCSV)

      expect(result).toHaveLength(1)
      expect(result[0]).toHaveProperty('incomplete')
      expect(result[0]).toHaveProperty('csv')
    })

    it('should preserve data types in CSV parsing', () => {
      const store = useFinancialStore()
      const csvText = `id,active,amount,name
1,true,1000.50,Test
2,false,0,Empty`

      const result = store.parseCSV(csvText)

      expect(result[0].id).toBe(1) // Number
      expect(result[0].active).toBe(true) // Boolean
      expect(result[0].amount).toBe(1000.50) // Number with decimals
      expect(result[0].name).toBe('Test') // String
      expect(result[1].active).toBe(false) // Boolean false
    })
  })

  describe('Local Storage Integration', () => {
    it('should save to localStorage when data changes', () => {
      const store = useFinancialStore()

      store.addBudgetItem({
        category: 'Food',
        amount: 300000,
        frequency: 'biweekly',
        is_active: true
      })

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'financial-data',
        expect.stringContaining('"budgetTemplate"')
      )
    })

    it('should load from localStorage on initialization', () => {
      const mockData = {
        currentPeriod: null,
        periods: [],
        accounts: [],
        receivables: [],
        budgetTemplate: [
          { id: 1, category: 'Food', amount: 300000, frequency: 'biweekly', is_active: true }
        ],
        incomeTemplate: [],
        receivablePayments: [],
        transactions: [],
        variances: [],
        goals: [],
        expenseCategories: ['Food', 'Transport'],
        lastUpdated: '2024-01-01T00:00:00.000Z'
      }

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockData))

      const store = useFinancialStore()
      store.loadFromLocalStorage()

      expect(store.budgetTemplate).toHaveLength(1)
      expect(store.budgetTemplate[0].category).toBe('Food')
      expect(store.expenseCategories).toEqual(['Food', 'Transport'])
    })

    it('should handle corrupted localStorage data', () => {
      localStorageMock.getItem.mockReturnValue('invalid json')

      const store = useFinancialStore()

      expect(() => store.loadFromLocalStorage()).not.toThrow()
      expect(store.budgetTemplate).toHaveLength(0) // Should remain empty
    })
  })
})