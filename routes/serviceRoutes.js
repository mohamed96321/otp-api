const express = require('express');
const { verifyOTPCode, sendOTPCode, followUpServiceData, sendOTPToEmailAddress, verifyEmailAddress } = require('../controllers/serviceController');
const { createAndUpdateService } = require('../utils/validators/serviceValidator')

const router = express.Router();
router.post('/send-otp', async (req, res, next) => {
  try {
    const { phoneNumber, ISD } = req.body;
    const response = await sendOTPCode(phoneNumber, ISD);
    res.status(200).json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    next(error);
  }
});
router.post('/verify-otp', async (req, res, next) => {
  try {
    const { phoneNumber, ISD, otpCode } = req.body;
    const response = await verifyOTPCode(phoneNumber, ISD, otpCode);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});
router.post('/service/:id/follow-up-service', createAndUpdateService, followUpServiceData);

router.post('/send-otp-email', sendOTPToEmailAddress);

router.post('/verify-email', verifyEmailAddress);

module.exports = router;
