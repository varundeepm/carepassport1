const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const authMiddleware = require('../middleware/authMiddleware');

// Patient routes
router.post('/', authMiddleware, appointmentController.createAppointment);
router.get('/patient', authMiddleware, appointmentController.getPatientAppointments);
router.patch('/:appointmentId/cancel', authMiddleware, appointmentController.cancelAppointment);

// Doctor routes
router.get('/doctor', authMiddleware, appointmentController.getDoctorAppointments);
router.patch('/:appointmentId/status', authMiddleware, appointmentController.updateAppointmentStatus);

// Utility routes
router.get('/available-slots', authMiddleware, appointmentController.getAvailableSlots);

module.exports = router;
