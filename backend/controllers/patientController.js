const Patient = require('../models/Patient');
const User = require('../models/User');
const mongoose = require('mongoose');

exports.createPatient = async (req, res) => {
    try {
        const { email, diseaseCategory, diseaseCategoryName, organizationId } = req.body;
        const doctorId = req.user.userId;

        // Find the user by email to link them as a patient
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'No registered user found with this email. Patients must register an account first.' });
        }

        const existingPatient = await Patient.findOne({ userId: user._id, doctorId });
        if (existingPatient) {
            return res.status(400).json({ success: false, message: 'This patient is already linked to your records.' });
        }

        const orgId = mongoose.Types.ObjectId.isValid(organizationId) ? organizationId :
            (user.profile?.organizationId && mongoose.Types.ObjectId.isValid(user.profile.organizationId) ? user.profile.organizationId : null);

        const orgName = user.profile?.organization || '';

        const patient = new Patient({
            userId: user._id,
            doctorId,
            organizationId: orgId,
            organizationName: orgName,
            diseaseCategory,
            diseaseCategoryName
        });

        await patient.save();
        res.status(201).json({ success: true, patient });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

exports.getAllPatients = async (req, res) => {
    try {
        const doctorId = req.user.userId;
        const patients = await Patient.find({ doctorId }).populate('userId', 'profile wallet');
        res.json({ success: true, patients });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

exports.getPatientsByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const doctorId = req.user.userId;

        const patients = await Patient.find({
            doctorId,
            diseaseCategory: parseInt(categoryId)
        }).populate('userId', 'profile wallet');

        res.json({ success: true, patients });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

exports.getCategoryCounts = async (req, res) => {
    try {
        const doctorId = req.user.userId;
        const counts = await Patient.aggregate([
            { $match: { doctorId: new mongoose.Types.ObjectId(doctorId) } },
            { $group: { _id: '$diseaseCategory', count: { $sum: 1 } } }
        ]);

        const countMap = {};
        counts.forEach(c => countMap[c._id] = c.count);
        res.json(countMap);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

exports.getMyDoctors = async (req, res) => {
    try {
        const userId = req.user.userId;
        // Find all patient records for this user and populate doctor info
        const patientRecords = await Patient.find({ userId })
            .populate({
                path: 'doctorId',
                select: 'profile email role'
            });

        // Extract unique doctors
        const doctors = patientRecords.map(record => ({
            id: record.doctorId._id,
            name: record.doctorId.profile.name,
            specialty: record.doctorId.profile.specialty,
            organization: record.doctorId.profile.organization || record.organizationName,
            email: record.doctorId.email
        }));

        res.json({ success: true, doctors });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
