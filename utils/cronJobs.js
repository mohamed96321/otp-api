const cron = require('node-cron');
const { Op } = require('sequelize');
const Service = require('../models/serviceModel');

// First cron job (every 30 minutes): Delete unverified emails or records with missing phone numbers
const deleteUnverifiedOrInvalidServices = async () => {
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

  try {
    // Check for matching services
    const matchingRecords = await Service.count({
      where: {
        createdAt: { [Op.lte]: thirtyMinutesAgo },
        [Op.or]: [
          { emailVerified: false },
          { emailVerified: true, phoneNumber: null }
        ]
      }
    });

    if (matchingRecords > 0) {
      console.log(`Found ${matchingRecords} services matching the conditions. Proceeding with deletion.`);

      const result = await Service.destroy({
        where: {
          createdAt: { [Op.lte]: thirtyMinutesAgo },
          [Op.or]: [
            { phoneVerified: false },
            { emailVerified: true, phoneNumber: null }
          ]
        }
      });

      console.log(`${result} services deleted.`);
    } else {
      console.log('No matching records found. Skipping deletion.');
    }
  } catch (error) {
    console.error('Error while checking and removing services:', error);
  }
};

// Schedule to run every 30 minutes
cron.schedule('*/30 * * * *', deleteUnverifiedOrInvalidServices);


// Second cron job (daily at midnight): Delete finished services older than 60 days
const deleteOldFinishedServices = async () => {
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  try {
    const finishedServicesCount = await Service.count({
      where: {
        status: 'finished',
        updatedAt: {
          [Op.lt]: sixtyDaysAgo
        }
      }
    });

    if (finishedServicesCount > 0) {
      console.log(`Found ${finishedServicesCount} finished services older than 60 days. Proceeding with deletion.`);

      const result = await Service.destroy({
        where: {
          status: 'finished',
          updatedAt: {
            [Op.lt]: sixtyDaysAgo
          }
        }
      });

      console.log(`${result} old finished service(s) deleted.`);
    } else {
      console.log('No finished services older than 60 days found. Skipping deletion.');
    }
  } catch (error) {
    console.error('Error deleting old finished services:', error);
  }
};

// Schedule to run daily at midnight
cron.schedule('0 0 * * *', deleteOldFinishedServices);
