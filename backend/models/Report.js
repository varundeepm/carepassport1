const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  title: { type: String, required: true },
  reportType: {
    type: String,
    enum: ['Lab Result', 'Radiology', 'Prescription', 'Consultation', 'general'],
    default: 'general'
  },

  fileHash: { type: String }, // Unique file identifier
  ipfsHash: { type: String }, // For decentralized storage
  blockchainTxHash: { type: String }, // For transaction proof

  fileMetadata: {
    fileName: String,
    fileSize: Number,
    mimeType: String
  },

  // Data visualization values extracted from the report
  extractedData: {
    alt: Number,
    ast: Number,
    alp: Number,
    bilirubin: Number,
    albumin: Number,
    inr: Number
  },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', ReportSchema);
