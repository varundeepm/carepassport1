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
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Verified as VerifiedIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import api from '../../services/api';

interface DoctorFileUploadProps {
  /** The target patient's User._id */
  patientId?: string;
  /** Patient display name (optional, just for UI) */
  patientName?: string;
  /** Patient's blockchain wallet address (optional, just for display) */
  patientWalletAddress?: string;
}

const DoctorFileUpload: React.FC<DoctorFileUploadProps> = ({
  patientId,
  patientName,
  patientWalletAddress,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [reportType, setReportType] = useState('Lab Result');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setResult(null);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file || !patientId || !title) {
      setError('Please fill in the report title and select a file.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const formData = new FormData();
      formData.append('patientId', patientId);
      formData.append('title', title);
      formData.append('reportType', reportType);
      formData.append('reportFile', file);

      // POST to /api/reports/upload (authenticated via api instance)
      const response = await api.post('/reports/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        setResult(response.data);
        setFile(null);
        setTitle('');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Upload failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => { });
  };

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        🔒 Blockchain File Transfer
      </Typography>
      {patientName && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          Recipient: <b>{patientName}</b>
        </Typography>
      )}
      {patientWalletAddress && (
        <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'success.dark', wordBreak: 'break-all' }}>
          Wallet: {patientWalletAddress}
        </Typography>
      )}
      <Divider sx={{ my: 2 }} />

      {/* Report title */}
      <TextField
        fullWidth
        label="Report Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={loading}
        margin="normal"
        placeholder="e.g. Blood Test Results – Feb 2025"
        size="small"
      />

      {/* Report type */}
      <TextField
        fullWidth
        select
        label="Report Type"
        value={reportType}
        onChange={(e) => setReportType(e.target.value)}
        disabled={loading}
        margin="normal"
        size="small"
        SelectProps={{ native: true }}
      >
        {['Lab Result', 'Radiology', 'Prescription', 'Consultation'].map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </TextField>

      {/* File picker */}
      <Box
        sx={{
          mt: 2, p: 3,
          border: '2px dashed #e0e0e0',
          borderRadius: 2,
          textAlign: 'center',
          bgcolor: file ? 'rgba(102,126,234,0.04)' : 'transparent',
          transition: 'background 0.2s'
        }}
      >
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          style={{ display: 'none' }}
          id="doctor-file-upload-input"
          onChange={handleFileChange}
        />
        <label htmlFor="doctor-file-upload-input">
          <Button
            component="span"
            variant="outlined"
            startIcon={<UploadIcon />}
            disabled={loading}
          >
            {file ? file.name : 'Select Medical File (PDF / JPG / PNG)'}
          </Button>
        </label>
        {file && (
          <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
            {(file.size / 1024).toFixed(1)} KB
          </Typography>
        )}
      </Box>

      {/* Submit */}
      <Button
        variant="contained"
        onClick={handleUpload}
        disabled={!file || !title || loading || !patientId}
        fullWidth
        sx={{ mt: 3, py: 1.2, fontWeight: 'bold', borderRadius: 2 }}
      >
        {loading ? <CircularProgress size={22} color="inherit" /> : 'Execute Blockchain Transfer'}
      </Button>

      {loading && <LinearProgress sx={{ mt: 1, borderRadius: 1 }} />}

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Success */}
      {result && (
        <Alert severity="success" sx={{ mt: 2, borderRadius: 2 }} icon={<VerifiedIcon />}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            ✅ Transfer Recorded on Blockchain!
          </Typography>
          <Box sx={{ mt: 1, p: 1.5, bgcolor: 'rgba(0,0,0,0.04)', borderRadius: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography variant="caption" sx={{ fontFamily: 'monospace', wordBreak: 'break-all', flex: 1 }}>
                TX: {result.blockchain?.transactionHash || result.report?.blockchainTxHash || 'N/A'}
              </Typography>
              <Chip
                icon={<CopyIcon sx={{ fontSize: '0.8rem !important' }} />}
                label="Copy"
                size="small"
                onClick={() => copyToClipboard(result.blockchain?.transactionHash || '')}
                sx={{ cursor: 'pointer' }}
              />
            </Box>
            {result.blockchain?.doctorWallet && (
              <Typography variant="caption" color="text.secondary" display="block">
                From: {result.blockchain.doctorWallet.slice(0, 14)}...
              </Typography>
            )}
            {result.blockchain?.patientWallet && (
              <Typography variant="caption" color="text.secondary" display="block">
                To: {result.blockchain.patientWallet.slice(0, 14)}...
              </Typography>
            )}
          </Box>
        </Alert>
      )}
    </Paper>
  );
};

export default DoctorFileUpload;