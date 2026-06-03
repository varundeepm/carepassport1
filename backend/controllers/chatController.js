const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');

exports.getMessages = async (req, res) => {
    try {
        const messages = await ChatMessage.find()
            .sort({ createdAt: -1 })
            .limit(50);
        res.json({ success: true, messages: messages.reverse() });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

exports.sendMessage = async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.user.userId;

        // Fetch user to get current profile name
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const newMessage = new ChatMessage({
            sender: userId,
            message,
            displayName: user.profile.name,
            userRole: user.role
        });

        await newMessage.save();
        res.status(201).json({ success: true, message: newMessage });
    } catch (error) {
        console.error('Chat Error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
