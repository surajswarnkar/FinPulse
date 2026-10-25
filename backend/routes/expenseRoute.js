import expresess from "express";
import authMiddleware from "../middleware/auth.js";
import { addExpense, deleteExpense, downloadExpensesExcel, getAllExpenses, getExpenseOverview, updateExpense } from "../controllers/expenseController.js";

const expenseRouter = expresess.Router();

expenseRouter.post("/add", authMiddleware, addExpense);
expenseRouter.get("/get", authMiddleware, getAllExpenses);

expenseRouter.put("/update/:id", authMiddleware, updateExpense);
expenseRouter.get("/downloadexcel", authMiddleware, downloadExpensesExcel);

expenseRouter.delete("/delete/:id", authMiddleware, deleteExpense);
expenseRouter.get("/overview", authMiddleware, getExpenseOverview);

export default expenseRouter;