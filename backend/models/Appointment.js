const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    appointmentDate: {
        type: Date,
        required: true
    },
    timeSlot: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        default: 30 // minutes
    },
    consultationType: {
        type: String,
        enum: ['In-Person', 'Video Call', 'Phone Call'],
        default: 'In-Person'
    },
    status: {
        type: String,
        enum: ['requested', 'accepted', 'rejected', 'completed', 'cancelled'],
        default: 'requested'
    },
    reason: {
        type: String,
        required: true
    },
    notes: {
        type: String
    },
    doctorNotes: {
        type: String
    },
    rejectionReason: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
AppointmentSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Appointment', AppointmentSchema);
