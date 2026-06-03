// Mock database service to simulate patient data storage and retrieval
export interface Patient {
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
  createdAt: string;
  updatedAt: string;
}

// Mock patient data
const mockPatients: Patient[] = [
  {
    id: "P001",
    name: "John Smith",
    age: 35,
    gender: "male",
    phone: "+1-555-0123",
    email: "john.smith@email.com",
    address: "123 Main St, New York, NY 10001",
    bloodGroup: "A+",
    emergencyContact: {
      name: "Jane Smith",
      phone: "+1-555-0124",
      relation: "Spouse"
    },
    medicalHistory: [
      "Hypertension (2020)",
      "Diabetes Type 2 (2019)",
      "Appendectomy (2015)"
    ],
    appointments: [
      {
        id: "A001",
        date: "2024-01-15",
        time: "10:00",
        doctor: "Dr. Sarah Johnson",
        department: "Cardiology",
        status: "completed",
        purpose: "Regular check-up for hypertension"
      },
      {
        id: "A002",
        date: "2024-01-22",
        time: "14:30",
        doctor: "Dr. Michael Chen",
        department: "Endocrinology",
        status: "scheduled",
        purpose: "Diabetes management consultation"
      }
    ],
    createdAt: "2023-06-15T08:30:00Z",
    updatedAt: "2024-01-10T15:45:00Z"
  },
  {
    id: "P002",
    name: "Emily Davis",
    age: 28,
    gender: "female",
    phone: "+1-555-0125",
    email: "emily.davis@email.com",
    address: "456 Oak Ave, Los Angeles, CA 90210",
    bloodGroup: "O-",
    emergencyContact: {
      name: "Robert Davis",
      phone: "+1-555-0126",
      relation: "Father"
    },
    medicalHistory: [
      "Asthma (childhood)",
      "Allergies - Peanuts, Shellfish"
    ],
    appointments: [
      {
        id: "A003",
        date: "2024-01-18",
        time: "11:15",
        doctor: "Dr. Lisa Wilson",
        department: "Dermatology",
        status: "completed",
        purpose: "Skin allergy consultation"
      },
      {
        id: "A004",
        date: "2024-01-25",
        time: "09:00",
        doctor: "Dr. James Brown",
        department: "Pulmonology",
        status: "scheduled",
        purpose: "Asthma follow-up"
      }
    ],
    createdAt: "2023-08-20T12:00:00Z",
    updatedAt: "2024-01-15T09:30:00Z"
  },
  {
    id: "P003",
    name: "Robert Wilson",
    age: 42,
    gender: "male",
    phone: "+1-555-0127",
    email: "robert.wilson@email.com",
    address: "789 Pine St, Chicago, IL 60601",
    bloodGroup: "B+",
    emergencyContact: {
      name: "Mary Wilson",
      phone: "+1-555-0128",
      relation: "Wife"
    },
    medicalHistory: [
      "Back injury (2021)",
      "High cholesterol (2020)"
    ],
    appointments: [
      {
        id: "A005",
        date: "2024-01-20",
        time: "16:00",
        doctor: "Dr. Michael Chen",
        department: "Orthopedics",
        status: "completed",
        purpose: "Back pain evaluation"
      },
      {
        id: "A006",
        date: "2024-01-28",
        time: "10:30",
        doctor: "Dr. Sarah Johnson",
        department: "Cardiology",
        status: "scheduled",
        purpose: "Cholesterol management"
      }
    ],
    createdAt: "2023-09-10T14:20:00Z",
    updatedAt: "2024-01-18T11:00:00Z"
  },
  {
    id: "P004",
    name: "Maria Garcia",
    age: 31,
    gender: "female",
    phone: "+1-555-0129",
    email: "maria.garcia@email.com",
    address: "321 Elm St, Miami, FL 33101",
    bloodGroup: "AB+",
    emergencyContact: {
      name: "Carlos Garcia",
      phone: "+1-555-0130",
      relation: "Husband"
    },
    medicalHistory: [
      "Pregnancy (2022)",
      "Iron deficiency anemia (2021)"
    ],
    appointments: [
      {
        id: "A007",
        date: "2024-01-16",
        time: "13:00",
        doctor: "Dr. Anna Martinez",
        department: "Obstetrics & Gynecology",
        status: "completed",
        purpose: "Postpartum check-up"
      },
      {
        id: "A008",
        date: "2024-01-30",
        time: "15:15",
        doctor: "Dr. David Lee",
        department: "Hematology",
        status: "scheduled",
        purpose: "Anemia follow-up"
      }
    ],
    createdAt: "2023-07-05T10:15:00Z",
    updatedAt: "2024-01-14T16:20:00Z"
  },
  {
    id: "P005",
    name: "David Thompson",
    age: 55,
    gender: "male",
    phone: "+1-555-0131",
    email: "david.thompson@email.com",
    address: "654 Maple Dr, Seattle, WA 98101",
    bloodGroup: "O+",
    emergencyContact: {
      name: "Susan Thompson",
      phone: "+1-555-0132",
      relation: "Wife"
    },
    medicalHistory: [
      "Heart attack (2019)",
      "High blood pressure (2018)",
      "Smoking cessation (2020)"
    ],
    appointments: [
      {
        id: "A009",
        date: "2024-01-12",
        time: "08:45",
        doctor: "Dr. Sarah Johnson",
        department: "Cardiology",
        status: "completed",
        purpose: "Cardiac rehabilitation follow-up"
      },
      {
        id: "A010",
        date: "2024-01-26",
        time: "12:00",
        doctor: "Dr. Patricia White",
        department: "Cardiology",
        status: "scheduled",
        purpose: "Stress test and evaluation"
      }
    ],
    createdAt: "2023-05-12T09:45:00Z",
    updatedAt: "2024-01-10T14:30:00Z"
  }
];

