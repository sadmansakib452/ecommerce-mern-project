const createError = require("http-errors");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { successResponse } = require("./responseController");
const { createJSONWebToken } = require("../helper/jsonwebtoken");
const bcrypt = require('bcryptjs');
const { jwtAccessKey } = require("../secret");


const handleLogin = async (req, res, next) => {
  try {
    //email, password extract from req.body
    const { email, password } = req.body;
    //isExist
    const user = await User.findOne({ email });

    if (!user) {
      throw createError(
        404,
        "User does not exist with this email. Please register first"
      );
    }
    // compare the password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      throw createError(401, "Email or Password did not match");
    }

    //isBanned
    if (user.isBanned) {
      throw createError(403, "You are Banned. Please contact authority");
    }
    //token, set on cokie
    //create jwt
    const accessToken = createJSONWebToken(
      {_id: user._id},
      jwtAccessKey,
      "10m"
    );
    res.cookie('accessToken',accessToken,{
        maxAge: 15 * 60 * 1000, //15m
        httpOnly: true,
        secure: true,
        sameSite: 'none'
    })

    //success response
    return successResponse(res, {
      statusCode: 200,
      message: "User logged in successfully",
      payload: { user },
    });
  } catch (error) {
    next(error);
  }
};

const handleLogout = async (req, res, next) => {
  try {

    res.clearCookie("accessToken");
    
    //success response
    return successResponse(res, {
      statusCode: 200,
      message: "User logged out successfully",
      payload: {  },
    });
  } catch (error) {
    next(error);
  }
};


module.exports = { handleLogin, handleLogout };
