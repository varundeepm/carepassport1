const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateWallet } = require('../utils/walletManager');
const twilioService = require('../services/twilioService');

exports.register = async (req, res) => {
    try {
        const { email, password, role, profile } = req.body;

        // 1. Validation
        if (!email || !password || !role || !profile || !profile.name || !profile.phone) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required including email, password, role, profile name, and phone number'
            });
        }

        // 2. Check if user already exists
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ success: false, message: 'User already exists' });

        // 3. Generate unique blockchain wallet
        const walletData = generateWallet();
        const encryptedPrivateKey = User.encryptPrivateKey(walletData.privateKey);

        // 4. Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // 5. Create user with wallet proof (Simulated Blockchain)
        const newUser = new User({
            email,
            password: hashedPassword,
            role,
            profile: {
                name: profile.name,
                phone: profile.phone || '',
                specialty: profile.specialty || '',
                organization: profile.organization || '',
                diseaseCategory: profile.diseaseCategory || null,
                diseaseCategoryName: profile.diseaseCategoryName || ''
            },
            wallet: {
                address: walletData.address,
                encryptedPrivateKey: encryptedPrivateKey,
                createdAt: new Date()
            }
        });

        // 6. Save through Mongoose query
        await newUser.save();
        console.log(`✅ User registered: ${email} (${role})`);

        res.status(201).json({
            success: true,
            message: 'User registered successfully with blockchain wallet',
            user: {
                id: newUser._id,
                email: newUser.email,
                role: newUser.role,
                walletAddress: walletData.address
            }
        });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '7d' }
        );

        // Update last login timestamp
        user.lastLogin = new Date();
        await user.save();

        console.log(`🔑 User logged in: ${email}`);

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                profile: user.profile,
                walletAddress: user.wallet?.address
            }
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email address is required' });
        }

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({ success: false, message: 'No account found with this email' });
        }

        if (!user.profile || !user.profile.phone) {
            return res.status(400).json({ success: false, message: 'No phone number associated with this account to send OTP' });
        }

        const phone = user.profile.phone;

        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetPasswordOTP = otp;
        user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save();

        // Send OTP via Twilio
        const message = `Your CarePassport password reset OTP is ${otp}. It expires in 10 minutes.`;
        const smsResult = await twilioService.sendSMS(phone, message);

        if (smsResult.success || smsResult.mock) {
            res.json({ success: true, message: 'OTP sent successfully to your registered phone number' });
        } else {
            res.status(500).json({ success: false, message: 'Failed to send OTP via SMS', error: smsResult.error });
        }
    } catch (error) {
        console.error('Forgot Password Error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ success: false, message: 'Email and OTP are required' });
        }

        const user = await User.findOne({
            email: email.toLowerCase(),
            resetPasswordOTP: otp,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        res.json({ success: true, message: 'OTP verified successfully' });
    } catch (error) {
        console.error('Verify OTP Error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) {
            return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required' });
        }

        const user = await User.findOne({
            email: email.toLowerCase(),
            resetPasswordOTP: otp,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);
        user.password = hashedPassword;
        user.resetPasswordOTP = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        console.error('Reset Password Error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
