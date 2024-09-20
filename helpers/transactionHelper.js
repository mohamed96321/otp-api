const mongoose = require('mongoose');

exports.withTransaction = async (fn) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const result = await fn(session); // Execute the business logic passed in as a function
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error; // Propagate the error to handle it in the calling function
  } finally {
    session.endSession();
  }
};
