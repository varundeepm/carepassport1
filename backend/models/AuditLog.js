const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  senderWallet: { type: String, required: true },
  receiverWallet: { type: String, required: true },
  fileHash: { type: String, required: true },
  ipfsLink: { type: String, required: true },
  action: { type: String, enum: ['UPLOAD', 'TRANSFER', 'DOWNLOAD'], required: true },
  timestamp: { type: Date, default: Date.now },
  metadata: { type: Object },
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);