const asyncHandler = require("express-async-handler");
const { catchError } = require("../middlewares/catchErrorMiddleware");
const ApiError = require("../utils/apiError");
const ApiResponse = require('../utils/apiResponse');
const createToken = require("../utils/createToken");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");

exports.signInController = catchError(
  asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return next(new ApiError("User not found", 404));

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect)
      return next(new ApiError("Invalid email or password", 401));

    // Generate token
    const token = createToken(user);

    res.status(200).json(new ApiResponse(200, token, "User signed in successfully"));
  })
);
