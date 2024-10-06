const Service = require('../models/serviceModel');
const ApiError = require('../utils/apiError');
const asyncHandler = require('express-async-handler');
const { sendEmail } = require('../utils/sendEmail');
const { updateStatusEmailTemplate } = require('../templates/updateStatusEmail');
const { inProgressUpdateTemplate } = require('../templates/inProgressUpdate');
const { adminSendEmailTemplate } = require('../templates/adminSendEmail');
const { catchError } = require('../middlewares/catchErrorMiddleware');
const { Op } = require('sequelize');

// Helper function to generate service status messages
const generateServiceStatusMessage = (status) => {
  let message = 'خدمتك قيد المراجعة نحن حريصون على انهائها في أقرب وقت.';

  switch (status.toLowerCase()) {
    case 'in-progress':
      message = 'خدمتك قيد التنفيذ.';
      break;
    case 'finished':
      message = 'تم الانتهاء من خدمتك.';
      break;
    case 'cancelled':
      message = 'نعتذر، لقد تم إلغاء خدمتك. سنقوم بمراجعة الخدمة لحل المشكلة.';
      break;
    default:
      message = 'خدمتك قيد المراجعة نحن حريصون على انهائها في أقرب وقت.';
  }

  return message;
};

// Helper function to update service status
const updateServiceStatus = asyncHandler(async (req, res, next, status) => {
  const { id } = req.params;

  // Find the service by ID
  const service = await Service.findByPk(id);

  if (!service) {
    return next(new ApiError('Service not found', 404));
  }

  // Update the service status
  service.status = status;

  // Generate message using the helper function
  const message = generateServiceStatusMessage(status);

  // Save the updated service
  service.message = message;

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
// Helper function to update admin notes
const updateAdminNote = asyncHandler(async (req, res, next, noteType) => {
  const { id } = req.params;
  const noteValue = req.body[noteType];

  try {
    const service = await Service.findByPk(id);

    if (!service) {
      return next(new ApiError('Service not found', 404));
    }

    // Update the specified admin note
    service[noteType] = noteValue || service[noteType];
    await service.save();

    res.status(200).json({
      success: true,
      message: `${noteType} updated successfully`,
      data: service,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Add or update admin note one for a service
// @route   PUT /api/v1/services/:id/admin-note-one
// @access  Public (or change to admin-only if required)
exports.addAdminNoteOne = asyncHandler((req, res, next) => {
  return updateAdminNote(req, res, next, 'adminNoteOne');
});

// @desc    Add or update admin note two for a service
// @route   PUT /api/v1/services/:id/admin-note-two
// @access  Public (or change to admin-only if required)
exports.addAdminNoteTwo = asyncHandler((req, res, next) => {
  return updateAdminNote(req, res, next, 'adminNoteTwo');
});

// get all adminNote for all services
exports.getAllAdminNote = asyncHandler(async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query; // Set default page to 1 and limit to 10
    const offset = (page - 1) * limit; // Calculate offset

    // Find all services where status is dynamic, and both email and phone are verified
    const services = await Service.findAndCountAll({
      attributes: [
        'id',
        'adminNoteOne',
        'adminNoteTwo',
        'status',
        'type',
        'email',
        'createdAt',
      ],
      where: {
        [Op.or]: [
          { adminNoteOne: { [Op.ne]: null } },
          { adminNoteTwo: { [Op.ne]: null } },
        ],
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

    // Generate message using the helper function
    const message = generateServiceStatusMessage(status);

    // Update the service with the message
    service.message = message;

    await service.save(); // Save the updated service with new status and message

    // Send email with status update
    const emailContent = updateStatusEmailTemplate(service.fullName, message);
    await sendEmail(service.email, 'تحديث حالة الخدمة', emailContent);

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
  const message = `خدمتك قيد التنفيذ الآن: ${updateMessage}`;

  service.message = message;

  await service.save(); // Save the updated service with new status and message

  // Send email with the in-progress status update
  const emailContent = inProgressUpdateTemplate(service.fullName, message);
  await sendEmail(
    service.email,
    'تحديث حالة الخدمة (قيد التنفيذ)',
    emailContent
  );

  res.status(200).json({
    success: true,
    message: `Service status updated to in-progress with update: ${updateMessage} and email notification sent.`,
    data: { service },
  });
});

// Controller for "someone will contact you" update
exports.inProgressLocationNotify = asyncHandler((req, res, next) => {
  const updateMessage = 'الفني قد وصل إلى موقعك وسيبدأ العمل على الفور. شكرًا لتعاونك.';
  return inProgressNotify(req, res, next, updateMessage);
});

// Controller for "someone is coming to you" update
exports.inProgressWayNotify = asyncHandler((req, res, next) => {
  const updateMessage = 'الفني في طريقه إلى موقعك الآن. شكرًا لتعاونك';
  return inProgressNotify(req, res, next, updateMessage);
});

// Controller for "someone is here" update
exports.inProgressInsureNotify = asyncHandler((req, res, next) => {
  const updateMessage = 'طلبكم في انتظار تأكيد الصيانة من قبلكم. يرجى تأكيد الطلب عن طريق الاتصال بخدمة العملاء - نور - لنتمكن من خدمتك. شكرًا لاختيارك نور';
  
  return inProgressNotify(req, res, next, updateMessage);
});

// Function to send admin email
exports.sendAdminEmail = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { body } = req.body; // Ensure the request has 'body'

  // Find the service by ID
  const service = await Service.findByPk(id);

  if (!service) {
    return next(new ApiError('Service not found', 404));
  }

  // Ensure the service is 'in-progress'
  if (service.status !== 'in-progress') {
    return next(new ApiError('Service is not in-progress', 400));
  }

  // Update the adminMessage with the provided body
  service.adminMessage = body;

  await service.save(); // Make sure to await saving the service

  // Generate the email content using the template
  const emailContent = adminSendEmailTemplate(service.fullName, body);

  try {
    // Send email to the service email
    await sendEmail(service.email, 'تحديث حالة الخدمة', emailContent);

    res.status(200).json({
      success: true,
      message: 'Admin email sent successfully.',
    });
  } catch (error) {
    next(new ApiError('Failed to send email', 500));
  }
});
