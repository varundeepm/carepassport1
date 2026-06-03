import React from 'react';
import {
    Box, Card, CardContent, Typography,
    Avatar, Grid, Button, Divider,
    Chip, IconButton
} from '@mui/material';
import {
    MedicalServices as HospitalIcon,
    EmojiEvents as AwardIcon,
    Verified as VerifiedIcon,
    Email as EmailIcon,
    Phone as PhoneIcon
} from '@mui/icons-material';

interface DoctorInfo {
    name: string;
    specialty: string;
    imageUrl: string;
    verified: boolean;
}

interface OrgInfo {
    name: string;
    type: string;
    address: string;
    imageUrl: string;
}

interface Props {
    organization: OrgInfo;
    doctor: DoctorInfo;
}

const OrganizationDoctorCards: React.FC<Props> = ({ organization, doctor }) => {
    return (
        <Grid container spacing={3}>
            {/* Organization Card */}
            <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: 4, height: '100%', position: 'relative', overflow: 'hidden' }}>
                    <Box
                        sx={{
                            height: 100,
                            backgroundImage: `url(${organization.imageUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            filter: 'brightness(0.7)'
                        }}
                    />
                    <CardContent sx={{ pt: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Typography variant="h6" fontWeight="bold">
                                {organization.name}
                            </Typography>
                            <Chip icon={<HospitalIcon fontSize="small" />} label={organization.type} size="small" color="primary" variant="outlined" />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {organization.address}
                        </Typography>
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button size="small" variant="text" startIcon={<PhoneIcon />}>Contact</Button>
                            <Button size="small" variant="text" startIcon={<AwardIcon />}>Accreditations</Button>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>

            {/* Doctor Card */}
            <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: 4, height: '100%' }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar
                                src={doctor.imageUrl}
                                sx={{ width: 64, height: 64, mr: 2, border: '3px solid #1a237e' }}
                            />
                            <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Typography variant="h6" fontWeight="bold">
                                        {doctor.name}
                                    </Typography>
                                    {doctor.verified && <VerifiedIcon color="primary" fontSize="small" />}
                                </Box>
                                <Typography variant="body2" color="primary" fontWeight="bold">
                                    {doctor.specialty}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Primary Care Physician
                                </Typography>
                            </Box>
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
                            <Box sx={{ textAlign: 'center' }}>
                                <IconButton color="primary" sx={{ bgcolor: 'rgba(26, 35, 126, 0.05)' }}>
                                    <EmailIcon />
                                </IconButton>
                                <Typography variant="caption" display="block">Email</Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center' }}>
                                <IconButton color="primary" sx={{ bgcolor: 'rgba(26, 35, 126, 0.05)' }}>
                                    <PhoneIcon />
                                </IconButton>
                                <Typography variant="caption" display="block">Call</Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center' }}>
                                <Button variant="contained" size="small" sx={{ height: 40, mt: 0.5, borderRadius: 2 }}>
                                    Book Session
                                </Button>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
};

export default OrganizationDoctorCards;
