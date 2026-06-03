const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  organizationName: { type: String },

  diseaseCategory: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  diseaseCategoryName: {
    type: String,
    required: true,
    enum: [
      'Viral (Infectious) Liver Diseases',
      'Metabolic & Fatty Liver Diseases',
      'Alcohol-Related Liver Diseases',
      'Autoimmune Liver Diseases',
      'Genetic / Hereditary Liver Disorders',
      'Drug-Induced & Toxic Liver Injury',
      'Vascular Liver Diseases',
      'Chronic Liver Disease & Complications',
      'Liver Failure',
      'Liver Cancer'
    ]
  },

  medicalHistory: [{
    condition: String,
    diagnosedDate: Date
  }],

  analytics: {
    lastUpdated: { type: Date, default: Date.now },
    liverEnzymes: {
      alt: { type: Number, default: 0 },
      ast: { type: Number, default: 0 },
      alp: { type: Number, default: 0 },
      bilirubin: { type: Number, default: 0 }
    },
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low'
    }
  },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Patient', PatientSchema);