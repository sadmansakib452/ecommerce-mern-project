const slugify = require('slugify')
const { successResponse } = require("./responseController")
const Category = require('../models/categoryModel')
const {createCategory, getCategories, getCategory, updateCategory, deleteCategory} = require('../services/categoryService')
const createError = require('http-errors')

const handleCreateCategory = async(req, res, next) =>{

    try{
        const {name} = req.body

        await createCategory(name)

        return successResponse(res,{
            statusCode: 200,
            message: 'category was created successfully'
        })
    }catch(error){
        next(error)
    }
}

const handleGetCategories = async (req, res, next) => {
  try {
    
    const categories = await getCategories()
    return successResponse(res, {
      statusCode: 201,
      message: "categories fetched successfully",
      payload: categories
    });
  } catch (error) {
    next(error);
  }
};

const handleGetCategory = async (req, res, next) => {
  try {

    const {slug} = req.params
    const category = await getCategory(slug);
    if (!category) throw createError(400, "Category not found");
    return successResponse(res, {
      statusCode: 200,
      message: "category fetched successfully",
      payload: category,
    });
  } catch (error) {
    next(error);
  }
};

const handleUpdateCategory = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const {name} = req.body

    const updatedCategory = await updateCategory(slug, name)
    if (!updatedCategory) throw createError(400, "No category found with this slug");
    return successResponse(res, {
      statusCode: 200,
      message: "category was updated successfully",
      payload: updatedCategory
    });
  } catch (error) {
    next(error);
  }
};

const handleDeleteCategory = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const result = await deleteCategory(slug)

    if (!result)
      throw createError(400, "No category found");

    return successResponse(res, {
      statusCode: 200,
      message: "category was deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  handleCreateCategory,
  handleGetCategories,
  handleGetCategory,
  handleUpdateCategory,
  handleDeleteCategory,
};