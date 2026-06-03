import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    LinearProgress,
    MenuItem,
    Divider,
    List,
    ListItem,
    ListItemText,
    Avatar,
    Grid,
    CircularProgress,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import VerifiedIcon from '@mui/icons-material/Verified';
import AddTaskIcon from '@mui/icons-material/AddTask';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import StarIcon from '@mui/icons-material/Star';
import { patients, reports, tasks, Patient, Report } from '../services/api';
import Navbar from '../components/NavBar';

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

const DoctorCategoryView: React.FC = () => {
    const { categoryId } = useParams<{ categoryId: string }>();
    const [patientsList, setPatientsList] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);

    // Dialog States
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [taskDialogOpen, setTaskDialogOpen] = useState(false);
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [patientTasks, setPatientTasks] = useState<any[]>([]);
    const [patientReports, setPatientReports] = useState<Report[]>([]);
    const [loadingDetails, setLoadingDetails] = useState(false);

    // Business Logic States
    const [uploadLoading, setUploadLoading] = useState(false);
    const [submittingTask, setSubmittingTask] = useState(false);

    const [reportData, setReportData] = useState({
        title: '',
        reportType: 'Lab Result',
    });
    const [file, setFile] = useState<File | null>(null);

    const [taskData, setTaskData] = useState({
        title: '',
        description: '',
        taskType: 'diet',
        priority: 'medium',
        rewardPoints: 10
    });
    const [taskPatientPhone, setTaskPatientPhone] = useState('');

    const navigate = useNavigate();
    const categoryName = DISEASE_CATEGORIES[Number(categoryId) - 1];

    useEffect(() => {
        fetchPatients();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [categoryId]);

    const fetchPatients = async () => {
        try {
            setLoading(true);
            const response = await patients.getByCategory(Number(categoryId));
            setPatientsList(response.data.patients || response.data);
        } catch (error) {
            console.error('Error fetching patients:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenUpload = (patient: Patient) => {
        setSelectedPatient(patient);
        setUploadDialogOpen(true);
    };

    const handleOpenTask = (patient: Patient) => {
        setSelectedPatient(patient);
        // Pre-fill phone if already stored in their profile
        setTaskPatientPhone((patient.userId as any)?.profile?.phone || '');
        setTaskDialogOpen(true);
    };

    const handleOpenDetails = async (patient: Patient) => {
        const userId = (patient.userId as any)?._id || (patient.userId as any)?.id;
        if (!userId) {
            alert('Patient user data link is broken.');
            return;
        }

        setSelectedPatient(patient);
        setDetailsDialogOpen(true);
        setLoadingDetails(true);
        try {
            const [reportsRes, tasksRes] = await Promise.all([
                reports.getPatientReports(userId),
                tasks.getPatientTasks(userId)
            ]);
            setPatientReports(reportsRes.data.reports || []);
            setPatientTasks(tasksRes.data.tasks || []);
        } catch (error) {
            console.error('Error fetching patient details:', error);
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleUpload = async () => {
        if (!selectedPatient || !file) return;
        const userId = (selectedPatient.userId as any)?._id || (selectedPatient.userId as any)?.id;
        if (!userId) {
            alert('Cannot identify patient ID.');
            return;
        }

        setUploadLoading(true);
        try {
            const formData = new FormData();
            formData.append('patientId', userId);
            formData.append('title', reportData.title);
            formData.append('reportType', reportData.reportType);
            formData.append('reportFile', file);

            await reports.upload(formData);
            setUploadDialogOpen(false);
            setReportData({ title: '', reportType: 'Lab Result' });
            setFile(null);
            alert('Report uploaded and blockchain transfer completed!');
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Upload failed. Please try again.');
        } finally {
            setUploadLoading(false);
        }
    };

    const handleCreateTask = async () => {
        if (!selectedPatient) return;
        const userId = (selectedPatient.userId as any)?._id || (selectedPatient.userId as any)?.id;
        if (!userId) {
            alert('Cannot identify patient ID.');
            return;
        }
        if (!taskPatientPhone.trim()) {
            alert('Please enter the patient mobile number to ensure they receive an SMS notification.');
            return;
        }

        setSubmittingTask(true);
        try {
            await tasks.create({
                ...taskData,
                patientId: userId,
                patientPhone: taskPatientPhone.trim()
            });
            setTaskDialogOpen(false);
            setTaskData({ title: '', description: '', taskType: 'diet', priority: 'medium', rewardPoints: 10 });
            setTaskPatientPhone('');
            alert('Task assigned successfully! Patient notified via SMS.');
        } catch (error) {
            console.error('Task creation failed:', error);
            alert('Failed to assign task.');
        } finally {
            setSubmittingTask(false);
        }
    };

    return (
        <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh' }}>
            <Navbar />
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IconButton onClick={() => navigate('/doctor/dashboard')} sx={{ bgcolor: 'white', boxShadow: 1 }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Box>
                        <Typography variant="h4" fontWeight="bold">
                            {categoryName}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Managing patients, secure file transfers, and personalized health plans.
                        </Typography>
                    </Box>
                </Box>

                {loading ? (
                    <LinearProgress sx={{ borderRadius: 2, height: 8 }} />
                ) : (
                    <TableContainer component={Paper} sx={{ borderRadius: 4, elevation: 0, border: '1px solid #eee', overflow: 'hidden' }}>
                        <Table>
                            <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Patient Details</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Wallet & ID</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Contact</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {patientsList.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                                            <Typography color="text.secondary">No patients registered in this category yet.</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    patientsList.map((patient) => (
                                        <TableRow key={patient._id} hover sx={{ cursor: 'pointer' }} onClick={() => handleOpenDetails(patient)}>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Avatar sx={{ bgcolor: 'primary.main', fontWeight: 'bold' }}>
                                                        {patient.userId?.profile?.name?.charAt(0) || 'P'}
                                                    </Avatar>
                                                    <Typography fontWeight="bold">{patient.userId?.profile?.name || 'Unknown Patient'}</Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    icon={<VerifiedIcon sx={{ fontSize: '1rem !important' }} />}
                                                    label={`${patient.userId?.wallet?.address?.slice(0, 10) || '0x...'}...`}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ fontFamily: 'monospace', borderRadius: 1.5, color: 'success.main', borderColor: 'success.light' }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">{patient.userId?.email || 'No Email'}</Typography>
                                                <Typography variant="caption" color="text.secondary">{(patient.userId as any)?.profile?.phone || 'No phone'}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip label="Sui Active" color="primary" size="small" sx={{ fontWeight: 'bold', fontSize: '0.7rem' }} />
                                            </TableCell>
                                            <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                                    <Button
                                                        variant="outlined"
                                                        size="small"
                                                        startIcon={<AddTaskIcon />}
                                                        onClick={() => handleOpenTask(patient)}
                                                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
                                                    >
                                                        Assign Task
                                                    </Button>
                                                    <Button
                                                        variant="contained"
                                                        size="small"
                                                        startIcon={<CloudUploadIcon />}
                                                        onClick={() => handleOpenUpload(patient)}
                                                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
                                                    >
                                                        Transfer Report
                                                    </Button>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Container>

            {/* Patient Details Dialog */}
            <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>{selectedPatient?.userId?.profile?.name?.charAt(0) || 'P'}</Avatar>
                    Patient Profile: {selectedPatient?.userId?.profile?.name || 'Loading...'}
                </DialogTitle>
                <DialogContent dividers>
                    {loadingDetails ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
                    ) : (
                        <Grid container spacing={4}>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Typography variant="h6" fontWeight="bold" gutterBottom>Info</Typography>
                                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <EmailIcon color="action" fontSize="small" />
                                        <Typography variant="body2">{selectedPatient?.userId?.email || 'N/A'}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <PhoneIcon color="action" fontSize="small" />
                                        <Typography variant="body2">{(selectedPatient?.userId as any)?.profile?.phone || 'N/A'}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <StarIcon sx={{ color: '#FFD700' }} fontSize="small" />
                                        <Typography variant="body2">Reward Points: {(selectedPatient?.userId as any)?.profile?.rewardPoints || 0}</Typography>
                                    </Box>
                                    <Divider sx={{ my: 1 }} />
                                    <Typography variant="caption" color="text.secondary">Wallet Address:</Typography>
                                    <Typography variant="caption" sx={{ display: 'block', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                                        {selectedPatient?.userId?.wallet?.address || 'No wallet linked'}
                                    </Typography>
                                </Paper>
                            </Grid>
                            <Grid size={{ xs: 12, md: 8 }}>
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <TaskAltIcon color="secondary" /> Task Status
                                    </Typography>
                                    {patientTasks.length === 0 ? <Typography variant="body2" color="text.secondary">No tasks assigned.</Typography> : (
                                        <List dense sx={{ bgcolor: '#fcfcfc', borderRadius: 2, border: '1px solid #f0f0f0' }}>
                                            {patientTasks.map((t, i) => (
                                                <React.Fragment key={t._id}>
                                                    <ListItem>
                                                        <ListItemText
                                                            primary={t.title}
                                                            secondary={`${t.taskType} | +${t.rewardPoints} pts`}
                                                        />
                                                        <Chip
                                                            label={t.completed ? "COMPLETED" : "PENDING"}
                                                            size="small"
                                                            color={t.completed ? "success" : "warning"}
                                                            variant="filled"
                                                            sx={{ fontWeight: 'bold', fontSize: '0.6rem' }}
                                                        />
                                                    </ListItem>
                                                    {i < patientTasks.length - 1 && <Divider />}
                                                </React.Fragment>
                                            ))}
                                        </List>
                                    )}
                                </Box>
                                <Box>
                                    <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <AssignmentIcon color="primary" /> Report Status
                                    </Typography>
                                    {patientReports.length === 0 ? <Typography variant="body2" color="text.secondary">No reports uploaded.</Typography> : (
                                        <List dense sx={{ bgcolor: '#fcfcfc', borderRadius: 2, border: '1px solid #f0f0f0' }}>
                                            {patientReports.map((r, i) => (
                                                <React.Fragment key={r._id}>
                                                    <ListItem>
                                                        <ListItemText
                                                            primary={r.title}
                                                            secondary={`${r.reportType} | ${new Date(r.createdAt).toLocaleDateString()}`}
                                                        />
                                                        <Chip icon={<VerifiedIcon />} label="TX VERIFIED" size="small" color="success" variant="outlined" sx={{ fontSize: '0.6rem' }} />
                                                    </ListItem>
                                                    {i < patientReports.length - 1 && <Divider />}
                                                </React.Fragment>
                                            ))}
                                        </List>
                                    )}
                                </Box>
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
                    <Button variant="contained" onClick={() => { setDetailsDialogOpen(false); handleOpenTask(selectedPatient!); }}>Assign New Task</Button>
                </DialogActions>
            </Dialog>

            {/* Upload Dialog */}
            <Dialog open={uploadDialogOpen} onClose={() => !uploadLoading && setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold' }}>Blockchain File Transfer</DialogTitle>
                <DialogContent dividers>
                    <Typography variant="body2" sx={{ mb: 3 }}>
                        Transferring to: <b>{selectedPatient?.userId?.profile?.name || 'Patient'}</b><br />
                        Wallet: <small>{selectedPatient?.userId?.wallet?.address || 'N/A'}</small>
                    </Typography>

                    <TextField
                        fullWidth
                        label="Report Title"
                        margin="normal"
                        value={reportData.title}
                        onChange={(e) => setReportData({ ...reportData, title: e.target.value })}
                        placeholder="e.g. Blood Test Results - Feb 2024"
                    />

                    <TextField
                        fullWidth
                        select
                        label="Report Type"
                        margin="normal"
                        value={reportData.reportType}
                        onChange={(e) => setReportData({ ...reportData, reportType: e.target.value })}
                    >
                        <MenuItem value="Lab Result">Lab Result</MenuItem>
                        <MenuItem value="Radiology">Radiology</MenuItem>
                        <MenuItem value="Prescription">Prescription</MenuItem>
                        <MenuItem value="Consultation">Consultation</MenuItem>
                    </TextField>

                    <Box sx={{ mt: 3, p: 3, border: '2px dashed #e0e0e0', borderRadius: 2, textAlign: 'center' }}>
                        <input
                            type="file"
                            accept=".pdf,.jpg,.png"
                            style={{ display: 'none' }}
                            id="report-file-input"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                        />
                        <label htmlFor="report-file-input">
                            <Button component="span" startIcon={<CloudUploadIcon />}>
                                {file ? file.name : 'Select Medical File (PDF/JPG)'}
                            </Button>
                        </label>
                        {file && <Typography variant="caption" display="block" sx={{ mt: 1 }}>{Math.round(file.size / 1024)} KB</Typography>}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setUploadDialogOpen(false)} disabled={uploadLoading}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleUpload}
                        disabled={uploadLoading || !file || !reportData.title}
                        sx={{ fontWeight: 'bold' }}
                    >
                        {uploadLoading ? 'Processing Blockchain TX...' : 'Execute Transfer'}
                    </Button>
                </DialogActions>
                {uploadLoading && <LinearProgress />}
            </Dialog>

            {/* Assign Task Dialog */}
            <Dialog open={taskDialogOpen} onClose={() => !submittingTask && setTaskDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold' }}>Assign Health Plan - {selectedPatient?.userId?.profile?.name || 'Patient'}</DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
                        <TextField
                            label="Patient Mobile Number"
                            fullWidth
                            required
                            value={taskPatientPhone}
                            onChange={(e) => setTaskPatientPhone(e.target.value)}
                            placeholder="e.g. 9876543210 or +919876543210"
                            helperText="SMS notification will be sent to this number"
                            InputProps={{
                                startAdornment: <span style={{ marginRight: 6, fontSize: 18 }}>📱</span>
                            }}
                            disabled={submittingTask}
                        />
                        <TextField
                            label="Task Title"
                            fullWidth
                            value={taskData.title}
                            onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
                            placeholder="e.g. Daily Liver Enzymes Support Diet"
                            disabled={submittingTask}
                        />
                        <TextField
                            label="Task Description"
                            fullWidth
                            multiline
                            rows={3}
                            value={taskData.description}
                            onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
                            placeholder="Details about diet or exercise plan..."
                        />
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 6 }}>
                                <TextField
                                    select
                                    label="Plan Type"
                                    fullWidth
                                    value={taskData.taskType}
                                    onChange={(e) => setTaskData({ ...taskData, taskType: e.target.value })}
                                >
                                    <MenuItem value="diet">Diet Plan</MenuItem>
                                    <MenuItem value="exercise">Exercise</MenuItem>
                                    <MenuItem value="medication">Medication</MenuItem>
                                    <MenuItem value="lifestyle">Lifestyle</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <TextField
                                    label="Reward Points"
                                    type="number"
                                    fullWidth
                                    value={taskData.rewardPoints}
                                    onChange={(e) => setTaskData({ ...taskData, rewardPoints: Number(e.target.value) })}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setTaskDialogOpen(false)} disabled={submittingTask}>Cancel</Button>
                    <Button
                        variant="contained"
                        disabled={submittingTask || !taskData.title}
                        onClick={handleCreateTask}
                        sx={{ borderRadius: 2, fontWeight: 'bold' }}
                    >
                        {submittingTask ? 'Processing...' : 'Confirm & Notify Patient'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default DoctorCategoryView;
