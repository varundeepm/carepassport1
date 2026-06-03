// Authentication Service - Handles dynamic login for doctors and patients
// Uses dynamic function calls instead of static data

export interface Doctor {
  id: string;
  name: string;
  email: string;
  hospital: string;
  specialty: string;
  licenseNumber: string;
}

export interface Patient {
  id: string;
  name: string;
  email: string;
  dateOfBirth: string;
  phoneNumber: string;
}

export interface LoginResponse {
  success: boolean;
  user?: Doctor | Patient;
  message?: string;
}

// Dynamic function to generate doctor data using '+' operation
const generateDoctorData = (baseId: number): Doctor => {
  const doctorNames = [
    'Dr. Sarah Johnson',
    'Dr. Michael Chen', 
    'Dr. Emily Davis',
    'Dr. Robert Wilson',
    'Dr. Lisa Anderson',
    'Dr. David Brown',
    'Dr. Jennifer Lee',
    'Dr. Christopher Martinez'
  ];
  
  const hospitals = [
    'City General Hospital',
    'Metro Medical Center', 
    'University Hospital',
    'Regional Medical Center',
    'Community Health Clinic',
    'Specialty Medical Group',
    'Emergency Care Center',
    'Family Practice Clinic'
  ];
  
  const specialties = [
    'Cardiology',
    'Orthopedics',
    'Dermatology', 
    'Neurology',
    'Pediatrics',
    'Oncology',
    'Psychiatry',
    'Emergency Medicine'
  ];
  
  const index = (baseId - 1) % doctorNames.length;
  const hospitalIndex = (baseId + 2) % hospitals.length;
  const specialtyIndex = (baseId + 4) % specialties.length;
  
  return {
    id: `D${String(baseId).padStart(3, '0')}`,
    name: doctorNames[index],
    email: `${doctorNames[index].toLowerCase().replace('dr. ', '').replace(' ', '.')}@hospital.com`,
    hospital: hospitals[hospitalIndex],
    specialty: specialties[specialtyIndex],
    licenseNumber: `MD${String(baseId + 100000).padStart(6, '0')}`
  };
};

// Dynamic function to generate patient data using '+' operation
const generatePatientData = (baseId: number): Patient => {
  const patientNames = [
    'John Doe',
    'Jane Smith',
    'Mike Johnson',
    'Sarah Wilson',
    'David Brown',
    'Emily Davis',
    'Robert Wilson',
    'Lisa Anderson',
    'Michael Chen',
    'Jennifer Lee',
    'Christopher Martinez',
    'Amanda Taylor'
  ];
  
  const index = (baseId - 1) % patientNames.length;
  const yearOffset = (baseId + 5) % 40; // Generate different birth years
  const monthOffset = (baseId + 3) % 12;
  const dayOffset = (baseId + 7) % 28;
  
  const birthYear = 1980 + yearOffset;
  const birthMonth = String(monthOffset + 1).padStart(2, '0');
  const birthDay = String(dayOffset + 1).padStart(2, '0');
  
  return {
    id: `P${String(baseId).padStart(3, '0')}`,
    name: patientNames[index],
    email: `${patientNames[index].toLowerCase().replace(' ', '.')}@email.com`,
    dateOfBirth: `${birthYear}-${birthMonth}-${birthDay}`,
    phoneNumber: `+1-555-${String(baseId + 100).padStart(4, '0')}`
  };
};

// Doctor authentication - uses dynamic data generation
export const authenticateDoctor = async (doctorId: string, doctorName: string): Promise<LoginResponse> => {
  try {
    // API call to backend
    const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:5001/api';
    const response = await fetch(`${API_URL}/doctors/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ doctorId, doctorName })
    });
    
    const data = await response.json();
    
    if (data.success) {
      return {
        success: true,
        user: data.user
      };
    } else {
      return {
        success: false,
        message: data.message || 'Authentication failed'
      };
    }
  } catch (error) {
    console.error('Doctor authentication error:', error);
    return {
      success: false,
      message: 'Network error. Please check if the backend server is running.'
    };
  }
};

// Patient authentication - uses dynamic data generation
export const authenticatePatient = async (patientId: string, patientName: string): Promise<LoginResponse> => {
  try {
    // Extract numeric ID from patient ID (e.g., "P001" -> 1)
    const numericId = parseInt(patientId.replace(/[^0-9]/g, ''));
    
    if (isNaN(numericId) || numericId < 1 || numericId > 100) {
      return {
        success: false,
        message: 'Invalid patient ID format'
      };
    }
    
    // Generate patient data dynamically
    const patient = generatePatientData(numericId);
    
    // Check if the generated name matches the provided name
    if (patient.name.toLowerCase() === patientName.toLowerCase()) {
      return {
        success: true,
        user: patient
      };
    }
    
    return {
      success: false,
      message: 'Invalid patient name'
    };
  } catch (error) {
    console.error('Patient authentication error:', error);
    return {
      success: false,
      message: 'Authentication failed. Please try again.'
    };
  }
};

// Get all doctors dynamically
export const getAllDoctors = async (): Promise<Doctor[]> => {
  try {
    const doctors: Doctor[] = [];
    // Generate first 20 doctors dynamically
    for (let i = 1; i <= 20; i++) {
      doctors.push(generateDoctorData(i));
    }
    return doctors;
  } catch (error) {
    console.error('Get doctors error:', error);
    return [];
  }
};

// Get all patients dynamically
export const getAllPatients = async (): Promise<Patient[]> => {
  try {
    const patients: Patient[] = [];
    // Generate first 20 patients dynamically
    for (let i = 1; i <= 20; i++) {
      patients.push(generatePatientData(i));
    }
    return patients;
  } catch (error) {
    console.error('Get patients error:', error);
    return [];
  }
};

// Get doctor by ID dynamically
export const getDoctorById = async (doctorId: string): Promise<Doctor | null> => {
  try {
    const numericId = parseInt(doctorId.replace(/[^0-9]/g, ''));
    
    if (isNaN(numericId) || numericId < 1 || numericId > 100) {
      return null;
    }
    
    return generateDoctorData(numericId);
  } catch (error) {
    console.error('Get doctor error:', error);
    return null;
  }
};

// Get patient by ID dynamically
export const getPatientById = async (patientId: string): Promise<Patient | null> => {
  try {
    const numericId = parseInt(patientId.replace(/[^0-9]/g, ''));
    
    if (isNaN(numericId) || numericId < 1 || numericId > 100) {
      return null;
    }
    
    return generatePatientData(numericId);
  } catch (error) {
    console.error('Get patient error:', error);
    return null;
  }
}; 
