require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const { generateWallet } = require('./utils/walletManager');

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/carepassport_v2');
        console.log('Connected to DB');

        // Clean up existing test users if any
        await User.deleteMany({ email: /test/ });

        const roles = ['doctor', 'patient'];

        for (const role of roles) {
            const email = `test_${role}@example.com`;
            const password = 'password123';

            const walletData = generateWallet();
            const encryptedPrivateKey = User.encryptPrivateKey(walletData.privateKey);
            const hashedPassword = await bcrypt.hash(password, 12);

            const user = new User({
                email,
                password: hashedPassword,
                role,
                profile: {
                    name: `Test ${role.charAt(0).toUpperCase() + role.slice(1)}`,
                    organization: 'CarePassport General Hospital'
                },
                wallet: {
                    address: walletData.address,
                    encryptedPrivateKey: encryptedPrivateKey,
                    createdAt: new Date()
                }
            });

            await user.save();
            console.log(`Created ${role}: ${email}`);
            console.log(`Wallet Address: ${walletData.address}`);
        }

        console.log('Seed complete!');
        process.exit(0);
    } catch (err) {
        console.error('Error during seeding:', err);
        process.exit(1);
    }
}

seed();
