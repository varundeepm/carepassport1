import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard'; // Keeping the original as temporary fallback
import DoctorDashboard from './pages/DoctorDashboard';
import PatientDashboard from './pages/PatientDashboard';
import Register from './pages/Register';
import AddPatient from './pages/AddPatient';
import DoctorCategoryView from './pages/DoctorCategoryView';
import BookAppointment from './pages/BookAppointment';
import PatientAppointments from './pages/PatientAppointments';
import DoctorAppointments from './pages/DoctorAppointments';
import Community from './pages/Community';
import HealthAnalysis from './pages/HealthAnalysis';
import DoctorPatientRewards from './pages/DoctorPatientRewards';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1a237e', // Deep Blue
    },
    secondary: {
      main: '#f44336', // Primary Red
    },
    background: {
      default: '#f8f9fa'
    }
  },
  shape: {
    borderRadius: 12
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  }
});

const ProtectedRoute: React.FC<{ children: React.ReactNode; role?: string }> = ({ children, role }) => {
  const { isAuthenticated, user } = useAuth();
  const savedToken = localStorage.getItem('token');

  if (!isAuthenticated && !savedToken) {
    return <Navigate to="/login" />;
  }

  if (role && user && user.role !== role) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              path="/doctor/dashboard"
              element={
                <ProtectedRoute role="doctor">
                  <DoctorDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/doctor/category/:categoryId"
              element={
                <ProtectedRoute role="doctor">
                  <DoctorCategoryView />
                </ProtectedRoute>
              }
            />

            <Route
              path="/doctor/add-patient"
              element={
                <ProtectedRoute role="doctor">
                  <AddPatient />
                </ProtectedRoute>
              }
            />

            <Route
              path="/doctor/appointments"
              element={
                <ProtectedRoute role="doctor">
                  <DoctorAppointments />
                </ProtectedRoute>
              }
            />

            <Route
              path="/doctor/patient-rewards"
              element={
                <ProtectedRoute role="doctor">
                  <DoctorPatientRewards />
                </ProtectedRoute>
              }
            />

            <Route
              path="/patient/dashboard"
              element={
                <ProtectedRoute role="patient">
                  <PatientDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/patient/appointments"
              element={
                <ProtectedRoute role="patient">
                  <PatientAppointments />
                </ProtectedRoute>
              }
            />

            <Route
              path="/patient/book-appointment"
              element={
                <ProtectedRoute role="patient">
                  <BookAppointment />
                </ProtectedRoute>
              }
            />

            <Route
              path="/patient/community"
              element={
                <ProtectedRoute role="patient">
                  <Community />
                </ProtectedRoute>
              }
            />

            <Route
              path="/patient/health-analysis"
              element={
                <ProtectedRoute role="patient">
                  <HealthAnalysis />
                </ProtectedRoute>
              }
            />

            {/* Legacy Dashboard endpoint handler */}
            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;