const mongoose = require('mongoose');

const OrganizationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ['Hospital', 'Clinic', 'Diagnostic Center'], default: 'Hospital' },
    address: { type: String },
    phone: { type: String },
    imageUrl: { type: String, default: 'https://images.unsplash.com/photo-1586773860418-d3b97998c637?auto=format&fit=crop&q=80&w=400' },
    doctors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Organization', OrganizationSchema);
