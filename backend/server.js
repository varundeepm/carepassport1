require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Scheduled Jobs (only run in non-serverless / local environments)
const { initReminderJobs } = require('./jobs/reminderJob');

const app = express();

// ─── CORS ────────────────────────────────────────────────────────────────────
// vercel.json headers do NOT apply to serverless function responses.
// CORS must be set by Express middleware directly.
app.use(cors({
  origin: [process.env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// ─── Database Connection ───────────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/carepassport_v2')
  .then(() => {
    console.log('✅ Connected to MongoDB (CarePassport V2)');
    // Cron jobs use node-cron which requires a persistent process.
    // On Vercel (serverless), functions are ephemeral — skip cron jobs in production.
    if (process.env.NODE_ENV !== 'production') {
      initReminderJobs();
    } else {
      console.log('ℹ️  Skipping cron jobs (serverless/production environment).');
    }
  })
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Route Imports
const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const medicalFileRoutes = require('./routes/medicalFiles');
const appointmentRoutes = require('./routes/appointments');
const chatRoutes = require('./routes/chat');
const taskRoutes = require('./routes/task');

// Register Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/reports', medicalFileRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/tasks', taskRoutes);

// Health Check
app.get('/', (req, res) => {
  res.json({ message: 'CarePassport API is running!', docs: '/api/health' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'Healthy', version: '2.0.0', network: 'Simulated Sui/Walrus' });
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 CarePassport Backend running on port ${PORT}`);
  });
}

module.exports = app;