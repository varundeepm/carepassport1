const mongoose = require('mongoose');

const diseaseSchema = new mongoose.Schema({
  diseaseId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['cardiovascular', 'respiratory', 'neurological', 'endocrine', 'gastrointestinal', 'musculoskeletal', 'dermatological', 'psychiatric', 'infectious', 'other'],
    required: true
  },
  severity: {
    type: String,
    enum: ['mild', 'moderate', 'severe', 'critical'],
    default: 'moderate'
  },
  description: {
    type: String,
    required: true
  },
  symptoms: [{
    type: String
  }],
  riskFactors: [{
    type: String
  }],
  treatmentOptions: [{
    name: String,
    description: String,
    effectiveness: String
  }],
  medications: [{
    name: String,
    dosage: String,
    frequency: String,
    sideEffects: [String]
  }],
  lifestyleRecommendations: [{
    category: String, // diet, exercise, stress, sleep
    recommendations: [String]
  }],
  monitoringRequirements: [{
    type: String, // blood tests, imaging, vital signs
    frequency: String,
    description: String
  }],
  emergencySigns: [{
    symptom: String,
    action: String,
    urgency: String // immediate, within_hours, within_days
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

diseaseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Disease', diseaseSchema);
