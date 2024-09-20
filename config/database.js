const mongoose = require('mongoose');

const dbConnection = () => {
  mongoose
    .connect(process.env.MONGO_DB_URI)
    .then((conn) => {
      console.log(`MongoDB Connected on host: ${conn.connection.host}`);
    })
    .catch((err) => {
      console.error(`Database Error: ${err}`);
      process.exit(1);
    });
};

module.exports = dbConnection;
