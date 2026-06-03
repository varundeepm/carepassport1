const mongoose = require('mongoose');

const medicalFileSchema = new mongoose.Schema({
  // Relationship fields
  patientId: {
    type: String,
    required: true,
    ref: 'Patient'
  },
  doctorId: {
    type: String,
    required: true
  },
  recordId: {
    type: String,
    required: true,
    ref: 'PatientRecord'
  },
  
  // File identification
  fileId: {
    type: String,
    required: true,
    unique: true
  },
  
  // File details
  fileName: {
    type: String,
    required: true,
    trim: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true,
    enum: ['xray', 'mri', 'blood-test', 'ecg', 'prescription', 'report', 'image', 'document', 'other']
  },
  
  // File storage
  filePath: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  
  // File metadata
  fileSize: {
    type: Number,
    required: true // Size in bytes
  },
  mimeType: {
    type: String,
    required: true
  },
  
  // Upload details
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  uploadedBy: {
    type: String,
    required: true // Doctor's ID who uploaded
  },
  
  // Medical context
  description: {
    type: String,
    trim: true
  },
  diagnosis: {
    type: String,
    trim: true
  },
  symptoms: [{
    type: String
  }],
  labResults: {
    type: mongoose.Schema.Types.Mixed // Store lab data as JSON
  },
  
  // Privacy and security
  isSensitive: {
    type: Boolean,
    default: false
  },
  accessLevel: {
    type: String,
    enum: ['public', 'doctor-only', 'patient-view', 'restricted'],
    default: 'doctor-only'
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['uploading', 'processing', 'ready', 'error', 'archived'],
    default: 'ready'
  },
  processingStatus: {
    type: String,
    enum: ['pending', 'analyzing', 'completed', 'failed'],
    default: 'pending'
  },
  
  // Analysis results (for AI/ML processing)
  analysisResults: {
    type: mongoose.Schema.Types.Mixed
  },
  
  // Sharing and collaboration
  sharedWith: [{
    doctorId: String,
    sharedAt: Date,
    permissions: [{
      type: String,
      enum: ['view', 'download', 'comment', 'modify']
    }]
  }],
  
  // Version control
  version: {
    type: Number,
    default: 1
  },
  previousVersions: [{
    versionId: String,
    filePath: String,
    uploadedAt: Date
  }],
  
  // Tags for categorization
  tags: [{
    type: String
  }],
  
  // Comments and notes
  comments: [{
    doctorId: String,
    comment: String,
    addedAt: Date,
    isInternal: {
      type: Boolean,
      default: true
    }
  }]
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Create indexes for better performance
medicalFileSchema.index({ patientId: 1, doctorId: 1 });
medicalFileSchema.index({ recordId: 1 });
medicalFileSchema.index({ fileType: 1 });
medicalFileSchema.index({ uploadedAt: -1 });
medicalFileSchema.index({ status: 1 });
medicalFileSchema.index({ tags: 1 });

// Text search index
medicalFileSchema.index({ 
  fileName: 'text', 
  description: 'text', 
  diagnosis: 'text',
  tags: 'text' 
});

// Virtual for file size in human readable format
medicalFileSchema.virtual('fileSizeFormatted').get(function() {
  const bytes = this.fileSize;
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

// Virtual for file extension
medicalFileSchema.virtual('fileExtension').get(function() {
  return this.originalName.split('.').pop().toLowerCase();
});

// Virtual for file age
medicalFileSchema.virtual('ageInDays').get(function() {
  const now = new Date();
  const uploaded = this.uploadedAt;
  const diffTime = Math.abs(now - uploaded);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Ensure virtuals are included in JSON output
medicalFileSchema.set('toJSON', { virtuals: true });
medicalFileSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('MedicalFile', medicalFileSchema);
