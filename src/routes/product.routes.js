import express from "express";

import {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";
import { adminMiddleware } from "../middleware/admin.middleware.js";

import upload from "../middleware/multer.middleware.js";

const router = express.Router();


//  PUBLIC ROUTES


// Get all products
router.get("/", getAllProducts);

// Get single product
router.get("/:id", getSingleProduct);


//  ADMIN ROUTES


// Create product (with image upload)
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  upload.single("image"),
  createProduct
);

// Update product (with optional image)
router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  upload.single("image"),
  updateProduct
);

// Delete product
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  deleteProduct
);

export default router;