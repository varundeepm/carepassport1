import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
} from '@mui/material';
import EventNoteIcon from '@mui/icons-material/EventNote';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PendingIcon from '@mui/icons-material/Pending';
import { appointments, Appointment } from '../services/api';
import moment from 'moment';

const DoctorAppointments: React.FC = () => {
    const [appointmentsList, setAppointmentsList] = useState<Appointment[]>([]);
    const [filteredList, setFilteredList] = useState<Appointment[]>([]);
    const [tabValue, setTabValue] = useState(0);
    const [actionDialog, setActionDialog] = useState<{
        open: boolean;
        appointment: Appointment | null;
        action: 'accept' | 'reject' | null;
    }>({ open: false, appointment: null, action: null });
    const [doctorNotes, setDoctorNotes] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [dialogPatientPhone, setDialogPatientPhone] = useState('');

    useEffect(() => {
        fetchAppointments();
    }, []);

    useEffect(() => {
        filterAppointments();
    }, [tabValue, appointmentsList]);

    const fetchAppointments = async () => {
        try {
            const response = await appointments.getDoctor();
            setAppointmentsList(response.data.appointments);
        } catch (error) {
            console.error('Error fetching appointments:', error);
        }
    };

    const filterAppointments = () => {
        const filters = ['requested', 'accepted', 'all'];
        const filter = filters[tabValue];

        if (filter === 'all') {
            setFilteredList(appointmentsList);
        } else {
            setFilteredList(appointmentsList.filter(apt => apt.status === filter));
        }
    };

    const handleAction = async () => {
        if (!actionDialog.appointment || !actionDialog.action) return;

        try {
            const data: any = {
                status: actionDialog.action === 'accept' ? 'accepted' : 'rejected',
                patientPhone: dialogPatientPhone.trim() || undefined,
            };
            if (doctorNotes) data.doctorNotes = doctorNotes;
            if (rejectionReason) data.rejectionReason = rejectionReason;

            await appointments.updateStatus(actionDialog.appointment._id, data);
            setActionDialog({ open: false, appointment: null, action: null });
            setDoctorNotes('');
            setRejectionReason('');
            setDialogPatientPhone('');
            fetchAppointments();
        } catch (error) {
            console.error('Error updating appointment:', error);
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                <EventNoteIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                <Box>
                    <Typography variant="h4" fontWeight="bold">
                        Appointment Management
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Review and manage patient consultation requests
                    </Typography>
                </Box>
            </Box>

            <Paper sx={{ borderRadius: 4, elevation: 0, border: '1px solid #e0e0e0' }}>
                <Tabs
                    value={tabValue}
                    onChange={(_, newValue) => setTabValue(newValue)}
                    sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
                >
                    <Tab label="Pending Requests" />
                    <Tab label="Confirmed" />
                    <Tab label="All Appointments" />
                </Tabs>

                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Date & Time</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Patient</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Reason</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredList.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                        <Typography color="text.secondary">No appointments found.</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredList.map((appointment) => (
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
                                                {appointment.patientId.profile.name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {appointment.patientId.email}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>{appointment.consultationType}</TableCell>
                                        <TableCell>
                                            <Typography
                                                sx={{
                                                    maxWidth: 250,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                }}
                                                title={appointment.reason}
                                            >
                                                {appointment.reason}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>{getStatusChip(appointment.status)}</TableCell>
                                        <TableCell align="right">
                                            {appointment.status === 'requested' && (
                                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                                    <Button
                                                        variant="contained"
                                                        color="success"
                                                        size="small"
                                                        onClick={() => {
                                                            setActionDialog({ open: true, appointment, action: 'accept' });
                                                            setDialogPatientPhone((appointment.patientId as any)?.profile?.phone || '');
                                                        }}
                                                        sx={{ fontWeight: 'bold' }}
                                                    >
                                                        Accept
                                                    </Button>
                                                    <Button
                                                        variant="outlined"
                                                        color="error"
                                                        size="small"
                                                        onClick={() => {
                                                            setActionDialog({ open: true, appointment, action: 'reject' });
                                                            setDialogPatientPhone((appointment.patientId as any)?.profile?.phone || '');
                                                        }}
                                                    >
                                                        Reject
                                                    </Button>
                                                </Box>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Accept/Reject Dialog */}
            <Dialog
                open={actionDialog.open}
                onClose={() => setActionDialog({ open: false, appointment: null, action: null })}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    {actionDialog.action === 'accept' ? 'Confirm Appointment' : 'Reject Appointment'}
                </DialogTitle>
                <DialogContent>
                    {actionDialog.appointment && (
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                Patient: <strong>{actionDialog.appointment.patientId.profile.name}</strong>
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Date:{' '}
                                <strong>
                                    {moment(actionDialog.appointment.appointmentDate).format('MMM DD, YYYY')} at{' '}
                                    {actionDialog.appointment.timeSlot}
                                </strong>
                            </Typography>
                        </Box>
                    )}

                    {/* Phone number – always shown so SMS is guaranteed */}
                    <TextField
                        fullWidth
                        label="Patient Mobile Number"
                        value={dialogPatientPhone}
                        onChange={(e) => setDialogPatientPhone(e.target.value)}
                        placeholder="e.g. 9876543210 or +919876543210"
                        helperText="SMS notification will be sent to this number"
                        inputProps={{ type: 'tel' }}
                        sx={{ mb: 2 }}
                        InputProps={{
                            startAdornment: <span style={{ marginRight: 6, fontSize: 18 }}>📱</span>
                        }}
                    />

                    {actionDialog.action === 'accept' ? (
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Notes (Optional)"
                            value={doctorNotes}
                            onChange={(e) => setDoctorNotes(e.target.value)}
                            placeholder="Add any preparation instructions for the patient..."
                            sx={{ mt: 2 }}
                        />
                    ) : (
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Rejection Reason"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Explain why you're rejecting this appointment..."
                            required
                            sx={{ mt: 2 }}
                        />
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button
                        onClick={() => {
                            setActionDialog({ open: false, appointment: null, action: null });
                            setDoctorNotes('');
                            setRejectionReason('');
                            setDialogPatientPhone('');
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color={actionDialog.action === 'accept' ? 'success' : 'error'}
                        onClick={handleAction}
                        disabled={actionDialog.action === 'reject' && !rejectionReason}
                        sx={{ fontWeight: 'bold' }}
                    >
                        {actionDialog.action === 'accept' ? 'Confirm Appointment' : 'Reject Appointment'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default DoctorAppointments;
