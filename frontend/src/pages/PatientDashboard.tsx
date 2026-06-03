import React, { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Card,
    CardContent,
    Typography,
    Box,
    Chip,
    Button,
    Divider,
    Paper,
    LinearProgress
} from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import DownloadIcon from '@mui/icons-material/Download';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { reports, Report, patients, appointments, Appointment } from '../services/api';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PendingIcon from '@mui/icons-material/Pending';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import Navbar from '../components/NavBar';
import axios from 'axios';

const PatientDashboard: React.FC = () => {
    const [patientReports, setPatientReports] = useState<Report[]>([]);
    const [myDoctors, setMyDoctors] = useState<any[]>([]);
    const [patientAppointments, setPatientAppointments] = useState<Appointment[]>([]);
    const { user } = useAuth();
    const navigate = useNavigate();
    const [patientTasks, setPatientTasks] = useState<any[]>([]);
    const [rewardPoints, setRewardPoints] = useState((user?.profile as any)?.rewardPoints || 0);
    const [loadingTasks, setLoadingTasks] = useState(false);

    useEffect(() => {
        fetchReports();
        fetchDoctors();
        fetchAppointments();
        fetchTasks();
    }, [user]);

    const fetchTasks = async () => {
        if (!user?.id) return;
        setLoadingTasks(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:5001/api/tasks/patient/${user.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setPatientTasks(response.data.tasks || []);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setLoadingTasks(false);
        }
    };

    const handleCompleteTask = async (taskId: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`http://localhost:5001/api/tasks/${taskId}/complete`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.data.success) {
                setRewardPoints(response.data.newTotalPoints);
                fetchTasks(); // Refresh tasks
                alert(response.data.message);
            }
        } catch (error) {
            console.error('Error completing task:', error);
            alert('Failed to complete task.');
        }
    };

    const fetchAppointments = async () => {
        try {
            const response = await appointments.getPatient();
            setPatientAppointments(response.data.appointments || []);
        } catch (error) {
            console.error('Error fetching appointments:', error);
        }
    };

    const fetchDoctors = async () => {
        try {
            const response = await patients.getMyDoctors();
            setMyDoctors(response.data.doctors || []);
        } catch (error) {
            console.error('Error fetching doctors:', error);
        }
    };

    const fetchReports = async () => {
        try {
            if (user?.id) {
                const response = await reports.getPatientReports(user.id);
                setPatientReports(response.data.reports || []);
            }
        } catch (error) {
            console.error('Error fetching reports:', error);
        }
    };

    const handleDownload = async (fileHash: string, fileName: string) => {
        try {
            const response = await reports.download(fileHash);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Download error:', error);
        }
    };

    return (
        <Box sx={{ bgcolor: '#f4f6f8', minHeight: '100vh', pb: 8 }}>
            <Navbar />

            <Container maxWidth="xl" sx={{ mt: 4 }}>
                {/* Rewards Summary Card */}
                <Card sx={{
                    mb: 4,
                    borderRadius: 4,
                    background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
                    color: 'white',
                    boxShadow: '0 8px 32px rgba(245, 124, 0, 0.3)'
                }}>
                    <CardContent sx={{ p: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                            <Typography variant="h6" fontWeight="bold">My Care Rewards</Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>Complete daily tasks assigned by your doctor to earn points!</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end' }}>
                                <VerifiedIcon sx={{ fontSize: 40 }} />
                                <Typography variant="h2" fontWeight="900">{rewardPoints}</Typography>
                            </Box>
                            <Typography variant="h6" fontWeight="bold">TOTAL POINTS</Typography>
                        </Box>
                    </CardContent>
                </Card>

                <Grid container spacing={3}>
                    {/* Main Content Area */}
                    <Grid sx={{ width: '100%', px: 1.5 }}>
                        {/* Linked Doctors */}
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                            Linked Doctors & Healthcare Providers
                        </Typography>
                        <Grid container spacing={2} sx={{ mb: 4 }}>
                            {myDoctors.length === 0 ? (
                                <Grid sx={{ width: '100%', px: 1.5 }}>
                                    <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 4, bgcolor: 'rgba(0,0,0,0.02)', border: '1px dashed #ccc' }}>
                                        <Typography color="text.secondary">No healthcare providers linked to your account yet.</Typography>
                                    </Paper>
                                </Grid>
                            ) : (
                                myDoctors.map((doc) => (
                                    <Grid key={doc.id} sx={{ width: { xs: '100%', md: '33.33%' }, px: 1.5, mb: 2 }}>
                                        <Card sx={{ borderRadius: 4, bgcolor: 'white', border: '1px solid #eee', height: '100%', transition: '0.3s', '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.1)' } }}>
                                            <CardContent>
                                                <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 'bold', mb: 1, display: 'block', textTransform: 'uppercase', letterSpacing: 1 }}>
                                                    🏥 {doc.organization}
                                                </Typography>
                                                <Typography variant="h6" fontWeight="bold">
                                                    Dr. {doc.name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                                    {doc.specialty}
                                                </Typography>
                                                <Divider sx={{ my: 2 }} />
                                                <Button
                                                    fullWidth
                                                    variant="contained"
                                                    size="medium"
                                                    startIcon={<CalendarMonthIcon />}
                                                    onClick={() => navigate('/patient/book-appointment', { state: { doctorId: doc.id, doctorName: doc.name } })}
                                                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
                                                >
                                                    Book Appointment
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))
                            )}
                        </Grid>

                        {/* Daily Tasks Section */}
                        <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                            📋 My Daily Health Plan
                            <Chip label="Rewards Enabled" size="small" color="secondary" sx={{ fontWeight: 'bold' }} />
                        </Typography>
                        <Grid container spacing={2} sx={{ mb: 4 }}>
                            {loadingTasks ? (
                                <Grid sx={{ width: '100%', px: 1.5 }}><LinearProgress /></Grid>
                            ) : patientTasks.length === 0 ? (
                                <Grid sx={{ width: '100%', px: 1.5 }}>
                                    <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 4, bgcolor: 'white', border: '1px dashed #ccc' }}>
                                        <Typography color="text.secondary">No daily tasks assigned to you yet.</Typography>
                                    </Paper>
                                </Grid>
                            ) : (
                                patientTasks.map((task) => (
                                    <Grid key={task._id} sx={{ width: { xs: '100%', md: '33.33%' }, px: 1.5, mb: 2 }}>
                                        <Card sx={{
                                            borderRadius: 4,
                                            bgcolor: 'white',
                                            border: '1px solid #eee',
                                            height: '100%',
                                            opacity: task.completed ? 0.8 : 1
                                        }}>
                                            <CardContent>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                                    <Chip
                                                        label={task.taskType.toUpperCase()}
                                                        size="small"
                                                        sx={{ bgcolor: 'rgba(26, 35, 126, 0.05)', color: 'primary.main', fontWeight: 'bold' }}
                                                    />
                                                    <Typography variant="subtitle2" color="secondary" fontWeight="bold">
                                                        +{task.rewardPoints} pts
                                                    </Typography>
                                                </Box>
                                                <Typography variant="h6" fontWeight="bold" gutterBottom>
                                                    {task.title}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, minHeight: 40 }}>
                                                    {task.description}
                                                </Typography>
                                                <Button
                                                    fullWidth
                                                    variant={task.completed ? "outlined" : "contained"}
                                                    color={task.completed ? "success" : "primary"}
                                                    disabled={task.completed}
                                                    startIcon={task.completed ? <CheckCircleIcon /> : undefined}
                                                    onClick={() => handleCompleteTask(task._id)}
                                                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
                                                >
                                                    {task.completed ? "Done & Rewarded" : "Mark as Complete"}
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))
                            )}
                        </Grid>

                        {/* Appointments Status */}
                        <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                            Active Appointments & Status
                        </Typography>
                        <Grid container spacing={2} sx={{ mb: 4 }}>
                            {patientAppointments.length === 0 ? (
                                <Grid sx={{ width: '100%', px: 1.5 }}>
                                    <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 4, bgcolor: 'rgba(0,0,0,0.01)', border: '1px solid #eee' }}>
                                        <Typography variant="body2" color="text.secondary">No active appointment requests found.</Typography>
                                    </Paper>
                                </Grid>
                            ) : (
                                patientAppointments.slice(0, 3).map((apt: any) => (
                                    <Grid key={apt._id} sx={{ width: { xs: '100%', md: '33.33%' }, px: 1.5, mb: 2 }}>
                                        <Card sx={{ borderRadius: 4, border: '1px solid #eee', position: 'relative', overflow: 'hidden' }}>
                                            <Box sx={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: 4,
                                                height: '100%',
                                                bgcolor: apt.status === 'accepted' ? 'success.main' : apt.status === 'requested' ? 'warning.main' : 'error.main'
                                            }} />
                                            <CardContent sx={{ py: 2 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                                    <Typography variant="subtitle2" fontWeight="bold">
                                                        Dr. {apt.doctorId.profile.name}
                                                    </Typography>
                                                    <Chip
                                                        size="small"
                                                        label={apt.status.toUpperCase()}
                                                        icon={apt.status === 'accepted' ? <CheckCircleIcon sx={{ fontSize: '0.8rem !important' }} /> : apt.status === 'requested' ? <PendingIcon sx={{ fontSize: '0.8rem !important' }} /> : <CancelIcon sx={{ fontSize: '0.8rem !important' }} />}
                                                        color={apt.status === 'accepted' ? 'success' : apt.status === 'requested' ? 'warning' : 'error'}
                                                        sx={{ fontSize: '0.65rem', fontWeight: 'bold', height: 20 }}
                                                    />
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary', mb: 0.5 }}>
                                                    <CalendarMonthIcon sx={{ fontSize: 14 }} />
                                                    <Typography variant="caption">{new Date(apt.appointmentDate).toLocaleDateString()}</Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                                                    <AccessTimeIcon sx={{ fontSize: 14 }} />
                                                    <Typography variant="caption">{apt.timeSlot}</Typography>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))
                            )}
                        </Grid>

                        {/* Blockchain Inbox */}
                        <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>Blockchain Medical Inbox</Typography>
                        <Card sx={{ borderRadius: 4 }}>
                            <CardContent sx={{ p: 2 }}>
                                {patientReports.length === 0 ? (
                                    <Box sx={{ p: 4, textAlign: 'center' }}>
                                        <Typography color="text.secondary">No reports received yet via Blockchain.</Typography>
                                    </Box>
                                ) : (
                                    <Grid container spacing={2}>
                                        {patientReports.map((report) => (
                                            <Grid key={report._id} sx={{ width: '100%', px: 1.5, mb: 2 }}>
                                                <Card variant="outlined" sx={{ borderRadius: 3, border: '1px solid #eee', transition: '0.3s', '&:hover': { borderColor: 'primary.main' } }}>
                                                    <CardContent sx={{ p: 2 }}>
                                                        <Grid container alignItems="center">
                                                            <Grid sx={{ width: { xs: '100%', sm: '75%' }, px: 1 }}>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                                    <Chip icon={<VerifiedIcon />} label="Sui Verified" color="success" size="small" sx={{ fontWeight: 'bold' }} />
                                                                    <Typography variant="subtitle2" color="primary">{report.reportType}</Typography>
                                                                </Box>
                                                                <Typography variant="h6" fontWeight="bold">{report.title}</Typography>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    From: Dr. {report.doctorId?.profile?.name} • {new Date(report.createdAt).toLocaleDateString()}
                                                                </Typography>
                                                                <Typography variant="caption" sx={{ fontFamily: 'monospace', opacity: 0.5, wordBreak: 'break-all' }}>
                                                                    TX: {report.blockchainTxHash}
                                                                </Typography>
                                                            </Grid>
                                                            <Grid sx={{ width: { xs: '100%', sm: '25%' }, px: 1, textAlign: { sm: 'right' }, mt: { xs: 2, sm: 0 } }}>
                                                                <Button
                                                                    variant="outlined"
                                                                    startIcon={<DownloadIcon />}
                                                                    onClick={() => handleDownload(report.fileHash, report.fileMetadata.fileName)}
                                                                    sx={{ borderRadius: 2, fontWeight: 'bold' }}
                                                                >
                                                                    Access
                                                                </Button>
                                                            </Grid>
                                                        </Grid>
                                                    </CardContent>
                                                </Card>
                                            </Grid>
                                        ))}
                                    </Grid>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default PatientDashboard;
