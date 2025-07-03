import { describe, it, expect } from 'vitest'

// Financial utility functions that should be extracted and tested
describe('Financial Utility Functions', () => {
  
  describe('Currency Formatting', () => {
    const formatCurrency = (value: number): string => {
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
      }).format(value)
    }

    it('should format positive amounts correctly', () => {
      const result = formatCurrency(1000000)
      expect(result).toContain('1.000.000')
      expect(result.includes('$') || result.includes('COP')).toBe(true)
    })

    it('should format negative amounts correctly', () => {
      const result = formatCurrency(-500000)
      expect(result).toContain('500.000')
      expect(result).toContain('-')
    })

    it('should format zero correctly', () => {
      const result = formatCurrency(0)
      expect(result).toContain('0')
    })

    it('should handle decimal amounts', () => {
      const result = formatCurrency(1000.50)
      // Different locales format decimals differently (period vs comma)
      expect(result.includes('1.001') || result.includes('1.000,5') || result.includes('1.000')).toBe(true)
    })

    it('should handle very large amounts', () => {
      const result = formatCurrency(999999999)
      expect(result).toContain('999.999.999')
    })
  })

  describe('Date Formatting', () => {
    const formatDate = (dateString: string): string => {
      // Parse as local date to avoid timezone issues
      const [year, month, day] = dateString.split('-').map(Number)
      const date = new Date(year, month - 1, day) // month is 0-indexed
      return date.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }

    it('should format dates correctly', () => {
      const formatted = formatDate('2024-01-15')
      expect(formatted).toContain('2024')
      expect(formatted).toContain('15')
      // Check for Spanish or English month abbreviation
      expect(formatted.includes('ene') || formatted.includes('Jan')).toBe(true)
    })

    it('should handle different date formats', () => {
      const isoDate = formatDate('2024-12-25')
      expect(isoDate).toContain('2024')
      expect(isoDate).toContain('25')
      // Check for Spanish or English month abbreviation for December
      expect(isoDate.includes('dic') || isoDate.includes('Dec')).toBe(true)
    })

    it('should handle invalid dates gracefully', () => {
      const invalidDate = formatDate('invalid-date')
      expect(invalidDate).toBe('Invalid Date')
    })
  })

  describe('Period Date Calculations', () => {
    const calculateEndDate = (startDate: string, days: number = 14): string => {
      const start = new Date(startDate)
      const end = new Date(start)
      end.setDate(end.getDate() + days)
      return end.toISOString().split('T')[0]
    }

    it('should calculate 15-day period end date correctly', () => {
      const endDate = calculateEndDate('2024-01-01', 14)
      expect(endDate).toBe('2024-01-15')
    })

    it('should handle month boundaries', () => {
      const endDate = calculateEndDate('2024-01-25', 14)
      expect(endDate).toBe('2024-02-08')
    })

    it('should handle year boundaries', () => {
      const endDate = calculateEndDate('2024-12-25', 14)
      expect(endDate).toBe('2025-01-08')
    })

    it('should handle leap years', () => {
      const endDate = calculateEndDate('2024-02-20', 14) // 2024 is a leap year
      expect(endDate).toBe('2024-03-05')
    })
  })

  describe('Days Remaining Calculation', () => {
    const calculateDaysRemaining = (endDate: string): number => {
      const end = new Date(endDate)
      const today = new Date()
      const diffTime = end.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return Math.max(0, diffDays)
    }

    it('should calculate positive days remaining', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 5)
      const endDate = tomorrow.toISOString().split('T')[0]
      
      const daysRemaining = calculateDaysRemaining(endDate)
      expect(daysRemaining).toBeGreaterThanOrEqual(4)
      expect(daysRemaining).toBeLessThanOrEqual(6) // Account for time differences
    })

    it('should return 0 for past dates', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const endDate = yesterday.toISOString().split('T')[0]
      
      const daysRemaining = calculateDaysRemaining(endDate)
      expect(daysRemaining).toBe(0)
    })

    it('should handle same day correctly', () => {
      const today = new Date().toISOString().split('T')[0]
      const daysRemaining = calculateDaysRemaining(today)
      expect(daysRemaining).toBeGreaterThanOrEqual(0)
      expect(daysRemaining).toBeLessThanOrEqual(1)
    })
  })

  describe('Percentage Calculations', () => {
    const calculatePercentage = (actual: number, budget: number): number => {
      if (budget === 0) return 0
      return (actual / budget) * 100
    }

    const calculateVariancePercentage = (variance: number, budget: number): number => {
      if (budget === 0) return 0
      return (variance / budget) * 100
    }

    it('should calculate budget usage percentage correctly', () => {
      expect(calculatePercentage(250000, 500000)).toBe(50)
      expect(calculatePercentage(500000, 500000)).toBe(100)
      expect(calculatePercentage(750000, 500000)).toBe(150) // Over budget
    })

    it('should handle zero budget gracefully', () => {
      expect(calculatePercentage(100000, 0)).toBe(0)
    })

    it('should calculate variance percentage correctly', () => {
      expect(calculateVariancePercentage(100000, 500000)).toBe(20) // 20% under budget
      expect(calculateVariancePercentage(-100000, 500000)).toBe(-20) // 20% over budget
    })

    it('should handle negative variance correctly', () => {
      expect(calculateVariancePercentage(-250000, 500000)).toBe(-50) // 50% over budget
    })
  })

  describe('Budget Accuracy Score', () => {
    const calculateAccuracyScore = (variance: number, budget: number): number => {
      if (budget === 0) return 0
      const accuracy = 100 - Math.abs((variance / budget) * 100)
      return Math.max(0, Math.round(accuracy))
    }

    it('should calculate perfect accuracy for zero variance', () => {
      expect(calculateAccuracyScore(0, 500000)).toBe(100)
    })

    it('should calculate accuracy for small variances', () => {
      expect(calculateAccuracyScore(25000, 500000)).toBe(95) // 5% variance = 95% accuracy
      expect(calculateAccuracyScore(-25000, 500000)).toBe(95) // Same for negative variance
    })

    it('should calculate accuracy for large variances', () => {
      expect(calculateAccuracyScore(250000, 500000)).toBe(50) // 50% variance = 50% accuracy
      expect(calculateAccuracyScore(-400000, 500000)).toBe(20) // 80% variance = 20% accuracy
    })

    it('should not return negative accuracy scores', () => {
      expect(calculateAccuracyScore(600000, 500000)).toBe(0) // 120% variance = 0% accuracy (not negative)
    })

    it('should handle zero budget gracefully', () => {
      expect(calculateAccuracyScore(100000, 0)).toBe(0)
    })
  })

  describe('Data Validation', () => {
    const isValidAmount = (amount: any): boolean => {
      return typeof amount === 'number' && amount >= 0 && isFinite(amount)
    }

    const isValidDate = (dateString: any): boolean => {
      if (typeof dateString !== 'string') return false
      const date = new Date(dateString)
      return !isNaN(date.getTime())
    }

    const isValidPeriodId = (id: any): boolean => {
      return typeof id === 'number' && id > 0 && Number.isInteger(id)
    }

    it('should validate amounts correctly', () => {
      expect(isValidAmount(1000)).toBe(true)
      expect(isValidAmount(0)).toBe(true)
      expect(isValidAmount(-100)).toBe(false)
      expect(isValidAmount('1000')).toBe(false)
      expect(isValidAmount(Infinity)).toBe(false)
      expect(isValidAmount(NaN)).toBe(false)
    })

    it('should validate dates correctly', () => {
      expect(isValidDate('2024-01-15')).toBe(true)
      expect(isValidDate('2024-01-15T10:00:00.000Z')).toBe(true)
      expect(isValidDate('invalid-date')).toBe(false)
      expect(isValidDate(123456)).toBe(false)
      expect(isValidDate(null)).toBe(false)
      expect(isValidDate('')).toBe(false)
    })

    it('should validate period IDs correctly', () => {
      expect(isValidPeriodId(1)).toBe(true)
      expect(isValidPeriodId(100)).toBe(true)
      expect(isValidPeriodId(0)).toBe(false)
      expect(isValidPeriodId(-1)).toBe(false)
      expect(isValidPeriodId(1.5)).toBe(false)
      expect(isValidPeriodId('1')).toBe(false)
      expect(isValidPeriodId(null)).toBe(false)
    })
  })

  describe('CSV Data Integrity', () => {
    const validateCSVRow = (row: any, requiredFields: string[]): boolean => {
      if (!row || typeof row !== 'object') return false
      return requiredFields.every(field => row.hasOwnProperty(field))
    }

    const sanitizeCSVValue = (value: any): string => {
      if (value === null || value === undefined) return ''
      const stringValue = String(value)
      // Escape quotes and commas
      if (stringValue.includes(',') || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`
      }
      return stringValue
    }

    it('should validate CSV rows correctly', () => {
      const validRow = { id: 1, name: 'Test', amount: 1000 }
      const invalidRow = { id: 1, name: 'Test' } // Missing amount
      const requiredFields = ['id', 'name', 'amount']

      expect(validateCSVRow(validRow, requiredFields)).toBe(true)
      expect(validateCSVRow(invalidRow, requiredFields)).toBe(false)
      expect(validateCSVRow(null, requiredFields)).toBe(false)
      expect(validateCSVRow('invalid', requiredFields)).toBe(false)
    })

    it('should sanitize CSV values correctly', () => {
      expect(sanitizeCSVValue('simple')).toBe('simple')
      expect(sanitizeCSVValue('has, comma')).toBe('"has, comma"')
      expect(sanitizeCSVValue('has "quotes"')).toBe('"has ""quotes"""')
      expect(sanitizeCSVValue(null)).toBe('')
      expect(sanitizeCSVValue(undefined)).toBe('')
      expect(sanitizeCSVValue(123)).toBe('123')
    })
  })

  describe('Category Analysis', () => {
    const calculateCategoryVariance = (transactions: any[], budgetItems: any[], category: string) => {
      const budgeted = budgetItems
        .filter(item => item.category === category && item.is_active)
        .reduce((sum, item) => sum + item.amount, 0)
      
      const actual = transactions
        .filter(t => t.category === category && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)
      
      return {
        budgeted,
        actual,
        variance: budgeted - actual,
        percentage: budgeted > 0 ? ((budgeted - actual) / budgeted) * 100 : 0
      }
    }

    it('should calculate category variance correctly', () => {
      const transactions = [
        { category: 'Food', type: 'expense', amount: 250000 },
        { category: 'Food', type: 'expense', amount: 50000 },
        { category: 'Transport', type: 'expense', amount: 100000 }
      ]

      const budgetItems = [
        { category: 'Food', amount: 400000, is_active: true },
        { category: 'Transport', amount: 150000, is_active: true }
      ]

      const foodVariance = calculateCategoryVariance(transactions, budgetItems, 'Food')
      expect(foodVariance.budgeted).toBe(400000)
      expect(foodVariance.actual).toBe(300000)
      expect(foodVariance.variance).toBe(100000) // Under budget
      expect(foodVariance.percentage).toBe(25) // 25% under budget

      const transportVariance = calculateCategoryVariance(transactions, budgetItems, 'Transport')
      expect(transportVariance.budgeted).toBe(150000)
      expect(transportVariance.actual).toBe(100000)
      expect(transportVariance.variance).toBe(50000) // Under budget
      expect(transportVariance.percentage).toBeCloseTo(33.33, 1) // ~33% under budget
    })

    it('should handle categories with no budget', () => {
      const transactions = [{ category: 'Unexpected', type: 'expense', amount: 100000 }]
      const budgetItems: any[] = []

      const variance = calculateCategoryVariance(transactions, budgetItems, 'Unexpected')
      expect(variance.budgeted).toBe(0)
      expect(variance.actual).toBe(100000)
      expect(variance.variance).toBe(-100000) // Over budget (no budget set)
      expect(variance.percentage).toBe(0) // Can't calculate percentage with zero budget
    })

    it('should handle categories with no transactions', () => {
      const transactions: any[] = []
      const budgetItems = [{ category: 'Food', amount: 400000, is_active: true }]

      const variance = calculateCategoryVariance(transactions, budgetItems, 'Food')
      expect(variance.budgeted).toBe(400000)
      expect(variance.actual).toBe(0)
      expect(variance.variance).toBe(400000) // All budget remaining
      expect(variance.percentage).toBe(100) // 100% under budget
    })
  })
})