const { body } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validationMiddleware');

// Validation rules for create and update service
exports.createAndUpdateService = [
  body('type')
    .optional()
    .isString()
    .withMessage('Type must be a string')
    .isLength({ min: 2, max: 50 })
    .withMessage('Type must be between 2 and 50 characters long'),

  body('fullName')
  .optional()
  .isString()
  .withMessage('Full name must be a string')
  .isLength({ min: 2, max: 50 })
  .withMessage('Full name must be between 2 and 50 characters long'),

body('country')
  .optional()
  .isString()
  .withMessage('Country must be a string')
  .isLength({ min: 2, max: 50 })
  .withMessage('Country must be between 2 and 50 characters long'),

body('addressLineOne')
  .optional()
  .isString()
  .withMessage('Address must be a string')
  .isLength({ min: 2, max: 100 })
  .withMessage('Address must be between 2 and 100 characters long'),

  body('addressLineTwo')
  .optional()
  .isString()
  .withMessage('Address must be a string')
  .isLength({ min: 2, max: 100 })
  .withMessage('Address must be between 2 and 100 characters long'),

body('city')
  .optional()
  .isString()
  .withMessage('City must be a string')
  .isLength({ min: 2, max: 50 })
  .withMessage('City must be between 2 and 50 characters long'),

  body('email')
    .optional() 
    .isEmail()
    .withMessage('Invalid email'),

  body('userNote')
    .optional()
    .isString()
    .withMessage('User note must be a string')
    .isLength({ min: 2, max: 500 })
    .withMessage('User note must be between 2 and 500 characters long'),

  body('adminNote')
    .optional()
    .isString()
    .withMessage('Admin note must be a string')
    .isLength({ min: 2, max: 500 })
    .withMessage('Admin note must be between 2 and 500 characters long'),
  
    body('periodDate')
    .optional() 
    .isISO8601()
    .withMessage('Invalid date format')
    .isAfter(new Date().toISOString())
    .withMessage('Date must be in the future'),

    body('periodFullTime')
    .optional() 
    .isString()
    .withMessage('Full time must be a string'),

  validatorMiddleware,  
];