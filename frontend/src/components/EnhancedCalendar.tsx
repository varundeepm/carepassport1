import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Link,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  LocalHospital as HospitalIcon,
  Medication as MedicationIcon,
  Assignment as AssignmentIcon,
  EventNote as EventNoteIcon,
  Folder as FolderIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Link as LinkIcon
} from '@mui/icons-material';
import { calendarApi, Visit, CalendarData } from '../services/calendarApi';

interface EnhancedCalendarProps {
  onVisitClick?: (visit: Visit) => void;
}

const EnhancedCalendar: React.FC<EnhancedCalendarProps> = ({ onVisitClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Generate years for dropdown (current year - 5 to current year + 5)
  const years = Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 5 + i);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Fetch calendar data when year/month changes
  useEffect(() => {
    fetchCalendarData(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth]);

  const fetchCalendarData = async (year: number, month: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await calendarApi.getCalendarData(year, month);
      setCalendarData(data);
    } catch (err) {
      setError('Failed to load calendar data');
      console.error('Error fetching calendar data:', err);
    } finally {
      setLoading(false);
    }
  };

  const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1);
  const lastDayOfMonth = new Date(selectedYear, selectedMonth + 1, 0);
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());

  const days = [];
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    days.push(date);
  }

  const getVisitsForDate = (date: Date): Visit[] => {
    if (!calendarData) return [];
    const dateString = date.toISOString().split('T')[0];
    return calendarData.visits.filter(visit => visit.date === dateString);
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === selectedMonth;
  };

  const isPastDate = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const handleDateClick = (date: Date) => {
    const visitsForDate = getVisitsForDate(date);
    if (visitsForDate.length > 0) {
      setSelectedVisit(visitsForDate[0]);
      setDialogOpen(true);
    }
  };

  const handleVisitClick = (visit: Visit) => {
    if (onVisitClick) {
      onVisitClick(visit);
    }
  };

  const handleFileClick = (fileUrl: string, fileName: string) => {
    // Open file in new tab
    window.open(fileUrl, '_blank');
  };

  const handleYearChange = (event: any) => {
    setSelectedYear(event.target.value);
  };

  const handleMonthChange = (event: any) => {
    setSelectedMonth(event.target.value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'upcoming': return 'primary';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'xray': return '📷';
      case 'mri': return '🧠';
      case 'blood-test': return '🩸';
      case 'ecg': return '💓';
      case 'prescription': return '💊';
      case 'report': return '📄';
      default: return '📄';
    }
  };

  return (
    <Box>
      {/* Calendar Header with Year/Month Selection */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Year</InputLabel>
            <Select
              value={selectedYear}
              label="Year"
              onChange={handleYearChange}
            >
              {years.map((year) => (
                <MenuItem key={year} value={year}>{year}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Month</InputLabel>
            <Select
              value={selectedMonth}
              label="Month"
              onChange={handleMonthChange}
            >
              {months.map((month, index) => (
                <MenuItem key={index} value={index}>{month}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6">
            {months[selectedMonth]} {selectedYear}
          </Typography>
        </Box>
      </Box>

      {/* Loading and Error States */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Calendar Grid */}
      {!loading && !error && (
        <Paper elevation={2}>
          <Box sx={{ p: 2 }}>
            {/* Day Headers */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0 }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <Box key={day} sx={{ p: 1, textAlign: 'center', fontWeight: 'bold', borderBottom: '1px solid #e0e0e0' }}>
                  <Typography variant="subtitle2">{day}</Typography>
                </Box>
              ))}
            </Box>

            {/* Calendar Days */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0 }}>
              {days.map((date, index) => {
                const visitsForDate = getVisitsForDate(date);
                const hasVisits = visitsForDate.length > 0;
                const isPast = isPastDate(date);
                
                return (
                  <Box
                    key={index}
                    sx={{
                      p: 1,
                      minHeight: '80px',
                      border: '1px solid #e0e0e0',
                      cursor: hasVisits ? 'pointer' : 'default',
                      backgroundColor: hasVisits && isPast ? '#ffebee' : 'transparent',
                      '&:hover': hasVisits ? { backgroundColor: '#f5f5f5' } : {},
                    }}
                    onClick={() => handleDateClick(date)}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: isCurrentMonth(date) ? 'text.primary' : 'text.disabled',
                        fontWeight: isToday(date) ? 'bold' : 'normal',
                        textDecoration: isToday(date) ? 'underline' : 'none'
                      }}
                    >
                      {date.getDate()}
                    </Typography>
                    
                    {hasVisits && (
                      <Box sx={{ mt: 0.5 }}>
                        {visitsForDate.map((visit, visitIndex) => (
                          <Chip
                            key={visitIndex}
                            label={`${visit.hospitalName} - ${visit.specialty}`}
                            size="small"
                            color={getStatusColor(visit.status) as any}
                            sx={{ fontSize: '0.6rem', height: '18px', mb: 0.5 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVisitClick(visit);
                            }}
                          />
                        ))}
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Paper>
      )}

      {/* Visit Details Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarIcon color="primary" />
              <Typography variant="h6">
                Medical Visit - {selectedVisit?.date}
              </Typography>
            </Box>
            <IconButton onClick={() => setDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedVisit && (
            <Box>
              <Typography variant="h6" color="primary" gutterBottom>
                {selectedVisit.hospitalName}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <PersonIcon sx={{ fontSize: 16 }} />
                <Typography variant="subtitle1">
                  {selectedVisit.doctor} - {selectedVisit.specialty}
                </Typography>
                <Chip 
                  label={selectedVisit.status} 
                  color={getStatusColor(selectedVisit.status) as any}
                  size="small"
                />
              </Box>

              {/* Medical Files with Hyperlinks */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <FolderIcon sx={{ fontSize: 16 }} />
                  Medical Files:
                </Typography>
                <List dense>
                  {selectedVisit.files.map((file) => (
                    <ListItem key={file.id} sx={{ pl: 0 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <Typography>{getFileIcon(file.type)}</Typography>
                      </ListItemIcon>
                      <ListItemText
                        primary={file.name}
                        secondary={`Uploaded: ${file.uploadedAt}`}
                      />
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleFileClick(file.url, file.name)}
                          title="View file"
                        >
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleFileClick(file.url, file.name)}
                          title="Download file"
                        >
                          <DownloadIcon />
                        </IconButton>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </Box>

              {/* Prescription */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <MedicationIcon sx={{ fontSize: 16 }} />
                  Prescription:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedVisit.prescription}
                </Typography>
                <Link
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    // Open prescription in new tab
                    window.open(`/prescription/${selectedVisit.id}`, '_blank');
                  }}
                  sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, mt: 1 }}
                >
                  <LinkIcon sx={{ fontSize: 16 }} />
                  View Full Prescription
                </Link>
              </Box>

              {/* Doctor's Suggestions */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <AssignmentIcon sx={{ fontSize: 16 }} />
                  Doctor's Suggestions:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedVisit.suggestions}
                </Typography>
              </Box>

              {/* Next Appointment */}
              <Box>
                <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <EventNoteIcon sx={{ fontSize: 16 }} />
                  Next Appointment:
                </Typography>
                <Chip label={selectedVisit.reAppointment} color="success" size="small" />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EnhancedCalendar; 