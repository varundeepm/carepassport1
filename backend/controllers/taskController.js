const Task = require('../models/Task');
const User = require('../models/User');
const twilioService = require('../services/twilioService');

// @desc    Create a new task and notify patient via SMS
// @route   POST /api/tasks
// @access  Doctor
exports.createTask = async (req, res) => {
    try {
        const { patientId, taskType, title, description, priority, frequency, startDate, endDate, rewardPoints, patientPhone } = req.body;
        const doctorId = req.user.userId;

        // Create Task
        const task = new Task({
            patientId,
            doctorId,
            taskType,
            title,
            description,
            priority,
            frequency,
            startDate: startDate || new Date(),
            endDate,
            rewardPoints: rewardPoints || 10
        });

        await task.save();

        // Fetch patient and doctor info for SMS
        const [patient, doctor] = await Promise.all([
            User.findById(patientId),
            User.findById(doctorId)
        ]);

        // Resolve phone: prefer number entered in the form, fall back to DB profile
        const resolvedPhone = patientPhone || (patient && patient.profile && patient.profile.phone) || null;

        // Save phone to profile if it wasn't stored yet
        if (patientPhone && patient && !patient.profile.phone) {
            patient.profile.phone = patientPhone;
            await patient.save();
        }

        // SMS to patient
        if (resolvedPhone) {
            try {
                await twilioService.sendTaskAssigned({
                    patientName: patient?.profile?.name || 'Patient',
                    phoneNumber: resolvedPhone,
                    taskTitle: title,
                    taskType,
                    rewardPoints: task.rewardPoints,
                    doctorName: doctor?.profile?.name || ''
                });
            } catch (smsError) {
                console.error('❌ Task assignment SMS error:', smsError.message);
            }
        } else {
            console.warn(`⚠️  No phone number available for patient ${patientId} – SMS skipped.`);
        }

        res.status(201).json({
            success: true,
            message: 'Task created and patient notified',
            task
        });
    } catch (error) {
        console.error('Create Task Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get all tasks for a patient
// @route   GET /api/tasks/patient/:patientId
// @access  Doctor or Patient
exports.getPatientTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ patientId: req.params.patientId })
            .sort({ createdAt: -1 });

        res.json({ success: true, tasks });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Mark task as completed, award points, and notify patient via SMS
// @route   PUT /api/tasks/:id/complete
// @access  Patient
exports.completeTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        if (task.completed) {
            return res.status(400).json({ success: false, message: 'Task already completed' });
        }

        // Update Task
        task.completed = true;
        task.completedAt = new Date();
        await task.save();

        // Award Reward Points to Patient
        const patient = await User.findById(task.patientId);
        if (patient) {
            patient.profile.rewardPoints = (patient.profile.rewardPoints || 0) + (task.rewardPoints || 10);
            await patient.save();

            // SMS completion notification to patient
            if (patient.profile && patient.profile.phone) {
                try {
                    await twilioService.sendTaskCompleted({
                        patientName: patient.profile.name || 'Patient',
                        phoneNumber: patient.profile.phone,
                        taskTitle: task.title,
                        rewardPoints: task.rewardPoints || 10,
                        totalPoints: patient.profile.rewardPoints
                    });
                } catch (smsError) {
                    console.error('❌ Task completion SMS error:', smsError.message);
                }
            }
        }

        res.json({
            success: true,
            message: `Task completed! You earned ${task.rewardPoints} points.`,
            newTotalPoints: patient?.profile?.rewardPoints || 0
        });
    } catch (error) {
        console.error('Complete Task Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get summary of patient rewards (for Doctor)
// @route   GET /api/tasks/doctor/rewards
// @access  Doctor
exports.getDoctorPatientRewards = async (req, res) => {
    try {
        const doctorId = req.user.userId;
        const Patient = require('../models/Patient');

        // Find all patients linked to this doctor in the Patient collection
        const patientLinks = await Patient.find({ doctorId }).populate('userId', 'profile.name profile.rewardPoints');

        // Map to a cleaner format
        const patientRewards = patientLinks
            .filter(link => link.userId)
            .map(link => ({
                _id: link.userId._id,
                profile: link.userId.profile
            }));

        res.json({ success: true, patients: patientRewards });
    } catch (error) {
        console.error('Fetch Rewards Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
