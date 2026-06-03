const FileTransfer = require('../models/FileTransfer');
const AuditLog = require('../models/AuditLog');

exports.initiateTransfer = async (req, res) => {
  try {
    const { fileHash, ipfsLink, senderWallet, receiverWallet, metadata } = req.body;
    // TODO: Integrate with blockchain smart contract
    // For now, stub blockchain call
    // Save transfer record
    const transfer = await FileTransfer.create({
      fileHash,
      ipfsLink,
      senderWallet,
      receiverWallet,
      status: 'COMPLETED',
      metadata,
      completedAt: new Date(),
    });
    // Log audit
    await AuditLog.create({
      senderWallet,
      receiverWallet,
      fileHash,
      ipfsLink,
      action: 'TRANSFER',
      metadata,
    });
    return res.json({ success: true, transfer });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};