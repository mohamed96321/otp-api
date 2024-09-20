const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');
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
  adminNote: {
    type: DataTypes.STRING,
  },
  userNote: {
    type: DataTypes.STRING,
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
    type: DataTypes.ENUM('pending', 'finished'),
    defaultValue: 'pending',
    index: true // Indexing the status column
  },
  updatedAt: {
    type: DataTypes.DATE,
    index: true // Indexing the updatedAt column
  },
}, {
  sequelize,
  modelName: 'Service',
  tableName: 'services',
  timestamps: true,
  indexes: [
    {
      fields: ['status', 'updatedAt']
    }
  ]
});

// Function to delete services with status 'finished'
const removeFinishedServices = async () => {
  try {
    const now = new Date();
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const result = await Service.destroy({
      where: {
        status: 'finished',
        updatedAt: {
          [Op.lt]: sixtyDaysAgo,
        }
      }
    });
    
    console.log(`${result} finished service(s) deleted`);
  } catch (error) {
    console.error('Error deleting finished services:', error);
  }
};

// Function to check every 60 days and delete 'finished' services
const checkAndRemoveFinishedServices = () => {
  setTimeout(async function run() {
    await removeFinishedServices(); // Call the function to remove finished services
    
    setTimeout(run, 60 * 24 * 60 * 60 * 1000); 
  }, 60 * 24 * 60 * 60 * 1000); 
};

// Start the background job when the application starts
checkAndRemoveFinishedServices();

module.exports = Service;
