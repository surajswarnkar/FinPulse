import User from "../models/userModels.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = "your_jwt_secret_here";

export default async function authMiddleware(req, res, next) {
    //grap the token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized: No token provided.",
        });
    }
    const token = authHeader.split(" ")[1]; // Remove "Bearer " prefix

    // to verify the token

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(payload.id).select("-password");
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found.",
            });
        }
        req.user = user;
        next();
    } catch (err) {
        console.log("JWT verification error:", err);
        return res.status(401).json({
            success: false,
            message: "Unauthorized: Invalid token.",
        });
    }
}