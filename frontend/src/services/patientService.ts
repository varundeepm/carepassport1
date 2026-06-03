import { MockPatientDatabase, Patient } from './mockDatabase';

export interface PatientSearchOptions {
  name?: string;
  id?: string;
  limit?: number;
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
  purpose?: string; // For appointment purpose
}

export class PatientService {
  // Get all patients for dropdown/selection
  static async getPatientOptions(): Promise<{ id: string; name: string; phone: string }[]> {
    try {
      const patients = await MockPatientDatabase.getAllPatients();
      return patients.map(patient => ({
        id: patient.id,
        name: patient.name,
        phone: patient.phone
      }));
    } catch (error) {
      console.error('Error fetching patient options:', error);
      throw new Error('Failed to fetch patient list');
    }
  }

  // Search patients
  static async searchPatients(options: PatientSearchOptions): Promise<Patient[]> {
    try {
      if (options.id) {
        const patient = await MockPatientDatabase.getPatientById(options.id);
        return patient ? [patient] : [];
      }
      
      if (options.name) {
        return await MockPatientDatabase.searchPatientsByName(options.name);
      }
      
      const allPatients = await MockPatientDatabase.getAllPatients();
      return options.limit ? allPatients.slice(0, options.limit) : allPatients;
    } catch (error) {
      console.error('Error searching patients:', error);
      throw new Error('Failed to search patients');
    }
  }

  // Get patient details by ID
  static async getPatientDetails(id: string): Promise<Patient | null> {
    try {
      return await MockPatientDatabase.getPatientById(id);
    } catch (error) {
      console.error('Error fetching patient details:', error);
      throw new Error('Failed to fetch patient details');
    }
  }

  // Create new patient
  static async createPatient(patientData: PatientCreateData): Promise<Patient> {
    try {
      const newPatientData = {
        ...patientData,
        medicalHistory: patientData.medicalHistory || [],
        appointments: patientData.purpose ? [{
          id: `A${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          time: '10:00',
          doctor: 'Dr. TBD',
          department: 'General',
          status: 'scheduled' as const,
          purpose: patientData.purpose
        }] : []
      };

      return await MockPatientDatabase.addPatient(newPatientData);
    } catch (error) {
      console.error('Error creating patient:', error);
      throw new Error('Failed to create patient');
    }
  }

  // Update patient
  static async updatePatient(id: string, updates: Partial<Patient>): Promise<Patient | null> {
    try {
      return await MockPatientDatabase.updatePatient(id, updates);
    } catch (error) {
      console.error('Error updating patient:', error);
      throw new Error('Failed to update patient');
    }
  }

  // Delete patient
  static async deletePatient(id: string): Promise<boolean> {
    try {
      return await MockPatientDatabase.deletePatient(id);
    } catch (error) {
      console.error('Error deleting patient:', error);
      throw new Error('Failed to delete patient');
    }
  }

  // Get patients with upcoming appointments
  static async getUpcomingAppointments(): Promise<Patient[]> {
    try {
      return await MockPatientDatabase.getPatientsWithUpcomingAppointments();
    } catch (error) {
      console.error('Error fetching upcoming appointments:', error);
      throw new Error('Failed to fetch upcoming appointments');
    }
  }

  // Quick patient lookup for autocomplete
  static async quickSearch(query: string): Promise<{ id: string; name: string; phone: string }[]> {
    try {
      if (!query || query.length < 2) return [];
      
      const patients = await MockPatientDatabase.searchPatientsByName(query);
      return patients.map(patient => ({
        id: patient.id,
        name: patient.name,
        phone: patient.phone
      }));
    } catch (error) {
      console.error('Error in quick search:', error);
      return [];
    }
  }
}
