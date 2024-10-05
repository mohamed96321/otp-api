const Service = require('../models/serviceModel');
const ApiError = require('../utils/apiError');
const asyncHandler = require('express-async-handler');
const { sendEmail } = require('../utils/sendEmail');
const { updateStatusEmailTemplate } = require('../templates/updateStatusEmail');
const { inProgressUpdateTemplate } = require('../templates/inProgressUpdate');
const { catchError } = require('../middlewares/catchErrorMiddleware');
const { Op } = require('sequelize');

// Helper function to update service status
const updateServiceStatus = asyncHandler(async (req, res, next, status) => {
  const { id } = req.params;

  // Find the service by ID
  const service = await Service.findByPk(id);

  if (!service) {
    return next(new ApiError('Service not found', 404));
  }

  // Update the status
  service.status = status;
  await service.save();

  res.status(200).json({
    status: 'success',
    message: `Service status updated to ${status}`,
    data: { service },
  });
});

// @desc Update service status to pending
// @route PATCH /api/services/:id/status/pending
exports.updateServiceStatusToPending = asyncHandler(async (req, res, next) => {
  return updateServiceStatus(req, res, next, 'pending');
});

// @desc Update service status to in-progress
// @route PATCH /api/services/:id/status/in-progress
exports.updateServiceStatusToInProgress = asyncHandler(
  async (req, res, next) => {
    return updateServiceStatus(req, res, next, 'in-progress');
  }
);

// @desc Update service status to finished
// @route PATCH /api/services/:id/status/finished
exports.updateServiceStatusToFinished = asyncHandler(async (req, res, next) => {
  return updateServiceStatus(req, res, next, 'finished');
});

// @desc Update service status to cancelled
// @route PATCH /api/services/:id/status/cancelled
exports.updateServiceStatusToCancelled = asyncHandler(
  async (req, res, next) => {
    return updateServiceStatus(req, res, next, 'cancelled');
  }
);

// Helper function to get services by status
const getAllServicesByStatus = asyncHandler(async (req, res, next, status) => {
  const { page = 1, limit = 10 } = req.query; // Set default page to 1 and limit to 10
  const offset = (page - 1) * limit; // Calculate offset

  // Find all services where status is dynamic, and both email and phone are verified
  const services = await Service.findAndCountAll({
    where: {
      status: status,
      emailVerified: true,
      phoneVerified: true,
    },
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['createdAt', 'DESC']],
  });

  // Calculate total pages
  const totalPages = Math.ceil(services.count / limit);

  res.status(200).json({
    status: 'success',
    results: services.rows.length,
    currentPage: parseInt(page),
    totalPages: totalPages,
    data: { services: services.rows },
  });
});

// @desc Get all services by status 'finished'
// @route GET /api/services/status/finished
exports.getAllServicesThatStatusIsFinished = asyncHandler(
  async (req, res, next) => {
    return getAllServicesByStatus(req, res, next, 'finished');
  }
);

// @desc Get all services by status 'pending'
// @route GET /api/services/status/pending
exports.getAllServicesThatStatusIsPending = asyncHandler(
  async (req, res, next) => {
    return getAllServicesByStatus(req, res, next, 'pending');
  }
);

// @desc Get all services by status 'in-progress'
// @route GET /api/services/status/in-progress
exports.getAllServicesThatStatusIsInProgress = asyncHandler(
  async (req, res, next) => {
    return getAllServicesByStatus(req, res, next, 'in-progress');
  }
);

// @desc Get all services by status 'cancelled'
// @route GET /api/services/status/cancelled
exports.getAllServicesThatStatusIsCancelled = asyncHandler(
  async (req, res, next) => {
    return getAllServicesByStatus(req, res, next, 'cancelled');
  }
);

// @desc    Update service details
// @route   PUT /api/v1/services/:id
// @access  Public
exports.updateServiceAdmin = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const { adminNote } = req.body;

    const service = await Service.findByPk(id);

    if (!service) {
      return next(new ApiError('Service not found', 404));
    }

    // Check if both email and phone number are verified
    if (!service.emailVerified && !service.phoneVerified) {
      return next(
        new ApiError(
          'Either email or phone number must be verified before proceeding',
          400
        )
      );
    }

    // Update service details
    service.adminNote = adminNote || service.adminNote;
    await service.save();

    res.status(200).json({
      success: true,
      message: 'Service data updated successfully',
      data: service,
    });
  } catch (error) {
    next(error);
  }
});

