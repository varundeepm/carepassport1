const axios = require('axios');

async function testAddPatient() {
    try {
        // 1. Login to get token
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'test_doctor@example.com',
            password: 'password123'
        });
        const token = loginRes.data.token;
        console.log('Logged in, got token');

        // 2. Add patient
        const addRes = await axios.post('http://localhost:5000/api/patients', {
            email: 'test_patient@example.com',
            diseaseCategory: 1,
            diseaseCategoryName: 'Viral (Infectious) Liver Diseases'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Add Patient Response:', addRes.data);
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

testAddPatient();
