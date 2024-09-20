const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  type: {
    type: String,
  },
  phoneNumber: {
    type: String,
  },
  ISD: {
    type: String,
  },
  email: {
    type: String,
  },
  addressLineOne: {
    type: String,
  },
  addressLineTwo: {
    type: String,
  },
  city: {
    type: String,
  },
  periodDate: {
    type: Date,
  },
  periodFullTime : {
    type: String,
  },
  country: {
    type: String,
  },
  fullName: {
    type: String,
  },
  adminNote: {
    type: String,
  },
  userNote: {
    type: String,
  },
  otpCode: {
    type: String,
  },
  otpCodeExpires: {
    type: Date,
    index: true,
  },
  phoneVerified: {
    type: Boolean,
    default: false,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['pending', 'finished'],
    default: 'pending',
  },
}, {
  timestamps: true,
});


const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;
