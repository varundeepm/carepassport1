const crypto = require('crypto');
const FileTransfer = require('../models/FileTransfer');

const blockchainService = {
    /**
     * Simulate a secure file transfer on the blockchain
     */
    initiateTransfer: async (fileId, senderWallet, receiverWallet, metadata = {}) => {
        try {
            // 1. Generate a mock content hash (simulating IPFS/Blockchain immutability)
            const fileHash = crypto.createHash('sha256')
                .update(`${fileId}-${Date.now()}`)
                .digest('hex');

            const ipfsLink = `https://ipfs.io/ipfs/Qm${fileHash.substring(0, 44)}`;

            // 2. Create the transfer record
            const transfer = new FileTransfer({
                fileId,
                fileHash,
                ipfsLink,
                senderWallet,
                receiverWallet,
                status: 'COMPLETED', // Simulating successful blockchain mining
                metadata: {
                    ...metadata,
                    originalFileId: fileId,
                    blockchainSyncDate: new Date()
                },
                completedAt: new Date()
            });

            await transfer.save();

            return {
                success: true,
                transactionId: `0x${crypto.randomBytes(32).toString('hex')}`,
                fileHash,
                ipfsLink,
                transfer
            };
        } catch (error) {
            console.error('Error in blockchain simulation:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Verify file integrity against blockchain hash
     */
    verifyIntegrity: async (providedHash) => {
        const record = await FileTransfer.findOne({
            $or: [{ fileHash: providedHash }, { fileId: providedHash }]
        });
        return {
            success: !!record,
            verified: !!record,
            originalMetadata: record ? record.metadata : null
        };
    }
};

module.exports = blockchainService;
