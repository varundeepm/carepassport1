import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Rating,
  Divider
} from '@mui/material';
import {
  Person as PersonIcon,
  LocalHospital as HospitalIcon,
  Star as StarIcon,
  Schedule as ScheduleIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import DoctorProfile from './DoctorProfile';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  rating: number;
  totalPatients: number;
  consultationFee: number;
  availability: string[];
  imageUrl?: string;
}

interface Hospital {
  id: string;
  name: string;
  location: string;
  doctors: Doctor[];
}

interface DoctorSelectionProps {
  onDoctorSelect?: (doctor: Doctor) => void;
}

const DoctorSelection: React.FC<DoctorSelectionProps> = ({ onDoctorSelect }) => {
  const [selectedHospital, setSelectedHospital] = useState<string>('');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [viewingDoctor, setViewingDoctor] = useState<Doctor | null>(null);

  const hospitals: Hospital[] = [
    {
      id: '1',
      name: 'City General Hospital',
      location: 'Downtown Medical District',
      doctors: [
        {
          id: '1',
          name: 'Dr. Sarah Johnson',
          specialty: 'Cardiology',
          hospital: 'City General Hospital',
          rating: 4.8,
          totalPatients: 1250,
          consultationFee: 150,
          availability: ['Monday', 'Wednesday', 'Friday'],
          imageUrl: '/images/doctor-1.jpg'
        },
        {
          id: '2',
          name: 'Dr. Michael Chen',
          specialty: 'Orthopedics',
          hospital: 'City General Hospital',
          rating: 4.6,
          totalPatients: 980,
          consultationFee: 120,
          availability: ['Tuesday', 'Thursday', 'Saturday'],
          imageUrl: '/images/doctor-2.jpg'
        }
      ]
    },
    {
      id: '2',
      name: 'Metro Medical Center',
      location: 'Metropolitan Area',
      doctors: [
        {
          id: '3',
          name: 'Dr. Emily Davis',
          specialty: 'Dermatology',
          hospital: 'Metro Medical Center',
          rating: 4.9,
          totalPatients: 1100,
          consultationFee: 130,
          availability: ['Monday', 'Tuesday', 'Thursday'],
          imageUrl: '/images/doctor-3.jpg'
        }
      ]
    },
    {
      id: '3',
      name: 'University Hospital',
      location: 'University Campus',
      doctors: [
        {
          id: '4',
          name: 'Dr. Robert Wilson',
          specialty: 'Neurology',
          hospital: 'University Hospital',
          rating: 4.7,
          totalPatients: 890,
          consultationFee: 140,
          availability: ['Wednesday', 'Friday', 'Saturday'],
          imageUrl: '/images/doctor-4.jpg'
        }
      ]
    }
  ];

  const currentHospital = hospitals.find(h => h.id === selectedHospital);

  const handleHospitalChange = (hospitalId: string) => {
    setSelectedHospital(hospitalId);
    setSelectedDoctor(null);
  };

  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    if (onDoctorSelect) {
      onDoctorSelect(doctor);
    }
  };

  const handleViewProfile = (doctor: Doctor) => {
    setViewingDoctor(doctor);
    setProfileDialogOpen(true);
  };

  const handleCloseProfile = () => {
    setProfileDialogOpen(false);
    setViewingDoctor(null);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Select Hospital & Doctor
      </Typography>

      {/* Hospital Selection */}
      <Box sx={{ mb: 4 }}>
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Select Hospital</InputLabel>
          <Select
            value={selectedHospital}
            label="Select Hospital"
            onChange={(e) => handleHospitalChange(e.target.value)}
          >
            {hospitals.map((hospital) => (
              <MenuItem key={hospital.id} value={hospital.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HospitalIcon />
                  <Box>
                    <Typography variant="body1">{hospital.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {hospital.location}
                    </Typography>
                  </Box>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Doctors List */}
        {currentHospital && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Available Doctors at {currentHospital.name}
            </Typography>
            <Grid container spacing={3}>
              {currentHospital.doctors.map((doctor) => (
                <Grid item xs={12} md={6} lg={4} key={doctor.id}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      cursor: 'pointer',
                      '&:hover': { boxShadow: 4 },
                      border: selectedDoctor?.id === doctor.id ? '2px solid #1976d2' : 'none'
                    }}
                    onClick={() => handleDoctorSelect(doctor)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar
                          src={doctor.imageUrl}
                          sx={{ width: 60, height: 60 }}
                        >
                          <PersonIcon />
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" gutterBottom>
                            {doctor.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {doctor.specialty}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Rating value={doctor.rating} readOnly size="small" />
                        <Typography variant="body2" color="text.secondary">
                          ({doctor.totalPatients} patients)
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Chip 
                          label={`$${doctor.consultationFee} consultation`} 
                          color="primary" 
                          size="small"
                        />
                        <Typography variant="body2" color="text.secondary">
                          {doctor.availability.length} days/week
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {doctor.availability.slice(0, 3).map((day) => (
                          <Chip key={day} label={day} size="small" variant="outlined" />
                        ))}
                        {doctor.availability.length > 3 && (
                          <Chip label={`+${doctor.availability.length - 3} more`} size="small" />
                        )}
                      </Box>
                    </CardContent>

                    <CardActions>
                      <Button
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewProfile(doctor);
                        }}
                      >
                        View Profile
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<ScheduleIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDoctorSelect(doctor);
                        }}
                      >
                        Book Appointment
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Box>

      {/* Doctor Profile Dialog */}
      <Dialog 
        open={profileDialogOpen} 
        onClose={handleCloseProfile}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">
              Doctor Profile
            </Typography>
            <IconButton onClick={handleCloseProfile}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {viewingDoctor && (
            <DoctorProfile 
              doctorId={viewingDoctor.id} 
              isEditable={false}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseProfile}>Close</Button>
          {viewingDoctor && (
            <Button
              variant="contained"
              onClick={() => {
                handleDoctorSelect(viewingDoctor);
                handleCloseProfile();
              }}
            >
              Book Appointment
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DoctorSelection; 