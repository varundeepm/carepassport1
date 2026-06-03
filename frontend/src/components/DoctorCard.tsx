import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Button
} from '@mui/material';
import {
  Person as PersonIcon,
  LocalHospital as HospitalIcon,
  Medication as MedicationIcon,
  Assignment as AssignmentIcon,
  Folder as FolderIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon
} from '@mui/icons-material';

interface MedicalFile {
  id: string;
  name: string;
  type: 'xray' | 'mri' | 'blood-test' | 'ecg' | 'prescription' | 'report';
  url: string;
  uploadedAt: string;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  experience: string;
  rating: number;
  patients: Patient[];
  files: MedicalFile[];
  prescriptions: string[];
  suggestions: string[];
}

interface Patient {
  id: string;
  name: string;
  purpose: string;
  appointmentDate: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

interface DoctorCardProps {
  doctor: Doctor;
  onViewFiles?: (files: MedicalFile[]) => void;
  onViewPatients?: (patients: Patient[]) => void;
}

const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, onViewFiles, onViewPatients }) => {
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'xray': return '📷';
      case 'mri': return '🧠';
      case 'blood-test': return '🩸';
      case 'ecg': return '💓';
      case 'prescription': return '💊';
      case 'report': return '📄';
      default: return '📄';
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'primary';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        sx={{
          fontSize: 16,
          color: i < rating ? 'gold' : 'grey.300'
        }}
      />
    ));
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
        {/* Doctor Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 60, height: 60 }}>
            <PersonIcon sx={{ fontSize: 30 }} />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
              {doctor.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {doctor.specialty}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              {renderStars(doctor.rating)}
              <Typography variant="caption" color="text.secondary">
                ({doctor.rating}/5)
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Hospital and Experience */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <HospitalIcon sx={{ fontSize: 20, color: 'primary.main' }} />
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Hospital
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
              {doctor.hospital}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <ScheduleIcon sx={{ fontSize: 20, color: 'secondary.main' }} />
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Experience
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
              {doctor.experience}
            </Typography>
          </Box>
        </Box>

        {/* Patient Statistics */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <PersonIcon sx={{ fontSize: 16 }} />
            Patients ({doctor.patients.length})
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {doctor.patients.slice(0, 3).map((patient) => (
              <Chip
                key={patient.id}
                label={patient.name}
                size="small"
                color={getStatusColor(patient.status) as any}
                variant="outlined"
              />
            ))}
            {doctor.patients.length > 3 && (
              <Chip
                label={`+${doctor.patients.length - 3} more`}
                size="small"
                color="default"
                variant="outlined"
              />
            )}
          </Box>
        </Box>

        {/* Medical Files */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <FolderIcon sx={{ fontSize: 16 }} />
            Medical Files ({doctor.files.length})
          </Typography>
          <List dense>
            {doctor.files.slice(0, 3).map((file) => (
              <ListItem key={file.id} sx={{ pl: 0, py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 30 }}>
                  <Typography>{getFileIcon(file.type)}</Typography>
                </ListItemIcon>
                <ListItemText
                  primary={file.name}
                  secondary={formatDate(file.uploadedAt)}
                  primaryTypographyProps={{ variant: 'body2' }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <IconButton size="small" title="View file">
                    <VisibilityIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                  <IconButton size="small" title="Download file">
                    <DownloadIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>
              </ListItem>
            ))}
            {doctor.files.length > 3 && (
              <ListItem sx={{ pl: 0, py: 0.5 }}>
                <ListItemText
                  primary={`+${doctor.files.length - 3} more files`}
                  primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                />
              </ListItem>
            )}
          </List>
        </Box>

        {/* Recent Prescriptions */}
        {doctor.prescriptions.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <MedicationIcon sx={{ fontSize: 16 }} />
              Recent Prescriptions
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4 }}>
              {doctor.prescriptions[0].substring(0, 100)}...
            </Typography>
          </Box>
        )}

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<FolderIcon />}
            onClick={() => onViewFiles?.(doctor.files)}
            sx={{ flex: 1 }}
          >
            View Files
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<PersonIcon />}
            onClick={() => onViewPatients?.(doctor.patients)}
            sx={{ flex: 1 }}
          >
            View Patients
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default DoctorCard; 