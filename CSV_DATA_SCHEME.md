# Financial Management App - CSV Data Schema

## 📊 **Required CSV Files**

### **1. periods.csv**
### **2. accounts.csv** (Liquid Assets)
### **2b. receivables.csv** (Money Owed to You)
### **3. budget_template.csv**
### **4. income_template.csv**
### **4b. receivable_payments.csv** (Receivable Payment Tracking)
### **5. transactions.csv**
### **6. variances.csv**
### **7. goals.csv**

### **1. periods.csv**
Tracks each 15-day financial cycle
```csv
id,start_date,end_date,status,liquid_assets_start,liquid_assets_end,total_receivables,total_budget,total_actual,variance,notes
1,2025-01-15,2025-01-30,completed,12245739,12742846,2220000,952980,1024314,-71334,"Unexpected medical expense"
2,2025-01-31,2025-02-14,active,12742846,0,1940000,952980,450000,502980,""
```

**Fields:**
- `id`: Unique period identifier
- `start_date`: Period start (payday)
- `end_date`: Period end
- `status`: active, completed
- `liquid_assets_start`: Liquid assets at period start
- `liquid_assets_end`: Liquid assets at period end (0 if active)
- `total_receivables`: Total money owed to you
- `total_budget`: Total budgeted expenses
- `total_actual`: Total actual expenses
- `variance`: Budget vs actual difference
- `notes`: General period notes

### **2. accounts.csv**
Liquid financial accounts (money you can access immediately)
```csv
id,name,type,current_balance,last_updated,period_id
1,Efectivo,cash,100000,2025-01-31,2
2,Bancolombia,bank,7108288,2025-01-31,2
3,Nequi,digital_wallet,867017,2025-01-31,2
4,Bonuses,salary_account,361850,2025-01-31,2
5,Inversiones,investment,1107627,2025-01-31,2
6,Tarjetas_People_Pass,credit,2557384,2025-01-31,2
```

**Fields:**
- `id`: Unique account identifier
- `name`: Account name
- `type`: cash, bank, digital_wallet, salary_account, investment, credit
- `current_balance`: Current balance
- `last_updated`: Last update date
- `period_id`: Associated period

### **2b. receivables.csv**
Money owed to you (assets but not liquid)
```csv
id,debtor_name,original_amount,current_balance,loan_date,expected_payment_date,payment_frequency,status,notes
1,REYES_Y_HORTUA,2500000,2220000,2024-06-15,2025-02-15,biweekly,active,"Work payment pending"
2,Brother,500000,350000,2024-12-01,2025-03-01,monthly,active,"Personal loan"
3,Friend_Carlos,200000,0,2024-08-01,2024-12-01,lump_sum,paid,"Paid back in full"
```

**Fields:**
- `id`: Unique receivable identifier
- `debtor_name`: Who owes you money
- `original_amount`: Original amount lent/owed
- `current_balance`: Amount still owed
- `loan_date`: When the debt was created
- `expected_payment_date`: When you expect payment
- `payment_frequency`: biweekly, monthly, lump_sum, irregular
- `status`: active, paid, overdue, written_off
- `notes`: Additional details

### **3. budget_template.csv**
Standard budget template applied each period
```csv
id,category,subcategory,amount,due_date,frequency,is_active
1,Transportes,,60000,,biweekly,1
2,Suscripciones,Netflix,26900,7,monthly,1
3,Suscripciones,Spotify,16900,16,monthly,1
4,Suscripciones,OpenAI,85000,5,monthly,1
5,Servicios,Luz,47000,15,monthly,1
6,Servicios,Agua,25000,15,monthly,1
7,Servicios,Internet,62000,18,monthly,1
8,Servicios,Gas,32000,28,monthly,1
9,Hogar,Arriendo,400000,17,monthly,1
10,Hogar,General,300000,,biweekly,1
11,Salidas,,200000,,biweekly,1
12,Credito,Cuota_Principal,360980,,biweekly,1
```

**Fields:**
- `id`: Unique budget item identifier
- `category`: Main expense category
- `subcategory`: Specific item (optional)
- `amount`: Budgeted amount
- `due_date`: Day of month when due (optional)
- `frequency`: biweekly, monthly
- `is_active`: 1 if active, 0 if inactive

### **4. income_template.csv**
Standard income sources (excluding receivables)
```csv
id,source,amount,frequency,is_active
1,CXC_NOMINA_2DA_QUINCENA,1840000,biweekly,1
2,Bill_Payment,361850,irregular,1
```

**Fields:**
- `id`: Unique income identifier
- `source`: Income source name
- `amount`: Expected amount
- `frequency`: biweekly, monthly, irregular
- `is_active`: 1 if active, 0 if inactive

