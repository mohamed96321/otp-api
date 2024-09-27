const Service = require('../models/serviceModel');
const ApiError = require('../utils/apiError');
const asyncHandler = require('express-async-handler');
const { catchError } = require('../middlewares/catchErrorMiddleware');

// @desc Update service status to finished
// @route PATCH /api/services/:id/status
exports.updateServiceStatus = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find the service by ID
    const service = await Service.findByPk(id);

    if (!service) {
      return next(new ApiError('Service not found', 404));
    }

    // Update the status to 'finished'
    service.status = 'finished';
    await service.save();

    res.status(200).json({
      status: 'success',
      message: 'Service status updated to finished',
      data: { service },
    });
  } catch (error) {
    next(error);
  }
});

// @desc Get all services by status 'finished', where email and phone are verified
// @route GET /api/services/status/finished
exports.getAllServicesThatStatusIsFinished = asyncHandler(
  async (req, res, next) => {
    try {
      const { page = 1, limit = 10 } = req.query; // Set default page to 1 and limit to 10

      const offset = (page - 1) * limit; // Calculate offset

      // Find all services where status is 'finished', and both email and phone are verified
      const services = await Service.findAndCountAll({
        where: {
          status: 'finished',
          emailVerified: true,
          phoneVerified: true,
        },
        limit: parseInt(limit),
        offset: parseInt(offset),
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
  }
);

// @desc Get all services by status 'pending', where email and phone are verified
// @route GET /api/services/status/pending
exports.getAllServicesThatStatusIsPending = asyncHandler(
  async (req, res, next) => {
    try {
      const { page = 1, limit = 10 } = req.query; // Set default page to 1 and limit to 10

      const offset = (page - 1) * limit; // Calculate offset

      // Find all services where status is 'pending', and both email and phone are verified
      const services = await Service.findAndCountAll({
        where: {
          status: 'pending',
          emailVerified: true,
          phoneVerified: true,
        },
        limit: parseInt(limit),
        offset: parseInt(offset),
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
