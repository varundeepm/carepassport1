const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');

const authMiddleware = require('../middleware/authMiddleware');

// Wrap these in authMiddleware
router.post('/', authMiddleware, patientController.createPatient);
router.get('/all', authMiddleware, patientController.getAllPatients);
router.get('/category/:categoryId', authMiddleware, patientController.getPatientsByCategory);
router.get('/counts', authMiddleware, patientController.getCategoryCounts);
router.get('/my-doctors', authMiddleware, patientController.getMyDoctors);

module.exports = router;
