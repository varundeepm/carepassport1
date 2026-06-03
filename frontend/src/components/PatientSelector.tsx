import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Autocomplete,
  Card,
  CardContent,
  Typography,
  Chip,
  Alert,
  CircularProgress,
  Button,
  Grid,
  Divider
} from '@mui/material';
import {
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Home as HomeIcon,
  LocalHospital as HospitalIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import RealPatientService, { Patient, PatientOption } from '../services/realPatientService';


interface PatientSelectorProps {
  onPatientSelected?: (patient: Patient) => void;
}

const PatientSelector: React.FC<PatientSelectorProps> = ({ onPatientSelected }) => {
  const [patientOptions, setPatientOptions] = useState<PatientOption[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  // Load initial patient options
  useEffect(() => {
    loadPatientOptions();
  }, []);

  const loadPatientOptions = async () => {
    try {
      setLoading(true);
      setError(null);
      const options = await RealPatientService.getPatientOptions();
      setPatientOptions(options);
    } catch (err) {
      setError('Failed to load patient list');
      console.error('Error loading patients:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePatientSelect = async (option: PatientOption | null) => {
    if (!option) {
      setSelectedPatient(null);
      return;
    }

    try {
      setSearchLoading(true);
      const patientDetails = await RealPatientService.getPatientDetails(option.id);
      if (patientDetails) {
        setSelectedPatient(patientDetails);
        onPatientSelected?.(patientDetails);
      }
    } catch (err) {
      setError('Failed to load patient details');
      console.error('Error loading patient details:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'primary';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Loading patients...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <PersonIcon />
        Patient Database
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Patient Search/Selection */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Select Patient
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Autocomplete
              sx={{ flex: 1 }}
              options={patientOptions}
              getOptionLabel={(option) => `${option.name} (${option.phone})`}
              onChange={(_, value) => handlePatientSelect(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search Patient by Name or Phone"
                  variant="outlined"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {searchLoading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Box>
                    <Typography variant="body1" fontWeight="bold">
                      {option.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {option.phone} • ID: {option.id}
                    </Typography>
                  </Box>
                </Box>
              )}
            />
            <Button 
              variant="outlined" 
              onClick={loadPatientOptions}
              disabled={loading}
            >
              Refresh
            </Button>
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Total patients in database: {patientOptions.length}
          </Typography>
        </CardContent>
      </Card>

      {/* Selected Patient Details */}
      {selectedPatient && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon />
              Patient Details
            </Typography>
            
            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    BASIC INFORMATION
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon fontSize="small" />
                      <Typography variant="body1">
                        <strong>{selectedPatient.name}</strong> (Age: {selectedPatient.age}, {selectedPatient.gender})
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PhoneIcon fontSize="small" />
                      <Typography variant="body2">{selectedPatient.phone}</Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EmailIcon fontSize="small" />
                      <Typography variant="body2">{selectedPatient.email}</Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <HomeIcon fontSize="small" />
                      <Typography variant="body2">{selectedPatient.address}</Typography>
                    </Box>
                    
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2">
                        <strong>Blood Group:</strong> {selectedPatient.bloodGroup}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Emergency Contact */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    EMERGENCY CONTACT
                  </Typography>
                  <Divider sx={{ mb: 1 }} />
                  <Typography variant="body2">
                    <strong>{selectedPatient.emergencyContact.name}</strong> ({selectedPatient.emergencyContact.relation})
                  </Typography>
                  <Typography variant="body2">
                    {selectedPatient.emergencyContact.phone}
                  </Typography>
                </Box>
              </Grid>

              {/* Medical Information */}
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    MEDICAL HISTORY
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  {selectedPatient.medicalHistory.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {selectedPatient.medicalHistory.map((history, index) => (
                        <Chip
                          key={index}
                          label={history}
                          variant="outlined"
                          size="small"
                          icon={<HospitalIcon />}
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No medical history recorded
                    </Typography>
                  )}
                </Box>

                {/* Appointments */}
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    APPOINTMENTS
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  {selectedPatient.appointments.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {selectedPatient.appointments.map((appointment) => (
                        <Card key={appointment.id} variant="outlined" sx={{ p: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <ScheduleIcon fontSize="small" />
                                <Typography variant="body2" fontWeight="bold">
                                  {formatDate(appointment.date)} at {appointment.time}
                                </Typography>
                              </Box>
                              <Typography variant="body2">
                                <strong>{appointment.doctor}</strong> - {appointment.department}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {appointment.purpose}
                              </Typography>
                            </Box>
                            <Chip
                              label={appointment.status}
                              color={getStatusColor(appointment.status) as any}
                              size="small"
                            />
                          </Box>
                        </Card>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No appointments scheduled
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>

            {/* Metadata */}
            <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #e0e0e0' }}>
              <Typography variant="caption" color="text.secondary">
                Patient ID: {selectedPatient.id} | 
                Created: {formatDate(selectedPatient.createdAt)} | 
                Last Updated: {formatDate(selectedPatient.updatedAt)}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default PatientSelector;
