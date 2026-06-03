import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Grid, Card, CardContent,
    Chip, Divider,
    CircularProgress, Alert
} from '@mui/material';
import { Healing, Timeline } from '@mui/icons-material';
import diseaseService, { PatientDisease } from '../services/diseaseService';

interface Props {
    patientId: string;
}

const PatientDiseaseView: React.FC<Props> = ({ patientId }) => {
    const [patientDiseases, setPatientDiseases] = useState<PatientDisease[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (patientId) {
            fetchPatientDiseases();
        }
    }, [patientId]);

    const fetchPatientDiseases = async () => {
        try {
            setLoading(true);
            const response = await diseaseService.getPatientDiseases(patientId);
            if (response.success) {
                setPatientDiseases(response.data);
            }
        } catch (err) {
            setError('Failed to load patient health conditions');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'error';
            case 'chronic': return 'warning';
            case 'in_remission': return 'info';
            case 'cured': return 'success';
            default: return 'default';
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;
    if (patientDiseases.length === 0) return <Alert severity="info">No chronic conditions or diseases recorded for this patient.</Alert>;

    return (
        <Box>
            <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ color: '#1a237e', display: 'flex', alignItems: 'center' }}>
                <Healing sx={{ mr: 1 }} /> Active Medical Conditions
            </Typography>

            <Grid container spacing={2}>
                {patientDiseases.map((pd: any) => (
                    <Grid key={pd._id} size={{ xs: 12 }}>
                        <Card sx={{ borderRadius: 2, borderLeft: `6px solid ${pd.currentStatus === 'active' ? '#f44336' : '#ffa726'}` }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        {pd.diseaseId?.name || 'Loading disease info...'}
                                    </Typography>
                                    <Chip
                                        label={pd.currentStatus.replace('_', ' ').toUpperCase()}
                                        color={getStatusColor(pd.currentStatus) as any}
                                        size="small"
                                    />
                                </Box>

                                <Grid container spacing={2} sx={{ mt: 1 }}>
                                    <Grid size={{ xs: 6 }}>
                                        <Typography variant="caption" color="textSecondary">Diagnosis Date</Typography>
                                        <Typography variant="body2">{new Date(pd.diagnosisDate).toLocaleDateString()}</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <Typography variant="caption" color="textSecondary">Severity Level</Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Typography variant="body2" sx={{ mr: 1 }}>{pd.severity}</Typography>
                                            <Timeline fontSize="small" color="action" />
                                        </Box>
                                    </Grid>
                                </Grid>

                                {pd.medications && pd.medications.length > 0 && (
                                    <Box sx={{ mt: 2 }}>
                                        <Divider sx={{ mb: 1 }} />
                                        <Typography variant="caption" color="textSecondary" sx={{ mb: 1, display: 'block' }}>Active Medications</Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {pd.medications.filter((m: any) => m.isActive).map((m: any, idx: number) => (
                                                <Chip key={idx} variant="outlined" label={`${m.name} (${m.dosage})`} size="small" />
                                            ))}
                                        </Box>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default PatientDiseaseView;
