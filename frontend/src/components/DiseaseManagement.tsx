import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Button, Dialog,
    DialogTitle, DialogContent, TextField, MenuItem,
    Chip, CircularProgress, Alert, Grid, Card, CardContent
} from '@mui/material';
import diseaseService, { Disease } from '../services/diseaseService';

const DiseaseManagement: React.FC = () => {
    const [diseases, setDiseases] = useState<Disease[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openAddDialog, setOpenAddDialog] = useState(false);

    useEffect(() => {
        fetchDiseases();
    }, []);

    const fetchDiseases = async () => {
        try {
            setLoading(true);
            const response = await diseaseService.getAllDiseases();
            if (response.success) {
                setDiseases(response.data);
            }
        } catch (err) {
            setError('Failed to fetch diseases');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity.toLowerCase()) {
            case 'critical': return 'error';
            case 'severe': return 'warning';
            case 'moderate': return 'info';
            case 'mild': return 'success';
            default: return 'default';
        }
    };

    return (
        <Box sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" fontWeight="bold">
                    Disease Library & Management
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setOpenAddDialog(true)}
                    sx={{ borderRadius: 2 }}
                >
                    Add New Disease Profile
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {diseases.map((disease) => (
                        <Grid item xs={12} md={4} key={disease.diseaseId}>
                            <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 3 }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                        <Typography variant="h6" color="primary" fontWeight="bold">
                                            {disease.name}
                                        </Typography>
                                        <Chip
                                            label={disease.severity.toUpperCase()}
                                            color={getSeverityColor(disease.severity) as any}
                                            size="small"
                                        />
                                    </Box>
                                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2, height: 60, overflow: 'hidden' }}>
                                        {disease.description}
                                    </Typography>
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="subtitle2" fontWeight="bold">Key Symptoms:</Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                                            {disease.symptoms.slice(0, 3).map((s, idx) => (
                                                <Chip key={idx} label={s} size="small" variant="outlined" />
                                            ))}
                                            {disease.symptoms.length > 3 && (
                                                <Chip label={`+${disease.symptoms.length - 3} more`} size="small" variant="outlined" />
                                            )}
                                        </Box>
                                    </Box>
                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        sx={{ mt: 3, borderRadius: 2 }}
                                        onClick={() => { }} // TODO: View details
                                    >
                                        View Details
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Add Disease Dialog (Simplified for MVP) */}
            <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Register New Disease Pattern</DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <TextField fullWidth label="Disease Name" margin="normal" />
                    <TextField fullWidth label="ID (e.g., D001)" margin="normal" />
                    <TextField fullWidth label="Category" select margin="normal">
                        <MenuItem value="cardiovascular">Cardiovascular</MenuItem>
                        <MenuItem value="respiratory">Respiratory</MenuItem>
                        <MenuItem value="neurological">Neurological</MenuItem>
                    </TextField>
                    <TextField fullWidth label="Description" multiline rows={3} margin="normal" />
                    <Button variant="contained" fullWidth sx={{ mt: 3 }}>Create Disease Profile</Button>
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default DiseaseManagement;
