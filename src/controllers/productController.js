const Product = require("../models/productModel");
const { findWithId } = require("../services/findItem");
const { successResponse } = require("./responseController");
const slugify = require("slugify");
const createError = require("http-errors");
const {
  createProduct,
  getProducts,
  getProductBySlug,
  deleteProductBySlug,
  updateProductBySlug,
} = require("../services/productService");

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
    const search = req.query.search || ''
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;

      const searchRegExp = new RegExp(".*" + search + ".*", "i");

      const filter = {
      
        $or: [
          { name: { $regex: searchRegExp } },
          // { email: { $regex: searchRegExp } },
          // { phone: { $regex: searchRegExp } },
        ],
      };


    const productsData = await getProducts(page, limit, filter);

    return successResponse(res, {
      statusCode: 200,
      message: "returned all the product",
      payload: {
        products: productsData.products,

        pagination: {
          totalPages: productsData.totalPages,
          currentPage: productsData.currentPage,
          previousPage: productsData.currentPage - 1,
          nextPage: productsData.currentPage + 1,
          totalNumberOfProducts: productsData.count,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const handleGetProduct = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const product = await getProductBySlug(slug);

    return successResponse(res, {
      statusCode: 200,
      message: "returned single product",
      payload: {
        product,
      },
    });
  } catch (error) {
    next(error);
  }
};

const handleDeleteProduct = async (req, res, next) => {
  try {
    const { slug } = req.params;

    await deleteProductBySlug(slug);

    return successResponse(res, {
      statusCode: 204,
      message: "deleted single product",
    });
  } catch (error) {
    next(error);
  }
};

const handleUpdateProduct = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const updateOptions = { new: true, runValidators: true, context: "query" };

    let updates = {};

    const allowedFields = [
      "name",
      "description",
      "price",
      "solde",
      "quantity",
      "shipping",
    ];

    for (const key in req.body) {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
      // else if (key === "email") {
      //   throw createError(400, "Email can not be updated");
      // }
    }
    const image = req.file;

    const updatedProduct = await updateProductBySlug(
      slug,
      updates,
      image,
      updateOptions
    );

    return successResponse(res, {
      statusCode: 200,
      message: "Product was updated successfully",
      payload: { updatedProduct },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleCreateProduct,
  handleGetProducts,
  handleGetProduct,
  handleDeleteProduct,
  handleUpdateProduct,
};
