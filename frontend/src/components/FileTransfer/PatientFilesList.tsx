import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    IconButton,
    Chip,
    CircularProgress,
    Divider,
    Button,
    Alert
} from '@mui/material';
import {
    CloudDownload as DownloadIcon,
    VerifiedUser as VerifiedIcon,
    Description as FileIcon
} from '@mui/icons-material';
import api from '../../services/api';

// Reads the logged-in user's wallet address from localStorage
const getMyWalletAddress = (): string | null => {
    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return user?.walletAddress || null;
    } catch {
        return null;
    }
};

const PatientFilesList: React.FC = () => {
    const [transfers, setTransfers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const walletAddress = getMyWalletAddress();

    useEffect(() => {
        if (walletAddress) {
            fetchTransfers();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [walletAddress]);

    const fetchTransfers = async () => {
        if (!walletAddress) return;
        try {
            setLoading(true);
            setError(null);
            // ── BUG FIX: use authenticated api instance + correct endpoint ──
            const response = await api.get(`/reports/transfers/${walletAddress}`);
            if (response.data.success) {
                setTransfers(response.data.data || []);
            }
        } catch (err: any) {
            console.error('Error fetching transfers:', err);
            setError('Could not load your files. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (transfer: any) => {
        try {
            // Download the physical file using the stored fileHash (filename on disk)
            const response = await api.get(`/reports/download/${transfer.fileHash}`, {
                responseType: 'blob'
            });
            const fileName = transfer.metadata?.filename || transfer.fileHash || 'medical-file';
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err: any) {
            console.error('Download error:', err);
            alert('Error downloading file. Please try again.');
        }
    };

    if (!walletAddress) {
        return (
            <Paper sx={{ p: 3, borderRadius: 3, textAlign: 'center', bgcolor: 'rgba(0,0,0,0.02)' }}>
                <Typography variant="body1" color="text.secondary">
                    No wallet address found. Please log in again.
                </Typography>
            </Paper>
        );
    }

    return (
        <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" display="flex" alignItems="center">
                    <VerifiedIcon sx={{ mr: 1, color: 'success.main' }} />
                    Blockchain Secured Files
                </Typography>
                <Button size="small" onClick={fetchTransfers} disabled={loading}>
                    Refresh
                </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress size={30} />
                </Box>
            ) : transfers.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    No files have been shared with your wallet yet.
                </Typography>
            ) : (
                <List disablePadding>
                    {transfers.map((item) => (
                        <ListItem
                            key={item._id}
                            sx={{
                                mb: 1,
                                bgcolor: 'rgba(0,0,0,0.01)',
                                borderRadius: 2,
                                '&:hover': { bgcolor: 'rgba(0,0,0,0.03)' }
                            }}
                            secondaryAction={
                                <IconButton
                                    edge="end"
                                    color="primary"
                                    onClick={() => handleDownload(item)}
                                    title="Download file"
                                >
                                    <DownloadIcon />
                                </IconButton>
                            }
                        >
                            <ListItemIcon>
                                <FileIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText
                                primary={item.metadata?.filename || 'Medical Document'}
                                secondary={
                                    <Box component="span" sx={{ display: 'flex', flexDirection: 'column' }}>
                                        <Typography variant="caption" color="text.secondary">
                                            Sent: {new Date(item.createdAt).toLocaleDateString()}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                                            ✓ Verified on Blockchain
                                        </Typography>
                                    </Box>
                                }
                            />
                        </ListItem>
                    ))}
                </List>
            )}
        </Paper>
    );
};

export default PatientFilesList;
