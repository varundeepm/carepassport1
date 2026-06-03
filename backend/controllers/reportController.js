const Report = require('../models/Report');
const Patient = require('../models/Patient');
const FileTransfer = require('../models/FileTransfer');
const blockchainService = require('../utils/blockchainService');
const path = require('path');
const fs = require('fs');

// ─── Upload a report and simulate blockchain wallet-to-wallet transfer ─────────
exports.uploadReport = async (req, res) => {
    try {
        const { patientId, reportType, title } = req.body;  // patientId = User._id from frontend
        const doctorId = req.user.userId;

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        // ── BUG FIX: frontend sends User._id, so find the Patient record via userId ──
        const patientRecord = await Patient.findOne({ userId: patientId }).populate('userId');
        if (!patientRecord) {
            return res.status(404).json({
                success: false,
                message: 'Patient record not found. Ensure this user is linked to you as a patient.'
            });
        }

        // Simulate AI liver data extraction
        const extractedData = {
            alt: Math.floor(Math.random() * 50) + 20,
            ast: Math.floor(Math.random() * 40) + 15,
            alp: Math.floor(Math.random() * 100) + 50,
            bilirubin: parseFloat((Math.random() * 2).toFixed(1)),
            albumin: parseFloat((Math.random() * 2 + 3).toFixed(1)),
            inr: parseFloat((Math.random() * 0.5 + 0.9).toFixed(1))
        };

        const riskLevel =
            extractedData.alt > 60 || extractedData.ast > 50 ? 'high' :
                extractedData.alt > 40 ? 'medium' : 'low';

        // ── Generate a unique file hash from originalname + timestamp ────────────
        const crypto = require('crypto');
        const fileHash = crypto.createHash('sha256')
            .update(`${req.file.originalname}-${Date.now()}`)
            .digest('hex').substring(0, 32) + require('path').extname(req.file.originalname);
        const blockchainResult = await blockchainService.transferFile(
            doctorId,
            patientRecord.userId._id,   // correct – User._id
            fileHash,
            reportType
        );

        if (!blockchainResult.success && blockchainResult.error) {
            console.warn('⚠️  Blockchain simulation warning:', blockchainResult.error);
        }

        // ── BUG FIX: save with patientRecord._id (Patient doc ID), not User ID ──
        const report = new Report({
            patientId: patientRecord._id,   // ← must be Patient._id
            doctorId,
            title,
            reportType,
            fileHash: blockchainResult.fileHash || fileHash,
            blockchainTxHash: blockchainResult.transactionHash || 'simulated',
            fileMetadata: {
                fileName: req.file.originalname,
                fileSize: req.file.size,
                mimeType: req.file.mimetype
            },
            extractedData
        });
        await report.save();

        // Update patient analytics
        await Patient.findByIdAndUpdate(patientRecord._id, {
            'analytics.lastUpdated': new Date(),
            'analytics.liverEnzymes': extractedData,
            'analytics.riskLevel': riskLevel
        });

        res.status(201).json({
            success: true,
            message: 'Report uploaded and blockchain transfer completed',
            report,
            blockchain: blockchainResult
        });
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ success: false, message: 'Upload failed', error: error.message });
    }
};

// ─── Get all reports for a patient (by User._id) ──────────────────────────────
exports.getPatientReports = async (req, res) => {
    try {
        const { patientId } = req.params;   // Comes in as User._id from the frontend

        // ── BUG FIX: patientId here is a User._id, so find matching Patient docs first ──
        const patientRecords = await Patient.find({ userId: patientId });
        const patientDocIds = patientRecords.map(p => p._id);

        const reports = await Report.find({ patientId: { $in: patientDocIds } })
            .populate('doctorId', 'profile wallet')
            .sort({ createdAt: -1 });

        res.json({ success: true, reports });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// ─── Download a report file (NOTE: files are not persisted in serverless env) ──
exports.downloadReport = async (req, res) => {
    try {
        const { fileHash } = req.params;
        // In a serverless/Vercel deployment, local disk files are not persisted.
        // To support file downloads, integrate cloud storage (e.g. AWS S3, Cloudinary).
        // For demonstration purposes, we will return a mock file.
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', `attachment; filename=${fileHash}.txt`);
        return res.send(`This is a mock downloaded file for the file hash: ${fileHash}.\n\nIn a real production environment, this would securely stream from AWS S3 or IPFS.`);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Download failed', error: error.message });
    }
};

// ─── Record a raw blockchain transfer entry (called by DoctorFileUpload.tsx) ───
exports.recordBlockchainTransfer = async (req, res) => {
    try {
        const { fileId, senderWallet, receiverWallet, metadata } = req.body;

        if (!fileId || !senderWallet || !receiverWallet) {
            return res.status(400).json({
                success: false,
                message: 'fileId, senderWallet, and receiverWallet are required'
            });
        }

        const crypto = require('crypto');
        const fileHash = crypto.createHash('sha256')
            .update(`${fileId}-${senderWallet}-${Date.now()}`)
            .digest('hex');
        const ipfsLink = `https://ipfs.io/ipfs/Qm${fileHash.substring(0, 44)}`;

        const transfer = await FileTransfer.create({
            fileId,
            fileHash,
            ipfsLink,
            senderWallet,
            receiverWallet,
            status: 'COMPLETED',
            metadata: metadata || {},
            completedAt: new Date()
        });

        res.json({ success: true, transfer, fileHash, ipfsLink });
    } catch (err) {
        console.error('recordBlockchainTransfer error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// ─── Get all transfers sent to a wallet address (PatientFilesList.tsx) ─────────
exports.getTransfersByWallet = async (req, res) => {
    try {
        const { walletAddress } = req.params;

        const transfers = await FileTransfer.find({ receiverWallet: walletAddress })
            .sort({ createdAt: -1 });

        res.json({ success: true, data: transfers });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// ─── Verify a file's integrity against the FileTransfer blockchain record ──────
exports.verifyIntegrity = async (req, res) => {
    try {
        const { fileId } = req.params;

        const record = await FileTransfer.findOne({
            $or: [{ fileId }, { fileHash: fileId }]
        });

        if (!record) {
            return res.json({ success: false, message: 'No blockchain record found for this file' });
        }

        res.json({
            success: true,
            verified: true,
            record: {
                fileId: record.fileId,
                fileHash: record.fileHash,
                ipfsLink: record.ipfsLink,
                senderWallet: record.senderWallet,
                receiverWallet: record.receiverWallet,
                status: record.status,
                completedAt: record.completedAt
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
