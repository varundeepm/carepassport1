const mongoose = require('mongoose');

const WalletSchema = new mongoose.Schema({
  address: { type: String, required: true, unique: true },
  userType: { type: String, enum: ['DOCTOR', 'PATIENT'], required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, refPath: 'userType', required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Wallet', WalletSchema);