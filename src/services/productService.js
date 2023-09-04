const slugify = require("slugify");
const Product = require("../models/productModel");
const createError = require("http-errors");

const createProduct = async (productData) => {
  const {
    name,
    description,
    price,
    quantity,
    shipping,
    category,
    imageBufferString,
  } = productData;

  const productExists = await Product.exists({ name: name });

  if (productExists) {
    throw createError(409, "Product with this name already exists.");
  }

  //create product

  const product = await Product.create({
    name: name,
    slug: slugify(name),
    description: description,
    price: price,
    quantity: quantity,
    shipping: shipping,
    image: imageBufferString,
    category: category,
  });

  return product;
};

const getProducts = async (page = 1, limit = 4, filter ={}) => {
  const products = await Product.find(filter)
    .populate("category")
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });

  if (!products) throw createError(404, "No product found");

  const count = await Product.find(filter).countDocuments();

  return {
    products,
    count,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
  };
};


const getProductBySlug = async (slug) => {
  
  const product = await Product.findOne({ slug }).populate("category");

  if (!product) throw createError(404, "No product found");

  

  return { product };
};


const deleteProductBySlug = async (slug) => {
  const product = await Product.findOneAndDelete({ slug });

  if (!product) throw createError(404, "No product found");

  return { product };
};

const updateProductBySlug = async (slug, updates, image, updateOptions) => {
  

   if (updates.name) {
     updates.slug = slugify(updates.name);
   }

   if (image) {
     //image size max 2mb
     if (image.size > 2 * 1024 * 1024) {
       throw createError(400, "File too large. It must be less than 2 MB");
     }

     updates.image = image.buffer.toString("base64");
   }

   const updatedProduct = await Product.findOneAndUpdate(
     { slug },
     updates,
     updateOptions
   );

   if (!updatedProduct) {
     throw createError(404, "Product with this slug does not exist");
   }

   return updatedProduct
};
module.exports = {
  createProduct,
  getProducts,
  getProductBySlug,
  deleteProductBySlug,
  updateProductBySlug,
};
