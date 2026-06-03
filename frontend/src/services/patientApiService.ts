// API service for patient and task management
const API_BASE_URL = 'http://localhost:5001/api';

export interface PatientData {
  patientId: string;
  name: string;
  phoneNumber: string;
  description: string;
  files: string[];
  doctorId: string;
}

export interface TaskData {
  patientId: string;
  taskDescription: string;
  reminderTime?: string;
  completed?: boolean;
}

export interface SuggestionData {
  text: string;
  reminderTime?: string;
}

export interface CreatePatientRequest {
  patientId: string;
  name: string;
  phoneNumber: string;
  description: string;
  files: string[];
  doctorId: string;
  suggestions: SuggestionData[];
}

export interface PatientWithTasks {
  patient: PatientData;
  tasks: TaskData[];
}

// Create a new patient with tasks
export const createPatient = async (patientData: CreatePatientRequest): Promise<{ patient: PatientData; tasks: TaskData[] }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/patients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(patientData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating patient:', error);
    throw error;
  }
};

// Get all patients for a doctor
export const getPatientsForDoctor = async (doctorId: string): Promise<PatientData[]> => {
  try {
    console.log('Making API request to:', `${API_BASE_URL}/doctors/${doctorId}/patients`);
    const response = await fetch(`${API_BASE_URL}/doctors/${doctorId}/patients`);
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error text:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    console.log('Response data:', data);
    return data.patients || [];
  } catch (error) {
    console.error('Error fetching patients for doctor:', error);
    throw error;
  }
};

// Get patient details with tasks
export const getPatientDetails = async (patientId: string): Promise<PatientWithTasks> => {
  try {
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}/details`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching patient details:', error);
    throw error;
  }
};

// Update task completion status
export const updateTaskStatus = async (taskId: string, completed: boolean): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ completed }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error updating task status:', error);
    throw error;
  }
};
