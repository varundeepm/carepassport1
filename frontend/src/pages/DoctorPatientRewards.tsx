import React, { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Typography,
    Box,
    Avatar,
    Chip,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    CircularProgress,
    LinearProgress,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Divider
} from '@mui/material';
import Navbar from '../components/NavBar';
import StarIcon from '@mui/icons-material/Star';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import HistoryIcon from '@mui/icons-material/History';
import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

const DoctorPatientRewards: React.FC = () => {
    const [patients, setPatients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [openTasksDialog, setOpenTasksDialog] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<any>(null);
    const [patientTasks, setPatientTasks] = useState<any[]>([]);
    const [loadingTasks, setLoadingTasks] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Task Form State
    const [taskData, setTaskData] = useState({
        title: '',
        description: '',
        taskType: 'diet',
        priority: 'medium',
        rewardPoints: 10
    });

    useEffect(() => {
        fetchPatientRewards();
    }, []);

    const fetchPatientRewards = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/tasks/doctor/rewards`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setPatients(response.data.patients || []);
        } catch (error) {
            console.error('Error fetching rewards:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (patient: any) => {
        setSelectedPatient(patient);
        setOpenDialog(true);
    };

    const handleViewTasks = async (patient: any) => {
        setSelectedPatient(patient);
        setOpenTasksDialog(true);
        setLoadingTasks(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/tasks/patient/${patient._id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setPatientTasks(response.data.tasks || []);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setLoadingTasks(false);
        }
    };

    const handleCreateTask = async () => {
        if (!selectedPatient) return;
        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/tasks`, {
                ...taskData,
                patientId: selectedPatient._id
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setOpenDialog(false);
            setTaskData({ title: '', description: '', taskType: 'diet', priority: 'medium', rewardPoints: 10 });
            alert('Task created and patient notified via SMS!');
            fetchPatientRewards(); // Refresh rewards list
        } catch (error) {
            console.error('Error creating task:', error);
            alert('Failed to create task.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>
        );
    }

    return (
        <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh' }}>
            <Navbar />
            <Container maxWidth="xl" sx={{ mt: 4, pb: 6 }}>
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" fontWeight="bold">🏆 Patient Rewards & Gamification</Typography>
                    <Typography variant="body1" color="text.secondary">Monitor patient progress and assign incentivized health plans.</Typography>
                </Box>

                <Grid container spacing={3}>
                    <Grid sx={{ width: '100%', px: 2 }}>
                        <TableContainer component={Paper} sx={{ borderRadius: 4, elevation: 0, border: '1px solid #eee' }}>
                            <Table sx={{ minWidth: 650 }}>
                                <TableHead sx={{ bgcolor: '#f4f6f8' }}>
                                    <TableRow>
                                        <TableCell>Patient Name</TableCell>
                                        <TableCell align="center">Total Rewards</TableCell>
                                        <TableCell align="center">Level</TableCell>
                                        <TableCell align="center">Progress</TableCell>
                                        <TableCell align="center">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {patients.length === 0 ? (
                                        <TableRow><TableCell colSpan={5} align="center">No patients found.</TableCell></TableRow>
                                    ) : (
                                        patients.map((p) => (
                                            <TableRow key={p._id} sx={{ '&:hover': { bgcolor: '#fafafa' } }}>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        <Avatar sx={{ bgcolor: 'primary.main' }}>{p.profile.name[0]}</Avatar>
                                                        <Typography variant="body1" fontWeight="bold">{p.profile.name}</Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                                        <StarIcon sx={{ color: '#FFD700' }} />
                                                        <Typography variant="h6" fontWeight="bold">{p.profile.rewardPoints || 0}</Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Chip
                                                        label={getPatientLevel(p.profile.rewardPoints || 0)}
                                                        size="small"
                                                        sx={{ fontWeight: 'bold', bgcolor: getLevelColor(p.profile.rewardPoints || 0), color: 'white' }}
                                                    />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Box sx={{ width: '100%', minWidth: 150 }}>
                                                        <LinearProgress
                                                            variant="determinate"
                                                            value={((p.profile.rewardPoints || 0) % 100)}
                                                            sx={{ height: 8, borderRadius: 5, mb: 0.5 }}
                                                        />
                                                        <Typography variant="caption">{100 - ((p.profile.rewardPoints || 0) % 100)} pts to next level</Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                                        <Button
                                                            startIcon={<HistoryIcon />}
                                                            variant="outlined"
                                                            size="small"
                                                            onClick={() => handleViewTasks(p)}
                                                            sx={{ borderRadius: 2, textTransform: 'none' }}
                                                        >
                                                            View Tasks
                                                        </Button>
                                                        <Button
                                                            startIcon={<AddCircleIcon />}
                                                            variant="contained"
                                                            size="small"
                                                            onClick={() => handleOpenDialog(p)}
                                                            sx={{ borderRadius: 2, textTransform: 'none' }}
                                                        >
                                                            Assign Task
                                                        </Button>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>
                </Grid>

                {/* Task History Dialog */}
                <Dialog open={openTasksDialog} onClose={() => setOpenTasksDialog(false)} maxWidth="sm" fullWidth>
                    <DialogTitle sx={{ fontWeight: 'bold' }}>Task Status - {selectedPatient?.profile.name}</DialogTitle>
                    <DialogContent dividers>
                        {loadingTasks ? <Box sx={{ p: 3, textAlign: 'center' }}><CircularProgress /></Box> : (
                            <List>
                                {patientTasks.length === 0 ? <Typography sx={{ textAlign: 'center', p: 2 }}>No tasks assigned yet.</Typography> : (
                                    patientTasks.map((task, idx) => (
                                        <React.Fragment key={task._id}>
                                            <ListItem alignItems="flex-start">
                                                <ListItemText
                                                    primary={<Typography fontWeight="bold">{task.title}</Typography>}
                                                    secondary={
                                                        <>
                                                            <Typography component="span" variant="body2" color="text.primary">
                                                                {task.taskType.toUpperCase()} | {task.rewardPoints} pts
                                                            </Typography>
                                                            {` — ${task.description}`}
                                                        </>
                                                    }
                                                />
                                                <ListItemSecondaryAction>
                                                    <Chip
                                                        label={task.completed ? "COMPLETED" : "PENDING"}
                                                        color={task.completed ? "success" : "warning"}
                                                        size="small"
                                                        icon={task.completed ? <TaskAltIcon /> : undefined}
                                                        sx={{ fontWeight: 'bold' }}
                                                    />
                                                </ListItemSecondaryAction>
                                            </ListItem>
                                            {idx < patientTasks.length - 1 && <Divider component="li" />}
                                        </React.Fragment>
                                    ))
                                )}
                            </List>
                        )}
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setOpenTasksDialog(false)}>Close</Button>
                    </DialogActions>
                </Dialog>

                {/* Assign Task Dialog */}
                <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                    <DialogTitle sx={{ fontWeight: 'bold' }}>Assign New Plan - {selectedPatient?.profile.name}</DialogTitle>
                    <DialogContent dividers>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
                            <TextField
                                label="Task Title"
                                fullWidth
                                value={taskData.title}
                                onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
                                placeholder="e.g. Daily Morning Walk"
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
                                <Grid sx={{ width: '50%', px: 1 }}>
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
                                <Grid sx={{ width: '50%', px: 1 }}>
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
                        <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                        <Button
                            variant="contained"
                            disabled={submitting || !taskData.title}
                            onClick={handleCreateTask}
                            sx={{ borderRadius: 2, fontWeight: 'bold' }}
                        >
                            {submitting ? 'Sending SMS...' : 'Confirm & Notify Patient'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
};

const getPatientLevel = (points: number) => {
    if (points < 100) return 'Bronze';
    if (points < 300) return 'Silver';
    if (points < 600) return 'Gold';
    return 'Platinum';
};

const getLevelColor = (points: number) => {
    if (points < 100) return '#cd7f32';
    if (points < 300) return '#c0c0c0';
    if (points < 600) return '#ffd700';
    return '#e5e4e2';
};

export default DoctorPatientRewards;
