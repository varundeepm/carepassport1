const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

// If set, ALL SMS is redirected to this number (useful for Twilio trial accounts
// which can only send to verified numbers). Remove from .env in production.
const testNumber = process.env.TWILIO_TEST_NUMBER
    ? process.env.TWILIO_TEST_NUMBER.replace(/\s+/g, '')
    : null;

// Only initialise the real client if real credentials exist
let client = null;
const hasCredentials =
    accountSid &&
    authToken &&
    twilioNumber &&
    accountSid !== 'your_twilio_account_sid_here' &&
    !accountSid.startsWith('ACXXXXXXXX');

if (hasCredentials) {
    try {
        client = twilio(accountSid, authToken);
        console.log('✅ Twilio client initialised successfully');
        if (testNumber) {
            console.log(`🔀 TWILIO_TEST_NUMBER is set → all SMS will be sent to ${testNumber}`);
        }
    } catch (err) {
        console.warn('⚠️  Twilio client failed to initialise:', err.message);
    }
} else {
    console.log('ℹ️  Twilio credentials not configured – SMS will be mock-logged to console.');
}

/**
 * Normalise a phone number to E.164 format.
 * If the number already starts with '+' it is returned as-is.
 * Otherwise a leading '0' is replaced with the Indian country code (+91).
 */
const normalisePhone = (phone) => {
    if (!phone) return null;
    const cleaned = phone.replace(/\s+/g, '').replace(/-/g, '');
    if (cleaned.startsWith('+')) return cleaned;
    if (cleaned.startsWith('0')) return '+91' + cleaned.slice(1);
    // Assume Indian number if 10 digits
    if (/^\d{10}$/.test(cleaned)) return '+91' + cleaned;
    return cleaned;
};

/**
 * Core SMS sender – all public methods delegate here.
 * If TWILIO_TEST_NUMBER is set, the message is always delivered to that
 * number (the real recipient is shown in the console log for reference).
 */
const sendSMS = async (to, body) => {
    const normalisedTo = normalisePhone(to);

    if (!normalisedTo) {
        console.warn('⚠️  SMS skipped: no phone number provided.');
        return { success: false, reason: 'No phone number' };
    }

    // Redirect to test number if configured (Twilio trial restriction workaround)
    const destination = testNumber || normalisedTo;
    if (testNumber && testNumber !== normalisedTo) {
        console.log(`🔀 [TEST OVERRIDE] Redirecting SMS from ${normalisedTo} → ${testNumber}`);
    }

    if (!client) {
        console.log(`📱 [MOCK SMS → ${destination}]:\n  ${body}`);
        return { success: true, mock: true };
    }

    try {
        const message = await client.messages.create({
            body,
            from: twilioNumber,
            to: destination,
        });
        console.log(`✅ SMS sent to ${destination} | SID: ${message.sid}`);
        return { success: true, sid: message.sid };
    } catch (err) {
        console.error(`❌ Failed to send SMS to ${destination}:`, err.message);
        return { success: false, error: err.message };
    }
};

// ─── Task Notifications ───────────────────────────────────────────────────────

/**
 * Notify a patient that their doctor has assigned a new task.
 */
const sendTaskAssigned = async ({ patientName, phoneNumber, taskTitle, taskType, rewardPoints, doctorName }) => {
    const body =
        `🏥 CarePassport\n` +
        `Hi ${patientName}, your doctor${doctorName ? ' Dr. ' + doctorName : ''} has assigned you a new ${taskType} task:\n` +
        `"${taskTitle}"\n` +
        `Complete it to earn ${rewardPoints} reward points! Log in to CarePassport to view details.`;
    return sendSMS(phoneNumber, body);
};

/**
 * Notify a patient of a task reminder.
 */
const sendTaskReminder = async ({ patientName, phoneNumber, taskTitle, dueDate }) => {
    const dueDateStr = dueDate
        ? new Date(dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
        : 'soon';
    const body =
        `⏰ CarePassport Reminder\n` +
        `Hi ${patientName}, don't forget to complete your health task:\n` +
        `"${taskTitle}"\n` +
        `Due: ${dueDateStr}. Stay on track with your health goals!`;
    return sendSMS(phoneNumber, body);
};

/**
 * Notify a patient that they completed a task and earned points.
 */
const sendTaskCompleted = async ({ patientName, phoneNumber, taskTitle, rewardPoints, totalPoints }) => {
    const body =
        `🎉 CarePassport\n` +
        `Great job, ${patientName}! You completed:\n` +
        `"${taskTitle}"\n` +
        `+${rewardPoints} points earned. Total: ${totalPoints} points. Keep it up!`;
    return sendSMS(phoneNumber, body);
};

/**
 * Notify a patient of an overdue task.
 */
const sendTaskOverdue = async ({ patientName, phoneNumber, taskTitle }) => {
    const body =
        `⚠️ CarePassport – Overdue Task\n` +
        `Hi ${patientName}, your health task:\n` +
        `"${taskTitle}"\n` +
        `is now overdue. Please complete it as soon as possible and update your doctor.`;
    return sendSMS(phoneNumber, body);
};

// ─── Appointment Notifications ────────────────────────────────────────────────

/**
 * Notify a DOCTOR that a patient has requested an appointment.
 */
const sendAppointmentRequestToDoctor = async ({
    doctorName,
    doctorPhone,
    patientName,
    appointmentDate,
    timeSlot,
    consultationType,
    reason,
}) => {
    const dateStr = new Date(appointmentDate).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
    });
    const body =
        `CarePassport: New request from ${patientName}.\n` +
        `Date: ${dateStr}, ${timeSlot}.\n` +
        `Type: ${consultationType || 'In-Person'}. Log in to CarePassport to view.`;
    return sendSMS(doctorPhone, body);
};

