import React, { useState } from 'react';
import {
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Alert,
    MenuItem,
    Grid,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/api';
import doctorBg from '../assets/doctor-bg.jpg';

const DISEASE_CATEGORIES = [
    { id: 1, name: 'Viral (Infectious) Liver Diseases' },
    { id: 2, name: 'Metabolic & Fatty Liver Diseases' },
    { id: 3, name: 'Alcohol-Related Liver Diseases' },
    { id: 4, name: 'Autoimmune Liver Diseases' },
    { id: 5, name: 'Genetic / Hereditary Liver Disorders' },
    { id: 6, name: 'Drug-Induced & Toxic Liver Injury' },
    { id: 7, name: 'Vascular Liver Diseases' },
    { id: 8, name: 'Chronic Liver Disease & Complications' },
    { id: 9, name: 'Liver Failure' },
    { id: 10, name: 'Liver Cancer' },
];

const Register: React.FC = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        role: 'patient' as 'doctor' | 'patient',
        name: '',
        phone: '',
        specialty: '',
        organization: '',
        diseaseCategory: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            return setError('Passwords do not match');
        }

        if (formData.role === 'patient' && !formData.diseaseCategory) {
            return setError('Please select a disease category');
        }

        setLoading(true);

        try {
            const diseaseName = formData.role === 'patient'
                ? DISEASE_CATEGORIES.find(c => c.id === Number(formData.diseaseCategory))?.name
                : undefined;

            await auth.register({
                email: formData.email,
                password: formData.password,
                role: formData.role,
                profile: {
                    name: formData.name,
                    phone: formData.phone,
                    specialty: formData.role === 'doctor' ? formData.specialty : undefined,
                    organization: formData.organization,
                    diseaseCategory: formData.role === 'patient' ? Number(formData.diseaseCategory) : undefined,
                    diseaseCategoryName: diseaseName,
                },
            });
            setSuccess(true);
            setTimeout(() => navigate('/login'), 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${doctorBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            py: 8
        }}>
            <Container maxWidth="md">
                <Paper elevation={6} sx={{ p: 4, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)' }}>
                    <Typography variant="h4" align="center" gutterBottom fontWeight="bold" color="primary">
                        Join CarePassport
                    </Typography>
                    <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
                        Experience the future of secure medical records
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
                    {success && <Alert severity="success" sx={{ mb: 3 }}>Registration successful! Redirecting to login...</Alert>}

                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid sx={{ width: { xs: '100%', md: '50%' }, px: 1.5, mb: 2 }}>
                                <TextField
                                    fullWidth
                                    label="Full Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </Grid>
                            <Grid sx={{ width: { xs: '100%', md: '50%' }, px: 1.5, mb: 2 }}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Role"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    required
                                >
                                    <MenuItem value="patient">Patient</MenuItem>
                                    <MenuItem value="doctor">Healthcare Professional (Doctor)</MenuItem>
                                </TextField>
                            </Grid>

                            {formData.role === 'patient' && (
                                <Grid sx={{ width: '100%', px: 1.5, mb: 2 }}>
                                    <TextField
                                        fullWidth
                                        select
                                        label="Liver Disease Category"
                                        name="diseaseCategory"
                                        value={formData.diseaseCategory}
                                        onChange={handleChange}
                                        required
                                    >
                                        {DISEASE_CATEGORIES.map((cat) => (
                                            <MenuItem key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                            )}

                            <Grid sx={{ width: { xs: '100%', md: '50%' }, px: 1.5, mb: 2 }}>
                                <TextField
                                    fullWidth
                                    label="Email Address"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </Grid>
                            <Grid sx={{ width: { xs: '100%', md: '50%' }, px: 1.5, mb: 2 }}>
                                <TextField
                                    fullWidth
                                    label="Phone Number"
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                />
                            </Grid>

                            {formData.role === 'doctor' && (
                                <Grid sx={{ width: { xs: '100%', md: '50%' }, px: 1.5, mb: 2 }}>
                                    <TextField
                                        fullWidth
                                        label="Medical Specialty"
                                        name="specialty"
                                        placeholder="e.g., Hepatology"
                                        value={formData.specialty}
                                        onChange={handleChange}
                                        required
                                    />
                                </Grid>
                            )}

                            <Grid sx={{ width: { xs: '100%', md: formData.role === 'doctor' ? '50%' : '100%' }, px: 1.5, mb: 2 }}>
                                <TextField
                                    fullWidth
                                    label="Organization / Hospital"
                                    name="organization"
                                    placeholder="e.g., General Hospital"
                                    value={formData.organization}
                                    onChange={handleChange}
                                />
                            </Grid>

                            <Grid sx={{ width: { xs: '100%', md: '50%' }, px: 1.5, mb: 2 }}>
                                <TextField
                                    fullWidth
                                    label="Password"
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </Grid>
                            <Grid sx={{ width: { xs: '100%', md: '50%' }, px: 1.5, mb: 2 }}>
                                <TextField
                                    fullWidth
                                    label="Confirm Password"
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
                            </Grid>
                        </Grid>

                        <Button
                            fullWidth
                            type="submit"
                            variant="contained"
                            size="large"
                            disabled={loading || success}
                            sx={{
                                mt: 4,
                                py: 1.5,
                                borderRadius: 2,
                                fontWeight: 'bold',
                                fontSize: '1.1rem'
                            }}
                        >
                            {loading ? 'Creating Account...' : 'Create Secure ID & Wallet'}
                        </Button>
                    </form>

                    <Box sx={{ mt: 3, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            Already have an account?{' '}
                            <Button onClick={() => navigate('/login')} sx={{ fontWeight: 'bold' }}>Login</Button>
                        </Typography>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default Register;
