const nodemailer = require('nodemailer');

// Create transporter for Gmail – returns null if credentials are missing/invalid
const createTransporter = () => {
    try {
        if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
            console.warn('⚠️  Gmail credentials not configured – emails will be skipped.');
            return null;
        }
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD
            }
        });
    } catch (err) {
        console.warn('⚠️  Failed to create email transporter:', err.message);
        return null;
    }
};

// Send appointment request notification to doctor
exports.sendAppointmentRequest = async (doctorEmail, patientName, patientEmail, appointmentDate, timeSlot, reason) => {
    try {
        const transporter = createTransporter();
        if (!transporter) return false;

        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: doctorEmail,
            subject: `New Appointment Request from ${patientName}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #667eea;">📅 New Appointment Request</h2>
                    <p>You have received a new appointment request:</p>
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>Patient:</strong> ${patientName}</p>
                        <p><strong>Email:</strong> ${patientEmail}</p>
                        <p><strong>Date:</strong> ${new Date(appointmentDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        <p><strong>Time:</strong> ${timeSlot}</p>
                        <p><strong>Reason:</strong> ${reason}</p>
                    </div>
                    <p>Please log in to your CarePassport account to accept or reject this appointment.</p>
                    <a href="http://localhost:5173/doctor/appointments" style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">
                        Review Appointment
                    </a>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('Appointment request email sent to doctor');
        return true;
    } catch (error) {
        console.error('Error sending appointment request email:', error);
        return false;
    }
};

// Send appointment confirmation to patient
exports.sendAppointmentConfirmation = async (patientEmail, doctorName, appointmentDate, timeSlot, doctorNotes) => {
    try {
        const transporter = createTransporter();
        if (!transporter) return false;

        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: patientEmail,
            subject: `Appointment Confirmed with Dr. ${doctorName}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #11998e;">✅ Appointment Confirmed</h2>
                    <p>Great news! Your appointment has been confirmed.</p>
                    <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>Doctor:</strong> Dr. ${doctorName}</p>
                        <p><strong>Date:</strong> ${new Date(appointmentDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        <p><strong>Time:</strong> ${timeSlot}</p>
                        ${doctorNotes ? `<p><strong>Doctor's Notes:</strong> ${doctorNotes}</p>` : ''}
                    </div>
                    <p style="color: #666;">Please arrive 10 minutes early for your appointment.</p>
                    <a href="http://localhost:5173/patient/appointments" style="display: inline-block; background: #11998e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">
                        View Appointment
                    </a>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('Appointment confirmation email sent to patient');
        return true;
    } catch (error) {
        console.error('Error sending confirmation email:', error);
        return false;
    }
};

// Send appointment rejection to patient
exports.sendAppointmentRejection = async (patientEmail, doctorName, appointmentDate, timeSlot, rejectionReason) => {
    try {
        const transporter = createTransporter();
        if (!transporter) return false;

        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: patientEmail,
            subject: `Appointment Update from Dr. ${doctorName}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #f44336;">❌ Appointment Not Available</h2>
                    <p>Unfortunately, your appointment request could not be accepted.</p>
                    <div style="background: #ffebee; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>Doctor:</strong> Dr. ${doctorName}</p>
                        <p><strong>Requested Date:</strong> ${new Date(appointmentDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        <p><strong>Requested Time:</strong> ${timeSlot}</p>
                        <p><strong>Reason:</strong> ${rejectionReason}</p>
                    </div>
                    <p>Please try booking another time slot or contact the clinic directly.</p>
                    <a href="http://localhost:5173/patient/book-appointment" style="display: inline-block; background: #f44336; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">
                        Book New Appointment
                    </a>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('Appointment rejection email sent to patient');
        return true;
    } catch (error) {
        console.error('Error sending rejection email:', error);
        return false;
    }
};

// Send cancellation notification
exports.sendCancellationNotification = async (recipientEmail, recipientName, appointmentDate, timeSlot, cancelledBy) => {
    try {
        const transporter = createTransporter();
        if (!transporter) return false;

        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: recipientEmail,
            subject: `Appointment Cancelled`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #ff9800;">🚫 Appointment Cancelled</h2>
                    <p>This appointment has been cancelled.</p>
                    <div style="background: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>Date:</strong> ${new Date(appointmentDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        <p><strong>Time:</strong> ${timeSlot}</p>
                        <p><strong>Cancelled by:</strong> ${cancelledBy}</p>
                    </div>
                    <p>If you have any questions, please contact us.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('Cancellation notification sent');
        return true;
    } catch (error) {
        console.error('Error sending cancellation email:', error);
        return false;
    }
};
