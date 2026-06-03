// Patient Data Service - Provides patient-specific data based on patient ID
// In a real application, this would fetch data from a backend API

export interface PatientRecord {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  hospital: string;
  visitDate: string;
  prescription: string;
  suggestions: string;
  patientDetails: string;
  files: MedicalFile[];
  status: 'active' | 'completed' | 'cancelled';
}

export interface MedicalFile {
  id: string;
  name: string;
  type: 'xray' | 'mri' | 'blood-test' | 'ecg' | 'prescription' | 'report';
  url: string;
  uploadedAt: string;
}

export interface PatientAppointment {
  id: string;
  patientId: string;
  doctorName: string;
  hospital: string;
  specialty: string;
  appointmentDate: string;
  purpose: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface HospitalVisit {
  date: string;
  doctor: string;
  specialty: string;
  files: string[];
  prescription: string;
  suggestions: string;
  reAppointment: string;
  hospitalName: string;
}

// Sample patient records database
const PATIENT_RECORDS: PatientRecord[] = [
  {
    id: '1',
    patientId: 'P001',
    patientName: 'John Doe',
    doctorId: 'D001',
    doctorName: 'Dr. Sarah Johnson',
    hospital: 'City General Hospital',
    visitDate: '2024-01-15',
    prescription: 'Aspirin 100mg daily, Beta-blocker for heart condition management',
    suggestions: 'Regular exercise, low-sodium diet, stress management',
    patientDetails: 'Patient with history of hypertension and mild heart condition',
    files: [
      { id: '1', name: 'ECG Report - John Doe', type: 'ecg', url: '/files/ecg-report.pdf', uploadedAt: '2024-01-15' },
      { id: '2', name: 'Blood Test Results - John Doe', type: 'blood-test', url: '/files/blood-test.pdf', uploadedAt: '2024-01-14' }
    ],
    status: 'completed'
  },
  {
    id: '2',
    patientId: 'P001',
    patientName: 'John Doe',
    doctorId: 'D002',
    doctorName: 'Dr. Michael Chen',
    hospital: 'Metro Medical Center',
    visitDate: '2024-01-08',
    prescription: 'Ibuprofen for pain relief, Physical therapy recommended',
    suggestions: 'Rest, ice therapy, gradual return to activity',
    patientDetails: 'Follow-up for knee injury rehabilitation',
    files: [
      { id: '3', name: 'X-Ray - Knee Joint - John Doe', type: 'xray', url: '/files/knee-xray.pdf', uploadedAt: '2024-01-10' },
      { id: '4', name: 'MRI Scan Report - John Doe', type: 'mri', url: '/files/mri-report.pdf', uploadedAt: '2024-01-09' }
    ],
    status: 'completed'
  },
  {
    id: '3',
    patientId: 'P002',
    patientName: 'Jane Smith',
    doctorId: 'D003',
    doctorName: 'Dr. Emily Davis',
    hospital: 'University Hospital',
    visitDate: '2024-01-10',
    prescription: 'Topical steroid cream, Antihistamine for allergies',
    suggestions: 'Avoid sun exposure, use sunscreen, monitor skin changes',
    patientDetails: 'Patient with chronic skin condition and seasonal allergies',
    files: [
      { id: '5', name: 'Skin Biopsy Report - Jane Smith', type: 'report', url: '/files/skin-biopsy.pdf', uploadedAt: '2024-01-10' },
      { id: '6', name: 'Allergy Test Results - Jane Smith', type: 'blood-test', url: '/files/allergy-test.pdf', uploadedAt: '2024-01-09' }
    ],
    status: 'completed'
  },
  {
    id: '4',
    patientId: 'P003',
    patientName: 'Mike Johnson',
    doctorId: 'D004',
    doctorName: 'Dr. Robert Wilson',
    hospital: 'St. Mary\'s Hospital',
    visitDate: '2024-01-05',
    prescription: 'Anticonvulsant medication, Regular monitoring required',
    suggestions: 'Regular follow-up, avoid triggers, maintain seizure diary',
    patientDetails: 'Patient with epilepsy, requires ongoing neurological care',
    files: [
      { id: '7', name: 'Brain MRI - Mike Johnson', type: 'mri', url: '/files/brain-mri.pdf', uploadedAt: '2024-01-05' },
      { id: '8', name: 'EEG Report - Mike Johnson', type: 'ecg', url: '/files/eeg-report.pdf', uploadedAt: '2024-01-04' }
    ],
    status: 'active'
  },
  {
    id: '5',
    patientId: 'P004',
    patientName: 'Sarah Wilson',
    doctorId: 'D001',
    doctorName: 'Dr. Sarah Johnson',
    hospital: 'City General Hospital',
    visitDate: '2024-01-20',
    prescription: 'Blood pressure medication, Lifestyle modifications',
    suggestions: 'Reduce salt intake, regular exercise, stress management',
    patientDetails: 'New patient with elevated blood pressure',
    files: [
      { id: '9', name: 'Blood Pressure Monitoring - Sarah Wilson', type: 'report', url: '/files/bp-monitoring.pdf', uploadedAt: '2024-01-20' }
    ],
    status: 'active'
  }
];

// Sample appointments database
const PATIENT_APPOINTMENTS: PatientAppointment[] = [
  {
    id: '1',
    patientId: 'P001',
    doctorName: 'Dr. Sarah Johnson',
    hospital: 'City General Hospital',
    specialty: 'Cardiology',
    appointmentDate: '2024-02-15',
    purpose: 'Follow-up consultation for heart condition',
    status: 'scheduled'
  },
  {
    id: '2',
    patientId: 'P002',
    doctorName: 'Dr. Emily Davis',
    hospital: 'University Hospital',
    specialty: 'Dermatology',
    appointmentDate: '2024-01-25',
    purpose: 'Skin condition follow-up',
    status: 'scheduled'
  },
  {
    id: '3',
    patientId: 'P003',
    doctorName: 'Dr. Robert Wilson',
    hospital: 'St. Mary\'s Hospital',
    specialty: 'Neurology',
    appointmentDate: '2024-02-05',
    purpose: 'Epilepsy management consultation',
    status: 'scheduled'
  },
  {
    id: '4',
    patientId: 'P004',
    doctorName: 'Dr. Sarah Johnson',
    hospital: 'City General Hospital',
    specialty: 'Cardiology',
    appointmentDate: '2024-02-20',
    purpose: 'Blood pressure follow-up',
    status: 'scheduled'
  }
];

// Sample hospital visits database
const HOSPITAL_VISITS: HospitalVisit[] = [
  {
    date: '2024-01-15',
    doctor: 'Dr. Sarah Johnson',
    specialty: 'Cardiology',
    files: ['X-Ray', 'Blood Test', 'ECG'],
    prescription: 'Aspirin 100mg daily, Beta-blocker',
    suggestions: 'Regular exercise, low-sodium diet',
    reAppointment: '2024-02-15',
    hospitalName: 'City General Hospital'
  },
  {
    date: '2024-01-08',
    doctor: 'Dr. Michael Chen',
    specialty: 'Orthopedics',
    files: ['CT Scan', 'MRI'],
    prescription: 'Ibuprofen for pain relief',
    suggestions: 'Physical therapy recommended',
    reAppointment: '2024-01-22',
    hospitalName: 'Metro Medical Center'
  },
  {
    date: '2024-01-10',
    doctor: 'Dr. Emily Davis',
    specialty: 'Dermatology',
    files: ['Skin Biopsy', 'Blood Test'],
    prescription: 'Topical steroid cream',
    suggestions: 'Avoid sun exposure, use sunscreen',
    reAppointment: '2024-01-25',
    hospitalName: 'University Hospital'
  },
  {
    date: '2024-01-05',
    doctor: 'Dr. Robert Wilson',
    specialty: 'Neurology',
    files: ['Brain MRI', 'EEG'],
    prescription: 'Anticonvulsant medication',
    suggestions: 'Regular follow-up, avoid triggers',
    reAppointment: '2024-02-05',
    hospitalName: 'St. Mary\'s Hospital'
  }
];

// Service functions
export const getPatientRecords = (patientId: string): PatientRecord[] => {
  return PATIENT_RECORDS.filter(record => record.patientId === patientId);
};

export const getPatientAppointments = (patientId: string): PatientAppointment[] => {
  return PATIENT_APPOINTMENTS.filter(appointment => appointment.patientId === patientId);
};

export const getPatientHospitalVisits = (patientId: string): HospitalVisit[] => {
  // In a real app, this would filter based on patient ID
  // For demo purposes, we'll return visits based on patient name patterns
  const patient = PATIENT_RECORDS.find(record => record.patientId === patientId);
  if (!patient) return [];
  
  // Return visits that match the patient's hospital visits
  return HOSPITAL_VISITS.filter(visit => {
    const patientRecord = PATIENT_RECORDS.find(record => 
      record.patientId === patientId && 
      record.hospital === visit.hospitalName
    );
    return patientRecord !== undefined;
  });
};

export const getPatientMedicalFiles = (patientId: string): MedicalFile[] => {
  const records = getPatientRecords(patientId);
  return records.flatMap(record => record.files);
};

export const getPatientHospitals = (patientId: string) => {
  const records = getPatientRecords(patientId);
  const hospitals = new Map();
  
  records.forEach(record => {
    if (!hospitals.has(record.hospital)) {
      hospitals.set(record.hospital, {
        id: record.hospital.replace(/\s+/g, '-').toLowerCase(),
        name: record.hospital,
        visits: getPatientHospitalVisits(patientId).filter(visit => 
          visit.hospitalName === record.hospital
        )
      });
    }
  });
  
  return Array.from(hospitals.values());
};

// Mock API functions for future backend integration
export const fetchPatientData = async (patientId: string) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    records: getPatientRecords(patientId),
    appointments: getPatientAppointments(patientId),
    hospitalVisits: getPatientHospitalVisits(patientId),
    medicalFiles: getPatientMedicalFiles(patientId),
    hospitals: getPatientHospitals(patientId)
  };
}; 