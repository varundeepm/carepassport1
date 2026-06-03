import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  IconButton,
  Avatar,
  Divider
} from '@mui/material';
import {
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  LocalHospital as HospitalIcon,
  Assignment as AssignmentIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

interface Patient {
  id: string;
  name: string;
  purpose: string;
  appointmentDate: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

interface PatientCardProps {
  patient: Patient;
  onEdit?: (patient: Patient) => void;
  onDelete?: (patientId: string) => void;
}

const PatientCard: React.FC<PatientCardProps> = ({ patient, onEdit, onDelete }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'primary';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Scheduled';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        {/* Header with Avatar and Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
              <PersonIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                {patient.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ID: {patient.id}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {onEdit && (
              <IconButton 
                size="small" 
                onClick={() => onEdit(patient)}
                sx={{ color: 'primary.main' }}
              >
                <EditIcon />
              </IconButton>
            )}
            {onDelete && (
              <IconButton 
                size="small" 
                onClick={() => onDelete(patient.id)}
                sx={{ color: 'error.main' }}
              >
                <DeleteIcon />
              </IconButton>
            )}
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Appointment Date */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <ScheduleIcon sx={{ fontSize: 20, color: 'primary.main' }} />
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Appointment Date
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
              {formatDate(patient.appointmentDate)}
            </Typography>
          </Box>
        </Box>

        {/* Purpose of Visit */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
          <AssignmentIcon sx={{ fontSize: 20, color: 'secondary.main', mt: 0.5 }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Purpose of Visit
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>
              {patient.purpose}
            </Typography>
          </Box>
        </Box>

        {/* Status */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
          <Chip
            label={getStatusText(patient.status)}
            color={getStatusColor(patient.status) as any}
            size="small"
            sx={{ fontWeight: 'medium' }}
          />
          <Typography variant="caption" color="text.secondary">
            Added {formatDate(new Date().toISOString())}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PatientCard; 