import React, { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Card,
    CardContent,
    Typography,
    Chip,
    Button,
    Box,
    AppBar,
    Toolbar,
    IconButton,
    Avatar,
    Paper,
    Tooltip as MuiTooltip
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import FolderIcon from '@mui/icons-material/Folder';
import PersonIcon from '@mui/icons-material/Person';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
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

const DoctorDashboard: React.FC = () => {
    const [patientCounts, setPatientCounts] = useState<Record<number, number>>({});
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchPatientData();
    }, []);

    const fetchPatientData = async () => {
        try {
            const response = await patients.getAll();
            const counts: Record<number, number> = {};

            // Handle the data structure returned by your API
            const patientsList = response.data.patients || response.data;
            if (Array.isArray(patientsList)) {
                patientsList.forEach((patient: any) => {
                    const cat = patient.diseaseCategory;
                    counts[cat] = (counts[cat] || 0) + 1;
                });
            }

            setPatientCounts(counts);
        } catch (error) {
            console.error('Error fetching patients:', error);
        }
    };

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
            <AppBar position="sticky" elevation={0} sx={{ borderBottom: '1px solid #e0e0e0', bgcolor: 'white', color: 'text.primary' }}>
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold', color: 'primary.main' }}>
                        CarePassport <Box component="span" sx={{ fontWeight: 'normal', color: 'text.secondary' }}>| Doctor Portal</Box>
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <MuiTooltip title={user?.walletAddress || ''}>
                            <Chip
                                icon={<AccountBalanceWalletIcon />}
                                label={`${user?.walletAddress?.slice(0, 8)}...`}
                                variant="outlined"
                                size="small"
                                sx={{ borderRadius: 2 }}
                            />
                        </MuiTooltip>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                                <PersonIcon fontSize="small" />
                            </Avatar>
                            <Typography variant="body2" fontWeight="bold">
                                Dr. {user?.profile.name}
                            </Typography>
                        </Box>
                        <IconButton color="inherit" onClick={logout} size="small">
                            <LogoutIcon />
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>

            <Container maxWidth="xl" sx={{ mt: 4, pb: 6 }}>
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Liver Disease Management
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Categorized patient monitoring and blockchain-secured report transfers
                    </Typography>
                </Box>

                {/* Quick Actions */}
                <Grid container spacing={2} sx={{ mb: 4 }}>
                    <Grid sx={{ width: { xs: 12, md: '25%' }, px: 1 }}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: 4,
                                border: '2px solid',
                                borderColor: 'primary.main',
                                background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)',
                                color: 'white',
                                cursor: 'pointer',
                                transition: 'transform 0.2s',
                                '&:hover': { transform: 'scale(1.02)' }
                            }}
                            onClick={() => navigate('/doctor/appointments')}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="h6" fontWeight="bold">
                                        📅 Appointments
                                    </Typography>
                                    <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                                        View consultation requests
                                    </Typography>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>
                    <Grid sx={{ width: { xs: '100%', md: '25%' }, px: 1 }}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: 4,
                                border: '2px solid',
                                borderColor: 'primary.main',
                                background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)',
                                color: 'white',
                                cursor: 'pointer',
                                transition: 'transform 0.2s',
                                '&:hover': { transform: 'scale(1.02)' }
                            }}
                            onClick={() => navigate('/doctor/add-patient')}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="h6" fontWeight="bold">
                                        👤 Add New Patient
                                    </Typography>
                                    <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                                        Link patient to your records
                                    </Typography>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>
                    <Grid sx={{ width: { xs: '100%', md: '25%' }, px: 1 }}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: 4,
                                border: '1px solid #e0e0e0',
                                background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)',
                                color: 'white'
                            }}
                        >
                            <Typography variant="h4" fontWeight="bold">
                                {Object.values(patientCounts).reduce((a, b) => a + b, 0)}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.9 }}>
                                Total Patients Under Care
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid sx={{ width: { xs: '100%', md: '25%' }, px: 1 }}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: 4,
                                border: '2px solid',
                                borderColor: 'primary.main',
                                background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
                                color: 'white',
                                cursor: 'pointer',
                                transition: 'transform 0.2s',
                                '&:hover': { transform: 'scale(1.02)' }
                            }}
                            onClick={() => navigate('/doctor/patient-rewards')}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="h6" fontWeight="bold">
                                        🏆 Patient Rewards
                                    </Typography>
                                    <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                                        Gamified tasks & total points earned
                                    </Typography>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>

                <Box sx={{ mb: 3 }}>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                        Patient Categories
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Organized by liver disease classification
                    </Typography>
                </Box>

                <Grid container spacing={3}>
                    {DISEASE_CATEGORIES.map((category, index) => {
                        const categoryNum = index + 1;
                        const count = patientCounts[categoryNum] || 0;

                        return (
                            <Grid sx={{ width: { xs: '100%', md: '50%', lg: '33.33%' }, px: 1.5, mb: 3 }} key={categoryNum}>
                                <Card
                                    elevation={0}
                                    sx={{
                                        borderRadius: 4,
                                        border: '1px solid #e0e0e0',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: '0 12px 24px rgba(0,0,0,0.05)',
                                            borderColor: 'primary.main'
                                        }
                                    }}
                                    onClick={() => navigate(`/doctor/category/${categoryNum}`)}
                                >
                                    <CardContent sx={{ p: 3 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                            <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(26, 35, 126, 0.05)', color: 'primary.main' }}>
                                                <FolderIcon />
                                            </Box>
                                            <Chip
                                                label={`${count} Patient${count !== 1 ? 's' : ''}`}
                                                color={count > 0 ? 'primary' : 'default'}
                                                variant={count > 0 ? 'filled' : 'outlined'}
                                                size="small"
                                                sx={{ fontWeight: 'bold' }}
                                            />
                                        </Box>

                                        <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ minHeight: 64 }}>
                                            {category}
                                        </Typography>

                                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 2 }}>
                                            Category ID: #{categoryNum.toString().padStart(2, '0')}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>

                <Paper
                    elevation={0}
                    sx={{
                        mt: 6,
                        p: 4,
                        borderRadius: 4,
                        bgcolor: 'primary.main',
                        color: 'white',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}
                >
                    <Box>
                        <Typography variant="h5" fontWeight="bold">Ready to register a new patient?</Typography>
                        <Typography variant="body1" sx={{ opacity: 0.8 }}>Add patient details and assign them to a liver health category.</Typography>
                    </Box>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={() => navigate('/doctor/add-patient')}
                        sx={{
                            bgcolor: 'white',
                            color: 'primary.main',
                            fontWeight: 'bold',
                            px: 4,
                            '&:hover': { bgcolor: '#f0f0f0' }
                        }}
                    >
                        + New Patient Record
                    </Button>
                </Paper>
            </Container>
        </Box>
    );
};

export default DoctorDashboard;
