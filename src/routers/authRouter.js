const express = require("express");

const runValidation = require("../validators");
const { handleLogin, handleLogout } = require("../controllers/authControllers");
const { isLoggedOut, isLoggedIn } = require("../middlewares/auth");
const { validateUserLogin } = require("../validators/auth");

const authRouter = express.Router();

authRouter.post(
  "/login",
  isLoggedOut,
  validateUserLogin,
  runValidation,
  handleLogin
);
authRouter.post("/logout", isLoggedIn, handleLogout);

module.exports = authRouter;
