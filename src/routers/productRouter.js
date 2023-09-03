const express = require("express");

const upload = require("../middlewares/uploadFile");

const runValidation = require("../validators");
const { isLoggedIn, isLoggedOut, isAdmin } = require("../middlewares/auth");
const { handleCreateProduct, handleGetProducts } = require("../controllers/productController");
const { validateProduct } = require("../validators/product");

const productRouter = express.Router();


//create a product
productRouter.post(
  "/",
  upload.single("image"),
  validateProduct,
  runValidation,
  isLoggedIn,
  isAdmin,
  handleCreateProduct
);
// get all product
productRouter.get(
  "/",
  handleGetProducts
);
module.exports = productRouter;
