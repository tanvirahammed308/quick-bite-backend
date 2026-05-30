import express from "express";
import {
  getMe,
  updateProfile,
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
} from "../controllers/user.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";
import { adminMiddleware } from "../middleware/admin.middleware.js";

const router = express.Router();


// Logged-in user routes

router.get("/me", authMiddleware, getMe);

router.put("/me", authMiddleware, updateProfile);


// Admin routes

router.get("/", authMiddleware, adminMiddleware, getAllUsers);

router.get("/:id", authMiddleware, adminMiddleware, getUserById);

router.put("/:id/role", authMiddleware, adminMiddleware, updateUserRole);

router.delete("/:id", authMiddleware, adminMiddleware, deleteUser);

export default router;