/**
 * Notify a PATIENT that they successfully booked an appointment.
 */
const sendAppointmentRequestToPatient = async ({
    patientName,
    patientPhone,
    doctorName,
    appointmentDate,
    timeSlot,
    consultationType,
}) => {
    const dateStr = new Date(appointmentDate).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
    });
    const body =
        `CarePassport: Appointment request submitted with Dr. ${doctorName}.\n` +
        `Date: ${dateStr}, ${timeSlot}.\n` +
        `We will notify you when the doctor responds.`;
    return sendSMS(patientPhone, body);
};

/**
 * Notify a PATIENT that their appointment has been confirmed.
 */
const sendAppointmentConfirmedToPatient = async ({
    patientName,
    patientPhone,
    doctorName,
    appointmentDate,
    timeSlot,
    consultationType,
    doctorNotes,
}) => {
    const dateStr = new Date(appointmentDate).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
    });
    const body =
        `CarePassport: Appointment CONFIRMED with Dr. ${doctorName}.\n` +
        `Date: ${dateStr}, ${timeSlot}.\n` +
        (doctorNotes ? `Note: ${doctorNotes}` : 'See you there!');
    return sendSMS(patientPhone, body);
};

/**
 * Notify a DOCTOR that they confirmed an appointment (doctor's own confirmation copy).
 */
const sendAppointmentConfirmedToDoctor = async ({
    doctorName,
    doctorPhone,
    patientName,
    appointmentDate,
    timeSlot,
}) => {
    const dateStr = new Date(appointmentDate).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
    });
    const body =
        `CarePassport: You confirmed appointment with ${patientName}.\n` +
        `Date: ${dateStr}, ${timeSlot}. Patient has been notified.`;
    return sendSMS(doctorPhone, body);
};

/**
 * Notify a PATIENT that their appointment was rejected.
 */
const sendAppointmentRejectedToPatient = async ({
    patientName,
    patientPhone,
    doctorName,
    appointmentDate,
    timeSlot,
    rejectionReason,
}) => {
    const dateStr = new Date(appointmentDate).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
    });
    const body =
        `CarePassport: Dr. ${doctorName} could not accept appt on ${dateStr}.\n` +
        (rejectionReason ? `Reason: ${rejectionReason}. ` : '') +
        `Please try booking a different slot.`;
    return sendSMS(patientPhone, body);
};

/**
 * Notify a PATIENT that their appointment was cancelled.
 */
const sendAppointmentCancelledToPatient = async ({
    patientName,
    patientPhone,
    doctorName,
    appointmentDate,
    timeSlot,
}) => {
    const dateStr = new Date(appointmentDate).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
    });
    const body =
        `CarePassport: Appt with Dr. ${doctorName} on ${dateStr} is CANCELLED.\n` +
        `Please visit CarePassport if you need to rebook.`;
    return sendSMS(patientPhone, body);
};

/**
 * Notify a DOCTOR that an appointment was cancelled by the patient.
 */
const sendAppointmentCancelledToDoctor = async ({
    doctorName,
    doctorPhone,
    patientName,
    appointmentDate,
    timeSlot,
}) => {
    const dateStr = new Date(appointmentDate).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
    });
    const body =
        `CarePassport: ${patientName} has cancelled appointment for ${dateStr}.\n` +
        `This slot (${timeSlot}) is now available again.`;
    return sendSMS(doctorPhone, body);
};

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
    sendSMS,
    // Task
    sendTaskAssigned,
    sendTaskReminder,
    sendTaskCompleted,
    sendTaskOverdue,
    // Appointment
    sendAppointmentRequestToDoctor,
    sendAppointmentRequestToPatient,
    sendAppointmentConfirmedToPatient,
    sendAppointmentConfirmedToDoctor,
    sendAppointmentRejectedToPatient,
    sendAppointmentCancelledToPatient,
    sendAppointmentCancelledToDoctor,
};
