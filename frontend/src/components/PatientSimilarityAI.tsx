import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, List, ListItem, ListItemAvatar,
    Avatar, ListItemText, CircularProgress, Alert, Chip, Divider
} from '@mui/material';
import { AutoAwesome, Person } from '@mui/icons-material';
import diseaseService from '../services/diseaseService';

interface Props {
    patientId: string;
}

const PatientSimilarityAI: React.FC<Props> = ({ patientId }) => {
    const [similarityData, setSimilarityData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (patientId) {
            analyzeSimilarity();
        }
    }, [patientId]);

    const analyzeSimilarity = async () => {
        try {
            setLoading(true);
            const response = await diseaseService.getAISimilarity(patientId);
            if (response.success) {
                setSimilarityData(response);
            }
        } catch (err) {
            setError('AI service temporarily unavailable');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
        <CircularProgress size={24} sx={{ mb: 1 }} />
        <Typography variant="caption">AI Analyzing Disease Patterns...</Typography>
    </Box>;

    if (error) return <Alert severity="warning">{error}</Alert>;
    if (!similarityData || !similarityData.similarPatients?.length) return null;

    return (
        <Paper sx={{ p: 2, borderRadius: 3, bgcolor: '#f5f7ff', border: '1px solid #e0e6ff' }}>
            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', color: '#3f51b5', fontWeight: 'bold' }}>
                <AutoAwesome sx={{ mr: 1, fontSize: 18 }} /> AI-Powered Case Similarity
            </Typography>
            <Typography variant="caption" color="textSecondary" sx={{ mb: 2, display: 'block' }}>
                Found {similarityData.similarPatients.length} patients with similar medical profiles.
            </Typography>

            <List dense sx={{ p: 0 }}>
                {similarityData.similarPatients.map((match: any, idx: number) => (
                    <React.Fragment key={match.patientId}>
                        <ListItem sx={{ px: 0 }}>
                            <ListItemAvatar>
                                <Avatar sx={{ bgcolor: '#3f51b5', width: 32, height: 32 }}>
                                    <Person fontSize="small" />
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={`Patient Ref: ${match.patientId}`}
                                secondary={
                                    <Box component="span" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                        <Chip
                                            label={`${match.score * 10}% match profile`}
                                            size="small"
                                            color="primary"
                                            variant="outlined"
                                            sx={{ height: 18, fontSize: '0.65rem' }}
                                        />
                                        <Typography variant="caption" sx={{ ml: 1 }}>
                                            {match.sharedDiseases.length} shared conditions
                                        </Typography>
                                    </Box>
                                }
                            />
                        </ListItem>
                        {idx < similarityData.similarPatients.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                ))}
            </List>
        </Paper>
    );
};

export default PatientSimilarityAI;
