const { ethers } = require('ethers');
const User = require('../models/User');

/**
 * Lazy-initialise the provider only when needed so the server
 * doesn't crash on startup when BLOCKCHAIN_RPC_URL is not set.
 */
let _provider = null;
const getProvider = () => {
    if (!_provider) {
        const rpcUrl = process.env.BLOCKCHAIN_RPC_URL;
        if (!rpcUrl) {
            console.warn('⚠️  BLOCKCHAIN_RPC_URL not set – blockchain calls will be simulated locally.');
            return null;
        }
        try {
            _provider = new ethers.JsonRpcProvider(rpcUrl);
        } catch (e) {
            console.warn('⚠️  Could not create JSON-RPC provider:', e.message);
        }
    }
    return _provider;
};

/**
 * Simulates a blockchain transfer proof between Doctor and Patient wallets.
 * If a real provider is available it connects the doctor's wallet to it;
 * otherwise the transfer hash is computed locally (Keccak256).
 *
 * @param {string} doctorId   – User._id of the doctor
 * @param {string} patientId  – User._id of the patient
 * @param {string} fileHash   – File identifier / stored filename
 * @param {string} reportType – e.g. "Lab Result"
 * @returns {{ success, transactionHash, doctorWallet, patientWallet, fileHash }}
 */
exports.transferFile = async (doctorId, patientId, fileHash, reportType) => {
    try {
        const doctor = await User.findById(doctorId);
        const patient = await User.findById(patientId);

        if (!doctor || !patient) {
            throw new Error('Doctor or patient not found in database');
        }

        if (!doctor.wallet?.address || !patient.wallet?.address) {
            throw new Error('One or both users do not have a blockchain wallet configured');
        }

        // Build the transaction data structure
        const transactionData = {
            from: doctor.wallet.address,
            to: patient.wallet.address,
            fileHash,
            reportType,
            timestamp: Date.now()
        };

        // Compute a deterministic Keccak256 hash of the transfer details
        const txHash = ethers.keccak256(
            ethers.toUtf8Bytes(JSON.stringify(transactionData))
        );

        // Optionally sign with the doctor's private key if a live provider is available
        const provider = getProvider();
        if (provider && doctor.wallet.encryptedPrivateKey) {
            try {
                const doctorPrivateKey = doctor.getPrivateKey();
                // We intentionally do NOT send a real on-chain tx to avoid gas costs.
                // Just connecting the wallet validates the key decryption is working.
                new ethers.Wallet(doctorPrivateKey, provider);
                console.log(`[Blockchain] Live provider connected for signing proof`);
            } catch (signErr) {
                console.warn('[Blockchain] Could not connect signer (non-fatal):', signErr.message);
            }
        }

        console.log(
            `[Blockchain] Transfer: ${doctor.wallet.address.slice(0, 8)}... → ${patient.wallet.address.slice(0, 8)}...`
        );
        console.log(`[Blockchain] TX Hash: ${txHash}`);

        return {
            success: true,
            transactionHash: txHash,
            doctorWallet: doctor.wallet.address,
            patientWallet: patient.wallet.address,
            fileHash
        };
    } catch (error) {
        console.error('Blockchain Transfer Error:', error.message);
        // Return a graceful simulated result so the upload flow doesn't break
        const fallbackHash = ethers.keccak256(ethers.toUtf8Bytes(`${fileHash}-${Date.now()}`));
        return {
            success: false,
            error: error.message,
            transactionHash: fallbackHash,
            fileHash
        };
    }
};
