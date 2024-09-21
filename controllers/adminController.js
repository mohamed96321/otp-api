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

// @desc Get all services by status
// @route GET /api/services/status/:status
exports.getAllServicesThatStatusIsFinished = asyncHandler(
  async (req, res, next) => {
    try {
      const services = await Service.findAll({ where: { status: 'finished' } });

      res.status(200).json({
        status: 'success',
        results: services.length,
        data: { services },
      });
    } catch (error) {
      next(error);
    }
  }
);

exports.getAllServicesThatStatusIsPending = asyncHandler(
  async (req, res, next) => {
    try {
      const services = await Service.findAll({ where: { status: 'pending' } });

      res.status(200).json({
        status: 'success',
        results: services.length,
        data: { services },
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

    if (!service.emailVerified) {
      return next(new ApiError(400, 'Email not verified'));
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
