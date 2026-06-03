import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Chip,
  Divider,
  Avatar,
  IconButton,
  Button
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ForumIcon from '@mui/icons-material/Forum';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'white', color: 'text.primary', borderBottom: '1px solid #eee' }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Typography
            variant="h6"
            onClick={() => navigate('/patient/dashboard')}
            sx={{ fontWeight: 'bold', color: 'primary.main', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 1 }}
          >
            CarePassport <Box component="span" sx={{ fontWeight: 'normal', opacity: 0.6, fontSize: '0.9rem' }}>| Patient</Box>
          </Typography>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              startIcon={<DashboardIcon />}
              onClick={() => navigate('/patient/dashboard')}
              variant={location.pathname === '/patient/dashboard' ? 'contained' : 'text'}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
            >
              Dashboard
            </Button>
            <Button
              size="small"
              startIcon={<AnalyticsIcon />}
              onClick={() => navigate('/patient/health-analysis')}
              variant={location.pathname === '/patient/health-analysis' ? 'contained' : 'text'}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
            >
              Health Analysis
            </Button>
            <Button
              size="small"
              startIcon={<ForumIcon />}
              onClick={() => navigate('/patient/community')}
              variant={location.pathname === '/patient/community' ? 'contained' : 'text'}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
            >
              Community
            </Button>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip
            icon={<AccountBalanceWalletIcon sx={{ fontSize: '1rem !important' }} />}
            label={`${user?.walletAddress?.slice(0, 8)}...`}
            variant="outlined"
            size="small"
            sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', border: 'none' }}
          />
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="body2" fontWeight="bold">
                {user?.profile.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.profile.diseaseCategoryName || 'Patient'}
              </Typography>
            </Box>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '1rem' }}>
              {user?.profile.name?.[0]}
            </Avatar>
            <IconButton color="inherit" onClick={logout} size="small" sx={{ ml: 1 }}>
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;