// Mock API functions
export class MockPatientDatabase {
  private static patients: Patient[] = [...mockPatients];

  // Get all patients
  static async getAllPatients(): Promise<Patient[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...this.patients]);
      }, 500); // Simulate API delay
    });
  }

  // Get patient by ID
  static async getPatientById(id: string): Promise<Patient | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const patient = this.patients.find(p => p.id === id);
        resolve(patient || null);
      }, 300);
    });
  }

  // Search patients by name
  static async searchPatientsByName(name: string): Promise<Patient[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filtered = this.patients.filter(p => 
          p.name.toLowerCase().includes(name.toLowerCase())
        );
        resolve(filtered);
      }, 400);
    });
  }

  // Add new patient
  static async addPatient(patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newPatient: Patient = {
          ...patientData,
          id: `P${String(this.patients.length + 1).padStart(3, '0')}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        this.patients.push(newPatient);
        resolve(newPatient);
      }, 600);
    });
  }

  // Update patient
  static async updatePatient(id: string, updates: Partial<Patient>): Promise<Patient | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = this.patients.findIndex(p => p.id === id);
        if (index !== -1) {
          this.patients[index] = {
            ...this.patients[index],
            ...updates,
            updatedAt: new Date().toISOString()
          };
          resolve(this.patients[index]);
        } else {
          resolve(null);
        }
      }, 500);
    });
  }

  // Delete patient
  static async deletePatient(id: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = this.patients.findIndex(p => p.id === id);
        if (index !== -1) {
          this.patients.splice(index, 1);
          resolve(true);
        } else {
          resolve(false);
        }
      }, 400);
    });
  }

  // Get patients with upcoming appointments
  static async getPatientsWithUpcomingAppointments(): Promise<Patient[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const today = new Date().toISOString().split('T')[0];
        const patientsWithUpcoming = this.patients.filter(patient =>
          patient.appointments.some(apt => 
            apt.date >= today && apt.status === 'scheduled'
          )
        );
        resolve(patientsWithUpcoming);
      }, 350);
    });
  }
}
