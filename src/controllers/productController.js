const Product = require("../models/productModel");
const { findWithId } = require("../services/findItem");
const { successResponse } = require("./responseController");
const slugify = require("slugify");
const createError = require("http-errors");
const { createProduct, getProducts } = require("../services/productService");

const handleCreateProduct = async (req, res, next) => {
  try {
    const { name, description, price, quantity, shipping, category } = req.body;
    const image = req.file;

    if (!image) {
      throw createError(400, "Image file is required");
    }
    if (image.size > 2 * 1024 * 1024) {
      throw createError(400, "File too large. It must be less than 2 MB");
    }

    const imageBufferString = image.buffer.toString("base64");

    const productData = {
      name,
      description,
      price,
      category,
      quantity,
      shipping,
      imageBufferString,
    };

    const product = await createProduct(productData);

    return successResponse(res, {
      statusCode: 200,
      message: "product was created successfully",
      payload: product,
    });
  } catch (error) {
    next(error);
  }
};

const handleGetProducts = async (req, res, next) => {
  try {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;
    
    const productsData = await getProducts(page, limit)

    return successResponse(res, {
      statusCode: 200,
      message: "returned all the product",
      payload: {products: productsData.products,

        pagination: {
            totalPages: productsData.totalPages,
            currentPage: productsData.currentPage,
            previousPage: productsData.currentPage - 1,
            nextPage: productsData.currentPage + 1,
            totalNumberOfProducts: productsData.count,
        }
        
    },
      
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { handleCreateProduct, handleGetProducts };
