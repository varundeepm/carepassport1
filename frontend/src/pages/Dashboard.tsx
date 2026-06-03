import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Divider,
  Avatar,
  Container,
  IconButton,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  Home as HomeIcon,
  NavigateNext as NextIcon,
  Person as PersonIcon,
  AccountBalanceWallet as WalletIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import HealthChatbot from '../components/HealthChatbot';
import { WalletConnectButton, WalletHistory } from '../components/WalletConnect';
import DoctorFileUpload from '../components/FileTransfer/DoctorFileUpload';
import PatientFilesList from '../components/FileTransfer/PatientFilesList';
import LiverCategoryList, { LIVER_CATEGORIES } from '../components/LiverCategoryList';
import PatientCategoryTable from '../components/PatientCategoryTable';
import LiverHealthVisualization from '../components/LiverHealthVisualization';
import OrganizationDoctorCards from '../components/OrganizationDoctorCards';

// Main Dashboard Component
const Dashboard: React.FC = () => {
  const { user, userType } = useAuth();

  if (!user) {
    return (
      <Box sx={{ p: 5, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>Session Expired</Typography>
        <Button variant="contained" href="/login" sx={{ mt: 2, borderRadius: 3 }}>
          Return to Login
        </Button>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {userType === 'doctor' ? <DoctorDashboard /> : <PatientDashboard />}
      <HealthChatbot />
    </Container>
  );
};

// Doctor Dashboard Component (Task 3)
const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // Mock data for counts and patients
  const categoryCounts = { 1: 5, 2: 12, 3: 8, 4: 3, 5: 2, 6: 7, 7: 4, 8: 15, 9: 6, 10: 9 };

  const mockPatients = [
    {
      id: 'p1', name: 'John Doe', age: 45, gender: 'Male',
      riskLevel: 'high' as const, lastReportDate: '2024-02-10',
      walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
    },
    {
      id: 'p2', name: 'Jane Smith', age: 38, gender: 'Female',
      riskLevel: 'low' as const, lastReportDate: '2024-02-12',
      walletAddress: '0x123d35Cc6634C0532925a3b844Bc454e4438f44a'
    }
  ];

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Breadcrumbs separator={<NextIcon fontSize="small" />} sx={{ mb: 1 }}>
            <Link underline="hover" color="inherit" onClick={() => { setSelectedCategory(null); setSelectedPatientId(null); }} sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Dashboard
            </Link>
            {selectedCategory && (
              <Typography color="text.primary">{LIVER_CATEGORIES[selectedCategory - 1]}</Typography>
            )}
          </Breadcrumbs>
          <Typography variant="h4" fontWeight="bold">Doctor Portal</Typography>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="body2" color="text.secondary">Welcome back,</Typography>
          <Typography variant="h6" color="primary" fontWeight="bold">Dr. {user?.name || 'Practitioner'}</Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Left Sidebar - Wallet & Profile */}
        <Grid item xs={12} md={3.5}>
          <Card sx={{ borderRadius: 4, mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ width: 60, height: 60, mr: 2, bgcolor: 'primary.main', border: '3px solid #e8eaf6' }}>
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">{user?.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{user?.specialty || 'Hepatologist'}</Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" gutterBottom fontWeight="bold" sx={{ color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                <WalletIcon sx={{ mr: 1, fontSize: 18 }} /> SUI HEALTH WALLET
              </Typography>
              <WalletConnectButton />
              <WalletHistory />
            </CardContent>
          </Card>
        </Grid>

        {/* Main Content Area */}
        <Grid item xs={12} md={8.5}>
          {!selectedCategory ? (
            <Box>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>Patient Categories</Typography>
              <LiverCategoryList
                counts={categoryCounts}
                onSelect={(id) => setSelectedCategory(id)}
              />
            </Box>
          ) : !selectedPatientId ? (
            <PatientCategoryTable
              categoryName={LIVER_CATEGORIES[selectedCategory - 1]}
              patients={mockPatients}
              onViewPatient={(id) => setSelectedPatientId(id)}
              onUploadReport={(id) => setSelectedPatientId(id)}
            />
          ) : (
            <Box>
              <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
                <Button variant="outlined" onClick={() => setSelectedPatientId(null)}>Back to List</Button>
              </Box>
              <DoctorFileUpload defaultRecipient={mockPatients.find(p => p.id === selectedPatientId)?.walletAddress} />
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

// Patient Dashboard Component (Task 2)
const PatientDashboard: React.FC = () => {
  const { user } = useAuth();

  // Mock data for visualizations
  const mockStats = { alt: 45, ast: 38, alp: 110, bilirubin: 1.2, albumin: 4.1 };
  const mockOrg = {
    name: 'Apollo Liver Institute',
    type: 'Diagnostic Center',
    address: '123 Health Ave, Medical District',
    imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=400'
  };
  const mockDoctor = {
    name: 'Dr. Sarah Johnson',
    specialty: 'Senior Hepatologist',
    imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200',
    verified: true
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">Patient Dashboard</Typography>
          <Typography variant="body2" color="text.secondary">Comprehensive Liver Health Tracking</Typography>
        </Box>
        <IconButton color="primary"><RefreshIcon /></IconButton>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column - Health Profile & Wallet */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 4, mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ width: 64, height: 64, mr: 2, bgcolor: 'secondary.main' }}>
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">{user?.name}</Typography>
                  <Typography variant="caption" color="text.secondary">ID: {user?.id || 'PAT-9021'}</Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" gutterBottom fontWeight="bold" sx={{ color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                <WalletIcon sx={{ mr: 1, fontSize: 18 }} /> SUI HEALTH WALLET
              </Typography>
              <WalletConnectButton />
              <WalletHistory />
            </CardContent>
          </Card>

          {/* Org & Doctor Cards (Task 2) */}
          <OrganizationDoctorCards
            organization={mockOrg}
            doctor={mockDoctor}
          />
        </Grid>

        {/* Right Column - Visualizations & Reports */}
        <Grid item xs={12} md={8}>
          {/* Health Visualizations (Task 1 & 2) */}
          <Box sx={{ mb: 3 }}>
            <LiverHealthVisualization stats={mockStats} riskLevel="low" />
          </Box>

          {/* Blockchain Files (Task 3) */}
          <PatientFilesList />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;