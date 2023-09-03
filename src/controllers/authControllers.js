const createError = require("http-errors");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { successResponse } = require("./responseController");
const { createJSONWebToken } = require("../helper/jsonwebtoken");
const bcrypt = require("bcryptjs");
const { jwtAccessKey, jwtRefreshKey } = require("../secret");
const {
  setAccessTokenCookie,
  setRefreshTokenCookie,
} = require("../helper/cookie");

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
    const accessToken = createJSONWebToken({ user }, jwtAccessKey, "5m");

    setAccessTokenCookie(res, accessToken);

    const refreshToken = createJSONWebToken({ user }, jwtRefreshKey, "7d");

    setRefreshTokenCookie(res, refreshToken);

    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    //success response
    return successResponse(res, {
      statusCode: 200,
      message: "User logged in successfully",
      payload: { userWithoutPassword },
    });
  } catch (error) {
    next(error);
  }
};

const handleLogout = async (req, res, next) => {
  try {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    //success response
    return successResponse(res, {
      statusCode: 200,
      message: "User logged out successfully",
      payload: {},
    });
  } catch (error) {
    next(error);
  }
};

const handleRefreshToken = async (req, res, next) => {
  try {
    const oldRefreshToken = req.cookies.refreshToken;

    //verify the old refresh token
    const decodedToken = jwt.verify(oldRefreshToken, jwtRefreshKey);

    if (!decodedToken) {
      throw createError(401, "Invalid refresh token. Please login again");
    }

    const accessToken = createJSONWebToken(
      decodedToken.user,
      jwtAccessKey,
      "5m"
    );

    setAccessTokenCookie(res, accessToken);

    //success response
    return successResponse(res, {
      statusCode: 200,
      message: "new access token is generated",
      payload: {},
    });
  } catch (error) {
    next(error);
  }
};

const handleProtectedRoute = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) throw createError(401, "Token is missing, Please login");

    //verify the old access token
    const decodedToken = jwt.verify(accessToken, jwtAccessKey);

    if (!decodedToken) {
      throw createError(401, "Invalid access token. Please login again");
    }

    //success response
    return successResponse(res, {
      statusCode: 200,
      message: "Protected resource accessed successfully",
      payload: {},
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleLogin,
  handleLogout,
  handleRefreshToken,
  handleProtectedRoute,
};
