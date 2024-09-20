const cron = require('node-cron');
const { Op } = require('sequelize');
const Service = require('../models/serviceModel');

// Function to delete finished services older than 60 days
const deleteOldFinishedServices = async () => {
  try {
    // Get the date 60 days ago
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 60);

    // Delete services with status 'finished' and updatedAt older than 60 days
    const result = await Service.destroy({
      where: {
        status: 'finished',
        updatedAt: {
          [Op.lt]: cutoffDate // Sequelize operator for less than
        }
      }
    });

    console.log(`${result} old finished service(s) deleted`);
  } catch (error) {
    console.error('Error deleting old finished services:', error);
  }
};

// Schedule the job to run daily at midnight
cron.schedule('0 0 * * *', deleteOldFinishedServices);
