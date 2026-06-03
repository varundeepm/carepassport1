# Patient Login System

## Overview
The patient login system has been updated to allow patients to log in using their **Patient ID** and **Patient Name** instead of a generic password. This ensures that each patient can only access their own medical records, appointments, and files.

## How It Works

### Patient Authentication
- Patients log in using their assigned **Patient ID** and **Patient Name**
- The system validates these credentials against a patient database
- Upon successful authentication, patients are redirected to their personalized dashboard

### Patient-Specific Data
- Each patient sees only their own medical records
- Medical files are filtered by patient ID
- Appointments are specific to the logged-in patient
- Hospital visits are personalized per patient

## Demo Patient Credentials

For testing purposes, the following patient credentials are available:

| Patient ID | Patient Name | Email |
|------------|--------------|-------|
| P001 | John Doe | john.doe@email.com |
| P002 | Jane Smith | jane.smith@email.com |
| P003 | Mike Johnson | mike.johnson@email.com |
| P004 | Sarah Wilson | sarah.wilson@email.com |
| P005 | David Brown | david.brown@email.com |
| P006 | Emily Davis | emily.davis@email.com |
| P007 | Robert Wilson | robert.wilson@email.com |
| P008 | Lisa Anderson | lisa.anderson@email.com |

## Patient Dashboard Features

### Medical Records
- View all medical records created by doctors
- See prescriptions and medical suggestions
- Track visit dates and hospital information

### Medical Files
- Access X-rays, MRIs, blood tests, and other medical files
- View file upload dates and types
- Download or view medical documents

### Appointments
- View scheduled appointments
- See doctor and hospital information
- Track appointment status

### Hospital Visits
- View detailed visit history
- See prescriptions and recommendations from each visit
- Access medical files from specific visits

## Technical Implementation

### Patient Data Service
- Located in `src/services/patientDataService.ts`
- Provides patient-specific data filtering
- Includes sample patient records, appointments, and medical files
- Ready for backend API integration

### Authentication Flow
1. Patient enters ID and Name on login form
2. System validates against patient database
3. If valid, patient is logged in and redirected to dashboard
4. Dashboard loads patient-specific data using patient ID

### Data Security
- Each patient can only access their own records
- Data is filtered by patient ID at the service level
- No cross-patient data access is possible

## Future Enhancements

### Backend Integration
- Replace sample data with real database queries
- Implement secure patient authentication
- Add patient registration functionality

### Additional Features
- Patient profile management
- Appointment booking system
- Direct messaging with doctors
- Medical history export

## File Structure

```
frontend/src/
├── pages/
│   ├── Login.tsx (Updated with patient ID/name login)
│   └── Dashboard.tsx (Updated with patient-specific data)
├── services/
│   └── patientDataService.ts (New patient data service)
└── contexts/
    └── AuthContext.tsx (Supports patient authentication)
```

## Usage Instructions

1. Navigate to the login page
2. Select the "Patient" tab
3. Enter your Patient ID (e.g., "P001")
4. Enter your Patient Name (e.g., "John Doe")
5. Click "Login"
6. View your personalized medical dashboard

The system will automatically load and display only your medical records, appointments, and files. 