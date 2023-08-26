const express = require("express");

const runValidation = require("../validators");
const { handleLogin } = require("../controllers/authControllers");

const authRouter = express.Router();


authRouter.post('/login', handleLogin)

module.exports = authRouter;
