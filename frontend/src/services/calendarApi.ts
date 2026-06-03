// Calendar API Service
export interface Visit {
  id: string;
  date: string;
  doctor: string;
  specialty: string;
  hospitalName: string;
  prescription: string;
  suggestions: string;
  reAppointment: string;
  files: MedicalFile[];
  status: 'completed' | 'upcoming' | 'cancelled';
}

export interface MedicalFile {
  id: string;
  name: string;
  type: 'xray' | 'mri' | 'blood-test' | 'ecg' | 'prescription' | 'report';
  url: string;
  uploadedAt: string;
}

export interface CalendarData {
  visits: Visit[];
  totalVisits: number;
  upcomingVisits: number;
  completedVisits: number;
}

// Mock API endpoints - replace with actual API calls
class CalendarApiService {
  private baseUrl = '/api/calendar';

  // Get calendar data for a specific month/year
  async getCalendarData(year: number, month: number): Promise<CalendarData> {
    try {
      // Mock API call - replace with actual fetch
      const response = await this.mockApiCall(`/calendar/${year}/${month}`);
      return response;
    } catch (error) {
      console.error('Error fetching calendar data:', error);
      throw error;
    }
  }

  // Get visit details by ID
  async getVisitDetails(visitId: string): Promise<Visit> {
    try {
      const response = await this.mockApiCall(`/visits/${visitId}`);
      return response;
    } catch (error) {
      console.error('Error fetching visit details:', error);
      throw error;
    }
  }

  // Get medical files for a visit
  async getMedicalFiles(visitId: string): Promise<MedicalFile[]> {
    try {
      const response = await this.mockApiCall(`/visits/${visitId}/files`);
      return response;
    } catch (error) {
      console.error('Error fetching medical files:', error);
      throw error;
    }
  }

  // Get prescription details
  async getPrescriptionDetails(visitId: string): Promise<any> {
    try {
      const response = await this.mockApiCall(`/visits/${visitId}/prescription`);
      return response;
    } catch (error) {
      console.error('Error fetching prescription:', error);
      throw error;
    }
  }

  // Mock API call function
  private async mockApiCall(endpoint: string): Promise<any> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Mock data based on endpoint
    if (endpoint.includes('/calendar/')) {
      return this.getMockCalendarData();
    } else if (endpoint.includes('/visits/') && endpoint.includes('/files')) {
      return this.getMockMedicalFiles();
    } else if (endpoint.includes('/visits/') && endpoint.includes('/prescription')) {
      return this.getMockPrescription();
    } else if (endpoint.includes('/visits/')) {
      return this.getMockVisitDetails();
    }

