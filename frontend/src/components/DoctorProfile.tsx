import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Avatar,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Divider
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  LocalHospital as HospitalIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  Star as StarIcon
} from '@mui/icons-material';

interface DoctorProfileData {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  hospital: string;
  experience: number;
  education: string;
  certifications: string[];
  bio: string;
  consultationFee: number;
  availability: string[];
  rating: number;
  totalPatients: number;
  imageUrl?: string;
}

interface DoctorProfileProps {
  doctorId?: string;
  isEditable?: boolean;
  onSave?: (profile: DoctorProfileData) => void;
}

const DoctorProfile: React.FC<DoctorProfileProps> = ({ 
  doctorId, 
  isEditable = false, 
  onSave 
}) => {
  const [profile, setProfile] = useState<DoctorProfileData>({
    id: doctorId || '1',
    name: '',
    email: '',
    phone: '',
    specialty: '',
    hospital: '',
    experience: 0,
    education: '',
    certifications: [],
    bio: '',
    consultationFee: 0,
    availability: [],
    rating: 0,
    totalPatients: 0
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState<DoctorProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const specialties = [
    'Cardiology', 'Dermatology', 'Neurology', 'Orthopedics', 
    'Pediatrics', 'Psychiatry', 'Oncology', 'General Medicine',
    'Surgery', 'Gynecology', 'Ophthalmology', 'ENT'
  ];

  const hospitals = [
    'City General Hospital', 'Metro Medical Center', 'University Hospital',
    'St. Mary\'s Hospital', 'Central Medical Institute', 'Regional Health Center'
  ];

  const availabilityOptions = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  useEffect(() => {
    if (doctorId) {
      loadDoctorProfile(doctorId);
    }
  }, [doctorId]);

  const loadDoctorProfile = async (id: string) => {
    setLoading(true);
    try {
      // Mock API call - replace with actual API
      const mockProfile: DoctorProfileData = {
        id: id,
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@hospital.com',
        phone: '+1 (555) 123-4567',
        specialty: 'Cardiology',
        hospital: 'City General Hospital',
        experience: 8,
        education: 'MD - Harvard Medical School, Fellowship in Cardiology',
        certifications: ['Board Certified Cardiologist', 'ACLS Certified', 'BLS Certified'],
        bio: 'Experienced cardiologist with expertise in interventional cardiology and heart failure management. Committed to providing personalized care to patients.',
        consultationFee: 150,
        availability: ['Monday', 'Wednesday', 'Friday'],
        rating: 4.8,
        totalPatients: 1250,
        imageUrl: '/images/doctor-avatar.jpg'
      };
      
      setProfile(mockProfile);
    } catch (err) {
      setError('Failed to load doctor profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setTempProfile({ ...profile });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTempProfile(null);
  };

  const handleSave = async () => {
    if (!tempProfile) return;
    
    setLoading(true);
    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProfile(tempProfile);
      setIsEditing(false);
      setTempProfile(null);
      
      if (onSave) {
        onSave(tempProfile);
      }
    } catch (err) {
      setError('Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof DoctorProfileData, value: any) => {
    if (!tempProfile) return;
    setTempProfile({ ...tempProfile, [field]: value });
  };

  const currentProfile = isEditing ? tempProfile : profile;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <Typography>Loading profile...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={2} sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5" component="h2">
            Doctor Profile
          </Typography>
          {isEditable && !isEditing && (
            <Button
              startIcon={<EditIcon />}
              variant="outlined"
              onClick={handleEdit}
            >
              Edit Profile
            </Button>
          )}
        </Box>

        {currentProfile && (
          <Grid container spacing={3}>
            {/* Profile Image and Basic Info */}
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Avatar
                  src={currentProfile.imageUrl}
                  sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
                >
                  <PersonIcon sx={{ fontSize: 60 }} />
                </Avatar>
                <Typography variant="h6" gutterBottom>
                  {currentProfile.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {currentProfile.specialty}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
                  <StarIcon sx={{ color: 'gold', fontSize: 20 }} />
                  <Typography variant="body2">
                    {currentProfile.rating} ({currentProfile.totalPatients} patients)
                  </Typography>
                </Box>
                <Chip 
                  label={`$${currentProfile.consultationFee} consultation`} 
                  color="primary" 
                  size="small"
                />
              </Box>
            </Grid>

            {/* Profile Details */}
            <Grid item xs={12} md={8}>
              <Grid container spacing={2}>
                {/* Contact Information */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Name"
                    value={currentProfile.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={!isEditing}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={currentProfile.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!isEditing}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={currentProfile.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal" disabled={!isEditing}>
                    <InputLabel>Specialty</InputLabel>
                    <Select
                      value={currentProfile.specialty}
                      label="Specialty"
                      onChange={(e) => handleInputChange('specialty', e.target.value)}
                    >
                      {specialties.map((specialty) => (
                        <MenuItem key={specialty} value={specialty}>
                          {specialty}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal" disabled={!isEditing}>
                    <InputLabel>Hospital</InputLabel>
                    <Select
                      value={currentProfile.hospital}
                      label="Hospital"
                      onChange={(e) => handleInputChange('hospital', e.target.value)}
                    >
                      {hospitals.map((hospital) => (
                        <MenuItem key={hospital} value={hospital}>
                          {hospital}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Years of Experience"
                    type="number"
                    value={currentProfile.experience}
                    onChange={(e) => handleInputChange('experience', parseInt(e.target.value))}
                    disabled={!isEditing}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Education"
                    value={currentProfile.education}
                    onChange={(e) => handleInputChange('education', e.target.value)}
                    disabled={!isEditing}
                    margin="normal"
                    multiline
                    rows={2}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Bio"
                    value={currentProfile.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    disabled={!isEditing}
                    margin="normal"
                    multiline
                    rows={4}
                  />
                </Grid>
              </Grid>

              {/* Certifications */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Certifications
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {currentProfile.certifications.map((cert, index) => (
                    <Chip key={index} label={cert} color="info" variant="outlined" />
                  ))}
                </Box>
              </Box>

              {/* Availability */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Availability
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {currentProfile.availability.map((day) => (
                    <Chip key={day} label={day} color="success" size="small" />
                  ))}
                </Box>
              </Box>
            </Grid>
          </Grid>
        )}

        {/* Edit Actions */}
        {isEditing && (
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
            <Button
              startIcon={<CancelIcon />}
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              startIcon={<SaveIcon />}
              variant="contained"
              onClick={handleSave}
              disabled={loading}
            >
              Save Profile
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default DoctorProfile; 