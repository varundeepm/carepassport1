// Real Patient Service that connects to MongoDB backend
const API_BASE_URL = 'http://localhost:5001/api';

export interface Patient {
  _id?: string;
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  phone: string;
  email: string;
  address: string;
  bloodGroup: string;
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  medicalHistory: string[];
  appointments: {
    id: string;
    date: string;
    time: string;
    doctor: string;
    department: string;
    status: 'scheduled' | 'completed' | 'cancelled';
    purpose: string;
  }[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PatientOption {
  id: string;
  name: string;
  phone: string;
  email: string;
}

export interface PatientCreateData {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  phone: string;
  email: string;
  address: string;
  bloodGroup: string;
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  medicalHistory?: string[];
  purpose?: string;
}

class RealPatientService {
  // Get all patients for dropdown/selection
  static async getPatientOptions(): Promise<PatientOption[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/patients`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch patients');
      }
      
      return result.data;
    } catch (error) {
      console.error('Error fetching patient options:', error);
      throw new Error('Failed to fetch patient list. Make sure the backend server is running.');
    }
  }

  // Search patients by name
  static async searchPatients(name?: string, limit?: number): Promise<Patient[]> {
    try {
      const params = new URLSearchParams();
      if (name) params.append('name', name);
      if (limit) params.append('limit', limit.toString());
      
      const response = await fetch(`${API_BASE_URL}/patients/search?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to search patients');
      }
      
      return result.data;
    } catch (error) {
      console.error('Error searching patients:', error);
      throw new Error('Failed to search patients. Make sure the backend server is running.');
    }
  }

  // Get patient details by ID
  static async getPatientDetails(id: string): Promise<Patient | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/patients/${id}`);
      
      if (response.status === 404) {
        return null;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch patient');
      }
      
      return result.data;
    } catch (error) {
      console.error('Error fetching patient details:', error);
      throw new Error('Failed to fetch patient details. Make sure the backend server is running.');
    }
  }

  // Create new patient
  static async createPatient(patientData: PatientCreateData): Promise<Patient> {
    try {
      const response = await fetch(`${API_BASE_URL}/patients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patientData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to create patient');
      }
      
      return result.data;
    } catch (error) {
      console.error('Error creating patient:', error);
      throw new Error('Failed to create patient. Make sure the backend server is running.');
    }
  }

  // Update patient
  static async updatePatient(id: string, updates: Partial<Patient>): Promise<Patient | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/patients/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (response.status === 404) {
        return null;
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to update patient');
      }
      
      return result.data;
    } catch (error) {
      console.error('Error updating patient:', error);
      throw new Error('Failed to update patient. Make sure the backend server is running.');
    }
  }

  // Delete patient
  static async deletePatient(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/patients/${id}`, {
        method: 'DELETE',
      });
      
      if (response.status === 404) {
        return false;
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Error deleting patient:', error);
      throw new Error('Failed to delete patient. Make sure the backend server is running.');
    }
  }

  // Get patients with upcoming appointments
  static async getUpcomingAppointments(): Promise<Patient[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/patients/appointments/upcoming`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch upcoming appointments');
      }
      
      return result.data;
    } catch (error) {
      console.error('Error fetching upcoming appointments:', error);
      throw new Error('Failed to fetch upcoming appointments. Make sure the backend server is running.');
    }
  }

  // Quick patient lookup for autocomplete
  static async quickSearch(query: string): Promise<PatientOption[]> {
    try {
      if (!query || query.length < 2) return [];
      
      const patients = await this.searchPatients(query, 10);
      return patients.map(patient => ({
        id: patient.id,
        name: patient.name,
        phone: patient.phone,
        email: patient.email
      }));
    } catch (error) {
      console.error('Error in quick search:', error);
      return [];
    }
  }

  // Test backend connection
  static async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.ok;
    } catch (error) {
      console.error('Backend connection test failed:', error);
      return false;
    }
  }
}

export default RealPatientService;
