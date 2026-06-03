const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  diseaseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Disease'
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  taskType: {
    type: String,
    enum: ['medication', 'appointment', 'lab_test', 'exercise', 'diet', 'monitoring', 'lifestyle', 'follow_up', 'emergency'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  frequency: {
    type: String,
    enum: ['once', 'daily', 'weekly', 'monthly', 'custom'],
    default: 'once'
  },
  customFrequency: {
    days: Number,
    hours: Number,
    minutes: Number
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  reminderTime: {
    type: Date
  },
  reminderFrequency: {
    type: String,
    enum: ['none', 'once', 'daily', 'weekly'],
    default: 'once'
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  skipped: {
    type: Boolean,
    default: false
  },
  skippedAt: {
    type: Date
  },
  skipReason: {
    type: String
  },
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileType: String,
    uploadedAt: Date
  }],
  notes: [{
    content: String,
    date: Date,
    author: String // patient or doctor
  }],
  relatedMedication: {
    name: String,
    dosage: String,
    instructions: String
  },
  relatedAppointment: {
    date: Date,
    type: String,
    location: String,
    doctor: String
  },
  relatedLabTest: {
    testName: String,
    instructions: String,
    fastingRequired: Boolean
  },
  aiInsights: {
    adherenceScore: Number, // 0-100
    riskLevel: String, // low, medium, high
    suggestions: [String],
    lastAnalyzed: Date
  },
  rewardPoints: {
    type: Number,
    default: 10 // Default reward for completing a task
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

taskSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for efficient queries
taskSchema.index({ patientId: 1, completed: 1 });
taskSchema.index({ doctorId: 1, taskType: 1 });
taskSchema.index({ reminderTime: 1, completed: 1 });

module.exports = mongoose.model('Task', taskSchema);
