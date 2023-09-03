const createError = require("http-errors");
const User = require("../models/userModel");
const { successResponse } = require("./responseController");
const { findWithId } = require("../services/findItem");
const { deleteImage } = require("../helper/deleteImage");
const { createJSONWebToken } = require("../helper/jsonwebtoken");
const {
  jwtActivationKey,
  clientURL,
  jwtResetPasswordKey,
  serverURL,
} = require("../secret");
const emailWithNodeMail = require("../helper/email");
const fs = require("fs").promises;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const checkUserExists = require("../helper/checkUserExists");
const sendEmail = require("../helper/sendEmail");

const getUsers = async (req, res, next) => {
  try {
    const search = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;

    const searchRegExp = new RegExp(".*" + search + ".*", "i");

    const filter = {
      isAdmin: { $ne: true },
      $or: [
        { name: { $regex: searchRegExp } },
        { email: { $regex: searchRegExp } },
        { phone: { $regex: searchRegExp } },
      ],
    };

    const options = { password: 0 };

    const users = await User.find(filter, options)
      .limit(limit)
      .skip((page - 1) * limit);
    const count = await User.find(filter).countDocuments();
    if (!users || users.length === 0) throw createError(404, "no users found");

    return successResponse(res, {
      statusCode: 200,
      message: "users were returned successfully",
      payload: {
        users,
        pagination: {
          totalPages: Math.ceil(count / limit),
          currentPage: page,
          previousPage: page - 1 > 0 ? page - 1 : null,
          nextPage: page + 1 <= Math.ceil(count / limit) ? page + 1 : null,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const options = { password: 0 };
    const user = await findWithId(User, id, options);

    return successResponse(res, {
      statusCode: 200,
      message: "user was returned successfully",
      payload: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};
const deleteUserById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const options = { password: 0 };
    user = await findWithId(User, id, options);

    await User.findByIdAndDelete({
      _id: id,
      isAdmin: false,
    });

    return successResponse(res, {
      statusCode: 200,
      message: "user were deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

const processRegister = async (req, res, next) => {
  try {
    const { name, email, password, phone, address } = req.body;

    const image = req.file;

    if (!image) {
      throw createError(400, "Image file is required");
    }
    if (image.size > 2 * 1024 * 1024) {
      throw createError(400, "File too large. It must be less than 2 MB");
    }

    const imageBufferString = image.buffer.toString("base64");

    const userExists = await checkUserExists(email)
    if (userExists) {
      throw createError(409, "User already exists");
    }

    //create jwt
    const token = createJSONWebToken(
      { name, email, password, phone, address, image: imageBufferString },
      // { name, email, password, phone, address },
      jwtActivationKey,
      "10m"
    );

    //prepare email
    const emailData = {
      email,
      subject: "Account Activation Email",
      html: `
        <h2>Hello ${name} ! </h2>
        <p>Please click here to <a href="${clientURL}/api/users/activate/${token}" target="_blank">activate your account</a></p>
      `,
    };

    //send email with nodemailer
    sendEmail(emailData)
    return successResponse(res, {
      statusCode: 200,
      message: `Please go to your ${email} for completing your registration process`,
      
    });
  } catch (error) {
    next(error);
  }
};

const activateUserAccount = async (req, res, next) => {
  try {
    const token = req.body.token;
    console.log(token);
    if (!token) throw createError(404, "token not found");

    try {
      const decoded = jwt.verify(token, jwtActivationKey);
      if (!decoded) throw createError(401, "User was not able to verified");

      const userExists = await User.exists({ email: decoded.email });
      if (userExists) {
        throw createError(409, "User already exists");
      }

      await User.create(decoded);

      return successResponse(res, {
        statusCode: 201,
        message: "User was registered successfully",
      });
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        throw createError(401, "Token has expired");
      } else if (error.name === "JsonWebTokenError") {
        console.log(error);
        throw createError(401, "Invalid Token");
      } else {
        throw error;
      }
    }
  } catch (error) {
    next(error);
  }
};

const updateUserById = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const options = { password: 0 };
    await findWithId(User, userId, options);
    const updateOptions = { new: true, runValidators: true, context: "query" };

    let updates = {};

    const allowedFields = ["name", "password", "phone", "address"]
    for (const key in req.body) {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      } else if (key === 'email') {
        throw createError(400, "Email can not be updated");
      }
    }

    const image = req.file;
    if (image) {
      //image size max 2mb
      if (image.size > 2 * 1024 * 1024) {
        throw createError(400, "File too large. It must be less than 2 MB");
      }

      updates.image = image.buffer.toString("base64");
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updates,
      updateOptions
    ).select("-password");

    if (!updatedUser) {
      throw createError(404, "User with this ID does not exist");
    }

    return successResponse(res, {
      statusCode: 200,
      message: "user was updated successfully",
      payload: { updatedUser },
    });
  } catch (error) {
    next(error);
  }
};

const handleBanUserById = async (req, res, next) => {
  try {
    const userId = req.params.id;
    await findWithId(User, userId);
    const updates = { isBanned: true };
    const updateOptions = { new: true, runValidators: true, context: "query" };

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updates,
      updateOptions
    ).select("-password");

    if (!updatedUser) {
      throw createError(400, "User was not banned successfully");
    }

    return successResponse(res, {
      statusCode: 200,
      message: "user was banned successfully",
    });
  } catch (error) {
    next(error);
  }
};

const handleUnbanUserById = async (req, res, next) => {
  try {
    const userId = req.params.id;
    await findWithId(User, userId);
    const updates = { isBanned: false };
    const updateOptions = { new: true, runValidators: true, context: "query" };

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updates,
      updateOptions
    ).select("-password");

    if (!updatedUser) {
      throw createError(400, "User was not unbanned successfully");
    }

    return successResponse(res, {
      statusCode: 200,
      message: "user was unbanned successfully",
    });
  } catch (error) {
    next(error);
  }
};

const handleUpdatePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword, confirmedPassword } = req.body;

    const userId = req.params.id;

    const user = await findWithId(User, userId);

    // compare the password
    const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordMatch) {
      throw createError(400, "old password is incorrect");
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { password: newPassword },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      throw createError(400, "User was not updated successfully");
    }
    updatedUser.password = newPassword;
    await updatedUser.save();

    return successResponse(res, {
      statusCode: 200,
      message: "user was updated successfully",
      payload: { updatedUser },
    });
  } catch (error) {
    next(error);
  }
};

const handleForgetPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const userData = await User.findOne({ email: email });

    if (!userData) {
      throw createError(
        404,
        "Email is incorrect or you have not verified your email address. Please register yourself first"
      );
    }

    //create jwt
    const token = createJSONWebToken({ email }, jwtResetPasswordKey, "10m");

    //prepare email
    const emailData = {
      email,
      subject: "Reset Password Email",
      html: `
        <h2>Hello ${userData.name} ! </h2>
        <p>Please click here to <a href="${clientURL}/api/users/reset-password/${token}" target="_blank">Reset your password</a></p>
      `,
    };

    //send email with nodemailer
    sendEmail(emailData)

    return successResponse(res, {
      statusCode: 200,
      message: `Please go to your ${email} to reset the password`,
      payload: token,
    });
  } catch (error) {
    next(error);
  }
};

const handleResetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    const decoded = jwt.verify(token, jwtResetPasswordKey);

    if (!decoded) {
      throw createError(400, "Invalid or expired token");
    }

    const filter = { email: decoded.email };
    const update = { password: password };
    const options = { new: true };

    const updatedUser = await User.findOneAndUpdate(
      filter,
      update,
      options
    ).select("-password");

    if (!updatedUser) {
      throw createError(400, "Password reset failed");
    }
    updatedUser.password = password;
    await updatedUser.save();

    return successResponse(res, {
      statusCode: 200,
      message: "password reset successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  deleteUserById,
  processRegister,
  activateUserAccount,
  updateUserById,
  handleBanUserById,
  handleUnbanUserById,
  handleUpdatePassword,
  handleForgetPassword,
  handleResetPassword,
};
