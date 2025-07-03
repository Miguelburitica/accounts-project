import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useFinancialStore } from '@/stores/financial'
import type { CSVFileStructure } from '@/types/financial'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('CSV Import/Export Integration Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorageMock.getItem.mockClear()
    localStorageMock.setItem.mockClear()
  })

  describe('Complete Data Round Trip', () => {
    it('should maintain data integrity through export and import cycle', () => {
      const store = useFinancialStore()

      // Setup complete financial data
      const originalData = {
        periods: [{
          id: 1,
          start_date: '2024-01-01',
          end_date: '2024-01-15',
          status: 'completed' as const,
          liquid_assets_start: 1000000,
          liquid_assets_end: 1200000,
          total_receivables: 500000,
          total_budget: 800000,
          total_actual: 750000,
          variance: 50000,
          notes: 'Test period with special chars: "quotes", commas'
        }],
        accounts: [{
          id: 1,
          name: 'Test Account with, comma',
          type: 'bank' as const,
          current_balance: 1000000,
          last_updated: '2024-01-15',
          period_id: 1
        }],
        budgetTemplate: [{
          id: 1,
          category: 'Food & Dining',
          subcategory: 'Restaurants, fast food',
          amount: 300000,
          due_date: 15,
          frequency: 'biweekly' as const,
          is_active: true
        }],
        incomeTemplate: [{
          id: 1,
          source: 'Salary "Regular"',
          amount: 2000000,
          frequency: 'biweekly' as const,
          is_active: true
        }],
        transactions: [{
          id: 1,
          period_id: 1,
          date: '2024-01-05',
          type: 'expense' as const,
          category: 'Food & Dining',
          subcategory: 'Restaurants',
          amount: 150000,
          description: 'Lunch with "colleagues", very nice',
          variance_flag: false
        }],
        variances: [{
          id: 1,
          period_id: 1,
          category: 'Food & Dining',
          budgeted_amount: 300000,
          actual_amount: 350000,
          variance_amount: -50000,
          reason: 'unexpected',
          explanation: 'Had extra meals, including "expensive" restaurant'
        }],
        goals: [{
          id: 1,
          name: 'Emergency Fund, 6 months',
          target_amount: 10000000,
          current_amount: 5000000,
          target_date: '2024-12-31',
          priority: 'high' as const,
          status: 'active' as const
        }]
      }

      // Load data into store
      store.periods = originalData.periods
      store.accounts = originalData.accounts
      store.budgetTemplate = originalData.budgetTemplate
      store.incomeTemplate = originalData.incomeTemplate
      store.transactions = originalData.transactions
      store.variances = originalData.variances
      store.goals = originalData.goals

      // Export each data type to CSV
      const csvExports = {
        periods: store.convertToCSV(store.periods, 'periods'),
        accounts: store.convertToCSV(store.accounts, 'accounts'),
        budget_template: store.convertToCSV(store.budgetTemplate, 'budget_template'),
        income_template: store.convertToCSV(store.incomeTemplate, 'income_template'),
        transactions: store.convertToCSV(store.transactions, 'transactions'),
        variances: store.convertToCSV(store.variances, 'variances'),
        goals: store.convertToCSV(store.goals, 'goals')
      }

      // Verify CSV exports contain data
      Object.entries(csvExports).forEach(([key, csv]) => {
        expect(csv.length).toBeGreaterThan(0)
        expect(csv.split('\n').length).toBeGreaterThanOrEqual(2) // Header + at least one data row
      })

      // Create new store instance and import the data
      const newStore = useFinancialStore()
      
      // Clear any existing data first
      newStore.periods = []
      newStore.accounts = []
      newStore.budgetTemplate = []
      newStore.incomeTemplate = []
      newStore.transactions = []
      newStore.variances = []
      newStore.goals = []
      
      newStore.importCSVData(csvExports)

      // Verify data integrity after round trip
      expect(newStore.periods).toHaveLength(1)
      expect(newStore.periods[0].id).toBe(1)
      expect(newStore.periods[0].start_date).toBe('2024-01-01')
      expect(newStore.periods[0].notes).toBe('Test period with special chars: "quotes", commas')

      expect(newStore.accounts).toHaveLength(1)
      expect(newStore.accounts[0].name).toBe('Test Account with, comma')
      expect(newStore.accounts[0].current_balance).toBe(1000000)

      expect(newStore.budgetTemplate).toHaveLength(1)
      expect(newStore.budgetTemplate[0].category).toBe('Food & Dining')
      expect(newStore.budgetTemplate[0].subcategory).toBe('Restaurants, fast food')

      expect(newStore.transactions).toHaveLength(1)
      expect(newStore.transactions[0].description).toBe('Lunch with "colleagues", very nice')
      expect(newStore.transactions[0].amount).toBe(150000)

      expect(newStore.variances).toHaveLength(1)
      expect(newStore.variances[0].explanation).toBe('Had extra meals, including "expensive" restaurant')

      expect(newStore.goals).toHaveLength(1)
      expect(newStore.goals[0].name).toBe('Emergency Fund, 6 months')
    })
  })

  describe('CSV Format Validation', () => {
    it('should handle periods CSV with all required fields', () => {
      const store = useFinancialStore()
      const periodsCSV = `id,start_date,end_date,status,liquid_assets_start,liquid_assets_end,total_receivables,total_budget,total_actual,variance,notes
1,2024-01-01,2024-01-15,completed,1000000,1200000,500000,800000,750000,50000,"Test notes"
2,2024-01-16,2024-01-31,active,1200000,0,500000,800000,400000,400000,""`

      const result = store.parseCSV(periodsCSV)

      expect(result).toHaveLength(2)
      expect(result[0].id).toBe(1)
      expect(result[0].status).toBe('completed')
      expect(result[0].liquid_assets_start).toBe(1000000)
      expect(result[1].id).toBe(2)
      expect(result[1].status).toBe('active')
      expect(result[1].liquid_assets_end).toBe(0)
    })

    it('should handle transactions CSV with variance flags', () => {
      const store = useFinancialStore()
      const transactionsCSV = `id,period_id,date,type,category,subcategory,amount,description,variance_flag
1,1,2024-01-05,expense,Food,,150000,"Lunch at restaurant",false
2,1,2024-01-06,expense,Transport,,75000,"Emergency taxi",true
3,1,2024-01-15,income,Salary,,2000000,"Bi-weekly salary",false`

      const result = store.parseCSV(transactionsCSV)

      expect(result).toHaveLength(3)
      expect(result[0].variance_flag).toBe(false)
      expect(result[1].variance_flag).toBe(true)
      expect(result[2].type).toBe('income')
      expect(result[2].amount).toBe(2000000)
    })

    it('should handle budget template CSV with optional fields', () => {
      const store = useFinancialStore()
      const budgetCSV = `id,category,subcategory,amount,due_date,frequency,is_active
1,Food,,300000,,biweekly,true
2,Utilities,Electricity,150000,15,monthly,true
3,Entertainment,Movies,100000,,monthly,false`

      const result = store.parseCSV(budgetCSV)

      expect(result).toHaveLength(3)
      expect(result[0].subcategory).toBe('')
      expect(result[0].due_date).toBe('')
      expect(result[1].due_date).toBe(15)
      expect(result[2].is_active).toBe(false)
    })
  })

  describe('Error Handling', () => {
    it('should handle malformed CSV gracefully', () => {
      const store = useFinancialStore()
      const malformedCSV = `id,name,amount
1,Test,1000
2,"Unclosed quote,2000
3,Normal,3000`

      const result = store.parseCSV(malformedCSV)

      // Should still parse what it can
      expect(result.length).toBeGreaterThan(0)
      expect(result[0].id).toBe(1)
      expect(result[0].name).toBe('Test')
    })

    it('should handle missing required fields', () => {
      const store = useFinancialStore()
      const incompleteCSV = `id,name
1,Test
2,Another`

      const result = store.parseCSV(incompleteCSV)

      expect(result).toHaveLength(2)
      expect(result[0]).toHaveProperty('id')
      expect(result[0]).toHaveProperty('name')
      expect(result[0]).not.toHaveProperty('amount')
    })

    it('should handle empty CSV data', () => {
      const store = useFinancialStore()

      expect(() => store.importCSVData({})).not.toThrow()
      expect(store.periods).toHaveLength(0)
      expect(store.accounts).toHaveLength(0)
    })

    it('should handle CSV with special characters', () => {
      const store = useFinancialStore()
      const specialCSV = `id,description,amount
1,"Contains ""quotes"" and commas, see?",1000
2,"Unicode: 🏦 💰 📊",2000
3,"Complex description with special chars",3000`

      const result = store.parseCSV(specialCSV)

      expect(result).toHaveLength(3)
      expect(result[0].description).toContain('quotes')
      expect(result[0].description).toContain('commas')
      expect(result[1].description).toContain('🏦')
      expect(result[2].description).toContain('Complex')
    })
  })

  describe('Data Type Preservation', () => {
    it('should preserve number types during CSV round trip', () => {
      const store = useFinancialStore()
      const originalData = [
        { id: 1, amount: 1000000, percentage: 25.5, count: 0 },
        { id: 2, amount: 500000, percentage: 0, count: 10 }
      ]

      const csv = store.convertToCSV(originalData, 'test')
      const parsed = store.parseCSV(csv)

      expect(parsed[0].id).toBe(1)
      expect(parsed[0].amount).toBe(1000000)
      expect(parsed[0].percentage).toBe(25.5)
      expect(parsed[0].count).toBe(0)
      expect(parsed[1].amount).toBe(500000)
      expect(parsed[1].count).toBe(10)
    })

    it('should preserve boolean types during CSV round trip', () => {
      const store = useFinancialStore()
      const originalData = [
        { id: 1, is_active: true, variance_flag: false },
        { id: 2, is_active: false, variance_flag: true }
      ]

      const csv = store.convertToCSV(originalData, 'test')
      const parsed = store.parseCSV(csv)

      expect(parsed[0].is_active).toBe(true)
      expect(parsed[0].variance_flag).toBe(false)
      expect(parsed[1].is_active).toBe(false)
      expect(parsed[1].variance_flag).toBe(true)
    })

    it('should handle null and undefined values', () => {
      const store = useFinancialStore()
      const originalData = [
        { id: 1, optional_field: null, another_field: undefined, normal_field: 'value' }
      ]

      const csv = store.convertToCSV(originalData, 'test')
      const parsed = store.parseCSV(csv)

      expect(parsed[0].id).toBe(1)
      expect(parsed[0].optional_field).toBe('')
      expect(parsed[0].another_field).toBe('')
      expect(parsed[0].normal_field).toBe('value')
    })
  })

  describe('Large Dataset Performance', () => {
    it('should handle large datasets efficiently', () => {
      const store = useFinancialStore()
      
      // Generate large dataset
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        period_id: Math.floor(i / 100) + 1,
        date: `2024-01-${String(i % 28 + 1).padStart(2, '0')}`,
        type: i % 2 === 0 ? 'expense' : 'income',
        category: `Category ${i % 10}`,
        amount: Math.floor(Math.random() * 1000000),
        description: `Transaction ${i + 1} with some description`,
        variance_flag: i % 10 === 0
      }))

      const startTime = Date.now()
      const csv = store.convertToCSV(largeDataset, 'transactions')
      const exportTime = Date.now() - startTime

      const parseStartTime = Date.now()
      const parsed = store.parseCSV(csv)
      const parseTime = Date.now() - parseStartTime

      expect(parsed).toHaveLength(1000)
      expect(exportTime).toBeLessThan(1000) // Should complete within 1 second
      expect(parseTime).toBeLessThan(1000) // Should complete within 1 second
      
      // Verify data integrity on sample
      expect(parsed[0].id).toBe(1)
      expect(parsed[999].id).toBe(1000)
      expect(parsed[0].type).toBe('expense')
      expect(parsed[1].type).toBe('income')
    })
  })

  describe('Financial Calculations After Import', () => {
    it('should maintain calculation accuracy after CSV import', () => {
      const store = useFinancialStore()
      
      // Import period data
      const periodCSV = `id,start_date,end_date,status,liquid_assets_start,liquid_assets_end,total_receivables,total_budget,total_actual,variance,notes
1,2024-01-01,2024-01-15,active,1000000,0,0,500000,0,0,""`
      
      // Import budget template
      const budgetCSV = `id,category,subcategory,amount,due_date,frequency,is_active
1,Food,,300000,,biweekly,true
2,Transport,,200000,,biweekly,true`
      
      // Import transactions
      const transactionsCSV = `id,period_id,date,type,category,subcategory,amount,description,variance_flag
1,1,2024-01-05,expense,Food,,250000,"Groceries",false
2,1,2024-01-06,expense,Transport,,180000,"Transportation",false`

      store.importCSVData({
        periods: periodCSV,
        budget_template: budgetCSV,
        transactions: transactionsCSV
      })

      // Verify calculations are correct after import
      expect(store.currentPeriodBudget).toBe(500000) // 300k + 200k
      expect(store.currentPeriodActual).toBe(430000) // 250k + 180k
      expect(store.currentPeriodVariance).toBe(70000) // 500k - 430k

      // Update period actuals and verify
      store.updatePeriodActuals()
      expect(store.currentPeriod?.total_actual).toBe(430000)
      expect(store.currentPeriod?.variance).toBe(70000)
    })
  })
})