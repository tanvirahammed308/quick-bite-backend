// middleware/auth.middleware.js
import User from "../models/User.js";
import admin from "../config/firebase.js";

export const authMiddleware = async (req, res, next) => {
  try {
    // Extract token
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - No token provided",
      });
    }

    // Verify Firebase token
    const decoded = await admin.auth().verifyIdToken(token);

    // Find user in MongoDB (don't auto-create)
    const user = await User.findOne({ firebaseUID: decoded.uid });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found. Please register first.",
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.log("Auth Error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};