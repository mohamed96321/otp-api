const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validationMiddleware');
const { emailPattern, passwordPattern } = require('../../helpers/regExPatterns');

exports.loginValidator = [
  check('email')
    .notEmpty()
    .withMessage('Email required')
    .matches(emailPattern)
    .withMessage('Invalid email'),

  check('password')
    .notEmpty()
    .withMessage('Password required')
    .matches(passwordPattern)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),

  validatorMiddleware,
];

