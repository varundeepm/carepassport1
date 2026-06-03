const API_BASE_URL = 'http://localhost:5001/api';

export interface Report {
  _id: string;
  reportId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  title: string;
  content: string;
  reportType: 'diagnosis' | 'lab_results' | 'treatment_plan' | 'follow_up' | 'discharge' | 'consultation' | 'general';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'sent' | 'read' | 'acknowledged';
  attachments: {
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
  }[];
  readAt?: string;
  acknowledgedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReportRequest {
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  title: string;
  content: string;
  reportType?: string;
  priority?: string;
  attachments?: {
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
  }[];
}

// Create a new report (doctor sends report to patient)
export const createReport = async (reportData: CreateReportRequest): Promise<Report> => {
  try {
    const response = await fetch(`${API_BASE_URL}/reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reportData),
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to create report');
    }

    return data.report;
  } catch (error) {
    console.error('Error creating report:', error);
    throw error;
  }
};

// Get all reports for a patient
export const getPatientReports = async (patientId: string): Promise<Report[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}/reports`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch patient reports');
    }

    return data.reports;
  } catch (error) {
    console.error('Error fetching patient reports:', error);
    throw error;
  }
};

// Get all reports sent by a doctor
export const getDoctorReports = async (doctorId: string): Promise<Report[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/doctors/${doctorId}/reports`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch doctor reports');
    }

    return data.reports;
  } catch (error) {
    console.error('Error fetching doctor reports:', error);
    throw error;
  }
};

// Mark report as read
export const markReportAsRead = async (reportId: string): Promise<Report> => {
  try {
    const response = await fetch(`${API_BASE_URL}/reports/${reportId}/read`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to mark report as read');
    }

    return data.report;
  } catch (error) {
    console.error('Error marking report as read:', error);
    throw error;
  }
};

// Mark report as acknowledged
export const markReportAsAcknowledged = async (reportId: string): Promise<Report> => {
  try {
    const response = await fetch(`${API_BASE_URL}/reports/${reportId}/acknowledge`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to mark report as acknowledged');
    }

    return data.report;
  } catch (error) {
    console.error('Error marking report as acknowledged:', error);
    throw error;
  }
};

// Get report by ID
export const getReportById = async (reportId: string): Promise<Report> => {
  try {
    const response = await fetch(`${API_BASE_URL}/reports/${reportId}`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch report');
    }

    return data.report;
  } catch (error) {
    console.error('Error fetching report:', error);
    throw error;
  }
};
