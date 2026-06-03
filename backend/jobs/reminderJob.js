const cron = require('node-cron');
const Task = require('../models/Task');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const twilioService = require('../services/twilioService');

/**
 * ─── CarePassport Scheduled Reminder Jobs ────────────────────────────────────
 *
 * Three scheduled jobs run automatically:
 *
 *  1. Daily Task Reminders     – 9:00 AM every day
 *     Sends an SMS for every pending (incomplete) task whose endDate is today.
 *
 *  2. Overdue Task Alerts      – 8:00 AM every day
 *     Finds tasks whose endDate passed yesterday and are still not completed,
 *     and warns the patient.
 *
 *  3. Appointment Reminders    – 8:30 AM every day
 *     Sends an SMS reminder to both patient AND doctor for every appointment
 *     scheduled for tomorrow.
 */

const initReminderJobs = () => {
    console.log('⏰ Initialising CarePassport scheduled reminder jobs...');

    // ── 1. Daily Task Reminders – 9:00 AM ────────────────────────────────────
    cron.schedule('0 9 * * *', async () => {
        console.log('📋 [Reminder Job] Checking for tasks due today...');
        try {
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const todayEnd = new Date();
            todayEnd.setHours(23, 59, 59, 999);

            // Tasks ending today that are not yet completed
            const pendingTasks = await Task.find({
                completed: false,
                skipped: false,
                endDate: { $gte: todayStart, $lte: todayEnd }
            });

            console.log(`   ↳ Found ${pendingTasks.length} task(s) due today.`);

            for (const task of pendingTasks) {
                try {
                    const patient = await User.findById(task.patientId);
                    if (patient && patient.profile && patient.profile.phone) {
                        await twilioService.sendTaskReminder({
                            patientName: patient.profile.name || 'Patient',
                            phoneNumber: patient.profile.phone,
                            taskTitle: task.title,
                            dueDate: task.endDate
                        });
                    }
                } catch (err) {
                    console.error(`   ❌ Failed reminder for task ${task._id}:`, err.message);
                }
            }
        } catch (error) {
            console.error('❌ [Task Reminder Job] Error:', error.message);
        }
    });

    // ── 2. Overdue Task Alerts – 8:00 AM ─────────────────────────────────────
    cron.schedule('0 8 * * *', async () => {
        console.log('⚠️  [Overdue Job] Checking for overdue tasks...');
        try {
            const yesterdayEnd = new Date();
            yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
            yesterdayEnd.setHours(23, 59, 59, 999);

            // Tasks that ended before today and are still incomplete
            const overdueTasks = await Task.find({
                completed: false,
                skipped: false,
                endDate: { $lt: yesterdayEnd }
            });

            console.log(`   ↳ Found ${overdueTasks.length} overdue task(s).`);

            for (const task of overdueTasks) {
                try {
                    const patient = await User.findById(task.patientId);
                    if (patient && patient.profile && patient.profile.phone) {
                        await twilioService.sendTaskOverdue({
                            patientName: patient.profile.name || 'Patient',
                            phoneNumber: patient.profile.phone,
                            taskTitle: task.title
                        });
                    }
                } catch (err) {
                    console.error(`   ❌ Failed overdue alert for task ${task._id}:`, err.message);
                }
            }
        } catch (error) {
            console.error('❌ [Overdue Task Job] Error:', error.message);
        }
    });

    // ── 3. Appointment Reminders (Day-Before) – 8:30 AM ──────────────────────
    cron.schedule('30 8 * * *', async () => {
        console.log('📅 [Appointment Reminder Job] Checking for tomorrow\'s appointments...');
        try {
            const tomorrowStart = new Date();
            tomorrowStart.setDate(tomorrowStart.getDate() + 1);
            tomorrowStart.setHours(0, 0, 0, 0);

            const tomorrowEnd = new Date(tomorrowStart);
            tomorrowEnd.setHours(23, 59, 59, 999);

            const upcomingAppointments = await Appointment.find({
                appointmentDate: { $gte: tomorrowStart, $lte: tomorrowEnd },
                status: 'accepted'
            })
                .populate('patientId', 'profile email')
                .populate('doctorId', 'profile email');

            console.log(`   ↳ Found ${upcomingAppointments.length} appointment(s) for tomorrow.`);

            for (const appt of upcomingAppointments) {
                const patientName = appt.patientId?.profile?.name || 'Patient';
                const doctorName = appt.doctorId?.profile?.name || 'Doctor';
                const patientPhone = appt.patientId?.profile?.phone;
                const doctorPhone = appt.doctorId?.profile?.phone;

                // SMS to patient
                if (patientPhone) {
                    try {
                        await twilioService.sendSMS(
                            patientPhone,
                            `⏰ CarePassport Reminder\nHi ${patientName}, your appointment with Dr. ${doctorName} is TOMORROW:\nDate: ${new Date(appt.appointmentDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}\nTime: ${appt.timeSlot}\nType: ${appt.consultationType || 'In-Person'}\nPlease be ready 10 minutes early!`
                        );
                    } catch (err) {
                        console.error(`   ❌ Patient reminder SMS failed for appt ${appt._id}:`, err.message);
                    }
                }

                // SMS to doctor
                if (doctorPhone) {
                    try {
                        await twilioService.sendSMS(
                            doctorPhone,
                            `📅 CarePassport Reminder\nDr. ${doctorName}, you have an appointment with ${patientName} TOMORROW:\nDate: ${new Date(appt.appointmentDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}\nTime: ${appt.timeSlot}\nType: ${appt.consultationType || 'In-Person'}`
                        );
                    } catch (err) {
                        console.error(`   ❌ Doctor reminder SMS failed for appt ${appt._id}:`, err.message);
                    }
                }
            }
        } catch (error) {
            console.error('❌ [Appointment Reminder Job] Error:', error.message);
        }
    });

    console.log('✅ Reminder jobs scheduled:');
    console.log('   • Task reminders    → daily at 09:00 AM');
    console.log('   • Overdue alerts    → daily at 08:00 AM');
    console.log('   • Appt reminders    → daily at 08:30 AM');
};

module.exports = { initReminderJobs };
