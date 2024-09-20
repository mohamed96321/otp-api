const { parsePhoneNumberFromString } = require('libphonenumber-js');
const ApiError = require('../utils/apiError');

/**
 * Validates and formats the phone number.
 * @param {string} ISD - The International Subscriber Dialing code.
 * @param {string} phoneNumber - The phone number to be validated and formatted.
 * @throws {ApiError} If the phone number is invalid.
 * @returns {string} The formatted phone number.
 */
const formatPhoneNumber = (ISD, phoneNumber) => {
  const fullPhoneNumber = `${ISD}${phoneNumber}`;
  const phoneNumberInstance = parsePhoneNumberFromString(fullPhoneNumber);

  if (!phoneNumberInstance || !phoneNumberInstance.isValid()) {
    throw new ApiError("Invalid phone number format", 400);
  }

  return phoneNumberInstance.formatInternational();
};

module.exports = { formatPhoneNumber };
