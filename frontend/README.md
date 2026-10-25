# FinPulse — Expense Tracker Frontend (React + Vite + Tailwind CSS)

Modern, responsive React + Vite + Tailwind CSS frontend built for your Express + MongoDB Expense Tracker backend (`server.js` running on `http://localhost:4000`).

## Features
- **Dashboard Overview**: Real-time Total Balance, Total Income, Total Expenses, Savings Rate, Monthly Budget Progress bar, Cashflow AreaChart, Category Donut Chart, and Recent Transactions list.
- **Income Management (`/api/income`)**: Add, edit, delete, filter, and search income entries matching your `income_details.xlsx` schema (`description, amount, category, date`), plus 1-click `.xlsx`/`.csv` export.
- **Expense Management (`/api/expense`)**: Add, edit, delete, filter, and search expenses with category breakdown charts and spreadsheet export.
- **User Authentication (`/api/users`)**: Login and Registration modal supporting JWT (`Bearer` & `token` headers).
- **Live Backend + Demo Mode**: Connects automatically to `http://localhost:4000` and includes an in-app **API Config** modal to customize sub-route paths if needed.

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start your Express backend (in your `backend` folder on port `4000`):
   ```bash
   npm start
   ```

3. Start the Vite frontend dev server:
   ```bash
   npm run dev
   ```
