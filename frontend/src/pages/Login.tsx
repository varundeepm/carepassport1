import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../services/api';
import doctorBg from '../assets/doctor-bg.jpg';

type ViewMode = 'login' | 'forgot_phone' | 'forgot_otp';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const [viewMode, setViewMode] = useState<ViewMode>('login');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      await login(email, password);
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        if (user.role === 'doctor') {
          navigate('/doctor/dashboard');
        } else {
          navigate('/patient/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await auth.forgotPassword(email);
      setSuccessMsg(res.data.message || 'OTP sent to your registered phone number.');
      setViewMode('forgot_otp');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await auth.resetPassword(email, otp, newPassword);
      setSuccessMsg(res.data.message || 'Password reset successfully. You can now login.');
      setViewMode('login');
      setPassword('');
      setOtp('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${doctorBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      py: 4
    }}>
      <Container maxWidth="sm">
        <Paper elevation={6} sx={{ p: 4, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)' }}>
          <Typography variant="h4" align="center" gutterBottom fontWeight="bold" color="primary">
            CarePassport {viewMode === 'login' ? 'Login' : 'Password Reset'}
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
            {viewMode === 'login' ? 'Blockchain-Secured Medical Records' : 'Reset Password via SMS OTP'}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {successMsg && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMsg}
            </Alert>
          )}

          {viewMode === 'login' && (
            <form onSubmit={handleLoginSubmit}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                required
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                required
                sx={{ mb: 1 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button 
                  onClick={() => {
                    setViewMode('forgot_phone');
                    setError('');
                    setSuccessMsg('');
                  }} 
                  color="primary" 
                  size="small"
                >
                  Forgot Password?
                </Button>
              </Box>
              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 'bold',
                  textTransform: 'none',
                  fontSize: '1.1rem'
                }}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Don't have an account?{' '}
                  <Button onClick={() => navigate('/register')} sx={{ fontWeight: 'bold' }}>Register</Button>
                </Typography>
              </Box>
            </form>
          )}

          {viewMode === 'forgot_phone' && (
            <form onSubmit={handleSendOTP}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                required
                sx={{ mb: 3 }}
                helperText="Enter your registered email. We will text an OTP to your phone."
              />
              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 'bold',
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  mb: 2
                }}
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </Button>
              <Button 
                fullWidth 
                variant="outlined" 
                onClick={() => setViewMode('login')}
                sx={{ py: 1.5, borderRadius: 2 }}
              >
                Back to Login
              </Button>
            </form>
          )}

          {viewMode === 'forgot_otp' && (
            <form onSubmit={handleResetPassword}>
              <TextField
                fullWidth
                label="6-Digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                margin="normal"
                required
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                margin="normal"
                required
                sx={{ mb: 3 }}
              />
              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 'bold',
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  mb: 2
                }}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>
              <Button 
                fullWidth 
                variant="outlined" 
                onClick={() => setViewMode('login')}
                sx={{ py: 1.5, borderRadius: 2 }}
              >
                Cancel
              </Button>
            </form>
          )}

        </Paper>
      </Container>
    </Box>
  );
};

export default Login;