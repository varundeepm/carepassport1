const PatientDisease = require('../models/PatientDisease');

// Assign disease to patient
exports.assignDiseaseToPatient = async (req, res) => {
    try {
        const patientDisease = new PatientDisease(req.body);
        await patientDisease.save();
        res.status(201).json({
            success: true,
            message: 'Disease assigned to patient successfully',
            data: patientDisease
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error assigning disease to patient',
            error: error.message
        });
    }
};

// Get all diseases for a patient
exports.getPatientDiseases = async (req, res) => {
    try {
        const diseases = await PatientDisease.find({ patientId: req.params.patientId })
            .populate('diseaseId');
        res.status(200).json({
            success: true,
            data: diseases
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching patient diseases',
            error: error.message
        });
    }
};

// Update patient disease status
exports.updatePatientDisease = async (req, res) => {
    try {
        const updated = await PatientDisease.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: Date.now() },
            { new: true }
        );
        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Patient disease record not found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Patient disease updated successfully',
            data: updated
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error updating patient disease',
            error: error.message
        });
    }
};