### **4b. receivable_payments.csv**
Track actual payments received from receivables
```csv
id,receivable_id,period_id,payment_date,amount_received,remaining_balance,notes
1,1,1,2025-01-15,280000,1940000,"Partial payment from REYES_Y_HORTUA"
2,1,2,2025-01-31,280000,1660000,"Regular biweekly payment"
3,2,2,2025-02-01,150000,200000,"Brother monthly payment"
```

**Fields:**
- `id`: Unique payment identifier
- `receivable_id`: Links to receivables.csv
- `period_id`: Which period the payment was received
- `payment_date`: Date of payment
- `amount_received`: Amount paid
- `remaining_balance`: Balance after this payment
- `notes`: Payment details

### **5. transactions.csv**
All actual income and expenses per period
```csv
id,period_id,date,type,category,subcategory,amount,description,variance_flag
1,2,2025-02-01,expense,Suscripciones,Netflix,26900,"Netflix subscription",0
2,2,2025-02-03,expense,Transportes,,75000,"Taxi + Metro",1
3,2,2025-02-01,income,CXC_NOMINA_2DA_QUINCENA,,1840000,"Salary payment",0
4,2,2025-02-05,expense,Unexpected,Medical,120000,"Doctor visit",1
```

**Fields:**
- `id`: Unique transaction identifier
- `period_id`: Associated period
- `date`: Transaction date
- `type`: income, expense
- `category`: Main category
- `subcategory`: Specific item (optional)
- `amount`: Transaction amount
- `description`: Transaction description
- `variance_flag`: 1 if this is a variance/unexpected item

### **6. variances.csv**
Detailed variance tracking and explanations
```csv
id,period_id,category,budgeted_amount,actual_amount,variance_amount,reason,explanation
1,1,Transportes,60000,75000,-15000,"Higher than expected","Had to take taxi due to strike"
2,1,Medical,0,120000,-120000,"Unbudgeted expense","Emergency doctor visit"
3,1,Servicios,32000,28500,3500,"Lower than expected","Gas bill was lower"
```

**Fields:**
- `id`: Unique variance identifier
- `period_id`: Associated period
- `category`: Affected category
- `budgeted_amount`: Originally budgeted
- `actual_amount`: Actual spent
- `variance_amount`: Difference (negative = overspent)
- `reason`: Brief reason code
- `explanation`: Detailed explanation

### **7. goals.csv**
Financial goals tracking (from your METAS sheet)
```csv
id,name,target_amount,current_amount,target_date,priority,status
1,Bicicleta_Mama,1100000,650000,2025-06-01,high,active
2,Mechanical_Keyboard,400000,400000,2025-03-01,medium,completed
3,Wireless_Mouse,160000,155000,2025-02-15,low,active
```

**Fields:**
- `id`: Unique goal identifier
- `name`: Goal name/description
- `target_amount`: Target cost
- `current_amount`: Amount saved toward goal
- `target_date`: Target completion date
- `priority`: high, medium, low
- `status`: active, completed, paused

---

## 🔄 **Data Migration Process**

### **Step 1: Export Current Data**
From your Excel file, you'll need to:
1. Extract current account balances → `accounts.csv`
2. Create budget template from PRESUPUESTO → `budget_template.csv` & `income_template.csv`
3. Extract goals from METAS → `goals.csv`
4. Create initial period record → `periods.csv`

### **Step 2: Historical Data (Optional)**
If you want historical analysis:
- Extract past transactions from specialized sheets
- Create historical periods
- Import past variances with explanations

### **Step 3: App Initialization**
- Import all CSV files
- Validate data integrity
- Set up current active period

---

## 📱 **Vue.js App Structure Preview**

### **Pages:**
1. **Dashboard** - Overview, current period status
2. **Accounts** - Asset tracking and updates
3. **Budget** - Budget vs actual, variance tracking
4. **Transactions** - Add/edit income and expenses
5. **Analysis** - Variance analysis, trends
6. **Goals** - Goal tracking and progress
7. **Settings** - Import/export, templates

### **Key Reactive Features:**
- **Real-time Balance Updates** - As you add expenses, see remaining budget
- **Variance Alerts** - Immediate feedback on budget overruns
- **Progress Indicators** - Visual progress bars for budget categories
- **Cash Flow Projection** - See projected end-of-period balance
- **Receivables Tracking** - Monitor money owed to you separately from liquid assets
- **Net Worth Calculator** - Liquid assets + receivables = total net worth

---

## ❓ **Next Steps:**

1. **Confirm CSV Structure** - Does this match your data needs?
2. **Data Migration Plan** - Should I help create the initial CSV files from your Excel?
3. **UI Priorities** - Which pages should we build first?
4. **Vue.js Setup** - Any specific Vue 3 preferences (Composition API, Pinia, etc.)?

Ready to start building once you confirm the data structure!