import User from "../models/User.js";
import admin from "../config/firebase.js";

export const authMiddleware = async (req, res, next) => {
  try {
    //  token extract
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - No token provided",
      });
    }

    // verify Firebase token
    const decoded = await admin.auth().verifyIdToken(token);

    // check user in MongoDB
    let user = await User.findOne({ firebaseUID: decoded.uid });

    //  if user not exist → create user
    if (!user) {
      user = await User.create({
        firebaseUID: decoded.uid,
        email: decoded.email,
        name: decoded.name || req.body?.name || "New User",
        role: "user",
      });
    }

    //  attach user to request
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