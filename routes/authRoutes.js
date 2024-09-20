const express = require("express");
const { signInController } = require("../controllers/authController");
const { loginValidator } = require("../utils/validators/authValidator");

const router = express.Router();

router.post("/signin", loginValidator, signInController);

module.exports = router;
