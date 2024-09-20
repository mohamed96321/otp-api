const cron = require('node-cron');
const Service = require('../models/serviceModel');

// Function to delete finished services older than 60 days
const deleteOldFinishedServices = async () => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 60); // Set the date to 60 days ago

    const result = await Service.deleteMany({
      status: 'finished',
      updatedAt: { $lt: cutoffDate } // Match services that have not been updated in the last 60 days
    });

    console.log(`${result.deletedCount} old finished service(s) deleted`);
  } catch (error) {
    console.error('Error deleting old finished services:', error);
  }
};

// Schedule the job to run daily at midnight
cron.schedule('0 0 * * *', deleteOldFinishedServices);
