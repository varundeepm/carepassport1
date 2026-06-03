const express = require('express');
const router = express.Router();
const {
    createTask,
    getPatientTasks,
    completeTask,
    getDoctorPatientRewards
} = require('../controllers/taskController');
const auth = require('../middleware/authMiddleware');

// @route   POST /api/tasks
// @desc    Create a task (Doctor only)
router.post('/', auth, createTask);

// @route   GET /api/tasks/patient/:patientId
// @desc    Get patient tasks
router.get('/patient/:patientId', auth, getPatientTasks);

// @route   PUT /api/tasks/:id/complete
// @desc    Complete a task (Patient only)
router.put('/:id/complete', auth, completeTask);

// @route   GET /api/tasks/doctor/rewards
// @desc    Get patient rewards summary (Doctor only)
router.get('/doctor/rewards', auth, getDoctorPatientRewards);

module.exports = router;
