const express = require("express");
const cookiePerser = require('cookie-parser')
const morgan = require("morgan");
const createError = require('http-errors')
const xssClean = require('xss-clean')
const rateLimit = require('express-rate-limit');
const userRouter = require("./routers/userRouter");
const seedRouter = require("./routers/seedRouter");
const { errorResponse } = require("./controllers/responseController");
const authRouter = require("./routers/authRouter");
const categoryRouter = require("./routers/categoryRouter");
const app = express();

const rateLimiter = rateLimit({
    windowMs: 1* 60 * 1000, // 1 minute
    max: 15,
    message: 'Too many requiest from this IP. Please try again later',
})

app.use(cookiePerser())
app.use(rateLimiter)
app.use(morgan("dev"));
app.use(xssClean())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/users',userRouter)
app.use('/api/seed', seedRouter)
app.use('/api/auth', authRouter)
app.use("/api/categories", categoryRouter);

app.get("/test", (req, res) => {
  res.status(200).send({
    message: "api is working fine",
  });
});


//client error handling
app.use((req, res, next) => {
  
  next(createError(404, "route not found"));
});

//server error handling -> all the error comes here from all routes
app.use((err, req, res, next) => {
  

    return errorResponse(res,{
      statusCode: err.status,
      message: err.message,
    })
  
});

module.exports = app