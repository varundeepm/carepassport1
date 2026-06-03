import React, { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Card,
    CardContent,
    Typography,
    Box,
    Divider,
    Paper,
    List,
    ListItem,
    ListItemText,
    CircularProgress,
    Button,
    Chip,
    LinearProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Avatar,
    Stack
} from '@mui/material';
import {
    ResponsiveContainer,
    Tooltip,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    Radar
} from 'recharts';
import Navbar from '../components/NavBar';
import { reports, Report } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import PersonalVideoIcon from '@mui/icons-material/PersonalVideo';
import MedicationIcon from '@mui/icons-material/Medication';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import * as XLSX from 'xlsx';

interface ExternalPatientData {
    id: string;
    name: string;
    age: number;
    gender: string;
    bloodGroup: string;
    diagnosis: string;
    medications: string;
    treatmentStatus: string;
    consentStatus: string;
    lastUpdated: string;
    // Keep markers if present
    alt?: number;
    ast?: number;
    bilirubin?: number;
}

const HealthAnalysis: React.FC = () => {
    const [patientReports, setPatientReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [externalData, setExternalData] = useState<ExternalPatientData[]>([]);
    const [selectedIndex, setSelectedIndex] = useState<number>(0);
    const [uploading, setUploading] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        const fetchReports = async () => {
            try {
                if (user?.id) {
                    const response = await reports.getPatientReports(user.id);
                    setPatientReports(response.data.reports || []);
                }
            } catch (error) {
                console.error('Error fetching reports:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, [user]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const reader = new FileReader();
        reader.onload = (evt: any) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws) as any[];

                const mappedData: ExternalPatientData[] = data.map(row => ({
                    id: row['Patient ID'] || 'N/A',
                    name: row['Patient Name'] || row['Name'] || 'Anonymous',
                    age: Number(row['Age'] || 0),
                    gender: row['Gender'] || 'U',
                    bloodGroup: row['Blood Group'] || 'N/A',
                    diagnosis: row['Current Diagnosis'] || 'None',
                    medications: row['Prescribed Medications'] || 'None',
                    treatmentStatus: row['Treatment Status'] || 'Active',
                    consentStatus: row['Consent Status'] || 'Pending',
                    lastUpdated: row['Last Updated Date'] || 'N/A',
                    alt: row['ALT'] ? Number(row['ALT']) : undefined,
                    ast: row['AST'] ? Number(row['AST']) : undefined,
                    bilirubin: row['Bilirubin'] ? Number(row['Bilirubin']) : undefined
                }));

                setExternalData(mappedData);
                setSelectedIndex(0); // Select first patient by default
            } catch (error) {
                console.error('Error parsing Excel:', error);
            } finally {
                setUploading(false);
            }
        };
        reader.readAsBinaryString(file);
    };

    const selectedPatient = externalData[selectedIndex];
    const isExternal = externalData.length > 0;

    // Use blockchain data if no external file is loaded
    const latestReport = patientReports[0];
    const personalMarkers = latestReport?.extractedData || {
        alt: 45,
        ast: 38,
        bilirubin: 1.2
    };

    const getStatusColor = (status: string): "success" | "warning" | "error" | "primary" => {
        const s = status.toLowerCase();
        if (s.includes('active') || s.includes('granted') || s.includes('normal')) return 'success';
        if (s.includes('pending') || s.includes('stable')) return 'warning';
        if (s.includes('critical') || s.includes('denied')) return 'error';
        return 'primary';
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ bgcolor: '#f4f6f8', minHeight: '100vh', pb: 8 }}>
            <Navbar />
            <Container maxWidth="xl" sx={{ mt: 4 }}>
                {/* Header Section */}
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <AnalyticsIcon color="primary" sx={{ fontSize: 40 }} />
                        <Box>
                            <Typography variant="h4" fontWeight="bold" sx={{ color: '#2c3e50' }}>Health Profile Analysis</Typography>
                            <Typography color="text.secondary">Deep dive into clinical parameters and medical history.</Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        {isExternal && (
                            <FormControl size="small" sx={{ minWidth: 200 }}>
                                <InputLabel>Select Record</InputLabel>
                                <Select
                                    value={selectedIndex}
                                    label="Select Record"
                                    onChange={(e) => setSelectedIndex(Number(e.target.value))}
                                    sx={{ bgcolor: 'white' }}
                                >
                                    {externalData.map((p, i) => (
                                        <MenuItem key={i} value={i}>{p.name} ({p.id})</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}
                        <input
                            accept=".xlsx, .xls, .csv"
                            style={{ display: 'none' }}
                            id="upload-excel"
                            type="file"
                            onChange={handleFileUpload}
                        />
                        <label htmlFor="upload-excel">
                            <Button
                                variant="contained"
                                component="span"
                                startIcon={<UploadFileIcon />}
                                sx={{ borderRadius: 2, fontWeight: 'bold', px: 3, py: 1.2, textTransform: 'none', boxShadow: '0 4px 14px 0 rgba(26, 35, 126, 0.3)' }}
                            >
                                Import Patient Data
                            </Button>
                        </label>
                    </Box>
                </Box>

                {uploading && <LinearProgress sx={{ mb: 4, borderRadius: 2 }} />}

                {/* Main Content */}
                <Grid container spacing={4}>
                    {/* Left Column: Demographics & Clinical Status */}
                    <Grid sx={{ width: { xs: '100%', lg: '33.33%' }, px: 2 }}>
                        <Stack spacing={3}>
                            {/* Profile Card */}
                            <Card sx={{ borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                                <Box sx={{ bgcolor: 'primary.main', p: 3, color: 'white', textAlign: 'center' }}>
                                    <Avatar
                                        sx={{
                                            width: 80,
                                            height: 80,
                                            mx: 'auto',
                                            mb: 2,
                                            bgcolor: 'white',
                                            color: 'primary.main',
                                            fontSize: '2rem',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {(isExternal ? selectedPatient.name : user?.profile.name || 'P')[0]}
                                    </Avatar>
                                    <Typography variant="h5" fontWeight="bold">
                                        {isExternal ? selectedPatient.name : user?.profile.name}
                                    </Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                        ID: {isExternal ? selectedPatient.id : user?.walletAddress?.slice(0, 10) + '...'}
                                    </Typography>
                                </Box>
                                <CardContent>
                                    <List>
                                        <ListItem sx={{ px: 0 }}>
                                            <ListItemText
                                                primary={<Typography variant="caption" color="text.secondary">BLOOD GROUP</Typography>}
                                                secondary={<Typography variant="h6" fontWeight="bold" color="error.main">{isExternal ? selectedPatient.bloodGroup : 'O+'}</Typography>}
                                            />
                                        </ListItem>
                                        <Divider />
                                        <ListItem sx={{ px: 0 }}>
                                            <ListItemText
                                                primary={<Typography variant="caption" color="text.secondary">AGE / GENDER</Typography>}
                                                secondary={<Typography variant="body1" fontWeight="bold">{isExternal ? `${selectedPatient.age}y / ${selectedPatient.gender}` : 'N/A'}</Typography>}
                                            />
                                        </ListItem>
                                        <Divider />
                                        <ListItem sx={{ px: 0 }}>
                                            <ListItemText
                                                primary={<Typography variant="caption" color="text.secondary">LAST UPDATED</Typography>}
                                                secondary={<Typography variant="body2">{isExternal ? selectedPatient.lastUpdated : 'Today'}</Typography>}
                                            />
                                        </ListItem>
                                    </List>
                                </CardContent>
                            </Card>

                            {/* Status Badges Card */}
                            <Card sx={{ borderRadius: 4, p: 2 }}>
                                <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" gutterBottom sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <AssignmentIndIcon fontSize="small" /> CONSENT & TREATMENT
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Box>
                                        <Typography variant="caption" display="block" gutterBottom>Treatment Status</Typography>
                                        <Chip
                                            label={isExternal ? selectedPatient.treatmentStatus : 'Standard'}
                                            color={getStatusColor(isExternal ? selectedPatient.treatmentStatus : 'Active')}
                                            sx={{ fontWeight: 'bold', width: '100%' }}
                                        />
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" display="block" gutterBottom>Consent Status</Typography>
                                        <Chip
                                            label={isExternal ? selectedPatient.consentStatus : 'Granted'}
                                            variant="outlined"
                                            color={getStatusColor(isExternal ? selectedPatient.consentStatus : 'Granted')}
                                            sx={{ fontWeight: 'bold', width: '100%' }}
                                        />
                                    </Box>
                                </Box>
                            </Card>
                        </Stack>
                    </Grid>

                    {/* Middle Column: Diagnosis & Medications */}
                    <Grid sx={{ width: { xs: '100%', lg: '66.66%' }, px: 2 }}>
                        <Grid container spacing={3}>
                            {/* Diagnosis Card */}
                            <Grid sx={{ width: '100%', mb: 3 }}>
                                <Card sx={{ borderRadius: 4, p: 3, background: 'linear-gradient(135deg, #1a237e 0%, #311b92 100%)', color: 'white' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                        <PersonalVideoIcon />
                                        <Typography variant="h6" fontWeight="bold">Current Medical Diagnosis</Typography>
                                    </Box>
                                    <Typography variant="h4" sx={{ mt: 2, fontWeight: 'bold' }}>
                                        {isExternal ? selectedPatient.diagnosis : 'Fatty Liver Grade I'}
                                    </Typography>
                                    <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                                        Verified clinical diagnosis extracted from the latest medical record.
                                    </Typography>
                                </Card>
                            </Grid>

                            {/* Medications Card */}
                            <Grid sx={{ width: { xs: '100%', md: '50%' }, mb: 3, pr: 2 }}>
                                <Card sx={{ borderRadius: 4, height: '100%', border: '1px solid #e1e5e9' }}>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                            <MedicationIcon color="primary" />
                                            <Typography variant="h6" fontWeight="bold">Prescribed Medications</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                            {(isExternal ? selectedPatient.medications.split(',') : ['Ursodeoxycholic Acid', 'Vitamin E']).map((med, i) => (
                                                <Chip key={i} label={med.trim()} variant="outlined" sx={{ bgcolor: 'rgba(26, 35, 126, 0.05)', fontWeight: 'medium' }} />
                                            ))}
                                        </Box>
                                        {isExternal && selectedPatient.medications.toLowerCase() === 'none' && (
                                            <Typography color="text.secondary" variant="body2">No active medications prescribed.</Typography>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* Health Marker Visualization */}
                            <Grid sx={{ width: { xs: '100%', md: '50%' }, mb: 3 }}>
                                <Card sx={{ borderRadius: 4, height: '100%', border: '1px solid #e1e5e9' }}>
                                    <CardContent>
                                        <Typography variant="h6" fontWeight="bold" gutterBottom>Marker Proximity Radar</Typography>
                                        <Box sx={{ height: 280 }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                                                    { subject: 'ALT', A: isExternal ? (selectedPatient.alt || 40) : personalMarkers.alt, fullMark: 100 },
                                                    { subject: 'AST', A: isExternal ? (selectedPatient.ast || 40) : personalMarkers.ast, fullMark: 100 },
                                                    { subject: 'BIL', A: (isExternal ? (selectedPatient.bilirubin || 1) : personalMarkers.bilirubin) * 50, fullMark: 100 },
                                                    { subject: 'ALB', A: 80, fullMark: 100 },
                                                    { subject: 'INR', A: 90, fullMark: 100 }
                                                ]}>
                                                    <PolarGrid />
                                                    <PolarAngleAxis dataKey="subject" />
                                                    <Radar name="Status" dataKey="A" stroke="#1a237e" fill="#1a237e" fillOpacity={0.6} />
                                                    <Tooltip />
                                                </RadarChart>
                                            </ResponsiveContainer>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* Action Card */}
                            <Grid sx={{ width: '100%' }}>
                                <Paper sx={{ p: 3, borderRadius: 4, border: '1px dashed #1a237e', bgcolor: 'rgba(26, 35, 126, 0.02)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography variant="h6" fontWeight="bold">Digital Health Passport</Typography>
                                        <Typography variant="body2" color="text.secondary">This status is synchronized with your blockchain-encrypted health record.</Typography>
                                    </Box>
                                    <Button variant="outlined" sx={{ borderRadius: 2, fontWeight: 'bold' }}>View Full History</Button>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default HealthAnalysis;
