const AuditLog = require('../models/AuditLog');

exports.getAuditLogs = async (req, res) => {
  try {
    const { senderWallet, receiverWallet, fileHash } = req.query;
    const filter = {};
    if (senderWallet) filter.senderWallet = senderWallet;
    if (receiverWallet) filter.receiverWallet = receiverWallet;
    if (fileHash) filter.fileHash = fileHash;
    const logs = await AuditLog.find(filter).sort({ timestamp: -1 });
    return res.json({ success: true, logs });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};