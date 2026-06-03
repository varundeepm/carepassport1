import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Chip,
  Divider,
  Grid,
  Paper,
  Alert,
  CircularProgress,
  IconButton,
  Collapse
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UncheckedIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Description as DescriptionIcon,
  Folder as FolderIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { getPatientDetails, updateTaskStatus, type PatientWithTasks } from '../services/patientApiService';

interface PatientDetailsWithTasksProps {
  patientId: string;
}

const PatientDetailsWithTasks: React.FC<PatientDetailsWithTasksProps> = ({ patientId }) => {
  const [patientData, setPatientData] = useState<PatientWithTasks | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    loadPatientDetails();
  }, [patientId]);

  const loadPatientDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPatientDetails(patientId);
      setPatientData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load patient details');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskToggle = async (taskId: string, completed: boolean) => {
    try {
      await updateTaskStatus(taskId, completed);
      // Refresh patient data to get updated task status
      await loadPatientDetails();
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
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

  if (!patientData) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        No patient data found
      </Alert>
    );
  }

  const { patient, tasks } = patientData;

  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h5" gutterBottom>
            Patient Details
          </Typography>
          <IconButton onClick={() => setExpanded(!expanded)}>
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Basic Information
              </Typography>
              <Typography><strong>Patient ID:</strong> {patient.patientId}</Typography>
              <Typography><strong>Name:</strong> {patient.name}</Typography>
              <Typography><strong>Phone:</strong> {patient.phoneNumber}</Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                <DescriptionIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Description
              </Typography>
              <Typography>{patient.description || 'No description provided'}</Typography>
            </Paper>
          </Grid>
        </Grid>

        {patient.files && patient.files.length > 0 && (
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              <FolderIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Files
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {patient.files.map((file, index) => (
                <Chip key={index} label={file} variant="outlined" />
              ))}
            </Box>
          </Paper>
        )}

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>
          <ScheduleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Tasks & Suggestions ({tasks.length})
        </Typography>

        {tasks.length === 0 ? (
          <Alert severity="info">
            No tasks or suggestions found for this patient.
          </Alert>
        ) : (
          <List>
            {tasks.map((task, index) => (
              <ListItem
                key={index}
                sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  mb: 1,
                  backgroundColor: task.completed ? '#f5f5f5' : 'white'
                }}
              >
                <ListItemIcon>
                  <Checkbox
                    checked={task.completed || false}
                    onChange={(e) => handleTaskToggle(task._id || index.toString(), e.target.checked)}
                    icon={<UncheckedIcon />}
                    checkedIcon={<CheckCircleIcon />}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography
                      sx={{
                        textDecoration: task.completed ? 'line-through' : 'none',
                        color: task.completed ? 'text.secondary' : 'text.primary'
                      }}
                    >
                      {task.taskDescription}
                    </Typography>
                  }
                  secondary={
                    task.reminderTime && (
                      <Box display="flex" alignItems="center" mt={1}>
                        <ScheduleIcon sx={{ fontSize: 16, mr: 0.5 }} />
                        <Typography variant="caption">
                          Reminder: {new Date(task.reminderTime).toLocaleString()}
                        </Typography>
                      </Box>
                    )
                  }
                />
                {task.completed && (
                  <Chip
                    label="Completed"
                    color="success"
                    size="small"
                    sx={{ ml: 1 }}
                  />
                )}
              </ListItem>
            ))}
          </List>
        )}

        <Collapse in={expanded}>
          <Paper sx={{ p: 2, mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Raw Data (Debug)
            </Typography>
            <pre style={{ fontSize: '12px', overflow: 'auto' }}>
              {JSON.stringify(patientData, null, 2)}
            </pre>
          </Paper>
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default PatientDetailsWithTasks;
