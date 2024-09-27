const express = require('express');
const { verifyOTPCode, sendOTPCode, followUpServiceData, sendOTPToEmailAddress , verifyEmailAddress } = require('../controllers/serviceController');
const { createAndUpdateService } = require('../utils/validators/serviceValidator')
const asyncHandler = require('express-async-handler');

const router = express.Router();

// @route   POST /api/v1/otp/send
// @desc    Send OTP to phone number
// @access  Public
router.post('/send-otp', asyncHandler(async (req, res) => {
  const { phoneNumber, ISD } = req.body;

  if (!phoneNumber || !ISD) {
    return res.status(400).json({ message: 'Phone number and ISD code are required.' });
  }

  try {
    const result = await sendOTPCode(phoneNumber, ISD);
    res.status(200).json({
      success: true,
      message: 'OTP sent successfully.',
      data: result
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
}));

// @route   POST /api/v1/otp/verify
// @desc    Verify OTP for phone number
// @access  Public
router.post('/verify-otp', asyncHandler(async (req, res) => {
  const { phoneNumber, otpCode, serviceId } = req.body;

  if (!phoneNumber || !otpCode || !serviceId) {
    return res.status(400).json({ message: 'Phone number, OTP code, and service ID are required.' });
  }

  try {
    const result = await verifyOTPCode(phoneNumber, otpCode, serviceId);
    res.status(200).json({
      success: true,
      message: 'OTP verified successfully.',
      data: result
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
}));

router.post('/service/:id/follow-up-service', createAndUpdateService, followUpServiceData);

router.post('/send-otp-email', sendOTPToEmailAddress);

router.post('/verify-email', verifyEmailAddress);

module.exports = router;
