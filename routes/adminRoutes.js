const express = require('express');
const {
  updateServiceStatusToPending,
  updateServiceStatusToCancelled,
  updateServiceStatusToFinished,
  updateServiceStatusToInProgress,
  getAllServicesThatStatusIsCancelled,
  getAllServicesThatStatusIsFinished,
  getAllServicesThatStatusIsInProgress,
  getAllServicesThatStatusIsPending,
  getServiceDetail,
  addAdminNoteOne,
  addAdminNoteTwo,
  deleteService,
  updateServiceStatusToFinishedNotify,
  updateServiceStatusToInProgressNotify,
  updateServiceStatusToCancelledNotify,
  inProgressComingNotify,
  inProgressContactNotify,
  getAllAdminNote,
  inProgressHereNotify,
} = require('../controllers/adminController');
const authService = require('../services/authService');
const {
  createAndUpdateService,
} = require('../utils/validators/serviceValidator');

const router = express.Router();

router.use(authService.protect);

router.use(authService.allowedTo('admin'));

// Route to update service status to 'pending'
router.patch('/service/:id/status/pending', updateServiceStatusToPending);

// Route to update service status to 'in-progress'
router.patch(
  '/service/:id/status/in-progress',
  updateServiceStatusToInProgress
);

// Route to update service status to 'finished'
router.patch('/service/:id/status/finished', updateServiceStatusToFinished);

// Route to update service status to 'cancelled'
router.patch('/service/:id/status/cancelled', updateServiceStatusToCancelled);

router.patch(
  '/service-notify/:id/status/in-progress',
  updateServiceStatusToInProgressNotify
);

router.patch(
  '/service-notify/:id/status/finished',
  updateServiceStatusToFinishedNotify
);

router.patch(
  '/service-notify/:id/status/cancelled',
  updateServiceStatusToCancelledNotify
);

// Route to get all services with 'pending' status
router.get('/service/status/pending', getAllServicesThatStatusIsPending);

// Route to get all services with 'in-progress' status
router.get('/service/status/in-progress', getAllServicesThatStatusIsInProgress);

// Route to get all services with 'finished' status
router.get('/service/status/finished', getAllServicesThatStatusIsFinished);

// Route to get all services with 'cancelled' status
router.get('/service/status/cancelled', getAllServicesThatStatusIsCancelled);

// Route to get service details by ID
router.get('/service/:id', getServiceDetail);

// Route to get all admin notes
router.get('/services/service/get-all-admin-notes', getAllAdminNote);

// Route to update service details by admin
router.put(
  '/service/:id/admin-note-one',
  createAndUpdateService,
  addAdminNoteOne
);

router.put(
  '/service/:id/admin-note-two',
  createAndUpdateService,
  addAdminNoteTwo
);

// Route to delete a service by ID
router.delete('/service/:id/delete', deleteService);

// Route to send email when service status is 'in-progress'
router.patch(
  '/service/:id/status/in-progress-notify/coming',
  inProgressComingNotify
);

// Route to send email when service status is 'in-progress'
router.patch(
  '/service/:id/status/in-progress-notify/contact',
  inProgressContactNotify
);

// Route to send email when service status is 'in-progress'
router.patch(
  '/service/:id/status/in-progress-notify/here',
  inProgressHereNotify
);

module.exports = router;
