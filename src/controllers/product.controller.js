
import Product from "../models/Product.js";
import streamUpload from "../utils/cloudinaryUpload.js";


//  1. Create Product (ADMIN)

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock } =
      req.body;

    // image required
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Product image is required",
      });
    }

    // upload image to cloudinary
    const result = await streamUpload(
      req.file.buffer,
      "products"
    );

    // create product
    const product = await Product.create({
      name,
      description,
      price,
      category,
      stock,
      image: result.secure_url,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


//  2. Get All Products

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


//  3. Get Single Product

export const getSingleProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// 4. Update Product (ADMIN)

export const updateProduct = async (req, res) => {
  try {
    let updateData = {
      ...req.body,
    };

    // if new image uploaded
    if (req.file) {
      const result = await streamUpload(
        req.file.buffer,
        "products"
      );

      updateData.image = result.secure_url;
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        $set: updateData,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


//  5. Delete Product (ADMIN)

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(
      req.params.id
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};