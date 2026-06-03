const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    displayName: {
        type: String,
        required: true
    },
    userRole: {
        type: String,
        enum: ['patient', 'doctor'],
        default: 'patient'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ChatMessage', ChatMessageSchema);
