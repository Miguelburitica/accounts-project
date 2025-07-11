import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
    },
    {
      path: '/budget-template',
      name: 'budget-template',
      component: () => import('../views/BudgetTemplateView.vue'),
    },
    {
      path: '/periods',
      name: 'periods',
      component: () => import('../views/PeriodsView.vue'),
    },
    {
      path: '/transactions',
      name: 'transactions',
      component: () => import('../views/TransactionsView.vue'),
    },
    {
      path: '/variance',
      name: 'variance',
      component: () => import('../views/VarianceView.vue'),
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
  ],
})

export default router
