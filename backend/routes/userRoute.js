import express from "express";
import {getCurrentUser, loginUser, registerUser,updatePassword,updateProfile} from "../controllers/userController.js";
import authMiddleware from "../middleware/auth.js";


const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);

// Protected Route
userRouter.get("/me", authMiddleware, getCurrentUser);
userRouter.put("/profile", authMiddleware, updateProfile);
userRouter.put("/password", authMiddleware, updatePassword);



import User from "../models/userModels.js";
import Income from "../models/incomeModel.js";
import Expense from "../models/expenseModel.js";

userRouter.delete("/delete", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    await Income.deleteMany({ userId });
    await Expense.deleteMany({ userId });
    await User.findByIdAndDelete(userId);
    res.json({ success: true, message: "User and all income/expense data deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});












// import User from "../models/userModels.js";

// userRouter.delete("/delete", authMiddleware, async (req, res) => {
//   try {
//     await User.findByIdAndDelete(req.user._id || req.user.id);
//     res.json({ success: true, message: "User deleted from database" });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });
export default userRouter;