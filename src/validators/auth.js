const { body } = require("express-validator");

// registration validation
const validateUserRegistration = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required. Enter your full name")
    .isLength({ min: 3, max: 31 })
    .withMessage("Name should be at least 3 to 31 chars long"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required. Enter your email address")
    .isEmail()
    .withMessage("Invalid email address"),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required. Enter your password")
    .isLength({ min: 6 })
    .withMessage("Password should be at least 6 chars long")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/
    )
    .withMessage(
      "Password should contain at least one uppercase letter, one lowercase letter, one number, and one special chars"
    ),
  body("address")
    .trim()
    .notEmpty()
    .withMessage("Address is required. Enter your address")
    .isLength({ min: 3 })
    .withMessage("Address should be at least 3 chars long"),
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone is required. Enter your phone number"),
  body("address")
    .trim()
    .notEmpty()
    .withMessage("Address is required")
    .isLength({ min: 3 })
    .withMessage("Address should be at least 3 chars long"),
  body("image")
    .custom((value, { req }) => {
      if (!req.file || !req.file.buffer) {
        throw new Error("User image is required");
      }
      return true;
    })
    .withMessage("User image is required"),
];

// sign in validation

const validateUserLogin = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required. Enter your email address")
    .isEmail()
    .withMessage("Invalid email address"),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required. Enter your password")
    .isLength({ min: 6 })
    .withMessage("Password should be at least 6 chars long")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/
    )
    .withMessage(
      "Password should contain at least one uppercase letter, one lowercase letter, one number, and one special chars"
    ),
];

//user password update validation

const validateUserPasswordUpdate = [
  body("oldPassword")
    .trim()
    .notEmpty()
    .withMessage("old password is required. Enter your old password")
    .isLength({ min: 6 })
    .withMessage("old password should be at least 6 chars long")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/
    )
    .withMessage(
      "Password should contain at least one uppercase letter, one lowercase letter, one number, and one special chars"
    ),
  body("newPassword")
    .trim()
    .notEmpty()
    .withMessage("new password is required. Enter your new password")
    .isLength({ min: 6 })
    .withMessage("new password should be at least 6 chars long")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/
    )
    .withMessage(
      "Password should contain at least one uppercase letter, one lowercase letter, one number, and one special chars"
    ),
  body("confirmedPassword").custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error("Password did not match");
    }
    return true;
  }),
];

const validateUserForgetPassword = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required. Enter your email address")
    .isEmail()
    .withMessage("Invalid email address"),
  
];

const validateUserResetPassword = [
  body("token").trim().notEmpty().withMessage("Token is missing"),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required. Enter your password")
    .isLength({ min: 6 })
    .withMessage("Password should be at least 6 chars long")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/
    )
    .withMessage(
      "Password should contain at least one uppercase letter, one lowercase letter, one number, and one special chars"
    ),
];



module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validateUserPasswordUpdate,
  validateUserForgetPassword,
  validateUserResetPassword,
};
