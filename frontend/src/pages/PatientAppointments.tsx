import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    Button,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PendingIcon from '@mui/icons-material/Pending';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { appointments, Appointment } from '../services/api';
import moment from 'moment';

const PatientAppointments: React.FC = () => {
    const [appointmentsList, setAppointmentsList] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [cancelDialog, setCancelDialog] = useState<string | null>(null);

    const navigate = useNavigate();

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const response = await appointments.getPatient();
            setAppointmentsList(response.data.appointments);
        } catch (error) {
            console.error('Error fetching appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (appointmentId: string) => {
        try {
            await appointments.cancel(appointmentId);
            setCancelDialog(null);
            fetchAppointments();
        } catch (error) {
            console.error('Error cancelling appointment:', error);
        }
    };

    const getStatusChip = (status: string) => {
        const statusConfig = {
            requested: { label: 'Pending', color: 'warning' as const, icon: <PendingIcon /> },
            accepted: { label: 'Confirmed', color: 'success' as const, icon: <CheckCircleIcon /> },
            rejected: { label: 'Rejected', color: 'error' as const, icon: <CancelIcon /> },
            completed: { label: 'Completed', color: 'default' as const, icon: <CheckCircleIcon /> },
            cancelled: { label: 'Cancelled', color: 'default' as const, icon: <CancelIcon /> },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.requested;
        return (
            <Chip
                icon={config.icon}
                label={config.label}
                color={config.color}
                size="small"
                sx={{ fontWeight: 'bold' }}
            />
        );
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <EventIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                    <Box>
                        <Typography variant="h4" fontWeight="bold">
                            My Appointments
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            View and manage your consultation schedule
                        </Typography>
                    </Box>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/patient/book-appointment')}
                    sx={{ borderRadius: 2, fontWeight: 'bold', px: 3 }}
                >
                    Book New Appointment
                </Button>
            </Box>

            <TableContainer component={Paper} sx={{ borderRadius: 4, elevation: 0, border: '1px solid #e0e0e0' }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Date & Time</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Doctor</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Reason</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {appointmentsList.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                    <Typography color="text.secondary">No appointments found. Book your first consultation!</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            appointmentsList.map((appointment) => (
                                <TableRow key={appointment._id} hover>
                                    <TableCell>
                                        <Typography fontWeight="medium">
                                            {moment(appointment.appointmentDate).format('MMM DD, YYYY')}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {appointment.timeSlot}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography fontWeight="medium">
                                            Dr. {appointment.doctorId.profile.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {appointment.doctorId.email}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>{appointment.consultationType}</TableCell>
                                    <TableCell>
                                        <Typography
                                            sx={{
                                                maxWidth: 200,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {appointment.reason}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>{getStatusChip(appointment.status)}</TableCell>
                                    <TableCell align="right">
                                        {(appointment.status === 'requested' || appointment.status === 'accepted') && (
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                size="small"
                                                onClick={() => setCancelDialog(appointment._id)}
                                            >
                                                Cancel
                                            </Button>
                                        )}
                                        {appointment.status === 'rejected' && appointment.rejectionReason && (
                                            <Typography variant="caption" color="error">
                                                Reason: {appointment.rejectionReason}
                                            </Typography>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Cancel Confirmation Dialog */}
            <Dialog open={!!cancelDialog} onClose={() => setCancelDialog(null)}>
                <DialogTitle>Cancel Appointment</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to cancel this appointment?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCancelDialog(null)}>No, Keep It</Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={() => cancelDialog && handleCancel(cancelDialog)}
                    >
                        Yes, Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default PatientAppointments;
