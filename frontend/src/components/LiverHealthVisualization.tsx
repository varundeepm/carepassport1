import React from 'react';
import {
    Paper, Typography, Box, Grid,
    Card, CardContent, LinearProgress
} from '@mui/material';
import {
    PieChart, Pie, Cell, ResponsiveContainer,
    Tooltip, Legend, RadarChart, PolarGrid,
    PolarAngleAxis, Radar
} from 'recharts';

interface LiverStats {
    alt: number;
    ast: number;
    alp: number;
    bilirubin: number;
    albumin: number;
}

interface Props {
    stats: LiverStats;
    riskLevel: 'low' | 'medium' | 'high';
}

const LiverHealthVisualization: React.FC<Props> = ({ stats, riskLevel }) => {
    const pieData = [
        { name: 'ALT', value: stats.alt, color: '#1a237e' },
        { name: 'AST', value: stats.ast, color: '#f44336' },
        { name: 'ALP', value: stats.alp, color: '#4caf50' },
        { name: 'Bilirubin', value: stats.bilirubin * 10, color: '#ffeb3b' } // Scale for visibility
    ];

    const radarData = [
        { subject: 'ALT', A: stats.alt, fullMark: 100 },
        { subject: 'AST', A: stats.ast, fullMark: 100 },
        { subject: 'ALP', A: stats.alp, fullMark: 200 },
        { subject: 'Albumin', A: stats.albumin * 20, fullMark: 100 },
        { subject: 'Bilirubin', A: stats.bilirubin * 50, fullMark: 100 },
    ];

    const getRiskColor = () => {
        switch (riskLevel) {
            case 'high': return '#f44336';
            case 'medium': return '#ffa726';
            default: return '#66bb6a';
        }
    };

    return (
        <Box>
            <Grid container spacing={3}>
                {/* Risk Assessment Card */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 3, borderRadius: 4, bgcolor: `${getRiskColor()}15`, border: `1px solid ${getRiskColor()}` }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                                <Typography variant="h6" fontWeight="bold" color={getRiskColor()}>
                                    Liver Health Risk: {riskLevel.toUpperCase()}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Based on your latest blockchain-verified medical report.
                                </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                                <Typography variant="h4" fontWeight="bold" color={getRiskColor()}>
                                    {riskLevel === 'low' ? '92%' : riskLevel === 'medium' ? '65%' : '38%'}
                                </Typography>
                                <Typography variant="caption">Health Index</Typography>
                            </Box>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={riskLevel === 'low' ? 92 : riskLevel === 'medium' ? 65 : 38}
                            sx={{ mt: 2, height: 8, borderRadius: 4, bgcolor: 'rgba(0,0,0,0.05)', '& .MuiLinearProgress-bar': { bgcolor: getRiskColor() } }}
                        />
                    </Paper>
                </Grid>

                {/* Dashboard Visualization */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ borderRadius: 4, height: 350 }}>
                        <CardContent>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                Enzyme Distrubution
                            </Typography>
                            <Box sx={{ height: 280 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card sx={{ borderRadius: 4, height: 350 }}>
                        <CardContent>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                Liver Profile Radar
                            </Typography>
                            <Box sx={{ height: 280 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                        <PolarGrid />
                                        <PolarAngleAxis dataKey="subject" />
                                        <Radar
                                            name="Patient"
                                            dataKey="A"
                                            stroke="#1a237e"
                                            fill="#1a237e"
                                            fillOpacity={0.6}
                                        />
                                        <Tooltip />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default LiverHealthVisualization;
