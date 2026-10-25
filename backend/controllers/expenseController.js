import expenseModel from "../models/expenseModel.js";
import getDateRange from "../utils/dataFilter.js";
import XLSX from "xlsx";

//add expense

export async function addExpense(req, res) {
    const userId = req.user._id;
    const { description, amount, category, date } = req.body;
    try {
        if (!description || !amount || !category || !date) {
            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });
        }

        const newExpense = new expenseModel({
            description,
            amount,
            category,
            date: new Date(date),
            userId
        });
        await newExpense.save();
        res.status(201).json({
            success: true,
            message: "Expense added successfully."
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error adding expense."
        });
    }
}


// to all expenses of a user

export async function getAllExpenses(req, res) {
    const userId = req.user._id;
    try {
        const expenses = await expenseModel.find({ userId });
        res.json(expenses);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching expenses."
        });
    }
}


// to update an expense

export async function updateExpense(req, res) {
    const { id } = req.params;
    const userId = req.user._id;
    const { description, amount } = req.body;
    try {
        const updatedExpense = await expenseModel.findOneAndUpdate(
            { _id: id, userId },
            { description, amount },
            { new: true }
        );
        if (!updatedExpense) {
            return res.status(404).json({
                success: false,
                message: "Expense not found."
            });
        }
        res.json({
            success: true,
            message: "Expense updated successfully.",
            data: updatedExpense
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating expense."
        });
    }
}

// to delete an expense

export async function deleteExpense(req, res) {
    try {
        const expense = await expenseModel.findOneAndDelete({ _id: req.params.id });
        if (!expense) {
            return res.status(404).json({
                success: false,
                message: "Expense not found."
            });
        }
        res.json({
            success: true,
            message: "Expense deleted successfully."
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting expense."
        });
    }
}

// download expenses
export async function downloadExpensesExcel(req, res) {
    const userId = req.user._id;
    try{
        const expenses = await expenseModel.find({ userId }).sort({ date: -1 });
        const plainData = expenses.map((exp) => ({
            description: exp.description,
            amount: exp.amount,
            category: exp.category,
            date: new Date(exp.date).toLocaleDateString(),
        }));
        
        const worksheet = XLSX.utils.json_to_sheet(plainData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "expenseModel");
        XLSX.writeFile(workbook, "expenses_details.xlsx");
        res.download("expenses_details.xlsx");
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server Error.",
        });
    }
}

// to get overview of expenses
export async function getExpenseOverview(req, res) {
    try {
    const userId = req.user._id;
    const { range = "monthly" } = req.query;
    const { start, end } = getDateRange(range);
    const expenses = await expenseModel
      .find({
        userId,
        date: { $gte: start, $lte: end },
      })
      .sort({ date: -1 });

    const totalExpense = expense.reduce((acc, cur) => acc + cur.amount, 0);
    const averageExpense =
      expense.length > 0 ? totalExpense / expense.length : 0;
    const numberOfTransactions = expense.length;

    const recentTransactions = expense.slice(0, 5);

    res.json({
      success: true,
      data: {
        totalExpense,
        averageExpense,
        numberOfTransactions,
        recentTransactions,
        range
      }
    });
  } 
  catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error.",
    });
  }
}