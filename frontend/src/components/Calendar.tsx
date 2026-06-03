import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
  TextField,
  Alert
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  LocalHospital as HospitalIcon,
  Medication as MedicationIcon,
  Assignment as AssignmentIcon,
  EventNote as EventNoteIcon,
  Folder as FolderIcon,
  Close as CloseIcon,
  Add as AddIcon
} from '@mui/icons-material';

interface Visit {
  date: string;
  doctor: string;
  specialty: string;
  files: string[];
  prescription: string;
  suggestions: string;
  reAppointment: string;
  hospitalName: string;
}

interface Patient {
  id: string;
  name: string;
  purpose: string;
  appointmentDate: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

interface CalendarProps {
  visits: Visit[];
  patients?: Patient[];
  onPatientAdded?: (patient: Patient) => void;
}

const Calendar: React.FC<CalendarProps> = ({ visits, patients = [], onPatientAdded }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedVisits, setSelectedVisits] = useState<Visit[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [addPatientDialogOpen, setAddPatientDialogOpen] = useState(false);
  const [newPatient, setNewPatient] = useState({
    id: '',
    name: '',
    purpose: '',
    appointmentDate: '',
    status: 'scheduled' as const
  });
  const [error, setError] = useState<string | null>(null);

  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());

  const days = [];
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    days.push(date);
  }

  const getVisitsForDate = (date: Date): Visit[] => {
    if (!date) return [];
    const dateString = date.toISOString().split('T')[0];
    return visits.filter(visit => visit.date === dateString);
  };

  const getPatientsForDate = (date: Date): Patient[] => {
    if (!date) return [];
    const dateString = date.toISOString().split('T')[0];
    return patients.filter(patient => patient.appointmentDate === dateString);
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === currentDate.getMonth();
  };

  const isPastDate = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const handleDateClick = (date: Date) => {
    const visitsForDate = getVisitsForDate(date);
    const patientsForDate = getPatientsForDate(date);
    if (visitsForDate.length > 0 || patientsForDate.length > 0) {
      setSelectedDate(date);
      setSelectedVisits(visitsForDate);
      setDialogOpen(true);
    }
  };

  const handleAddPatient = () => {
    setAddPatientDialogOpen(true);
    setNewPatient({
      id: '',
      name: '',
      purpose: '',
      appointmentDate: '',
      status: 'scheduled'
    });
    setError(null);
  };

  const handleCloseAddPatient = () => {
    setAddPatientDialogOpen(false);
  };

  const handlePatientInputChange = (field: string, value: string) => {
    setNewPatient(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitPatient = () => {
    if (!newPatient.id || !newPatient.name || !newPatient.purpose || !newPatient.appointmentDate) {
      setError('Please fill in all required fields');
      return;
    }

    if (onPatientAdded) {
      onPatientAdded(newPatient);
    }

    setAddPatientDialogOpen(false);
    setNewPatient({
      id: '',
      name: '',
      purpose: '',
      appointmentDate: '',
      status: 'scheduled'
    });
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <IconButton onClick={handlePrevMonth}>
          <ChevronLeftIcon />
        </IconButton>
        <Typography variant="h5" component="h2">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={handleNextMonth}>
            <ChevronRightIcon />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddPatient}
            size="small"
          >
            Add Patient
          </Button>
        </Box>
      </Box>

      <Paper elevation={2}>
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0 }}>
            {dayNames.map((day) => (
              <Box key={day} sx={{ p: 1, textAlign: 'center', fontWeight: 'bold', borderBottom: '1px solid #e0e0e0' }}>
                <Typography variant="subtitle2">{day}</Typography>
              </Box>
            ))}
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0 }}>
            {days.map((date, index) => {
              const visitsForDate = getVisitsForDate(date);
              const patientsForDate = getPatientsForDate(date);
              const hasVisits = visitsForDate.length > 0;
              const hasPatients = patientsForDate.length > 0;
              const isPast = isPastDate(date);
              
              return (
                <Box
                  key={index}
                  sx={{
                    p: 1,
                    minHeight: '80px',
                    border: '1px solid #e0e0e0',
                    cursor: (hasVisits || hasPatients) ? 'pointer' : 'default',
                    backgroundColor: (hasVisits && isPast) ? '#ffebee' : 
                                  hasPatients ? '#e3f2fd' : 'transparent',
                    '&:hover': (hasVisits || hasPatients) ? { backgroundColor: '#f5f5f5' } : {},
                  }}
                  onClick={() => handleDateClick(date)}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: isCurrentMonth(date) ? 'text.primary' : 'text.disabled',
                      fontWeight: isToday(date) ? 'bold' : 'normal',
                      textDecoration: isToday(date) ? 'underline' : 'none'
                    }}
                  >
                    {date.getDate()}
                  </Typography>
                  
                  {hasVisits && (
                    <Box sx={{ mt: 0.5 }}>
                      <Chip
                        label={`${visitsForDate.length} visit${visitsForDate.length > 1 ? 's' : ''}`}
                        size="small"
                        color={isPast ? "error" : "primary"}
                        sx={{ fontSize: '0.7rem', height: '20px' }}
                      />
                    </Box>
                  )}
                  
                  {hasPatients && (
                    <Box sx={{ mt: 0.5 }}>
                      <Chip
                        label={`${patientsForDate.length} appointment${patientsForDate.length > 1 ? 's' : ''}`}
                        size="small"
                        color="secondary"
                        sx={{ fontSize: '0.7rem', height: '20px' }}
                      />
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>
      </Paper>

      {/* Add Patient Dialog */}
      <Dialog open={addPatientDialogOpen} onClose={handleCloseAddPatient} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">
              Add New Patient Appointment
            </Typography>
            <IconButton onClick={handleCloseAddPatient}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Patient ID *"
                value={newPatient.id}
                onChange={(e) => handlePatientInputChange('id', e.target.value)}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Patient Name *"
                value={newPatient.name}
                onChange={(e) => handlePatientInputChange('name', e.target.value)}
                margin="normal"
                required
              />
            </Box>
            <TextField
              fullWidth
              label="Appointment Date *"
              type="date"
              value={newPatient.appointmentDate}
              onChange={(e) => handlePatientInputChange('appointmentDate', e.target.value)}
              margin="normal"
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Purpose of Appointment *"
              value={newPatient.purpose}
              onChange={(e) => handlePatientInputChange('purpose', e.target.value)}
              margin="normal"
              multiline
              rows={3}
              placeholder="Describe the disease, symptoms, or reason for appointment..."
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddPatient}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmitPatient}
            variant="contained"
            disabled={!newPatient.id || !newPatient.name || !newPatient.purpose || !newPatient.appointmentDate}
          >
            Add Patient
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarIcon color="primary" />
              <Typography variant="h6">
                Medical Visits - {selectedDate?.toLocaleDateString()}
              </Typography>
            </Box>
            <IconButton onClick={() => setDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {/* Patient Appointments */}
          {selectedDate && getPatientsForDate(selectedDate).map((patient, index) => (
            <Box key={`patient-${index}`} sx={{ mb: 3, p: 2, border: '1px solid #e3f2fd', borderRadius: 1, backgroundColor: '#f8f9fa' }}>
              <Typography variant="h6" color="secondary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon />
                Patient Appointment
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {patient.name} (ID: {patient.id})
                </Typography>
                <Chip label={patient.status} color="secondary" size="small" />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <AssignmentIcon sx={{ fontSize: 16 }} />
                  Purpose of Visit:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {patient.purpose}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <EventNoteIcon sx={{ fontSize: 16 }} />
                  Appointment Date:
                </Typography>
                <Chip label={new Date(patient.appointmentDate).toLocaleDateString()} color="info" size="small" />
              </Box>
            </Box>
          ))}

          {/* Medical Visits */}
          {selectedVisits.map((visit, index) => (
            <Box key={`visit-${index}`} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
              <Typography variant="h6" color="primary" gutterBottom>
                {visit.hospitalName}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <PersonIcon sx={{ fontSize: 16 }} />
                <Typography variant="subtitle1">
                  {visit.doctor} - {visit.specialty}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <FolderIcon sx={{ fontSize: 16 }} />
                  Medical Files:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {visit.files.map((file, fileIndex) => (
                    <Chip key={fileIndex} label={file} size="small" color="info" variant="outlined" />
                  ))}
                </Box>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <MedicationIcon sx={{ fontSize: 16 }} />
                  Prescription:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {visit.prescription}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  Doctor's Suggestions:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {visit.suggestions}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <EventNoteIcon sx={{ fontSize: 16 }} />
                  Next Appointment:
                </Typography>
                <Chip label={visit.reAppointment} color="success" size="small" />
              </Box>
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Calendar;