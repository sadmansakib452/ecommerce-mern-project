const express = require("express");

const runValidation = require("../validators");
const { isLoggedIn, isAdmin } = require("../middlewares/auth");
const { validateCategory } = require("../validators/category");
const { handleCreateCategory, handleGetCategories, handleGetCategory, handleUpdateCategory, handleDeleteCategory } = require("../controllers/categoryController");

const categoryRouter = express.Router();

// POST /api/categores
categoryRouter.post("/", validateCategory, runValidation, isLoggedIn, isAdmin, handleCreateCategory);
categoryRouter.get("/",handleGetCategories);
categoryRouter.get("/:slug",handleGetCategory);
categoryRouter.put(
  "/:slug",
  validateCategory,
  runValidation,
  isLoggedIn,
  isAdmin,
  handleUpdateCategory
);
categoryRouter.delete(
  "/:slug",
  isLoggedIn,
  isAdmin,
  handleDeleteCategory
);
module.exports = categoryRouter;
