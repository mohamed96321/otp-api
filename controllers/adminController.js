const Service = require('../models/serviceModel');
const ApiError = require('../utils/apiError');

// @desc Update service status to finished
// @route PATCH /api/services/:id/status
exports.updateServiceStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find the service by ID
    const service = await Service.findById(id);

    if (!service) {
      return next(new ApiError('Service not found', 404));
    }

    // Update the status to 'finished'
    service.status = 'finished';
    await service.save();

    res.status(200).json({
      status: 'success',
      message: 'Service status updated to finished',
      data: {
        service
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get all services by status
// @route GET /api/services/status/:status
exports.getServicesByStatus = async (req, res, next) => {
  try {
    const { status } = req.params;

    if (!['pending', 'finished'].includes(status)) {
      return next(new ApiError('Invalid status', 400));
    }

    const services = await Service.find({ status });

    res.status(200).json({
      status: 'success',
      results: services.length,
      data: {
        services
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update service details
// @route   PUT /api/v1/services/:id
// @access  Public
exports.updateServiceAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { adminNote } = req.body;

    const service = await Service.findById(id);

    if (!service) {
      throw new ApiError("Service not found", 404);
    }

    // Check if the phone number has been verified
    if (!service.emailVerified) {
      return next(new ApiError(400, 'Email not verified'));
    }

    // Update the service with the remaining data
    service.adminNote = adminNote || service.adminNote;
    
    // Save the updated service
    await service.save();

    res.status(200).json({
      success: true,
      message: "Service data updated successfully",
      data: service,
    });
  } catch (error) {
    next(error);
  }
};

// try {
//   // Find the service by its ID
//   const service = await Service.findById(id);

//   if (!service) {
//     return next(new ApiError(404, 'Service not found'));
//   }

//   // Check if the phone number or email has been verified
//   if (!service.emailVerified) {
//     return next(new ApiError(400, 'Email not verified'));
//   }

//   const formattedPhoneNumber = formatPhoneNumber(ISD, phoneNumber);

//   // Update the service with the data provided in the request body
//   Object.assign(service, updateData);

//   // Save the updated service data
//   await service.save();

//   res.status(200).json({
//     status: 'success',
//     message: 'Service details updated successfully',
//     data: service,
//   });
// } catch (error) {
//   next(new ApiError(500, 'Failed to update service details'));
// }
// };
