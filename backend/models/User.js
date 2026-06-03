const mongoose = require('mongoose');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['doctor', 'patient'], required: true },

    wallet: {
        address: { type: String, unique: true, sparse: true },
        encryptedPrivateKey: { type: String },
        createdAt: { type: Date, default: Date.now }
    },

    profile: {
        name: { type: String, required: true },
        phone: { type: String, default: '' },
        specialty: { type: String }, // For doctors
        organization: { type: String },
        organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
        diseaseCategory: { type: Number }, // For patients
        diseaseCategoryName: { type: String }, // For patients
        rewardPoints: { type: Number, default: 0 } // For patients (gamification)
    },
    resetPasswordOTP: { type: String },
    resetPasswordExpires: { type: Date },
    lastLogin: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

// Helper to encrypt private key
UserSchema.statics.encryptPrivateKey = function (privateKey) {
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(process.env.WALLET_ENCRYPTION_KEY.padEnd(32).slice(0, 32));
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(privateKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
};

// Instance method to decrypt private key
UserSchema.methods.getPrivateKey = function () {
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(process.env.WALLET_ENCRYPTION_KEY.padEnd(32).slice(0, 32));
    const textParts = this.wallet.encryptedPrivateKey.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};

module.exports = mongoose.model('User', UserSchema);
