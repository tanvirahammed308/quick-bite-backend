import express from "express";

import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../controllers/cart.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();


//  GET USER CART


router.get(
  "/",
  authMiddleware,
  getCart
);


//  ADD TO CART


router.post(
  "/",
  authMiddleware,
  addToCart
);


// UPDATE CART ITEM QUANTITY


router.put(
  "/",
  authMiddleware,
  updateCartItem
);


// REMOVE SINGLE ITEM


router.delete(
  "/:productId",
  authMiddleware,
  removeCartItem
);

//  CLEAR ENTIRE CART


router.delete(
  "/",
  authMiddleware,
  clearCart
);

export default router;