import incomeModel from "../models/incomeModel.js";
import Xlsx from "xlsx";
import getDateRange from "../utils/dataFilter.js";

// Create Income

export async function addIncome(req, res) {
  const userId = req.user._id;
  const { description, amount, category, date } = req.body;
  try {
    if (!description || !amount || !category || !date) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    const newIncome = new incomeModel({
      description,
      amount,
      category,
      date: new Date(date),
      userId,
    });
    await newIncome.save();
    res.status(201).json({
      success: true,
      message: "Income added successfully.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error.",
    });
  }
}

// To get all income of a user

export async function getAllIncome(req, res) {
  const userId = req.user._id;
  try {
    const incomes = await incomeModel.find({ userId }).sort({ date: -1 });
    res.json(incomes);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error.",
    });
  }
}

//update income
export async function updateIncome(req, res) {
  const { id } = req.params;
  const userId = req.user._id;
  const { description, amount } = req.body;

  try {
    const updatedIncome = await incomeModel.findOneAndUpdate(
      { _id: id, userId },
      { description, amount },
      { new: true },
    );

    if (!updatedIncome) {
      return res.status(404).json({
        success: false,
        message: "Income not found or you are not authorized to update it.",
      });
    }
    res.json({
      success: true,
      message: "Income updated successfully.",
      data: updatedIncome,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error.",
    });
  }
}

// to delete income
export async function deleteIncome(req, res) {
  try {
    const income = await incomeModel.findOneAndDelete({ _id: req.params.id });

    if (!income) {
      return res.status(404).json({
        success: false,
        message: "Income not found or you are not authorized to delete it.",
      });
    }

    res.json({
      success: true,
      message: "Income deleted successfully.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error.",
    });
  }
}

// to download income data
export async function downloadIncomeExcel(req, res) {
  const userId = req.user._id;
  try {
    const income = await incomeModel.find({ userId }).sort({ date: -1 });
    const plainData = income.map((inc) => ({
      description: inc.description,
      amount: inc.amount,
      category: inc.category,
      date: new Date(inc.date).toLocaleDateString(), // Format date as YYYY-MM-DD
    }));

    const worksheet = Xlsx.utils.json_to_sheet(plainData);
    const workbook = Xlsx.utils.book_new();
    Xlsx.utils.book_append_sheet(workbook, worksheet, "Income Data");
    Xlsx.writeFile(workbook, "income_details.xlsx");
    res.download("income_details.xlsx");
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error.",
    });
  }
}

// to get income overview

export async function getIncomeOverview(req, res) {
  try {
    const userId = req.user._id;
    const { range = "monthly" } = req.query;
    const { start, end } = getDateRange(range);
    const income = await incomeModel
      .find({
        userId,
        date: { $gte: start, $lte: end },
      })
      .sort({ date: -1 });

    const totalIncome = income.reduce((acc, cur) => acc + cur.amount, 0);
    const averageIncome = income.length > 0 ? totalIncome / income.length : 0;
    const numberOfTransactions = income.length;

    const recentTransactions = income.slice(0, 9);

    res.json({
      success: true,
      data: {
        totalIncome,
        averageIncome,
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
