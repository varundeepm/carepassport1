import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton
} from '@mui/material';
import {
  Add as AddIcon,
  Description as DescriptionIcon,
  Medication as MedicationIcon,
  Assignment as AssignmentIcon,
  Folder as FolderIcon,
  Person as PersonIcon,
  LocalHospital as HospitalIcon,
  Schedule as ScheduleIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { getPatientRecordsForDoctor, type PatientRecordData } from '../services/patientRecordApiService';
import { createPatient, type CreatePatientRequest } from '../services/patientApiService';

interface PatientRecordsListProps {
  doctorId: string;
}

const PatientRecordsList: React.FC<PatientRecordsListProps> = ({ doctorId }) => {
  const [records, setRecords] = useState<PatientRecordData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<PatientRecordData | null>(null);
  const [suggestionDialogOpen, setSuggestionDialogOpen] = useState(false);
  const [creatingSuggestions, setCreatingSuggestions] = useState(false);

  useEffect(() => {
    loadPatientRecords();
  }, [doctorId]);

  const loadPatientRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      const recordsData = await getPatientRecordsForDoctor(doctorId);
      setRecords(recordsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load patient records');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuggestions = (record: PatientRecordData) => {
    setSelectedRecord(record);
    setSuggestionDialogOpen(true);
  };

  const handleCreateSuggestionsFromRecord = async () => {
    if (!selectedRecord) return;

    setCreatingSuggestions(true);
    try {
      // Convert patient record data to suggestions
      const suggestions = [];
      
      // Add prescription as a suggestion
      if (selectedRecord.prescription) {
        suggestions.push({
          text: `Follow prescription: ${selectedRecord.prescription}`,
          reminderTime: ''
        });
      }

      // Add patient details as suggestions
      if (selectedRecord.patientDetails) {
        suggestions.push({
          text: `Follow doctor's notes: ${selectedRecord.patientDetails}`,
          reminderTime: ''
        });
      }

      // Add general suggestions
      if (selectedRecord.suggestions) {
        suggestions.push({
          text: selectedRecord.suggestions,
          reminderTime: ''
        });
      }

      // Create patient with suggestions
      const patientData: CreatePatientRequest = {
        patientId: selectedRecord.patientId,
        name: selectedRecord.patientName,
        phoneNumber: '', // This would need to be added to the record
        description: `Patient record from ${selectedRecord.visitDate} - ${selectedRecord.hospital}`,
        files: selectedRecord.files.map(f => f.name),
        doctorId: selectedRecord.doctorId,
        suggestions
      };

      await createPatient(patientData);
      
      setSuggestionDialogOpen(false);
      setSelectedRecord(null);
      // You could show a success message here
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create suggestions');
    } finally {
      setCreatingSuggestions(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Patient Records (MongoDB)
      </Typography>
      
      {records.length === 0 ? (
        <Alert severity="info">
          No patient records found. Add patient records to create suggestions from them.
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {records.map((record) => (
            <Grid item xs={12} md={6} lg={4} key={record._id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Typography variant="h6" gutterBottom>
                      {record.patientName}
                    </Typography>
                    <Chip 
                      label={record.status} 
                      color={record.status === 'active' ? 'primary' : 'default'}
                      size="small"
                    />
                  </Box>

                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      <PersonIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                      ID: {record.patientId}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <LocalHospitalIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                      {record.hospital}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <ScheduleIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                      {record.visitDate}
                    </Typography>
                  </Box>

                  {record.prescription && (
                    <Box mb={1}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        <MedicationIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                        Prescription:
                      </Typography>
                      <Typography variant="body2" sx={{ ml: 2 }}>
                        {record.prescription.substring(0, 100)}...
                      </Typography>
                    </Box>
                  )}

                  {record.patientDetails && (
                    <Box mb={1}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        <DescriptionIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                        Details:
                      </Typography>
                      <Typography variant="body2" sx={{ ml: 2 }}>
                        {record.patientDetails.substring(0, 100)}...
                      </Typography>
                    </Box>
                  )}

                  {record.files && record.files.length > 0 && (
                    <Box mb={2}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        <FolderIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                        Files ({record.files.length}):
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={0.5} mt={0.5}>
                        {record.files.slice(0, 3).map((file, index) => (
                          <Chip key={index} label={file.name} size="small" variant="outlined" />
                        ))}
                        {record.files.length > 3 && (
                          <Chip label={`+${record.files.length - 3} more`} size="small" variant="outlined" />
                        )}
                      </Box>
                    </Box>
                  )}

                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleCreateSuggestions(record)}
                    fullWidth
                    size="small"
                  >
                    Create Suggestions from Record
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Suggestion Creation Dialog */}
      <Dialog open={suggestionDialogOpen} onClose={() => setSuggestionDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">
              Create Suggestions from Patient Record
            </Typography>
            <IconButton onClick={() => setSuggestionDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {selectedRecord && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Patient: {selectedRecord.patientName} (ID: {selectedRecord.patientId})
              </Typography>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                This will create a new patient entry with suggestions based on the record data.
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" gutterBottom>
                Suggestions to be created:
              </Typography>

              <List dense>
                {selectedRecord.prescription && (
                  <ListItem>
                    <ListItemText
                      primary="Prescription Follow-up"
                      secondary={`Follow prescription: ${selectedRecord.prescription.substring(0, 100)}...`}
                    />
                  </ListItem>
                )}
                
                {selectedRecord.patientDetails && (
                  <ListItem>
                    <ListItemText
                      primary="Doctor's Notes"
                      secondary={`Follow doctor's notes: ${selectedRecord.patientDetails.substring(0, 100)}...`}
                    />
                  </ListItem>
                )}
                
                {selectedRecord.suggestions && (
                  <ListItem>
                    <ListItemText
                      primary="General Suggestions"
                      secondary={selectedRecord.suggestions}
                    />
                  </ListItem>
                )}
              </List>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setSuggestionDialogOpen(false)} disabled={creatingSuggestions}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateSuggestionsFromRecord} 
            variant="contained"
            disabled={creatingSuggestions}
          >
            {creatingSuggestions ? 'Creating...' : 'Create Suggestions'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PatientRecordsList;