// get all adminNote for all services
exports.getAllAdminNote = asyncHandler(async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query; // Set default page to 1 and limit to 10
    const offset = (page - 1) * limit; // Calculate offset

    // Find all services where status is dynamic, and both email and phone are verified
    const services = await Service.findAndCountAll({
      attributes: ['id', 'adminNote', 'status', 'type', 'email', 'createdAt'],
      where: {
        adminNote: {
          [Op.ne]: null, // Sequelize operator for 'not equal to null'
        },
      },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
    });

    // Calculate total pages
    const totalPages = Math.ceil(services.count / limit);

    res.status(200).json({
      status: 'success',
      results: services.rows.length,
      currentPage: parseInt(page),
      totalPages: totalPages,
      data: { services: services.rows },
    });
  } catch (error) {
    next(error);
  }
});

// Get service by ID
exports.getServiceDetail = catchError(
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    // Find the service by ID
    const service = await Service.findByPk(id);

    // If no service is found, throw an error
    if (!service) {
      return next(new ApiError(`Service not found with id: ${id}`, 404));
    }

    // Respond with the service data
    res.status(200).json({
      success: true,
      data: service,
    });
  })
);

// @desc Delete a service by ID
// @route DELETE /api/services/:id
exports.deleteService = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Find the service by ID
  const service = await Service.findByPk(id);

  if (!service) {
    return next(new ApiError('Service not found', 404));
  }

  // Delete the service
  await service.destroy();

  res.status(200).json({
    status: 'success',
    message: 'Service deleted successfully',
  });
});

// Helper function to update service status, save message, and send email
const updateServiceStatusAndNotify = asyncHandler(
  async (req, res, next, status) => {
    const { id } = req.params;
    const service = await Service.findByPk(id);

    if (!service) {
      return next(new ApiError('Service not found', 404));
    }

    // Update the service status
    service.status = status;

    // Generate a custom message based on the status
    let message = `The status of your service '${service.type}' has been updated to: ${status}.`;

    if (status.toLowerCase() === 'cancelled') {
      message = `We are sorry, but your service '${service.type}' has been cancelled. We will review our service to solve this problem.`;
    }

    // Update the service with the message
    service.message = message;

    await service.save(); // Save the updated service with new status and message

    // Send email with status update
    const emailContent = updateStatusEmailTemplate(service.fullName, message);
    await sendEmail(service.email, 'Service Status Update', emailContent);

    res.status(200).json({
      success: true,
      message: `Service status updated to ${status} and email notification sent.`,
      data: { service },
    });
  }
);

// Example usage for updating to 'in-progress' status
exports.updateServiceStatusToInProgressNotify = asyncHandler(
  (req, res, next) => {
    return updateServiceStatusAndNotify(req, res, next, 'in-progress');
  }
);

// Example usage for updating to 'finished' status
exports.updateServiceStatusToFinishedNotify = asyncHandler((req, res, next) => {
  return updateServiceStatusAndNotify(req, res, next, 'finished');
});

exports.updateServiceStatusToCancelledNotify = asyncHandler(
  (req, res, next) => {
    return updateServiceStatusAndNotify(req, res, next, 'cancelled');
  }
);

// Helper function to handle in-progress notifications and save message
const inProgressNotify = asyncHandler(async (req, res, next, updateMessage) => {
  const { id } = req.params;
  const service = await Service.findByPk(id);

  if (!service) {
    return next(new ApiError('Service not found', 404));
  }

  if (service.status !== 'in-progress') {
    return next(new ApiError('Service is not in-progress', 400));
  }

  // Generate the message based on the specific action
  const message = `Your service '${service.type}' is now in progress: ${updateMessage}`;
  service.message = message;

  await service.save(); // Save the updated service with new status and message

  // Send email with the in-progress status update
  const emailContent = inProgressUpdateTemplate(service.fullName, message);
  await sendEmail(service.email, 'Service In-Progress Update', emailContent);

  res.status(200).json({
    success: true,
    message: `Service status updated to in-progress with update: ${updateMessage} and email notification sent.`,
    data: { service },
  });
});

// Controller for "someone will contact you" update
exports.inProgressContactNotify = asyncHandler((req, res, next) => {
  const updateMessage = 'Someone will contact you shortly.';
  return inProgressNotify(req, res, next, updateMessage);
});

// Controller for "someone is coming to you" update
exports.inProgressComingNotify = asyncHandler((req, res, next) => {
  const updateMessage = 'Someone is on their way to you.';
  return inProgressNotify(req, res, next, updateMessage);
});

// Controller for "someone is here" update
exports.inProgressHereNotify = asyncHandler((req, res, next) => {
  const updateMessage = 'Someone has arrived at your location.';
  return inProgressNotify(req, res, next, updateMessage);
});
