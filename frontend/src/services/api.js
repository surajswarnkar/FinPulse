// Centralized API configuration for the Express Backend (server.js on port 4000)
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const API_ENDPOINTS = {
  // Mounted at app.use("/api/users", userRouter)
  login: '/api/users/login',
  register: '/api/users/register',
  profile: '/api/users/me',

  // Mounted at app.use("/api/dashboard", dashboardRouter)
  dashboard: '/api/dashboard',

  // Mounted at app.use("/api/income", incomeRouter)
  getIncome: '/api/income/get',
  addIncome: '/api/income/add',
  deleteIncome: '/api/income/delete',
  downloadIncome: '/api/income/download-excel',

  // Mounted at app.use("/api/expense", expenseRouter)
  getExpense: '/api/expense/get',
  addExpense: '/api/expense/add',
  deleteExpense: '/api/expense/delete',
  downloadExpense: '/api/expense/download-excel'
};
