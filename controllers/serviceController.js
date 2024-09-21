const {
  CognitoIdentityProviderClient,
  AdminInitiateAuthCommand,
} = require('@aws-sdk/client-cognito-identity-provider');
const ApiError = require('../utils/apiError');
const crypto = require('crypto');
const { sendEmail } = require('../utils/sendEmail');
const { verifyEmailTemplate } = require('../template/verifyEmail');
const { Op } = require('sequelize');
const {
  AdminRespondToAuthChallengeCommand,
} = require('@aws-sdk/client-cognito-identity-provider');
const Service = require('../models/serviceModel');
const { formatPhoneNumber } = require('../helpers/phoneNumber');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.COGNITO_REGION,
});

// Send OTP Code
exports.sendOTPCode = async (phoneNumber, ISD) => {
  const formattedPhoneNumber = formatPhoneNumber(ISD, phoneNumber);

  const params = {
    AuthFlow: 'CUSTOM_AUTH', // For OTP handling
    ClientId: process.env.COGNITO_CLIENT_ID,
    UserPoolId: process.env.COGNITO_USER_POOL_ID,
    AuthParameters: {
      USERNAME: formattedPhoneNumber,
    },
  };

  try {
    const command = new AdminInitiateAuthCommand(params);
    const response = await cognitoClient.send(command);

    if (!response || !response.AuthenticationResult) {
      throw new ApiError('Failed to send OTP', 500);
    }

    // Encrypt the OTP code using bcrypt
    const otpCode = response.AuthenticationResult.AccessToken;
    const hashedOtpCode = await bcrypt.hash(otpCode, 12);
    const otpCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

    // Update the service model with the encrypted OTP code and expiry
    const service = await Service.update(
      {
        otpCode: hashedOtpCode,
        otpCodeExpires,
      },
      {
        where: { phoneNumber: formattedPhoneNumber },
      }
    );

    return {
      success: true,
      message: 'OTP sent successfully',
      phoneNumber: formattedPhoneNumber,
      serviceId: service.id,
    };
  } catch (error) {
    throw new ApiError(`Failed to send OTP: ${error.message}`, 500);
  }
};

// Verify OTP Code
exports.verifyOTPCode = async (phoneNumber, ISD, enteredCode) => {
  const formattedPhoneNumber = formatPhoneNumber(ISD, phoneNumber);

  const service = await Service.findOne({
    where: { phoneNumber: formattedPhoneNumber },
  });

  if (!service) {
    throw new ApiError('Service not found', 404);
  }

  if (service.otpCodeExpires < Date.now()) {
    throw new ApiError('OTP code has expired', 400);
  }

  // Verify the entered code by comparing with the stored hashed OTP
  const isMatch = await bcrypt.compare(enteredCode, service.otpCode);
  if (!isMatch) {
    throw new ApiError('Invalid OTP code', 400);
  }

  // Verify OTP using AWS Cognito
  const params = {
    ChallengeName: 'CUSTOM_CHALLENGE',
    ClientId: process.env.COGNITO_CLIENT_ID,
    ChallengeResponses: {
      USERNAME: formattedPhoneNumber,
      ANSWER: enteredCode, // User-entered OTP code
    },
  };

  try {
    const command = new AdminRespondToAuthChallengeCommand(params);
    const response = await cognitoClient.send(command);

    if (response.AuthenticationResult) {
      // Mark the phone number as verified
      service.phoneVerified = true;
      service.otpCode = null; // Clear OTP once verified
      service.otpCodeExpires = null; // Clear expiration
      await service.save();

      return { success: true, message: 'Phone number verified successfully' };
    } else {
      throw new ApiError('OTP verification failed', 400);
    }
  } catch (error) {
    throw new ApiError(`Failed to verify OTP: ${error.message}`, 500);
  }
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
  const { email, otpCode } = req.body;

  // 1) Hash the input OTP
  const hashedOTPCode = crypto
    .createHash('sha256')
    .update(otpCode)
    .digest('hex');

  // 2) Find service by email and valid OTP
  const service = await Service.findOne({
    where: {
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
  service.otpCode = null; // Clear OTP once verified
  service.otpCodeExpires = null; // Clear expiration
  await service.save();

  res.status(200).json({
    status: 'Success',
    message: 'Email successfully verified',
    serviceId: service.id,
  });
});
