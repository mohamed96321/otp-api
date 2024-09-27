const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');
const ApiError = require('../utils/apiError');
const crypto = require('crypto');
const { sendEmail } = require('../utils/sendEmail');
const { verifyEmailTemplate } = require('../template/verifyEmail');
const { Op } = require('sequelize');
const Service = require('../models/serviceModel');
const { formatPhoneNumber } = require('../helpers/phoneNumber');
const asyncHandler = require('express-async-handler');

// Create an SNS client with the specified configuration
const sns = new SNSClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

// Function to send OTP via AWS SNS
async function sendSMSMessage(params) {
  const command = new PublishCommand(params);
  const message = await sns.send(command);
  return message;
}

// Send OTP Code and create service
exports.sendOTPCode = async (phoneNumber, ISD) => {
  const formattedPhoneNumber = formatPhoneNumber(ISD, phoneNumber);

  // Generate a 6-digit OTP code (same method as email)
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

  // Hash the OTP code using crypto (SHA-256)
  const hashedOtpCode = crypto
    .createHash('sha256')
    .update(otpCode)
    .digest('hex');

  const otpCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

  // Define parameters for the SMS message
  const params = {
    Message: `Your OTP code is: ${otpCode}`,
    PhoneNumber: formattedPhoneNumber,
    MessageAttributes: {
      'AWS.SNS.SMS.SenderID': {
        DataType: 'String',
        StringValue: 'OTP-Sender',
      },
    },
  };

  try {
    // Send the OTP via SMS
    await sendSMSMessage(params);

    // Create a new service record with the encrypted OTP code and expiry
    const service = await Service.create({
      phoneNumber: formattedPhoneNumber,
      otpCode: hashedOtpCode,
      otpCodeExpires,
      ISD,
    });

    return {
      success: true,
      message: 'OTP sent successfully',
      phoneNumber: formattedPhoneNumber,
      serviceId: service.id, // Return the service ID
    };
  } catch (error) {
    throw new ApiError(`Failed to send OTP: ${error.message}`, 500);
  }
};

exports.verifyOTPCode = async (phoneNumber, ISD, enteredCode, serviceId) => {
  const formattedPhoneNumber = formatPhoneNumber(ISD, phoneNumber);

  // Hash the entered OTP code
  const hashedEnteredCode = crypto
    .createHash('sha256')
    .update(enteredCode)
    .digest('hex');

  // Find the service record for the specific service and phone number, matching the OTP
  const service = await Service.findOne({
    where: {
      id: serviceId, // Ensure we are verifying the OTP for the correct service
      phoneNumber: formattedPhoneNumber,
      otpCode: hashedEnteredCode,
      otpCodeExpires: { [Op.gt]: new Date() }, // Ensure OTP is still valid
    },
  });

  if (!service) {
    throw new ApiError('Invalid or expired OTP', 400);
  }

  // Mark the phone number as verified for this specific service
  service.phoneVerified = true;
  service.emailVerified = true;
  service.otpCode = null; // Clear OTP once verified
  service.otpCodeExpires = null; // Clear expiration
  await service.save();

  return {
    success: true,
    message: 'Phone number verified successfully',
    serviceId: service.id,
  };
};

/**
 * Updates service data after phone verification.
 * @param {Object} req - The request object containing service data.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
exports.followUpServiceData = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      addressLineOne,
      addressLineTwo,
      city,
      area,
      street,
      buildingNum,
      flatNum,
      fullName,
      email,
      userNote,
      periodDate,
      periodFullTime,
      phoneNumber,
      ISD,
      type,
    } = req.body;

    const service = await Service.findByPk(id); // Use Sequelize's `findByPk`
    if (!service) {
      throw new ApiError('Service not found', 404);
    }

    // Check if the phone number has been verified
    if (!service.emailVerified) {
      return next(new ApiError(400, 'Email not verified'));
    }

    const formattedPhoneNumber = formatPhoneNumber(ISD, phoneNumber);

    // Update the service with the remaining data
    await service.update({
      addressLineOne: addressLineOne || service.addressLineOne,
      addressLineTwo: addressLineTwo || service.addressLineTwo,
      type: type || service.type,
      city: city || service.city,
      area: area || service.area,
      street: street || service.street,
      fullName: fullName || service.fullName,
      email: email || service.email,
      userNote: userNote || service.userNote,
      periodFullTime: periodFullTime || service.periodFullTime,
      phoneNumber: formattedPhoneNumber || service.phoneNumber,
      ISD: ISD || service.ISD,
      buildingNum: buildingNum || service.buildingNum,
      flatNum: flatNum || service.flatNum,
      periodDate: periodDate || service.periodDate,
    });

    res.status(200).json({
      success: true,
      message: 'Service data updated successfully',
      data: service,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new service with email and send OTP (or resend if already exists)
// @route   POST /api/v1/services/sendOTP
// @access  Public
exports.sendOTPToEmailAddress = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  // 1) Generate a 6-digit OTP code
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

  // 2) Hash the OTP code before saving it
  const hashedOTPCode = crypto
    .createHash('sha256')
    .update(otpCode)
    .digest('hex');

  // 3) Create new service with email, OTP, and expiration
  const service = await Service.create({
    email,
    otpCode: hashedOTPCode,
    otpCodeExpires: new Date(Date.now() + 10 * 60 * 1000), // OTP expires in 10 minutes
  });

  // 4) Send OTP via email
  try {
    await sendEmail(
      email,
      'Your OTP Code (Valid for 10 min)',
      verifyEmailTemplate(otpCode)
    );
    res.status(200).json({
      status: 'Success',
      message: 'OTP sent to email',
      email,
      serviceId: service.id, // Use 'id' for Sequelize
    });
  } catch (error) {
    // If email sending fails, clear the OTP details from the service model
    service.otpCode = null;
    service.otpCodeExpires = null;
    await service.save();

    return next(new ApiError('Error sending OTP to email', 500));
  }
});

// @desc    Verify OTP with Lockout Mechanism
// @route   POST /api/v1/services/verifyOTP
// @access  Public
exports.verifyEmailAddress = asyncHandler(async (req, res, next) => {
  const { email, otpCode, serviceId } = req.body;

  // 1) Hash the input OTP
  const hashedOTPCode = crypto
    .createHash('sha256')
    .update(otpCode)
    .digest('hex');

  // 2) Find service by email and valid OTP
  const service = await Service.findOne({
    where: {
      id: serviceId,
      email,
      otpCode: hashedOTPCode,
      otpCodeExpires: { [Op.gt]: new Date() }, // Ensure OTP is still valid
    },
  });

  if (!service) {
    return next(new ApiError('Invalid or expired OTP', 400));
  }

  // 3) Mark email as verified
  service.emailVerified = true;
  service.phoneVerified = true;
  service.otpCode = null; // Clear OTP once verified
  service.otpCodeExpires = null; // Clear expiration
  await service.save();

  res.status(200).json({
    status: 'Success',
    message: 'Email successfully verified',
    serviceId: service.id,
  });
});
