import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import { CloudDownload as DownloadIcon, Verified as VerifiedIcon } from '@mui/icons-material';
import api from '../../services/api';

const PatientFileDownload: React.FC = () => {
  const [fileHash, setFileHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVerifyAndDownload = async () => {
    if (!fileHash.trim()) {
      setError('Please enter the file hash or ID provided by your doctor.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setVerified(null);

      // ── Step 1: Verify blockchain record ─────────────────────────────────
      // BUG FIX: was hitting non-existent /api/medical-files/verify-integrity/:id
      const verifyResponse = await api.get(`/reports/verify-integrity/${fileHash.trim()}`);

      if (!verifyResponse.data.success || !verifyResponse.data.verified) {
        setError('Blockchain verification failed: no valid record found for this file hash.');
        setLoading(false);
        return;
      }

      const record = verifyResponse.data.record;
      setVerified(record);

      // ── Step 2: Download the physical file ───────────────────────────────
      // BUG FIX: was hitting non-existent /api/medical-files/verify-integrity
      const response = await api.get(`/reports/download/${record.fileHash}`, {
        responseType: 'blob',
      });

      const fileName = record.fileId || record.fileHash || 'medical-file';
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to download file.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 3 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        📥 Receive & Verify Secure File
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Enter the file hash that your doctor shared with you to verify its authenticity on the
        blockchain and download it securely.
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <TextField
        fullWidth
        label="File Hash / File ID"
        value={fileHash}
        onChange={(e) => {
          setFileHash(e.target.value);
          setVerified(null);
          setError(null);
        }}
        disabled={loading}
        margin="normal"
        size="small"
        placeholder="Enter the file hash provided by your doctor"
        helperText="This is the unique identifier sent to you by your doctor"
      />

      <Button
        variant="contained"
        onClick={handleVerifyAndDownload}
        disabled={!fileHash.trim() || loading}
        fullWidth
        startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <DownloadIcon />}
        sx={{ mt: 2, py: 1.2, fontWeight: 'bold', borderRadius: 2 }}
      >
        {loading ? 'Verifying & Downloading…' : 'Verify & Download'}
      </Button>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Verified badge */}
      {verified && (
        <Alert severity="success" icon={<VerifiedIcon />} sx={{ mt: 2, borderRadius: 2 }}>
          <Typography variant="subtitle2" fontWeight="bold">✅ Blockchain Verified</Typography>
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" display="block" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
              Hash: {verified.fileHash}
            </Typography>
            <Typography variant="caption" display="block" color="text.secondary">
              From wallet: {verified.senderWallet?.slice(0, 16)}...
            </Typography>
            <Typography variant="caption" display="block" color="text.secondary">
              Completed: {verified.completedAt ? new Date(verified.completedAt).toLocaleString() : 'N/A'}
            </Typography>
          </Box>
        </Alert>
      )}
    </Paper>
  );
};

export default PatientFileDownload;