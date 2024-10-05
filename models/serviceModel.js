const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');
const { v4: UUIDV4 } = require('uuid');

class Service extends Model {}

Service.init({
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: UUIDV4,
  },
  type: {
    type: DataTypes.STRING,
  },
  phoneNumber: {
    type: DataTypes.STRING,
  },
  ISD: {
    type: DataTypes.STRING,
  },
  email: {
    type: DataTypes.STRING,
  },
  addressLineOne: {
    type: DataTypes.STRING,
  },
  addressLineTwo: {
    type: DataTypes.STRING,
  },
  city: {
    type: DataTypes.STRING,
  },
  periodDate: {
    type: DataTypes.DATEONLY,
  },
  periodFullTime : {
    type: DataTypes.STRING,
  },
  area: {
    type: DataTypes.STRING,
  },
  street: {
    type: DataTypes.STRING,
  },
  buildingNum: {
    type: DataTypes.STRING,
  },
  flatNum: {
    type: DataTypes.STRING,
  },
  fullName: {
    type: DataTypes.STRING,
  },
  serviceCode: {
    type: DataTypes.STRING,
  },
  message: {
    type: DataTypes.TEXT,
  },
  adminNoteOne: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  adminNoteTwo: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  userNote: {
    type: DataTypes.TEXT,
  },
  otpCode: {
    type: DataTypes.STRING,
  },
  otpCodeExpires: {
    type: DataTypes.DATE,
  },
  phoneVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  emailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'in-progress', 'finished', 'cancelled'),
    defaultValue: 'pending',
  },
}, {
  sequelize,
  modelName: 'Service',
  tableName: 'services',
  timestamps: true,
});

module.exports = Service;
