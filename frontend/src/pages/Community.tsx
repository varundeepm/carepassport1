import React from 'react';
import { Container, Box, Typography, Grid, Paper, Divider } from '@mui/material';
import Navbar from '../components/NavBar';
import CommunityChat from '../components/CommunityChat';
import GroupsIcon from '@mui/icons-material/Groups';

const Community: React.FC = () => {
    return (
        <Box sx={{ bgcolor: '#f4f6f8', minHeight: '100vh' }}>
            <Navbar />
            <Container maxWidth="xl" sx={{ mt: 4, pb: 8 }}>
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>Community Hub</Typography>
                    <Typography color="text.secondary">Connect with other patients, share experiences, and support each other.</Typography>
                </Box>

                <Grid container spacing={3}>
                    {/* Main Chat Area */}
                    <Grid sx={{ width: { xs: '100%', lg: '66.6%' }, px: 1.5 }}>
                        <Box sx={{ height: 'calc(100vh - 250px)', minHeight: 600 }}>
                            <CommunityChat />
                        </Box>
                    </Grid>

                    {/* Community Stats/Info Area */}
                    <Grid sx={{ width: { xs: '100%', lg: '33.3%' }, px: 1.5 }}>
                        <Grid container spacing={3}>
                            <Grid sx={{ width: '100%', px: 1.5, mb: 3 }}>
                                <Paper sx={{ p: 3, borderRadius: 4, bgcolor: 'primary.main', color: 'white' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                        <GroupsIcon sx={{ fontSize: 40 }} />
                                        <Box>
                                            <Typography variant="h6" fontWeight="bold">Patient Network</Typography>
                                            <Typography variant="body2" sx={{ opacity: 0.8 }}>Growing global community</Typography>
                                        </Box>
                                    </Box>
                                    <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)', my: 2 }} />
                                    <Typography variant="body1">
                                        You are currently in the <strong>Global CarePassport Chat</strong>. Be kind and supportive to fellow patients.
                                    </Typography>
                                </Paper>
                            </Grid>

                            <Grid sx={{ width: '100%', px: 1.5 }}>
                                <Paper sx={{ p: 3, borderRadius: 4 }}>
                                    <Typography variant="h6" fontWeight="bold" gutterBottom>Community Guidelines</Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                                        <Box sx={{ display: 'flex', gap: 2 }}>
                                            <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: '#e3f2fd', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'primary.main', fontWeight: 'bold', flexShrink: 0 }}>1</Box>
                                            <Typography variant="body2">No sharing of sensitive personal health data publicly.</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 2 }}>
                                            <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: '#e3f2fd', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'primary.main', fontWeight: 'bold', flexShrink: 0 }}>2</Box>
                                            <Typography variant="body2">Be respectful and maintain a positive environment.</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 2 }}>
                                            <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: '#e3f2fd', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'primary.main', fontWeight: 'bold', flexShrink: 0 }}>3</Box>
                                            <Typography variant="body2">Verified doctors will have a red label; listen to their general advice!</Typography>
                                        </Box>
                                    </Box>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default Community;
