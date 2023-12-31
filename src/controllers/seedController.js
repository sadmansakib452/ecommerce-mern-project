const data = require("../data");
const Product = require("../models/productModel");
const User = require("../models/userModel");

const seedUser = async (req, res, next) => {
  try {
    //   deleting all existing users
    await User.deleteMany({});

    // inserting new users

    const insertedUsers = [];

    // Inserting new users with hashed passwords using .save()
    for (const userData of data.users) {
      const newUser = new User(userData);
      const savedUser = await newUser.save();
      insertedUsers.push(savedUser);
    }

    //successful response
    return res.status(201).json(insertedUsers);
  } catch (error) {
    next(error);
  }
};


const seedProduct = async (req, res, next) => {
  try {
    //   deleting all existing users
    await Product.deleteMany({});

   const products = await Product.insertMany(data.products)

    //successful response
    return res.status(201).json(products);
  } catch (error) {
    next(error);
  }
};
module.exports = { seedUser, seedProduct };
