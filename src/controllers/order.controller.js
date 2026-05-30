

import stripe from "../config/stripe.js";
import Cart from "../models/cart.model.js";
import Order from "../models/order.model.js";


//  CREATE ORDER + STRIPE PAYMENT

export const createOrder = async (req, res) => {
  try {
    const {
      shippingAddress,
      paymentMethod,
    } = req.body;

    // get user cart
    const cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        message: "Cart is empty",
      });
    }

    // calculate totals
    const subtotal = cart.totalPrice;

    const deliveryFee = subtotal > 1000 ? 0 : 60;

    const tax = Math.round(subtotal * 0.05);

    const totalPrice = subtotal + deliveryFee + tax;

    
    //  STRIPE PAYMENT
    
    let paymentIntent = null;

    if (paymentMethod === "stripe") {
      paymentIntent = await stripe.paymentIntents.create({
        amount: totalPrice * 100,
        currency: "usd",

        metadata: {
          userId: req.user._id.toString(),
        },
      });
    }

    
    // CREATE ORDER
    
    const order = await Order.create({
      user: req.user._id,

      items: cart.items,

      shippingAddress,

      paymentMethod,

      paymentStatus:
        paymentMethod === "cash_on_delivery"
          ? "pending"
          : "paid",

      stripePaymentIntentId:
        paymentIntent?.id || "",

      totalItems: cart.totalItems,

      subtotal,

      deliveryFee,

      tax,

      totalPrice,
    });

    
    //  CLEAR CART
    
    cart.items = [];
    cart.totalItems = 0;
    cart.totalPrice = 0;

    await cart.save();

    
    // RESPONSE
    
    res.status(201).json({
      success: true,

      order,

      clientSecret:
        paymentIntent?.client_secret || null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// GET LOGGED-IN USER ORDERS

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


//  GET SINGLE ORDER

export const getSingleOrder = async (req, res) => {
  try {
    const order = await Order.findById(
      req.params.id
    )
      .populate("user")
      .populate("items.product");

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


//  ADMIN: GET ALL ORDERS

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


//  ADMIN: UPDATE ORDER STATUS

export const updateOrderStatus = async ( req,res) => {
  try {
    const { orderStatus } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        orderStatus,
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


//  CANCEL ORDER

export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(
      req.params.id
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // check owner
    if (
      order.user.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    // prevent cancel after delivery
    if (order.orderStatus === "delivered") {
      return res.status(400).json({
        message:
          "Delivered order cannot be cancelled",
      });
    }

    order.orderStatus = "cancelled";

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order cancelled",
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};