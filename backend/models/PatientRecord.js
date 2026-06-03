const mongoose = require('mongoose');

const medicalFileSchema = new mongoose.Schema({
  fileId: { type: String, required: true },
  fileName: { type: String, required



: true },
  fileType: { 
    type: String, 
    required: true,
    enum: ['xray', 'mri', 'blood-test', 'ecg', 'prescription', 'report', 'image', 'document']
  },
  filePath: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now }
});

const patientRecordSchema = new mongoose.Schema({
  // Relationship fields
  patientId: {
    type: String,
    required: true,
    ref: 'Patient'
  },
  patientName: {
    type: String,
    required: true,
    trim: true
  },
  doctorId: {
    type: String,
    required: true
  },
  doctorName: {
    type: String,
    required: true,
    trim: true
  },
  
  // Visit details
  hospital: {
    type: String,
    required: true,
    trim: true
  },
  visitDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  // Medical information
  prescription: {
    type: String,
    required: true,
    trim: true
  },
  suggestions: {
    type: String,
    trim: true
  },
  patientDetails: {
    type: String,
    trim: true
  },
  
  // Medical files attached to this record
  files: [medicalFileSchema],
  
  // Status tracking
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled', 'archived'],
    default: 'active'
  },
  
  // Digital signatures and approvals
  doctorSignature: {
    type: String,
    required: false
  },
  approvedAt: {
    type: Date,
    default: null
  },
  
  // Additional medical data
  vitalSigns: {
    bloodPressure: String,
    heartRate: String,
    temperature: String,
    weight: String,
    height: String
  },
  
  diagnosis: [{
    primary: { type: String },
    secondary: [String],
    icdCode: String
  }],
  
  treatmentPlan: {
    medications: [{
      name: String,
      dosage: String,
      frequency: String,
      duration: String,
      instructions: String
    }],
    procedures: [String],
    followUpRequired: Boolean,
    nextVisitDate: Date
  },
  
  // Lab results and test data
  labResults: [{
    testName: String,
    result: String,
    normalRange: String,
    status: {
      type: String,
      enum: ['normal', 'abnormal', 'critical', 'pending']
    },
    testDate: Date,
    labName: String
  }],
  
  // Patient-reported symptoms
  symptoms: [{
    symptom: String,
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe'],
      default: 'moderate'
    },
    duration: String,
    notes: String
  }],
  
  // Clinical notes
  clinicalNotes: {
    chiefComplaint: String,
    historyOfPresentIllness: String,
    physicalExamination: String,
    assessment: String,
    plan: String
  },
  
  // Follow-up information
  followUpNotes: [{
    date: Date,
    notes: String,
    doctorId: String,
    doctorName: String
  }],
  
  // Insurance and billing
  billingInfo: {
    insuranceProvider: String,
    policyNumber: String,
    coPayment: Number,
    totalCost: Number,
    billingStatus: {
      type: String,
      enum: ['pending', 'submitted', 'approved', 'paid', 'rejected'],
      default: 'pending'
    }
  },
  
  // Privacy and compliance
  patientConsent: {
    documentSharing: { type: Boolean, default: false },
    third PartySharing: { type: Boolean, default: false },
    consentDate: Date,
    consentForm: String // Base64 or file path
  },
  
  // Audit trail
  createdBy: {
    type: String,
    required:**

 true // Doctor or staff member who created the record
  },
  lastModifiedBy: String,
  modifications: [{
    modifiedAt: Date,
    modifiedBy: String,
    changes: String,
    reason: String
  }]
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Indexes for better query performance
patientRecordSchema.index({ patientId: 1, doctorId: 1 });
patientRecordSchema.index({ visitDate: -1 });
patientRecordSchema.index({ hospital: 1 });
patientRecordSchema.index({ status: 1 });
patientRecordSchema.index({ 'files.fileType': 1 });

// Text search index
patientRecordSchema.index({
  patientName: 'text',
  doctorName: 'text',
  hospital: 'text',
  prescription: 'text',
  suggestions: 'text',
  patientDetails: 'text'
});

// Virtual for formatted visit date
patientRecordSchema.virtual('visitDateFormatted').get(function() {
  return this.visitDate.toLocaleDateString();
});

// Virtual for file count by type
patientRecordSchema.virtual('fileSummary').get(function() {
  const summary = {};
  this.files.forEach(file => {
    summary[file.fileType] = (summary[file.fileType] || 0) + 1;
  });
  return summary;
});

// Virtual for formatted prescription preview
patientRecordSchema.virtual('prescriptionPreview').get(function() {
  if (this.prescription.length <= 100) {
    return this.prescription;
  }
  return this.prescription.substring(0, 100) + '...';
});

// Ensure virtuals are included in JSON output
patientRecordSchema.set('toJSON', { virtuals: true });
patientRecordSchema.set('toObject', { virtuals: true });

// Pre-save middleware to validate data
patientRecordSchema.pre('save', function(next) {
  // Ensure patient details are provided
  if (!this.patientDetails && this.prescription) {
    this.patientDetails = 'Prescription: ' + this.prescription;
  }
  
  // Update modification tracking
  this.lastModifiedBy = this.createdBy;
  
  next();
});

// Static method to find records by patient
patientRecordSchema.statics.findByPatient = function(patientId) {
  return this.find({ patientId }).sort({ visitDate: -1 });
};

// Static method to find records by doctor
patientRecordSchema.statics.findByDoctor = function(doctorId) {
  return this.find({ doctorId }).sort({ visitDate: -1 });
};

// Instance method to add file to record
patientRecordSchema.methods.addFile = function(fileData) {
  this.files.push({
    fileId: fileData.id,
    fileName: fileData.name,
    fileType: fileData.type,
    filePath: fileData.url,
    uploadedAt: new Date()
  });
  return this.save();
};

// Instance method to get files by type
patientRecordSchema.methods.getFilesByType = function(fileType) {
  return this.files.filter(file => file.fileType === fileType);
};

module.exports = mongoose.model('PatientRecord', patientRecordSchema);