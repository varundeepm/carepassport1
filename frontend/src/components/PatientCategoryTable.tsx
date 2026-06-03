import React from 'react';
import {
    Box, Card, CardContent, Typography,
    Avatar, Grid, Button, Chip,
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, IconButton
} from '@mui/material';
import {
    Visibility as ViewIcon,
    FileUpload as UploadIcon,
    Send as SendIcon,
    HealthAndSafety as HealthIcon
} from '@mui/icons-material';

interface PatientSummary {
    id: string;
    name: string;
    age: number;
    gender: string;
    riskLevel: 'low' | 'medium' | 'high';
    lastReportDate: string;
    walletAddress: string;
}

interface Props {
    categoryName: string;
    patients: PatientSummary[];
    onViewPatient: (id: string) => void;
    onUploadReport: (id: string) => void;
}

const PatientCategoryTable: React.FC<Props> = ({
    categoryName, patients, onViewPatient, onUploadReport
}) => {
    return (
        <Box sx={{ p: 2 }}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h5" fontWeight="bold" color="primary">
                        {categoryName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Managing {patients.length} patients in this specialized liver category.
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={<HealthIcon />}
                    sx={{ borderRadius: 2 }}
                >
                    Category Protocol
                </Button>
            </Box>

            <TableContainer component={Paper} sx={{ borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'rgba(26, 35, 126, 0.02)' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Patient</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Demographics</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Risk Level</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Last Update</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Blockchain Wallet</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }} align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {patients.map((patient) => (
                            <TableRow key={patient.id} hover>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>{patient.name[0]}</Avatar>
                                        <Box>
                                            <Typography variant="body2" fontWeight="bold">{patient.name}</Typography>
                                            <Typography variant="caption" color="text.secondary">ID: {patient.id.slice(-6)}</Typography>
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2">{patient.age}y, {patient.gender}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={patient.riskLevel.toUpperCase()}
                                        size="small"
                                        sx={{
                                            bgcolor: patient.riskLevel === 'high' ? 'rgba(244, 67, 54, 0.1)' :
                                                patient.riskLevel === 'medium' ? 'rgba(255, 167, 38, 0.1)' : 'rgba(102, 187, 106, 0.1)',
                                            color: patient.riskLevel === 'high' ? '#f44336' :
                                                patient.riskLevel === 'medium' ? '#ffa726' : '#66bb6a',
                                            fontWeight: 'bold'
                                        }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2">{new Date(patient.lastReportDate).toLocaleDateString()}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                                        {patient.walletAddress.slice(0, 6)}...{patient.walletAddress.slice(-4)}
                                    </Typography>
                                </TableCell>
                                <TableCell align="center">
                                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                        <IconButton color="primary" onClick={() => onViewPatient(patient.id)}>
                                            <ViewIcon />
                                        </IconButton>
                                        <Button
                                            size="small"
                                            variant="contained"
                                            startIcon={<UploadIcon />}
                                            onClick={() => onUploadReport(patient.id)}
                                            sx={{ borderRadius: 2 }}
                                        >
                                            Report
                                        </Button>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default PatientCategoryTable;
