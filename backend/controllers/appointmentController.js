const Appointment = require('../models/Appointment');
const User = require('../models/User');
const emailService = require('../services/emailService');
const twilioService = require('../services/twilioService');

// ─── Create a new appointment request ────────────────────────────────────────
exports.createAppointment = async (req, res) => {
    try {
        const { doctorId, appointmentDate, timeSlot, consultationType, reason, patientPhone } = req.body;
        const patientId = req.user.userId;

        // Check if time slot is already booked
        const existingAppointment = await Appointment.findOne({
            doctorId,
            appointmentDate,
            timeSlot,
            status: { $in: ['requested', 'accepted'] }
        });

        if (existingAppointment) {
            return res.status(400).json({
                success: false,
                message: 'This time slot is already booked'
            });
        }

        const appointment = new Appointment({
            patientId,
            doctorId,
            appointmentDate,
            timeSlot,
            consultationType,
            reason,
            status: 'requested'
        });

        await appointment.save();
        await appointment.populate('patientId', 'profile email');
        await appointment.populate('doctorId', 'profile email');

        const patientName = appointment.patientId.profile?.name || 'Patient';
        const doctorName = appointment.doctorId.profile?.name || 'Doctor';
        // Prefer the phone number the patient just entered; fall back to DB
        const resolvedPatientPhone = patientPhone || appointment.patientId.profile?.phone;
        const resolvedDoctorPhone = appointment.doctorId.profile?.phone;

        // Persist patient phone if new and profile didn't have one
        if (patientPhone && !appointment.patientId.profile?.phone) {
            await User.findByIdAndUpdate(patientId, { 'profile.phone': patientPhone });
        }

        // ── Email notification to doctor ──────────────────────────────────────
        try {
            await emailService.sendAppointmentRequest(
                appointment.doctorId.email,
                patientName,
                appointment.patientId.email,
                appointmentDate,
                timeSlot,
                reason
            );
        } catch (emailError) {
            console.error('Failed to send email notification to doctor:', emailError);
        }

        // ── SMS notification to doctor ───────────────────────────────────
        if (resolvedDoctorPhone) {
            try {
                await twilioService.sendAppointmentRequestToDoctor({
                    doctorName,
                    doctorPhone: resolvedDoctorPhone,
                    patientName,
                    appointmentDate,
                    timeSlot,
                    consultationType,
                    reason
                });
            } catch (smsError) {
                console.error('Failed to send SMS to doctor:', smsError.message);
            }
        } else {
            console.warn('⚠️  Doctor has no phone number – appointment request SMS skipped.');
        }

        // ── SMS notification to patient (booking confirmation) ───────────
        if (resolvedPatientPhone) {
            try {
                await twilioService.sendAppointmentRequestToPatient({
                    patientName,
                    patientPhone: resolvedPatientPhone,
                    doctorName,
                    appointmentDate,
                    timeSlot,
                    consultationType
                });
            } catch (smsError) {
                console.error('Failed to send SMS to patient:', smsError.message);
            }
        } else {
            console.warn('⚠️  Patient has no phone number – booking confirmation SMS skipped.');
        }

        res.status(201).json({
            success: true,
            message: 'Appointment request sent successfully',
            appointment
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// ─── Get all appointments for a patient ──────────────────────────────────────
exports.getPatientAppointments = async (req, res) => {
    try {
        const patientId = req.user.userId;
        const appointments = await Appointment.find({ patientId })
            .populate('doctorId', 'profile email')
            .sort({ appointmentDate: -1 });

        res.json({ success: true, appointments });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// ─── Get all appointments for a doctor ───────────────────────────────────────
exports.getDoctorAppointments = async (req, res) => {
    try {
        const doctorId = req.user.userId;
        const { status } = req.query;

        const query = { doctorId };
        if (status) query.status = status;

        const appointments = await Appointment.find(query)
            .populate('patientId', 'profile email wallet')
            .sort({ appointmentDate: 1 });

        res.json({ success: true, appointments });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// ─── Update appointment status (accept / reject) ─────────────────────────────
exports.updateAppointmentStatus = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const { status, doctorNotes, rejectionReason } = req.body;
        const doctorId = req.user.userId;

        const appointment = await Appointment.findOne({ _id: appointmentId, doctorId });
        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        appointment.status = status;
        if (doctorNotes) appointment.doctorNotes = doctorNotes;
        if (rejectionReason) appointment.rejectionReason = rejectionReason;

        await appointment.save();

        // Use modern populate syntax (array of objects is most robust)
        await appointment.populate([
            { path: 'patientId', select: 'profile email' },
            { path: 'doctorId', select: 'profile email' }
        ]);

        const patientName = appointment.patientId?.profile?.name || 'Patient';
        const doctorName = appointment.doctorId?.profile?.name || 'Doctor';

        // Prefer numbers provided in request (doctor might enter them during update)
        const overridePatientPhone = req.body.patientPhone;
        const resolvedPatientPhone = overridePatientPhone || appointment.patientId?.profile?.phone;
        const resolvedDoctorPhone = req.body.doctorPhone || appointment.doctorId?.profile?.phone;

        // Persist patient phone if provided and not already in profile
        if (overridePatientPhone && appointment.patientId?._id && !appointment.patientId.profile?.phone) {
            await User.findByIdAndUpdate(appointment.patientId._id, { 'profile.phone': overridePatientPhone });
        }

        if (status === 'accepted') {
            // ── Email to patient
            try {
                if (appointment.patientId?.email) {
                    await emailService.sendAppointmentConfirmation(
                        appointment.patientId.email,
                        doctorName,
                        appointment.appointmentDate,
                        appointment.timeSlot,
                        doctorNotes
                    );
                }
            } catch (err) { console.error('Email error:', err.message); }

            // ── SMS to patient
            if (resolvedPatientPhone) {
                try {
                    await twilioService.sendAppointmentConfirmedToPatient({
                        patientName,
                        patientPhone: resolvedPatientPhone,
                        doctorName,
                        appointmentDate: appointment.appointmentDate,
                        timeSlot: appointment.timeSlot,
                        consultationType: appointment.consultationType,
                        doctorNotes
                    });
                } catch (err) { console.error('SMS error:', err.message); }
            }

            // ── SMS to doctor
            if (resolvedDoctorPhone) {
                try {
                    await twilioService.sendAppointmentConfirmedToDoctor({
                        doctorName,
                        doctorPhone: resolvedDoctorPhone,
                        patientName,
                        appointmentDate: appointment.appointmentDate,
                        timeSlot: appointment.timeSlot
                    });
                } catch (err) { console.error('SMS error (doctor):', err.message); }
            }

        } else if (status === 'rejected') {
            // ── Email to patient
            try {
                if (appointment.patientId?.email) {
                    await emailService.sendAppointmentRejection(
                        appointment.patientId.email,
                        doctorName,
                        appointment.appointmentDate,
                        appointment.timeSlot,
                        rejectionReason
                    );
                }
            } catch (err) { console.error('Email error:', err.message); }

            // ── SMS to patient
            if (resolvedPatientPhone) {
                try {
                    await twilioService.sendAppointmentRejectedToPatient({
                        patientName,
                        patientPhone: resolvedPatientPhone,
                        doctorName,
                        appointmentDate: appointment.appointmentDate,
                        timeSlot: appointment.timeSlot,
                        rejectionReason
                    });
                } catch (err) { console.error('SMS error:', err.message); }
            }
        }

        res.json({
            success: true,
            message: `Appointment ${status} successfully`,
            appointment
        });
    } catch (error) {
        console.error('Update appointment error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// ─── Cancel appointment (by patient) ─────────────────────────────────────────
exports.cancelAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const patientId = req.user.userId;

        console.log(`Cancelling appointment: ${appointmentId} for patient: ${patientId}`);

        const appointment = await Appointment.findOne({ _id: appointmentId, patientId });
        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found or not owned by patient' });
        }

        appointment.status = 'cancelled';
        await appointment.save();

        // Use standard populate object syntax for cross-version compatibility
        await appointment.populate([
            { path: 'patientId', select: 'profile email' },
            { path: 'doctorId', select: 'profile email' }
        ]);

        const patientName = appointment.patientId?.profile?.name || 'Patient';
        const doctorName = appointment.doctorId?.profile?.name || 'Doctor';
        const patientPhone = appointment.patientId?.profile?.phone;
        const doctorPhone = appointment.doctorId?.profile?.phone;

        // ── Email cancellation (safely swallowed within service or handled here)
        try {
            if (appointment.doctorId?.email) {
                await emailService.sendCancellationNotification(
                    appointment.doctorId.email,
                    doctorName,
                    appointment.appointmentDate,
                    appointment.timeSlot,
                    patientName
                );
            }
        } catch (emailError) {
            console.error('Cancellation email failed:', emailError.message);
        }

        // ── SMS to patient
        if (patientPhone) {
            try {
                await twilioService.sendAppointmentCancelledToPatient({
                    patientName,
                    patientPhone,
                    doctorName,
                    appointmentDate: appointment.appointmentDate,
                    timeSlot: appointment.timeSlot
                });
            } catch (smsError) {
                console.error('Cancellation SMS failed (patient):', smsError.message);
            }
        }

        // ── SMS to doctor
        if (doctorPhone) {
            try {
                await twilioService.sendAppointmentCancelledToDoctor({
                    doctorName,
                    doctorPhone,
                    patientName,
                    appointmentDate: appointment.appointmentDate,
                    timeSlot: appointment.timeSlot
                });
            } catch (smsError) {
                console.error('Cancellation SMS failed (doctor):', smsError.message);
            }
        }

        res.json({
            success: true,
            message: 'Appointment cancelled successfully',
            appointment
        });
    } catch (error) {
        console.error('CRITICAL: Cancel appointment error:', error);
        res.status(500).json({ success: false, message: 'Server error during cancellation', error: error.message });
    }
};

// ─── Get available time slots for a doctor on a specific date ─────────────────
exports.getAvailableSlots = async (req, res) => {
    try {
        const { doctorId, date } = req.query;

        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const bookedAppointments = await Appointment.find({
            doctorId,
            appointmentDate: { $gte: startOfDay, $lte: endOfDay },
            status: { $in: ['requested', 'accepted'] }
        });

        const bookedSlots = bookedAppointments.map(apt => apt.timeSlot);

        // Standard time slots (9 AM to 4:30 PM)
        const allSlots = [
            '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
            '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
            '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
        ];

        const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));

        res.json({ success: true, availableSlots, bookedSlots });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
