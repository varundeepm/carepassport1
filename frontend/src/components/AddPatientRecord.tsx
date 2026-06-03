import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  Fab,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  Upload as UploadIcon,
  Medication as MedicationIcon,
  Assignment as AssignmentIcon,
  Folder as FolderIcon,
  Person as PersonIcon,
  LocalHospital as HospitalIcon
} from '@mui/icons-material';
import { createPatientRecord, type CreatePatientRecordRequest, type PatientRecordData } from '../services/patientRecordApiService';
import { getPatientsForDoctor, type PatientData } from '../services/patientApiService';
import PatientRecordDetails from './PatientRecordDetails';

interface PatientRecord {
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  hospital: string;
  visitDate: string;
  prescription: string;
  suggestions: string;
  patientDetails: string; // Added patientDetails field
  files: MedicalFile[];
  status: 'active' | 'completed' | 'cancelled';
}

interface MedicalFile {
  id: string;
  name: string;
  type: 'xray' | 'mri' | 'blood-test' | 'ecg' | 'prescription' | 'report';
  url: string;
  uploadedAt: string;
}

interface AddPatientRecordProps {
  doctorId: string;
  onSave?: (record: PatientRecord) => void;
}

const AddPatientRecord: React.FC<AddPatientRecordProps> = ({ doctorId, onSave }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [loadingHospitals, setLoadingHospitals] = useState(false);
  const [createdRecord, setCreatedRecord] = useState<PatientRecordData | null>(null);
  
  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    hospital: '',
    visitDate: '',
    prescription: '',
    suggestions: '',
    patientDetails: '', // New field for patient-specific details
    files: [] as File[]
  });

  const hospitals = [
    'City General Hospital', 'Metro Medical Center', 'University Hospital',
    'St. Mary\'s Hospital', 'Central Medical Institute', 'Regional Health Center'
  ];

  const fileTypes = [
    { value: 'xray', label: 'X-Ray' },
    { value: 'mri', label: 'MRI' },
    { value: 'blood-test', label: 'Blood Test' },
    { value: 'ecg', label: 'ECG' },
    { value: 'prescription', label: 'Prescription' },
    { value: 'report', label: 'Report' }
  ];

  // Load patients and hospitals from MongoDB when dialog opens
  useEffect(() => {
    if (dialogOpen) {
      loadPatients();
      loadHospitals();
    }
  }, [dialogOpen, doctorId]);

  const loadPatients = async () => {
    try {
      setLoadingPatients(true);
      const patientsData = await getPatientsForDoctor(doctorId);
      setPatients(patientsData);
    } catch (error) {
      console.error('Failed to load patients:', error);
      setError('Failed to load patients. Please try again.');
    } finally {
      setLoadingPatients(false);
    }
  };

  const loadHospitals = async () => {
    try {
      setLoadingHospitals(true);
      const response = await fetch('http://localhost:5001/api/hospitals');
      const data = await response.json();
      
      if (data.success) {
        setHospitals(data.data);
      } else {
        throw new Error(data.message || 'Failed to load hospitals');
      }
    } catch (error) {
      console.error('Failed to load hospitals:', error);
      setError('Failed to load hospitals. Please try again.');
    } finally {
      setLoadingHospitals(false);
    }
  };

  const handleOpenDialog = () => {
    setDialogOpen(true);
    setError(null);
    setSuccess(null);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setCreatedRecord(null);
    setFormData({
      patientId: '',
      patientName: '',
      hospital: '',
      visitDate: '',
      prescription: '',
      suggestions: '',
      patientDetails: '',
      files: []
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePatientChange = (patientId: string) => {
    const patient = patients.find(p => p.patientId === patientId);
    setFormData(prev => ({
      ...prev,
      patientId,
      patientName: patient?.name || '',
      hospital: patient?.hospital || ''
    }));
  };

  const handleHospitalChange = (hospitalId: string) => {
    const hospital = hospitals.find(h => h.id === hospitalId);
    setFormData(prev => ({
      ...prev,
      hospital: hospital?.name || ''
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData(prev => ({ ...prev, files: [...prev.files, ...files] }));
  };

  const handleRemoveFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!formData.patientId || !formData.prescription) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const recordData: CreatePatientRecordRequest = {
        patientId: formData.patientId,
        patientName: formData.patientName,
        doctorId,
        doctorName: 'Dr. Sarah Johnson', // This would come from context/state
        hospital: formData.hospital,
        visitDate: formData.visitDate || new Date().toISOString().split('T')[0],
        prescription: formData.prescription,
        suggestions: formData.suggestions,
        patientDetails: formData.patientDetails,
        files: formData.files.map((file, index) => ({
          id: `file-${Date.now()}-${index}`,
          name: file.name,
          type: 'report' as any, // This would be determined by file type
          url: URL.createObjectURL(file),
          uploadedAt: new Date().toISOString()
        })),
        status: 'active'
      };

      const newRecord = await createPatientRecord(recordData);

      if (onSave) {
        onSave(newRecord);
      }

      setCreatedRecord(newRecord);
      setSuccess('Patient record added successfully!');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add patient record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add patient record"
        onClick={handleOpenDialog}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000
        }}
      >
        <AddIcon />
      </Fab>

      {/* Show Patient Record Details after creation */}
      {createdRecord && (
        <PatientRecordDetails 
          record={createdRecord} 
          onClose={() => setCreatedRecord(null)} 
        />
      )}

      {/* Add Patient Record Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">
              Add Patient Record
            </Typography>
            <IconButton onClick={handleCloseDialog}>
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
          
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Patient Selection */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Select Patient *</InputLabel>
                <Select
                  value={formData.patientId}
                  label="Select Patient *"
                  onChange={(e) => handlePatientChange(e.target.value)}
                  disabled={loadingPatients}
                >
                  {loadingPatients ? (
                    <MenuItem disabled>Loading patients...</MenuItem>
                  ) : patients.length === 0 ? (
                    <MenuItem disabled>No patients found. Please add patients first.</MenuItem>
                  ) : (
                    patients.map((patient) => (
                      <MenuItem key={patient.patientId} value={patient.patientId}>
                        {patient.name} - {patient.patientId}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Visit Date"
                type="date"
                value={formData.visitDate}
                onChange={(e) => handleInputChange('visitDate', e.target.value)}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Select Hospital *</InputLabel>
                <Select
                  value={hospitals.find(h => h.name === formData.hospital)?.id || '')
                  label="Select Hospital *"
                  onChange={(e) => handleHospitalChange(e.target.value)}
                  disabled={loadingHospitals}
                >
                  {loadingHospitals ? (
                    <MenuItem disabled>Loading hospitals...</MenuItem>
                  ) : hospitals.length === 0 ? (
                    <MenuItem disabled>No hospitals found. Please check database.</MenuItem>
                  ) : (
                    hospitals.map((hospital) => (
                      <MenuItem key={hospital.id} value={hospital.id}>
                        {hospital.displayName}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>

            {/* Patient Details Section */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon />
                Patient Details
              </Typography>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Patient Name"
                  value={formData.patientName}
                  margin="normal"
                  placeholder="Auto-filled when patient is selected"
                  InputProps={{
                    readOnly: true,
                  }}
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Patient ID"
                  value={formData.patientId}
                  margin="normal"
                  placeholder="Auto-filled when patient is selected"
                  InputProps={{
                    readOnly: true,
                  }}
                  variant="outlined"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Patient Details & Notes"
                value={formData.patientDetails}
                onChange={(e) => handleInputChange('patientDetails', e.target.value)}
                margin="normal"
                multiline
                rows={3}
                placeholder="Enter patient-specific details, symptoms, medical history, or any relevant notes..."
              />
            </Grid>

            {/* Prescription */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MedicationIcon />
                Prescription *
              </Typography>
              <TextField
                fullWidth
                label="Prescription Details"
                value={formData.prescription}
                onChange={(e) => handleInputChange('prescription', e.target.value)}
                margin="normal"
                multiline
                rows={4}
                placeholder="Enter prescription details, dosage, frequency, duration..."
              />
            </Grid>

            {/* Doctor's Suggestions */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AssignmentIcon />
                Doctor's Suggestions
              </Typography>
              <TextField
                fullWidth
                label="Suggestions and Recommendations"
                value={formData.suggestions}
                onChange={(e) => handleInputChange('suggestions', e.target.value)}
                margin="normal"
                multiline
                rows={3}
                placeholder="Enter lifestyle recommendations, follow-up instructions, precautions..."
              />
            </Grid>

            {/* File Upload */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FolderIcon />
                Medical Files
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<UploadIcon />}
                  sx={{ mb: 2 }}
                >
                  Upload Files
                  <input
                    type="file"
                    multiple
                    hidden
                    onChange={handleFileUpload}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  />
                </Button>
              </Box>

              {/* Uploaded Files List */}
              {formData.files.length > 0 && (
                <List dense>
                  {formData.files.map((file, index) => (
                    <ListItem key={index} sx={{ pl: 0 }}>
                      <ListItemIcon>
                        <FolderIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={file.name}
                        secondary={`Size: ${(file.size / 1024).toFixed(1)} KB`}
                      />
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveFile(index)}
                        color="error"
                      >
                        <CloseIcon />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
              )}
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={loading || !formData.patientId || !formData.prescription}
          >
            {loading ? 'Saving...' : 'Save Record'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddPatientRecord; 
