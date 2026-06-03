import axios from 'axios';

const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Add auth token to all requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// ========================================
// AUTHENTICATION
// ========================================

export const auth = {
    register: (data: {
        email: string;
        password: string;
        role: 'doctor' | 'patient';
        profile: {
            name: string;
            phone: string;
            specialty?: string;
            organization?: string;
            diseaseCategory?: number;
            diseaseCategoryName?: string;
        };
    }) => api.post('/auth/register', data),

    login: (email: string, password: string) =>
        api.post('/auth/login', { email, password }),

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
    verifyOTP: (email: string, otp: string) => api.post('/auth/verify-otp', { email, otp }),
    resetPassword: (email: string, otp: string, newPassword: string) => api.post('/auth/reset-password', { email, otp, newPassword }),
};

// ========================================
// PATIENTS (Doctor only)
// ========================================

export const patients = {
    create: (data: {
        email: string;
        name: string;
        phone: string;
        diseaseCategory: number;
        diseaseCategoryName: string;
    }) => api.post('/patients', data),

    getAll: () => api.get('/patients/all'),

    getByCategory: (category: number) =>
        api.get(`/patients/category/${category}`),

    getMyDoctors: () => api.get('/patients/my-doctors'),
};

// ========================================
// REPORTS (File Transfer)
// ========================================

export const reports = {
    upload: (formData: FormData) =>
        api.post('/reports/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),

    getPatientReports: (patientId: string) =>
        api.get(`/reports/patient/${patientId}`),

    download: (fileHash: string) =>
        api.get(`/reports/download/${fileHash}`, {
            responseType: 'blob',
        }),
};

// ========================================
// TYPES
// ========================================

export interface User {
    id: string;
    email: string;
    role: 'doctor' | 'patient';
    walletAddress: string;
    profile: {
        name: string;
        phone?: string;
        specialty?: string;
        organization?: string;
        diseaseCategory?: number;
        diseaseCategoryName?: string;
    };
}

export interface Patient {
    _id: string;
    userId: {
        email: string;
        profile: { name: string };
        wallet: { address: string };
    };
    doctorId: string;
    diseaseCategory: number;
    diseaseCategoryName: string;
}

export interface Report {
    _id: string;
    title: string;
    reportType: string;
    fileHash: string;
    blockchainTxHash: string;
    doctorId: {
        profile: { name: string };
        wallet: { address: string };
    };
    createdAt: string;
    fileMetadata: {
        fileName: string;
        fileSize: number;
    };
    extractedData?: {
        alt: number;
        ast: number;
        alp: number;
        bilirubin: number;
        albumin: number;
        inr: number;
    };
}

// ========================================
// APPOINTMENTS
// ========================================

export const appointments = {
    create: (data: {
        doctorId: string;
        appointmentDate: string;
        timeSlot: string;
        consultationType: string;
        reason: string;
        patientPhone?: string;
    }) => api.post('/appointments', data),

    getPatient: () => api.get('/appointments/patient'),

    getDoctor: (status?: string) =>
        api.get('/appointments/doctor', { params: { status } }),

    updateStatus: (appointmentId: string, data: {
        status: string;
        doctorNotes?: string;
        rejectionReason?: string;
    }) => api.patch(`/appointments/${appointmentId}/status`, data),

    cancel: (appointmentId: string) =>
        api.patch(`/appointments/${appointmentId}/cancel`),

    getAvailableSlots: (doctorId: string, date: string) =>
        api.get('/appointments/available-slots', { params: { doctorId, date } }),
};

export const chat = {
    getMessages: () => api.get('/chat'),
    sendMessage: (message: string) => api.post('/chat', { message }),
};

// ========================================
// TASKS & REWARDS
// ========================================

export const tasks = {
    create: (data: {
        patientId: string;
        title: string;
        description: string;
        taskType: string;
        priority: string;
        rewardPoints: number;
        patientPhone?: string;
    }) => api.post('/tasks', data),

    getPatientTasks: (patientId: string) =>
        api.get(`/tasks/patient/${patientId}`),

    completeTask: (taskId: string) =>
        api.put(`/tasks/${taskId}/complete`),

    getDoctorRewards: () =>
        api.get('/tasks/doctor/rewards'),
};

export interface ChatMessage {
    _id: string;
    sender: string;
    message: string;
    displayName: string;
    userRole: 'patient' | 'doctor';
    createdAt: string;
}

export interface Appointment {
    _id: string;
    patientId: {
        _id: string;
        email: string;
        profile: { name: string };
        wallet?: { address: string };
    };
    doctorId: {
        _id: string;
        email: string;
        profile: { name: string };
    };
    appointmentDate: string;
    timeSlot: string;
    duration: number;
    consultationType: string;
    status: 'requested' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
    reason: string;
    notes?: string;
    doctorNotes?: string;
    rejectionReason?: string;
    createdAt: string;
    updatedAt: string;
}

export default api;
