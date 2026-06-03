const mongoose = require('mongoose');

const FileTransferSchema = new mongoose.Schema({
  fileId: { type: String, required: true },
  fileHash: { type: String, required: true },
  ipfsLink: { type: String, required: true },
  senderWallet: { type: String, required: true },
  receiverWallet: { type: String, required: true },
  status: { type: String, enum: ['PENDING', 'COMPLETED', 'FAILED'], default: 'PENDING' },
  metadata: { type: Object },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
});

module.exports = mongoose.model('FileTransfer', FileTransferSchema);