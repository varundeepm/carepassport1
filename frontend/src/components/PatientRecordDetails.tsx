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
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Collapse
} from '@mui/material';
import {
  Person as PersonIcon,
  LocalHospital as HospitalIcon,
  Schedule as ScheduleIcon,
  Medication as MedicationIcon,
  Description as DescriptionIcon,
  Folder as FolderIcon,
  Assignment as AssignmentIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CheckCircle as CheckCircleIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { type PatientRecordData } from '../services/patientRecordApiService';
import { createPatient, type CreatePatientRequest } from '../services/patientApiService';

interface PatientRecordDetailsProps {
  record: PatientRecordData;
  onClose: () => void;
}

const PatientRecordDetails: React.FC<PatientRecordDetailsProps> = ({ record, onClose }) => {
  const [creatingSuggestions, setCreatingSuggestions] = useState(false);
  const [suggestionsCreated, setSuggestionsCreated] = useState(false);
  const [showRawData, setShowRawData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateSuggestions = async () => {
    setCreatingSuggestions(true);
    setError(null);

    try {
      // Convert patient record data to suggestions
      const suggestions = [];
      
      // Add prescription as a suggestion
      if (record.prescription) {
        suggestions.push({
          text: `Follow prescription: ${record.prescription}`,
          reminderTime: ''
        });
      }

      // Add patient details as suggestions
      if (record.patientDetails) {
        suggestions.push({
          text: `Follow doctor's notes: ${record.patientDetails}`,
          reminderTime: ''
        });
      }

      // Add general suggestions
      if (record.suggestions) {
        suggestions.push({
          text: record.suggestions,
          reminderTime: ''
        });
      }

      // Create patient with suggestions
      const patientData: CreatePatientRequest = {
        patientId: record.patientId,
        name: record.patientName,
        phoneNumber: '', // This would need to be added to the record
        description: `Patient record from ${record.visitDate} - ${record.hospital}`,
        files: record.files.map(f => f.name),
        doctorId: record.doctorId,
        suggestions
      };

      await createPatient(patientData);
      setSuggestionsCreated(true);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create suggestions');
    } finally {
      setCreatingSuggestions(false);
    }
  };

  return (
    <Card sx={{ mt: 2, maxWidth: 1200, mx: 'auto' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" gutterBottom>
            Patient Record Created Successfully! ✅
          </Typography>
          <Button variant="outlined" onClick={onClose}>
            Close
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Patient Credentials Section */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon />
              Patient Credentials
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Basic Information
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <PersonIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Patient Name" 
                        secondary={record.patientName}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <PersonIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Patient ID" 
                        secondary={record.patientId}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <LocalHospitalIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Hospital" 
                        secondary={record.hospital}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <ScheduleIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Visit Date" 
                        secondary={record.visitDate}
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Medical Information
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <MedicationIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Prescription" 
                        secondary={record.prescription ? `${record.prescription.substring(0, 50)}...` : 'None'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <DescriptionIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Patient Details" 
                        secondary={record.patientDetails ? `${record.patientDetails.substring(0, 50)}...` : 'None'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <AssignmentIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Suggestions" 
                        secondary={record.suggestions ? `${record.suggestions.substring(0, 50)}...` : 'None'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <FolderIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Files" 
                        secondary={`${record.files.length} file(s) uploaded`}
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Suggestions Creation Section */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AddIcon />
              Create Suggestions from Record
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              <Typography variant="body1" paragraph>
                Convert this patient record into actionable suggestions/tasks for the patient.
              </Typography>

              {!suggestionsCreated ? (
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Suggestions to be created:
                  </Typography>
                  <List dense>
                    {record.prescription && (
                      <ListItem>
                        <ListItemIcon>
                          <MedicationIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Prescription Follow-up"
                          secondary={`Follow prescription: ${record.prescription}`}
                        />
                      </ListItem>
                    )}
                    
                    {record.patientDetails && (
                      <ListItem>
                        <ListItemIcon>
                          <DescriptionIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Doctor's Notes"
                          secondary={`Follow doctor's notes: ${record.patientDetails}`}
                        />
                      </ListItem>
                    )}
                    
                    {record.suggestions && (
                      <ListItem>
                        <ListItemIcon>
                          <AssignmentIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="General Suggestions"
                          secondary={record.suggestions}
                        />
                      </ListItem>
                    )}
                  </List>

                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreateSuggestions}
                    disabled={creatingSuggestions}
                    sx={{ mt: 2 }}
                  >
                    {creatingSuggestions ? 'Creating Suggestions...' : 'Create Suggestions'}
                  </Button>
                </Box>
              ) : (
                <Alert severity="success" sx={{ mt: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    ✅ Suggestions Created Successfully!
                  </Typography>
                  <Typography>
                    The patient now has actionable tasks based on this record. 
                    They can view these suggestions in their dashboard.
                  </Typography>
                </Alert>
              )}
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Data Storage Details */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <VisibilityIcon />
              How Data is Stored in MongoDB
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                This record is stored in the <code>patientrecords</code> collection:
              </Typography>
              
              <Paper sx={{ p: 2, backgroundColor: '#f5f5f5', fontFamily: 'monospace', fontSize: '12px' }}>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
{JSON.stringify({
  _id: "Auto-generated MongoDB ID",
  patientId: record.patientId,
  patientName: record.patientName,
  doctorId: record.doctorId,
  doctorName: record.doctorName,
  hospital: record.hospital,
  visitDate: record.visitDate,
  prescription: record.prescription,
  suggestions: record.suggestions,
  patientDetails: record.patientDetails,
  files: record.files.map(f => ({
    id: f.id,
    name: f.name,
    type: f.type,
    url: f.url,
    uploadedAt: f.uploadedAt
  })),
  status: record.status,
  createdAt: "Auto-generated timestamp",
  updatedAt: "Auto-generated timestamp"
}, null, 2)}
                </pre>
              </Paper>

              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                When suggestions are created, they are stored in the <code>patients</code> and <code>tasks</code> collections:
              </Typography>

              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, backgroundColor: '#e8f5e8' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      <strong>patients collection:</strong>
                    </Typography>
                    <pre style={{ margin: 0, fontSize: '11px' }}>
{JSON.stringify({
  patientId: record.patientId,
  name: record.patientName,
  phoneNumber: "",
  description: `Patient record from ${record.visitDate} - ${record.hospital}`,
  files: record.files.map(f => f.name),
  doctorId: record.doctorId
}, null, 2)}
                    </pre>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, backgroundColor: '#fff3e0' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      <strong>tasks collection:</strong>
                    </Typography>
                    <pre style={{ margin: 0, fontSize: '11px' }}>
{JSON.stringify([
  ...(record.prescription ? [{
    patientId: record.patientId,
    taskDescription: `Follow prescription: ${record.prescription}`,
    reminderTime: null,
    completed: false
  }] : []),
  ...(record.patientDetails ? [{
    patientId: record.patientId,
    taskDescription: `Follow doctor's notes: ${record.patientDetails}`,
    reminderTime: null,
    completed: false
  }] : []),
  ...(record.suggestions ? [{
    patientId: record.patientId,
    taskDescription: record.suggestions,
    reminderTime: null,
    completed: false
  }] : [])
], null, 2)}
                    </pre>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Action Buttons */}
        <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="outlined"
            onClick={() => setShowRawData(!showRawData)}
            startIcon={showRawData ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          >
            {showRawData ? 'Hide Raw Data' : 'Show Raw Data'}
          </Button>
          
          {suggestionsCreated && (
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircleIcon />}
            >
              View Patient Dashboard
            </Button>
          )}
        </Box>

        {/* Raw Data Collapse */}
        <Collapse in={showRawData}>
          <Paper sx={{ p: 2, mt: 2, backgroundColor: '#fafafa' }}>
            <Typography variant="h6" gutterBottom>
              Complete Raw Data
            </Typography>
            <pre style={{ fontSize: '12px', overflow: 'auto', maxHeight: '400px' }}>
              {JSON.stringify(record, null, 2)}
            </pre>
          </Paper>
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default PatientRecordDetails;
