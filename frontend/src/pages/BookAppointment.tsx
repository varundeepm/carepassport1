import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    Button,
    TextField,
    MenuItem,
    Grid,
    Chip,
    Alert,
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useNavigate, useLocation } from 'react-router-dom';
import { appointments } from '../services/api';

const BookAppointment: React.FC = () => {
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [doctorName, setDoctorName] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [selectedSlot, setSelectedSlot] = useState('');
    const [consultationType, setConsultationType] = useState('In-Person');
    const [reason, setReason] = useState('');
    const [patientPhone, setPatientPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // If doctorId is passed via state, pre-fill it
        if (location.state?.doctorId) {
            setSelectedDoctor(location.state.doctorId);
        }
        if (location.state?.doctorName) {
            setDoctorName(location.state.doctorName);
        }
    }, [location.state]);

    useEffect(() => {
        if (selectedDoctor && selectedDate) {
            fetchAvailableSlots();
        }
    }, [selectedDoctor, selectedDate]);

    const fetchAvailableSlots = async () => {
        try {
            const response = await appointments.getAvailableSlots(selectedDoctor, selectedDate);
            setAvailableSlots(response.data.availableSlots);
        } catch (error) {
            console.error('Error fetching slots:', error);
        }
    };

    const handleSubmit = async () => {
        if (!selectedDoctor || !selectedDate || !selectedSlot || !reason) {
            setError('Please fill all required fields');
            return;
        }
        if (!patientPhone.trim()) {
            setError('Please enter your mobile number so we can send you an SMS confirmation.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await appointments.create({
                doctorId: selectedDoctor,
                appointmentDate: selectedDate,
                timeSlot: selectedSlot,
                consultationType,
                reason,
                patientPhone: patientPhone.trim(),
            });
            setSuccess(true);
            setTimeout(() => navigate('/patient/appointments'), 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to book appointment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #e0e0e0' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    <CalendarMonthIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                    <Box>
                        <Typography variant="h4" fontWeight="bold">
                            Book Consultation
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            {doctorName ? `Requesting a visit with Dr. ${doctorName}` : 'Schedule an appointment with your doctor'}
                        </Typography>
                    </Box>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 3 }}>Appointment requested successfully! Redirecting...</Alert>}

                <Grid container spacing={3}>
                    <Grid sx={{ width: '100%', px: 1.5, mb: 1 }}>
                        <TextField
                            fullWidth
                            label="Doctor ID"
                            value={selectedDoctor}
                            onChange={(e) => setSelectedDoctor(e.target.value)}
                            required
                            placeholder="Enter doctor's ID"
                            inputProps={{ readOnly: !!location.state?.doctorId }}
                            helperText={location.state?.doctorId ? "Locked to your selected provider" : "Enter the ID of the doctor you wish to visit"}
                        />
                    </Grid>

                    <Grid sx={{ width: { xs: '100%', md: '50%' }, px: 1.5, mb: 2 }}>
                        <TextField
                            fullWidth
                            label="Appointment Date"
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ min: new Date().toISOString().split('T')[0] }}
                            required
                        />
                    </Grid>

                    <Grid sx={{ width: { xs: '100%', md: '50%' }, px: 1.5, mb: 2 }}>
                        <TextField
                            fullWidth
                            select
                            label="Consultation Type"
                            value={consultationType}
                            onChange={(e) => setConsultationType(e.target.value)}
                            required
                        >
                            <MenuItem value="In-Person">In-Person</MenuItem>
                            <MenuItem value="Video Call">Video Call</MenuItem>
                            <MenuItem value="Phone Call">Phone Call</MenuItem>
                        </TextField>
                    </Grid>

                    {(availableSlots.length > 0 || selectedDate) && (
                        <Grid sx={{ width: '100%', px: 1.5, mb: 2 }}>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                {availableSlots.length > 0 ? 'Available Time Slots' : (selectedDate ? 'No slots available for this date' : 'Select a date to see availability')}
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {availableSlots.map((slot) => (
                                    <Chip
                                        key={slot}
                                        label={slot}
                                        onClick={() => setSelectedSlot(slot)}
                                        color={selectedSlot === slot ? 'primary' : 'default'}
                                        variant={selectedSlot === slot ? 'filled' : 'outlined'}
                                        sx={{ cursor: 'pointer', px: 1, height: 32, fontWeight: selectedSlot === slot ? 'bold' : 'normal' }}
                                    />
                                ))}
                            </Box>
                        </Grid>
                    )}

                    <Grid sx={{ width: '100%', px: 1.5 }}>
                        <TextField
                            fullWidth
                            label="Your Mobile Number"
                            value={patientPhone}
                            onChange={(e) => setPatientPhone(e.target.value)}
                            required
                            placeholder="e.g. 9876543210 or +919876543210"
                            helperText="We'll send you an SMS confirmation to this number"
                            inputProps={{ type: 'tel' }}
                        />
                    </Grid>

                    <Grid sx={{ width: '100%', px: 1.5 }}>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label="Reason for Consultation"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            required
                            placeholder="Briefly describe why you need this consultation..."
                        />
                    </Grid>
                </Grid>

                <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        onClick={() => navigate(-1)}
                        sx={{ px: 4, borderRadius: 2 }}
                    >
                        Go Back
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={loading || success || !selectedSlot}
                        sx={{ px: 4, borderRadius: 2, fontWeight: 'bold' }}
                    >
                        {loading ? 'Submitting...' : 'Send Request'}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default BookAppointment;
