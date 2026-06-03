import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

export interface Disease {
    _id?: string;
    diseaseId: string;
    name: string;
    category: string;
    severity: string;
    description: string;
    symptoms: string[];
}

export interface PatientDisease {
    _id?: string;
    patientId: string;
    diseaseId: string | Disease;
    doctorId: string;
    diagnosisDate: string;
    currentStatus: string;
    severity: string;
}

const diseaseService = {
    getAllDiseases: async () => {
        const response = await axios.get(`${API_URL}/diseases`);
        return response.data;
    },

    getDiseaseById: async (id: string) => {
        const response = await axios.get(`${API_URL}/diseases/${id}`);
        return response.data;
    },

    assignToPatient: async (data: Partial<PatientDisease>) => {
        const response = await axios.post(`${API_URL}/patient-diseases`, data);
        return response.data;
    },

    getPatientDiseases: async (patientId: string) => {
        const response = await axios.get(`${API_URL}/patient-diseases/patient/${patientId}`);
        return response.data;
    },

    updatePatientDisease: async (id: string, data: Partial<PatientDisease>) => {
        const response = await axios.put(`${API_URL}/patient-diseases/${id}`, data);
        return response.data;
    },

    getAISimilarity: async (patientId: string) => {
        const response = await axios.get(`${API_URL}/ai/patient-similarity/${patientId}`);
        return response.data;
    }
};

export default diseaseService;
