const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.POSTGRES_DB_URI, {
  dialect: 'postgres',
  logging: false,
});

const dbConnection = async () => {
  try {
    await sequelize.authenticate(); // Test the connection to the database
    await sequelize.sync({ alter: true });
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error; // Ensure the error is thrown
  }
};

module.exports = { sequelize, dbConnection };
