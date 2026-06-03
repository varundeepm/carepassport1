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
import { patients } from '../services/api';

const DISEASE_CATEGORIES = [
    'Viral (Infectious) Liver Diseases',
    'Metabolic & Fatty Liver Diseases',
    'Alcohol-Related Liver Diseases',
    'Autoimmune Liver Diseases',
    'Genetic / Hereditary Liver Disorders',
    'Drug-Induced & Toxic Liver Injury',
    'Vascular Liver Diseases',
    'Chronic Liver Disease & Complications',
    'Liver Failure',
    'Liver Cancer',
];

const AddPatient: React.FC = () => {
    const [formData, setFormData] = useState({
        patientEmail: '',
        patientName: '',
        patientPhone: '',
        diseaseCategory: '' as string | number,
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
        setLoading(true);

        try {
            const categoryId = Number(formData.diseaseCategory);
            const categoryName = DISEASE_CATEGORIES[categoryId - 1];

            // In this flow, we assume the patient might already have a user account or we create a mapping
            // For simplicity, we'll send the email and details to the backend
            await patients.create({
                email: formData.patientEmail,
                name: formData.patientName,
                phone: formData.patientPhone,
                diseaseCategory: categoryId,
                diseaseCategoryName: categoryName,
            });

            setSuccess(true);
            setTimeout(() => navigate('/doctor/dashboard'), 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to add patient record');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="md" sx={{ mt: 8, mb: 10 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 4 }}>
                <Typography variant="h4" align="center" gutterBottom fontWeight="bold">
                    Add New Patient Record
                </Typography>
                <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
                    Initialize a blockchain-linked health profile for a new patient
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 3 }}>Patient record created successfully!</Alert>}

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid sx={{ width: '100%', px: 1.5, mb: 2 }}>
                            <TextField
                                fullWidth
                                label="Patient Name"
                                name="patientName"
                                value={formData.patientName}
                                onChange={handleChange}
                                required
                            />
                        </Grid>
                        <Grid sx={{ width: { xs: '100%', md: '50%' }, px: 1.5, mb: 2 }}>
                            <TextField
                                fullWidth
                                label="Patient Email (must match their registered email)"
                                name="patientEmail"
                                type="email"
                                value={formData.patientEmail}
                                onChange={handleChange}
                                required
                            />
                        </Grid>
                        <Grid sx={{ width: { xs: '100%', md: '50%' }, px: 1.5, mb: 2 }}>
                            <TextField
                                fullWidth
                                label="Contact Number"
                                name="patientPhone"
                                value={formData.patientPhone}
                                onChange={handleChange}
                                required
                            />
                        </Grid>
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
                                {DISEASE_CATEGORIES.map((cat, index) => (
                                    <MenuItem key={index + 1} value={index + 1}>
                                        {cat}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                    </Grid>

                    <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={() => navigate('/doctor/dashboard')}
                            sx={{ py: 1.5, borderRadius: 2 }}
                        >
                            Cancel
                        </Button>
                        <Button
                            fullWidth
                            type="submit"
                            variant="contained"
                            disabled={loading || success}
                            sx={{
                                py: 1.5,
                                borderRadius: 2,
                                fontWeight: 'bold'
                            }}
                        >
                            {loading ? 'Creating Record...' : 'Link Patient Profile'}
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Container>
    );
};

export default AddPatient;
