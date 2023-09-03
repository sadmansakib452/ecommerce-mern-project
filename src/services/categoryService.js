const slugify = require("slugify");
const Category = require("../models/categoryModel");

const createCategory = async (name) => {
  const newCategory = await Category.create({
    name: name,
    slug: slugify(name),
  });

  return newCategory;
};

const getCategories = async () => {
  return await Category.find({}).select("name slug").lean();
};

const getCategory = async (slug) => {
  return await Category.find({ slug }).select("name slug").lean();
};

const updateCategory = async (slug, name) => {
  const updateCategory = await Category.findOneAndUpdate(
    { slug },
    { $set: { name: name, slug: slugify(name) } },
    { new: true }
  );

  return updateCategory
};

const deleteCategory = async (slug) => {
  return await Category.findOneAndDelete({ slug })
};

module.exports = {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
};
