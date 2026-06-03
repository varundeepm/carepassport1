import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Alert,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { createPatient, type CreatePatientRequest, type SuggestionData } from '../services/patientApiService';

interface AddPatientWithTasksProps {
  doctorId: string;
  onPatientAdded: () => void;
  onClose: () => void;
}

const AddPatientWithTasks: React.FC<AddPatientWithTasksProps> = ({ doctorId, onPatientAdded, onClose }) => {
  const [formData, setFormData] = useState({
    patientId: '',
    name: '',
    phoneNumber: '',
    description: '',
    files: [] as string[]
  });

  const [suggestions, setSuggestions] = useState<SuggestionData[]>([
    { text: '', reminderTime: '' }
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSuggestionChange = (index: number, field: 'text' | 'reminderTime', value: string) => {
    setSuggestions(prev => prev.map((suggestion, i) => 
      i === index ? { ...suggestion, [field]: value } : suggestion
    ));
  };

  const addSuggestion = () => {
    setSuggestions(prev => [...prev, { text: '', reminderTime: '' }]);
  };

  const removeSuggestion = (index: number) => {
    setSuggestions(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Filter out empty suggestions
      const validSuggestions = suggestions.filter(s => s.text.trim() !== '');
      
      if (validSuggestions.length === 0) {
        setError('At least one suggestion is required');
        setLoading(false);
        return;
      }

      const patientData: CreatePatientRequest = {
        ...formData,
        doctorId,
        suggestions: validSuggestions
      };

      await createPatient(patientData);
      setSuccess(true);
      onPatientAdded();
      
      // Reset form
      setTimeout(() => {
        setFormData({
          patientId: '',
          name: '',
          phoneNumber: '',
          description: '',
          files: []
        });
        setSuggestions([{ text: '', reminderTime: '' }]);
        setSuccess(false);
        onClose();
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create patient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ maxWidth: 800, mx: 'auto', mt: 2 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Add New Patient with Tasks
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Patient created successfully!
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Patient ID"
                value={formData.patientId}
                onChange={(e) => handleInputChange('patientId', e.target.value)}
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Patient Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                multiline
                rows={3}
                margin="normal"
              />
            </Grid>
          </Grid>

          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            Suggestions/Tasks
          </Typography>

          <List>
            {suggestions.map((suggestion, index) => (
              <ListItem key={index} sx={{ border: '1px solid #e0e0e0', borderRadius: 1, mb: 1 }}>
                <ListItemText
                  primary={
                    <TextField
                      fullWidth
                      label={`Suggestion ${index + 1}`}
                      value={suggestion.text}
                      onChange={(e) => handleSuggestionChange(index, 'text', e.target.value)}
                      placeholder="Enter suggestion/task description"
                      margin="dense"
                    />
                  }
                  secondary={
                    <TextField
                      fullWidth
                      label="Reminder Time (optional)"
                      type="datetime-local"
                      value={suggestion.reminderTime}
                      onChange={(e) => handleSuggestionChange(index, 'reminderTime', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      margin="dense"
                      sx={{ mt: 1 }}
                    />
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => removeSuggestion(index)}
                    disabled={suggestions.length === 1}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>

          <Button
            startIcon={<AddIcon />}
            onClick={addSuggestion}
            variant="outlined"
            sx={{ mb: 2 }}
          >
            Add Suggestion
          </Button>

          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Patient'}
            </Button>
            <Button
              variant="outlined"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AddPatientWithTasks;
