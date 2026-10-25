import mongoose from "mongoose";

export const connectDB = async() => {
    await mongoose.connect("mongodb+srv://surajkumarsoni7105_db_user:LhYO8WddqoKzV8bE@cluster0.u3oyl42.mongodb.net/Expense")
    .then(() => console.log("DB Connected"));
}