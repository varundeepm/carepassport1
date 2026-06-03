import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge
} from '@mui/material';
import {
  Description as ReportIcon,
  Visibility as ViewIcon,
  CheckCircle as AcknowledgeIcon,
  Schedule as ScheduleIcon,
  Person as DoctorIcon,
  Priority as PriorityIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { getPatientReports, markReportAsRead, markReportAsAcknowledged, type Report } from '../services/reportService';

interface PatientReportsProps {
  patientId: string;
  patientName: string;
}

const PatientReports: React.FC<PatientReportsProps> = ({ patientId, patientName }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Load reports for the patient
  useEffect(() => {
    const loadReports = async () => {
      try {
        setLoading(true);
        setError(null);
        const reportsData = await getPatientReports(patientId);
        setReports(reportsData);
      } catch (error) {
        console.error('Failed to load reports:', error);
        setError(error instanceof Error ? error.message : 'Failed to load reports');
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      loadReports();
    }
  }, [patientId]);

  const handleViewReport = async (report: Report) => {
    setSelectedReport(report);
    setDialogOpen(true);

    // Mark as read if not already read
    if (report.status === 'sent') {
      try {
        const updatedReport = await markReportAsRead(report.reportId);
        setReports(prev => prev.map(r => 
          r.reportId === report.reportId ? updatedReport : r
        ));
        setSelectedReport(updatedReport);
      } catch (error) {
        console.error('Failed to mark report as read:', error);
      }
    }
  };

  const handleAcknowledgeReport = async (report: Report) => {
    try {
      const updatedReport = await markReportAsAcknowledged(report.reportId);
      setReports(prev => prev.map(r => 
        r.reportId === report.reportId ? updatedReport : r
      ));
      setSelectedReport(updatedReport);
    } catch (error) {
      console.error('Failed to acknowledge report:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'warning';
      case 'read': return 'info';
      case 'acknowledged': return 'success';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'normal': return 'primary';
      case 'low': return 'default';
      default: return 'primary';
    }
  };

  const getReportTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'general': 'General Report',
      'diagnosis': 'Diagnosis',
      'lab_results': 'Lab Results',
      'treatment_plan': 'Treatment Plan',
      'follow_up': 'Follow-up',
      'discharge': 'Discharge Summary',
      'consultation': 'Consultation Notes'
    };
    return types[type] || type;
  };

  const unreadCount = reports.filter(r => r.status === 'sent').length;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Loading your reports...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ReportIcon />
          Medical Reports
        </Typography>
        {unreadCount > 0 && (
          <Badge badgeContent={unreadCount} color="error">
            <Chip label={`${unreadCount} New`} color="warning" size="small" />
          </Badge>
        )}
      </Box>

      {reports.length === 0 ? (
        <Alert severity="info">
          No reports available yet. Your doctor will send reports here when available.
        </Alert>
      ) : (
        <List>
          {reports.map((report, index) => (
            <React.Fragment key={report.reportId}>
              <ListItem
                sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  mb: 1,
                  backgroundColor: report.status === 'sent' ? '#fff3e0' : 'white'
                }}
              >
                <ListItemIcon>
                  <ReportIcon color={report.status === 'sent' ? 'warning' : 'primary'} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {report.title}
                      </Typography>
                      <Chip 
                        label={getReportTypeLabel(report.reportType)} 
                        size="small" 
                        variant="outlined" 
                      />
                      <Chip 
                        label={report.priority} 
                        size="small" 
                        color={getPriorityColor(report.priority)} 
                      />
                      <Chip 
                        label={report.status} 
                        size="small" 
                        color={getStatusColor(report.status)} 
                      />
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DoctorIcon fontSize="small" />
                        From: {report.doctorName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <ScheduleIcon fontSize="small" />
                        Sent: {new Date(report.createdAt).toLocaleDateString()} at {new Date(report.createdAt).toLocaleTimeString()}
                      </Typography>
                      {report.readAt && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          Read: {new Date(report.readAt).toLocaleDateString()} at {new Date(report.readAt).toLocaleTimeString()}
                        </Typography>
                      )}
                    </Box>
                  }
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ViewIcon />}
                    onClick={() => handleViewReport(report)}
                  >
                    View
                  </Button>
                  {report.status === 'read' && (
                    <Button
                      variant="contained"
                      size="small"
                      color="success"
                      startIcon={<AcknowledgeIcon />}
                      onClick={() => handleAcknowledgeReport(report)}
                    >
                      Acknowledge
                    </Button>
                  )}
                </Box>
              </ListItem>
              {index < reports.length - 1 && <Divider sx={{ my: 1 }} />}
            </React.Fragment>
          ))}
        </List>
      )}

      {/* Report Detail Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedReport && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6">{selectedReport.title}</Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Chip label={getReportTypeLabel(selectedReport.reportType)} size="small" />
                  <Chip label={selectedReport.priority} size="small" color={getPriorityColor(selectedReport.priority)} />
                  <Chip label={selectedReport.status} size="small" color={getStatusColor(selectedReport.status)} />
                </Box>
              </Box>
              <Button onClick={() => setDialogOpen(false)} startIcon={<CloseIcon />}>
                Close
              </Button>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>From:</strong> {selectedReport.doctorName}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Sent:</strong> {new Date(selectedReport.createdAt).toLocaleString()}
                </Typography>
                {selectedReport.readAt && (
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Read:</strong> {new Date(selectedReport.readAt).toLocaleString()}
                  </Typography>
                )}
                {selectedReport.acknowledgedAt && (
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Acknowledged:</strong> {new Date(selectedReport.acknowledgedAt).toLocaleString()}
                  </Typography>
                )}
              </Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                {selectedReport.content}
              </Typography>
              {selectedReport.attachments && selectedReport.attachments.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Attachments:
                  </Typography>
                  {selectedReport.attachments.map((attachment, index) => (
                    <Chip
                      key={index}
                      label={attachment.fileName}
                      variant="outlined"
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              {selectedReport.status === 'read' && (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<AcknowledgeIcon />}
                  onClick={() => handleAcknowledgeReport(selectedReport)}
                >
                  Acknowledge Report
                </Button>
              )}
              <Button onClick={() => setDialogOpen(false)}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default PatientReports;
