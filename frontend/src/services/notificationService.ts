import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

const notificationService = {
    // Currently backend doesn't have a direct notification route yet, 
    // but we can trigger reminders through specific actions or a dedicated endpoint.

    triggerSmsReminder: async (to: string, body: string) => {
        // This is a placeholder for a future dedicated notification endpoint
        // console.log(`Triggering SMS to ${to}: ${body}`);
        return { success: true, message: 'SMS trigger sent to backend' };
    },

    // In a real app, you might have a route for this
    sendMedicationAlert: async (patientId: string, medicationName: string) => {
        // return axios.post(`${API_URL}/notifications/medication`, { patientId, medicationName });
        return { success: true };
    }
};

export default notificationService;
