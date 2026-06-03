import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Autocomplete,
  Chip
} from '@mui/material';
import {
  Send as SendIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { createReport, CreateReportRequest } from '../services/reportService';
import { getPatientsForDoctor, type PatientData } from '../services/patientApiService';

interface SendReportFormProps {
  doctorId: string;
  doctorName: string;
  onReportSent?: () => void;
  onClose?: () => void;
  preSelectedPatient?: {
    patientId: string;
    patientName: string;
  };
}

const SendReportForm: React.FC<SendReportFormProps> = ({
  doctorId,
  doctorName,
  onReportSent,
  onClose,
  preSelectedPatient
}) => {
  const [formData, setFormData] = useState({
    patientId: preSelectedPatient?.patientId || '',
    patientName: preSelectedPatient?.patientName || '',
    title: '',
    content: '',
    reportType: 'general',
    priority: 'normal'
  });
  
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Load patients for the doctor
  useEffect(() => {
    const loadPatients = async () => {
      try {
        setLoadingPatients(true);
        const patientsData = await getPatientsForDoctor(doctorId);
        setPatients(patientsData);
      } catch (error) {
        console.error('Failed to load patients:', error);
        setError('Failed to load patients');
      } finally {
        setLoadingPatients(false);
      }
    };

    loadPatients();
  }, [doctorId]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };

  const handlePatientSelect = (patient: PatientData | null) => {
    if (patient) {
      setFormData(prev => ({
        ...prev,
        patientId: patient.patientId,
        patientName: patient.name
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        patientId: '',
        patientName: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.patientId || !formData.patientName || !formData.title || !formData.content) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const reportData: CreateReportRequest = {
        patientId: formData.patientId,
        patientName: formData.patientName,
        doctorId,
        doctorName,
        title: formData.title,
        content: formData.content,
        reportType: formData.reportType,
        priority: formData.priority
      };

      await createReport(reportData);
      
      setSuccess(true);
      setFormData({
        patientId: preSelectedPatient?.patientId || '',
        patientName: preSelectedPatient?.patientName || '',
        title: '',
        content: '',
        reportType: 'general',
        priority: 'normal'
      });

      if (onReportSent) {
        onReportSent();
      }

      // Auto-close success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);

    } catch (error) {
      console.error('Error sending report:', error);
      setError(error instanceof Error ? error.message : 'Failed to send report');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'normal': return 'primary';
      case 'low': return 'default';
      default: return 'primary';
    }
  };

  return (
    <Card sx={{ maxWidth: 800, mx: 'auto', mt: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h2">
            Send Report to Patient
          </Typography>
          {onClose && (
            <Button
              onClick={onClose}
              size="small"
              startIcon={<CloseIcon />}
            >
              Close
            </Button>
          )}
        </Box>

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Report sent successfully to {formData.patientName}!
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Patient Selection */}
          <Autocomplete
            options={patients}
            getOptionLabel={(option) => `${option.name} (ID: ${option.patientId})`}
            value={patients.find(p => p.patientId === formData.patientId) || null}
            onChange={(_, newValue) => handlePatientSelect(newValue)}
            loading={loadingPatients}
            disabled={!!preSelectedPatient}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Patient *"
                variant="outlined"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingPatients ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />

          {/* Report Title */}
          <TextField
            label="Report Title *"
            variant="outlined"
            fullWidth
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="e.g., Lab Results - Blood Test, Treatment Plan Update"
          />

          {/* Report Type */}
          <FormControl fullWidth>
            <InputLabel>Report Type</InputLabel>
            <Select
              value={formData.reportType}
              label="Report Type"
              onChange={(e) => handleInputChange('reportType', e.target.value)}
            >
              <MenuItem value="general">General Report</MenuItem>
              <MenuItem value="diagnosis">Diagnosis</MenuItem>
              <MenuItem value="lab_results">Lab Results</MenuItem>
              <MenuItem value="treatment_plan">Treatment Plan</MenuItem>
              <MenuItem value="follow_up">Follow-up</MenuItem>
              <MenuItem value="discharge">Discharge Summary</MenuItem>
              <MenuItem value="consultation">Consultation Notes</MenuItem>
            </Select>
          </FormControl>

          {/* Priority */}
          <FormControl fullWidth>
            <InputLabel>Priority</InputLabel>
            <Select
              value={formData.priority}
              label="Priority"
              onChange={(e) => handleInputChange('priority', e.target.value)}
            >
              <MenuItem value="low">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip label="Low" color="default" size="small" />
                  Low Priority
                </Box>
              </MenuItem>
              <MenuItem value="normal">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip label="Normal" color="primary" size="small" />
                  Normal Priority
                </Box>
              </MenuItem>
              <MenuItem value="high">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip label="High" color="warning" size="small" />
                  High Priority
                </Box>
              </MenuItem>
              <MenuItem value="urgent">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip label="Urgent" color="error" size="small" />
                  Urgent
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

          {/* Report Content */}
          <TextField
            label="Report Content *"
            variant="outlined"
            fullWidth
            multiline
            rows={6}
            value={formData.content}
            onChange={(e) => handleInputChange('content', e.target.value)}
            placeholder="Enter detailed report content here..."
          />

          {/* Submit Button */}
          <Button
            type="submit"
            variant="contained"
            size="large"
            startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
            disabled={loading || !formData.patientId || !formData.title || !formData.content}
            sx={{ mt: 2 }}
          >
            {loading ? 'Sending Report...' : 'Send Report'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default SendReportForm;