    throw new Error('Endpoint not found');
  }

  private getMockCalendarData(): CalendarData {
    return {
      visits: [
        {
          id: '1',
          date: '2024-01-05',
          doctor: 'Dr. Robert Wilson',
          specialty: 'Neurology',
          hospitalName: 'University Hospital',
          prescription: 'Anticonvulsant medication - 500mg twice daily',
          suggestions: 'Regular follow-up, avoid triggers, maintain sleep schedule',
          reAppointment: '2024-02-05',
          files: [
            { id: '1', name: 'Brain MRI', type: 'mri', url: '/files/brain-mri-2024-01-05.pdf', uploadedAt: '2024-01-05' },
            { id: '2', name: 'EEG Report', type: 'report', url: '/files/eeg-report-2024-01-05.pdf', uploadedAt: '2024-01-05' }
          ],
          status: 'completed'
        },
        {
          id: '2',
          date: '2024-01-08',
          doctor: 'Dr. Michael Chen',
          specialty: 'Orthopedics',
          hospitalName: 'City General Hospital',
          prescription: 'Ibuprofen 400mg three times daily for pain relief',
          suggestions: 'Physical therapy recommended, avoid heavy lifting',
          reAppointment: '2024-01-22',
          files: [
            { id: '3', name: 'CT Scan', type: 'xray', url: '/files/ct-scan-2024-01-08.pdf', uploadedAt: '2024-01-08' },
            { id: '4', name: 'MRI Report', type: 'mri', url: '/files/mri-report-2024-01-08.pdf', uploadedAt: '2024-01-08' }
          ],
          status: 'completed'
        },
        {
          id: '3',
          date: '2024-01-10',
          doctor: 'Dr. Emily Davis',
          specialty: 'Dermatology',
          hospitalName: 'Metro Medical Center',
          prescription: 'Topical steroid cream - apply twice daily',
          suggestions: 'Avoid sun exposure, use sunscreen SPF 50+',
          reAppointment: '2024-01-25',
          files: [
            { id: '5', name: 'Skin Biopsy', type: 'report', url: '/files/skin-biopsy-2024-01-10.pdf', uploadedAt: '2024-01-10' },
            { id: '6', name: 'Blood Test', type: 'blood-test', url: '/files/blood-test-2024-01-10.pdf', uploadedAt: '2024-01-10' }
          ],
          status: 'completed'
        },
        {
          id: '4',
          date: '2024-01-15',
          doctor: 'Dr. Sarah Johnson',
          specialty: 'Cardiology',
          hospitalName: 'City General Hospital',
          prescription: 'Aspirin 100mg daily, Beta-blocker 25mg twice daily',
          suggestions: 'Regular exercise, low-sodium diet, monitor blood pressure',
          reAppointment: '2024-02-15',
          files: [
            { id: '7', name: 'X-Ray', type: 'xray', url: '/files/xray-2024-01-15.pdf', uploadedAt: '2024-01-15' },
            { id: '8', name: 'Blood Test', type: 'blood-test', url: '/files/blood-test-2024-01-15.pdf', uploadedAt: '2024-01-15' },
            { id: '9', name: 'ECG', type: 'ecg', url: '/files/ecg-2024-01-15.pdf', uploadedAt: '2024-01-15' }
          ],
          status: 'completed'
        },
        {
          id: '5',
          date: '2024-02-15',
          doctor: 'Dr. Sarah Johnson',
          specialty: 'Cardiology',
          hospitalName: 'City General Hospital',
          prescription: 'Continue current medication, add Vitamin D supplement',
          suggestions: 'Continue exercise routine, schedule stress test',
          reAppointment: '2024-03-15',
          files: [],
          status: 'upcoming'
        }
      ],
      totalVisits: 5,
      upcomingVisits: 1,
      completedVisits: 4
    };
  }

  private getMockMedicalFiles(): MedicalFile[] {
    return [
      { id: '1', name: 'Brain MRI', type: 'mri', url: '/files/brain-mri-2024-01-05.pdf', uploadedAt: '2024-01-05' },
      { id: '2', name: 'EEG Report', type: 'report', url: '/files/eeg-report-2024-01-05.pdf', uploadedAt: '2024-01-05' },
      { id: '3', name: 'CT Scan', type: 'xray', url: '/files/ct-scan-2024-01-08.pdf', uploadedAt: '2024-01-08' },
      { id: '4', name: 'MRI Report', type: 'mri', url: '/files/mri-report-2024-01-08.pdf', uploadedAt: '2024-01-08' }
    ];
  }

  private getMockPrescription(): any {
    return {
      medications: [
        { name: 'Aspirin', dosage: '100mg', frequency: 'daily', duration: 'ongoing' },
        { name: 'Beta-blocker', dosage: '25mg', frequency: 'twice daily', duration: 'ongoing' }
      ],
      instructions: 'Take with food, avoid alcohol',
      refillDate: '2024-02-15'
    };
  }

  private getMockVisitDetails(): Visit {
    return {
      id: '1',
      date: '2024-01-05',
      doctor: 'Dr. Robert Wilson',
      specialty: 'Neurology',
      hospitalName: 'University Hospital',
      prescription: 'Anticonvulsant medication - 500mg twice daily',
      suggestions: 'Regular follow-up, avoid triggers, maintain sleep schedule',
      reAppointment: '2024-02-05',
      files: [
        { id: '1', name: 'Brain MRI', type: 'mri', url: '/files/brain-mri-2024-01-05.pdf', uploadedAt: '2024-01-05' },
        { id: '2', name: 'EEG Report', type: 'report', url: '/files/eeg-report-2024-01-05.pdf', uploadedAt: '2024-01-05' }
      ],
      status: 'completed'
    };
  }
}

export const calendarApi = new CalendarApiService(); 