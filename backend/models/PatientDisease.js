const mongoose = require('mongoose');

const patientDiseaseSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true,
    ref: 'Patient'
  },
  diseaseId: {
    type: String,
    required: true,
    ref: 'Disease'
  },
  doctorId: {
    type: String,
    required: true,
    ref: 'Doctor'
  },
  diagnosisDate: {
    type: Date,
    required: true
  },
  currentStatus: {
    type: String,
    enum: ['active', 'in_remission', 'cured', 'monitoring', 'chronic'],
    default: 'active'
  },
  severity: {
    type: String,
    enum: ['mild', 'moderate', 'severe', 'critical'],
    default: 'moderate'
  },
  symptoms: [{
    symptom: String,
    severity: String,
    dateReported: Date,
    notes: String
  }],
  medications: [{
    name: String,
    dosage: String,
    frequency: String,
    startDate: Date,
    endDate: Date,
    isActive: {
      type: Boolean,
      default: true
    },
    sideEffects: [String],
    adherence: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor'],
      default: 'good'
    }
  }],
  vitalSigns: [{
    date: Date,
    bloodPressure: String,
    heartRate: Number,
    temperature: Number,
    weight: Number,
    notes: String
  }],
  labResults: [{
    testName: String,
    testDate: Date,
    result: String,
    normalRange: String,
    status: {
      type: String,
      enum: ['normal', 'abnormal', 'critical'],
      default: 'normal'
    },
    notes: String
  }],
  appointments: [{
    date: Date,
    type: String, // follow-up, consultation, emergency
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'no_show'],
      default: 'scheduled'
    },
    notes: String
  }],
  treatmentPlan: {
    shortTerm: [String],
    longTerm: [String],
    goals: [String],
    milestones: [{
      description: String,
      targetDate: Date,
      achieved: {
        type: Boolean,
        default: false
      }
    }]
  },
  riskFactors: [{
    factor: String,
    severity: String,
    mitigation: String
  }],
  emergencyContacts: [{
    name: String,
    relationship: String,
    phone: String,
    email: String
  }],
  notes: [{
    date: Date,
    doctorId: String,
    content: String,
    type: {
      type: String,
      enum: ['progress', 'concern', 'improvement', 'medication_change'],
      default: 'progress'
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

patientDiseaseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
patientDiseaseSchema.index({ patientId: 1, diseaseId: 1 });
patientDiseaseSchema.index({ doctorId: 1, currentStatus: 1 });

module.exports = mongoose.model('PatientDisease', patientDiseaseSchema);
