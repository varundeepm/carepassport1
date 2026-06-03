// API service for patient record management
const API_BASE_URL = 'http://localhost:5001/api';

export interface PatientRecordData {
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  hospital: string;
  visitDate: string;
  prescription: string;
  suggestions: string;
  patientDetails: string;
  files: MedicalFileData[];
  status: 'active' | 'completed' | 'cancelled';
}

export interface MedicalFileData {
  id: string;
  name: string;
  type: 'xray' | 'mri' | 'blood-test' | 'ecg' | 'prescription' | 'report';
  url: string;
  uploadedAt: string;
}

export interface CreatePatientRecordRequest {
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  hospital: string;
  visitDate: string;
  prescription: string;
  suggestions: string;
  patientDetails: string;
  files: MedicalFileData[];
  status: 'active' | 'completed' | 'cancelled';
}

// Create a new patient record
export const createPatientRecord = async (recordData: CreatePatientRecordRequest): Promise<PatientRecordData> => {
  try {
    const response = await fetch(`${API_BASE_URL}/patient-records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(recordData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.record;
  } catch (error) {
    console.error('Error creating patient record:', error);
    throw error;
  }
};

// Get all patient records for a doctor
export const getPatientRecordsForDoctor = async (doctorId: string): Promise<PatientRecordData[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/doctors/${doctorId}/patient-records`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.records || [];
  } catch (error) {
    console.error('Error fetching patient records for doctor:', error);
    throw error;
  }
};

// Get patient record by ID
export const getPatientRecordById = async (recordId: string): Promise<PatientRecordData> => {
  try {
    const response = await fetch(`${API_BASE_URL}/patient-records/${recordId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.record;
  } catch (error) {
    console.error('Error fetching patient record:', error);
    throw error;
  }
};

// Update patient record
export const updatePatientRecord = async (recordId: string, recordData: Partial<PatientRecordData>): Promise<PatientRecordData> => {
  try {
    const response = await fetch(`${API_BASE_URL}/patient-records/${recordId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(recordData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.record;
  } catch (error) {
    console.error('Error updating patient record:', error);
    throw error;
  }
};

// Delete patient record
export const deletePatientRecord = async (recordId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/patient-records/${recordId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error deleting patient record:', error);
    throw error;
  }
};
