require('dotenv').config();
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: String,
    role: String,
    profile: Object,
    wallet: Object
});

const PatientSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    diseaseCategory: Number,
    diseaseCategoryName: String
});

const User = mongoose.model('User', UserSchema);
const Patient = mongoose.model('Patient', PatientSchema);

async function verify() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/carepassport_v2');
        console.log('Connected to DB');

        const users = await User.find({});
        console.log(`Found ${users.length} users:`);
        users.forEach(u => {
            console.log(`- ${u.email} (${u.role}) - Wallet: ${u.wallet?.address}`);
        });

        const patients = await Patient.find({}).populate('userId');
        console.log(`\nFound ${patients.length} patient records:`);
        patients.forEach(p => {
            console.log(`- Patient: ${p.userId?.email} | Doctor ID: ${p.doctorId} | Category: ${p.diseaseCategoryName}`);
        });

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

verify();
