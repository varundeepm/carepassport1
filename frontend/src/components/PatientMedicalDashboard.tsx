import React, { useState, useMemo } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Chip, 
  Button, 
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  LinearProgress
} from '@mui/material';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ScatterChart,
  Scatter,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';
import {
  Upload as UploadIcon,
  ExpandMore as ExpandMoreIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  LocalHospital as LocalHospitalIcon
} from '@mui/icons-material';

type Patient = {
  name: string;
  age: number;
  gender: 'M' | 'F';
  date: string; // ISO date
  alt: number | null;
  ast: number | null;
  bilirubin: number | null;
  albumin: number | null;
  inr: number | null;
  platelets: number | null;
  symptoms?: string[];
  diagnosis?: string;
  riskScore?: number;
  similarPatients?: string[];
};

type DiseasePattern = {
  name: string;
  symptoms: string[];
  testPatterns: {
    alt?: { min: number; max: number };
    ast?: { min: number; max: number };
    bilirubin?: { min: number; max: number };
    albumin?: { min: number; max: number };
    inr?: { min: number; max: number };
    platelets?: { min: number; max: number };
  };
  ageRange: { min: number; max: number };
  genderPreference?: 'M' | 'F';
  description: string;
  recommendations: string[];
};

type AnalysisResult = {
  diseasePatterns: DiseasePattern[];
  riskAssessment: {
    highRisk: Patient[];
    mediumRisk: Patient[];
    lowRisk: Patient[];
  };
  correlations: Array<{
    test1: string;
    test2: string;
    correlation: number;
  }>;
  recommendations: Array<{
    patientId: string;
    similarPatients: Patient[];
    suggestedActions: string[];
    confidence: number;
  }>;
};

const samplePatients: Patient[] = [
  { name: 'Patient 1', age: 65, gender: 'F', date: '2024-01-15', alt: 43, ast: 43, bilirubin: 0.7, albumin: 8.7, inr: null, platelets: null, symptoms: ['fatigue', 'jaundice'], diagnosis: 'Hepatitis' },
  { name: 'Patient 2', age: 54, gender: 'M', date: '2024-01-16', alt: 50, ast: 55, bilirubin: 1.2, albumin: 3.8, inr: null, platelets: null, symptoms: ['abdominal pain', 'nausea'], diagnosis: 'Liver Disease' },
  { name: 'Patient 3', age: 45, gender: 'M', date: '2024-01-17', alt: 35, ast: 40, bilirubin: 1, albumin: 4, inr: null, platelets: null, symptoms: ['fatigue'], diagnosis: 'Normal' },
  { name: 'Patient 4', age: 60, gender: 'F', date: '2024-01-18', alt: 70, ast: 80, bilirubin: 1.5, albumin: 2.5, inr: null, platelets: null, symptoms: ['jaundice', 'abdominal swelling'], diagnosis: 'Cirrhosis' },
  { name: 'Patient 5', age: 50, gender: 'M', date: '2024-01-19', alt: null, ast: 100, bilirubin: 1.2, albumin: 4, inr: null, platelets: null, symptoms: ['chest pain'], diagnosis: 'Heart Condition' },
  { name: 'Patient 6', age: 40, gender: 'F', date: '2024-01-20', alt: null, ast: 60, bilirubin: 0.8, albumin: 3.5, inr: null, platelets: null, symptoms: ['headache'], diagnosis: 'Normal' },
  { name: 'Patient 7', age: 70, gender: 'F', date: '2024-01-21', alt: null, ast: 80, bilirubin: 2, albumin: 3.5, inr: null, platelets: 120, symptoms: ['fatigue', 'bruising'], diagnosis: 'Blood Disorder' },
  { name: 'Patient 8', age: 55, gender: 'M', date: '2024-01-22', alt: null, ast: 50, bilirubin: 1.5, albumin: 4.2, inr: null, platelets: 150, symptoms: ['abdominal pain'], diagnosis: 'Normal' },
  { name: 'Patient 9', age: 65, gender: 'M', date: '2024-01-23', alt: 50, ast: 60, bilirubin: 2.5, albumin: 3, inr: 1.3, platelets: 130, symptoms: ['jaundice', 'fatigue', 'abdominal swelling'], diagnosis: 'Advanced Liver Disease' },
  { name: 'Patient 10', age: 70, gender: 'F', date: '2024-01-24', alt: 75, ast: 80, bilirubin: 3, albumin: 2.8, inr: 1.8, platelets: 100, symptoms: ['jaundice', 'fatigue', 'abdominal swelling', 'confusion'], diagnosis: 'Liver Failure' },
];

// Disease pattern database
const diseasePatterns: DiseasePattern[] = [
  {
    name: 'Hepatitis',
    symptoms: ['fatigue', 'jaundice', 'abdominal pain', 'nausea'],
    testPatterns: {
      alt: { min: 40, max: 200 },
      ast: { min: 40, max: 200 },
      bilirubin: { min: 1.5, max: 5.0 },
      albumin: { min: 2.5, max: 4.0 }
    },
    ageRange: { min: 20, max: 80 },
    description: 'Inflammation of the liver',
    recommendations: ['Rest', 'Avoid alcohol', 'Monitor liver function', 'Consider antiviral treatment']
  },
  {
    name: 'Cirrhosis',
    symptoms: ['jaundice', 'abdominal swelling', 'fatigue', 'confusion'],
    testPatterns: {
      alt: { min: 30, max: 100 },
      ast: { min: 50, max: 150 },
      bilirubin: { min: 2.0, max: 8.0 },
      albumin: { min: 1.5, max: 3.0 },
      inr: { min: 1.2, max: 3.0 },
      platelets: { min: 50, max: 150 }
    },
    ageRange: { min: 40, max: 80 },
    description: 'Scarring of the liver tissue',
    recommendations: ['Liver transplant evaluation', 'Symptom management', 'Regular monitoring', 'Avoid alcohol']
  },
  {
    name: 'Liver Failure',
    symptoms: ['jaundice', 'fatigue', 'abdominal swelling', 'confusion', 'bleeding'],
    testPatterns: {
      alt: { min: 50, max: 300 },
      ast: { min: 60, max: 300 },
      bilirubin: { min: 3.0, max: 15.0 },
      albumin: { min: 1.0, max: 2.5 },
      inr: { min: 1.5, max: 5.0 },
      platelets: { min: 30, max: 100 }
    },
    ageRange: { min: 50, max: 90 },
    description: 'Severe liver dysfunction',
    recommendations: ['Immediate medical attention', 'Liver transplant', 'Supportive care', 'Monitor for complications']
  },
  {
    name: 'Blood Disorder',
    symptoms: ['fatigue', 'bruising', 'bleeding', 'pale skin'],
    testPatterns: {
      platelets: { min: 50, max: 150 },
      inr: { min: 1.2, max: 2.0 }
    },
    ageRange: { min: 20, max: 80 },
    description: 'Disorders affecting blood cells or clotting',
    recommendations: ['Blood tests', 'Bone marrow evaluation', 'Specialist consultation', 'Monitor bleeding risk']
  }
];

const normalRanges = {
  alt: { min: 7, max: 56 },
  ast: { min: 10, max: 40 },
  bilirubin: { min: 0.3, max: 1.2 },
  albumin: { min: 3.5, max: 5.0 },
  inr: { min: 0.8, max: 1.1 },
  platelets: { min: 150, max: 450 },
};

const COLORS = ['#3498db', '#1abc9c', '#9b59b6', '#e74c3c'];

function average(values: (number | null)[]) {
  const filtered = values.filter((v): v is number => v != null);
  if (!filtered.length) return 0;
  return filtered.reduce((a, b) => a + b, 0) / filtered.length;
}

function statusFor(test: keyof typeof normalRanges, value: number) {
  const range = normalRanges[test];
  if (value < range.min) return { label: 'Low', color: 'warning' as const };
  if (value > range.max) return { label: 'High', color: 'error' as const };
  return { label: 'Normal', color: 'success' as const };
}

// CSV parsing function
const parseCSV = (text: string): Patient[] => {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  return lines.slice(1).map((line, index) => {
    const values = line.split(',').map(v => v.trim());
    const patient: any = { name: `Patient ${index + 1}` };
    
    headers.forEach((header, i) => {
      const value = values[i] || '';
      if (header.includes('name')) patient.name = value;
      else if (header.includes('age')) patient.age = parseInt(value) || 0;
      else if (header.includes('gender')) patient.gender = value.toUpperCase() === 'F' ? 'F' : 'M';
      else if (header.includes('date')) patient.date = value;
      else if (header.includes('alt')) patient.alt = value === '' || value === 'NA' ? null : parseFloat(value);
      else if (header.includes('ast')) patient.ast = value === '' || value === 'NA' ? null : parseFloat(value);
      else if (header.includes('bilirubin')) patient.bilirubin = value === '' || value === 'NA' ? null : parseFloat(value);
      else if (header.includes('albumin')) patient.albumin = value === '' || value === 'NA' ? null : parseFloat(value);
      else if (header.includes('inr')) patient.inr = value === '' || value === 'NA' ? null : parseFloat(value);
      else if (header.includes('platelets')) patient.platelets = value === '' || value === 'NA' ? null : parseFloat(value);
      else if (header.includes('symptoms')) patient.symptoms = value ? value.split(';').map(s => s.trim()) : [];
      else if (header.includes('diagnosis')) patient.diagnosis = value;
    });
    
    return patient as Patient;
  });
};

// Disease pattern matching
const analyzeDiseasePatterns = (patients: Patient[]): AnalysisResult => {
  const riskAssessment = {
    highRisk: [] as Patient[],
    mediumRisk: [] as Patient[],
    lowRisk: [] as Patient[]
  };
  
  const correlations: Array<{ test1: string; test2: string; correlation: number }> = [];
  const recommendations: Array<{
    patientId: string;
    similarPatients: Patient[];
    suggestedActions: string[];
    confidence: number;
  }> = [];
  
  // Calculate risk scores and categorize patients
  patients.forEach(patient => {
    let riskScore = 0;
    const testValues = [patient.alt, patient.ast, patient.bilirubin, patient.albumin, patient.inr, patient.platelets];
    const validTests = testValues.filter(v => v !== null).length;
    
    // Risk scoring based on abnormal values
    if (patient.alt && (patient.alt < normalRanges.alt.min || patient.alt > normalRanges.alt.max)) riskScore += 2;
    if (patient.ast && (patient.ast < normalRanges.ast.min || patient.ast > normalRanges.ast.max)) riskScore += 2;
    if (patient.bilirubin && (patient.bilirubin < normalRanges.bilirubin.min || patient.bilirubin > normalRanges.bilirubin.max)) riskScore += 3;
    if (patient.albumin && (patient.albumin < normalRanges.albumin.min || patient.albumin > normalRanges.albumin.max)) riskScore += 3;
    if (patient.inr && (patient.inr < normalRanges.inr.min || patient.inr > normalRanges.inr.max)) riskScore += 2;
    if (patient.platelets && (patient.platelets < normalRanges.platelets.min || patient.platelets > normalRanges.platelets.max)) riskScore += 2;
    
    // Age factor
    if (patient.age > 65) riskScore += 1;
    
    patient.riskScore = riskScore;
    
    if (riskScore >= 8) riskAssessment.highRisk.push(patient);
    else if (riskScore >= 4) riskAssessment.mediumRisk.push(patient);
    else riskAssessment.lowRisk.push(patient);
  });
  
  // Find similar patients and generate recommendations
  patients.forEach(patient => {
    const similarPatients = patients.filter(p => 
      p.name !== patient.name && 
      Math.abs((p.age || 0) - (patient.age || 0)) <= 10 &&
      p.gender === patient.gender &&
      p.symptoms && patient.symptoms && 
      p.symptoms.some(s => patient.symptoms!.includes(s))
    );
    
    if (similarPatients.length > 0) {
      const suggestedActions = generateRecommendations(patient, similarPatients);
      recommendations.push({
        patientId: patient.name,
        similarPatients,
        suggestedActions,
        confidence: Math.min(0.9, similarPatients.length * 0.2 + 0.3)
      });
    }
  });
  
  // Calculate correlations between test values
  const testNames = ['alt', 'ast', 'bilirubin', 'albumin', 'inr', 'platelets'];
  for (let i = 0; i < testNames.length; i++) {
    for (let j = i + 1; j < testNames.length; j++) {
      const test1 = testNames[i];
      const test2 = testNames[j];
      const values1 = patients.map(p => p[test1 as keyof Patient] as number).filter(v => v !== null);
      const values2 = patients.map(p => p[test2 as keyof Patient] as number).filter(v => v !== null);
      
      if (values1.length > 1 && values2.length > 1) {
        const correlation = calculateCorrelation(values1, values2);
        correlations.push({ test1, test2, correlation });
      }
    }
  }
  
  return {
    diseasePatterns,
    riskAssessment,
    correlations,
    recommendations
  };
};

const calculateCorrelation = (x: number[], y: number[]): number => {
  const n = Math.min(x.length, y.length);
  if (n < 2) return 0;
  
  const sumX = x.slice(0, n).reduce((a, b) => a + b, 0);
  const sumY = y.slice(0, n).reduce((a, b) => a + b, 0);
  const sumXY = x.slice(0, n).reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.slice(0, n).reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.slice(0, n).reduce((sum, yi) => sum + yi * yi, 0);
  
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  
  return denominator === 0 ? 0 : numerator / denominator;
};

const generateRecommendations = (patient: Patient, similarPatients: Patient[]): string[] => {
  const recommendations: string[] = [];
  
  // Analyze common treatments from similar patients
  const commonDiagnoses = similarPatients.map(p => p.diagnosis).filter(Boolean);
  const diagnosisCounts = commonDiagnoses.reduce((acc, diag) => {
    acc[diag!] = (acc[diag!] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const mostCommonDiagnosis = Object.entries(diagnosisCounts)
    .sort(([,a], [,b]) => b - a)[0]?.[0];
  
  if (mostCommonDiagnosis) {
    const pattern = diseasePatterns.find(p => p.name === mostCommonDiagnosis);
    if (pattern) {
      recommendations.push(...pattern.recommendations);
    }
  }
  
  // Add general recommendations based on risk level
  if (patient.riskScore && patient.riskScore >= 8) {
    recommendations.push('Immediate specialist consultation required');
    recommendations.push('Consider hospitalization for monitoring');
  } else if (patient.riskScore && patient.riskScore >= 4) {
    recommendations.push('Schedule follow-up within 2 weeks');
    recommendations.push('Monitor symptoms closely');
  } else {
    recommendations.push('Continue routine monitoring');
    recommendations.push('Maintain healthy lifestyle');
  }
  
  return [...new Set(recommendations)]; // Remove duplicates
};

const PatientMedicalDashboard: React.FC<{ patients?: Patient[] }> = ({ patients: initialPatients = [] }) => {
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const totalPatients = patients.length;
  const avgAge = average(patients.map(p => p.age));
  const male = patients.filter(p => p.gender === 'M').length;
  const female = patients.filter(p => p.gender === 'F').length;

  // Analyze patients when data changes
  useMemo(() => {
    if (patients.length > 0) {
      setIsAnalyzing(true);
      setTimeout(() => {
        const result = analyzeDiseasePatterns(patients);
        setAnalysisResult(result);
        setIsAnalyzing(false);
      }, 1000); // Simulate analysis time
    }
  }, [patients]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const newPatients = parseCSV(text);
      if (newPatients.length > 0) {
        setPatients(newPatients);
      } else {
        alert('No valid patient data found in CSV file');
      }
    } catch (error) {
      alert('Error reading CSV file');
    }
  };

  const genderData = [
    { name: 'Female', value: female, color: '#3498db' },
    { name: 'Male', value: male, color: '#1abc9c' },
  ];

  const ageGroups = {
    'Under 50': patients.filter(p => p.age < 50).length,
    '50-65': patients.filter(p => p.age >= 50 && p.age <= 65).length,
    '65+': patients.filter(p => p.age > 65).length,
  };
  const ageData = [
    { name: 'Under 50', value: ageGroups['Under 50'], color: '#3498db' },
    { name: '50-65', value: ageGroups['50-65'], color: '#1abc9c' },
    { name: '65+', value: ageGroups['65+'], color: '#9b59b6' },
  ];

  const avgAlt = average(patients.map(p => p.alt));
  const avgAst = average(patients.map(p => p.ast));
  const avgBili = average(patients.map(p => p.bilirubin));
  const avgAlb = average(patients.map(p => p.albumin));
  const testBarData = [
    { name: 'ALT', value: avgAlt, color: '#3498db' },
    { name: 'AST', value: avgAst, color: '#1abc9c' },
    { name: 'Bilirubin', value: avgBili, color: '#9b59b6' },
    { name: 'Albumin', value: avgAlb, color: '#e74c3c' },
  ];

  const summaryRows: { test: string; avg: number; range: string; status: ReturnType<typeof statusFor> }[] = [
    { test: 'ALT', avg: avgAlt, range: `${normalRanges.alt.min} - ${normalRanges.alt.max}`, status: statusFor('alt', avgAlt) },
    { test: 'AST', avg: avgAst, range: `${normalRanges.ast.min} - ${normalRanges.ast.max}`, status: statusFor('ast', avgAst) },
    { test: 'Bilirubin', avg: avgBili, range: `${normalRanges.bilirubin.min} - ${normalRanges.bilirubin.max}`, status: statusFor('bilirubin', avgBili) },
    { test: 'Albumin', avg: avgAlb, range: `${normalRanges.albumin.min} - ${normalRanges.albumin.max}`, status: statusFor('albumin', avgAlb) },
  ];

  return (
    <Box>
      <Typography variant="h4" align="center" gutterBottom>Patient Medical Analysis Dashboard</Typography>

      {/* Upload First Gate */}
      {patients.length === 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Upload your file</Typography>
            <Button
              component="label"
              variant="contained"
              startIcon={<UploadIcon />}
            >
              Choose CSV File
              <input
                type="file"
                hidden
                accept=".csv"
                onChange={handleFileUpload}
              />
            </Button>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              After upload, data visualization and analysis will be generated automatically.
            </Typography>
            <Button
              component="label"
              variant="contained"
              startIcon={<UploadIcon />}
            >
              Choose File
              <input
                type="file"
                hidden
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    setUploadedFile(file);

                    const reader = new FileReader();
                    reader.onload = async (event) => {
                      const xmlData = event.target?.result;
                      if (xmlData) {
                        try {
                          const response = await fetch('http://localhost:5001/api/upload/xml', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/xml'
                            },
                            body: xmlData,
                          });

                          if (response.ok) {
                            console.log('XML file uploaded successfully');
                          } else {
                            console.error('Error uploading XML file');
                          }
                        } catch (error) {
                          console.error('Error uploading XML file:', error);
                        }
                      }
                    };
                    reader.readAsText(file);
                  }
                }}
              />
            </Button>
            {uploadedFile && (
              <>
                <Typography variant="body2">Uploaded File: {uploadedFile.name}</Typography>
                {uploadedFile.type === 'application/xml' ? null : uploadedFile.type.startsWith('image/') ? (
                  <img
                    src={URL.createObjectURL(uploadedFile)}
                    alt="Uploaded File"
                    style={{ maxWidth: '100%', maxHeight: '300px' }}
                  />
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    href={URL.createObjectURL(uploadedFile)}
                    download={uploadedFile.name}
                  >
                    Download File
                  </Button>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Analysis Status */}
      {isAnalyzing && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Analyzing Patient Data</Typography>
            <LinearProgress />
            <Typography variant="body2" sx={{ mt: 1 }}>
              Detecting disease patterns and generating recommendations...
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Risk Assessment Alerts */}
      {analysisResult && (
        <Box sx={{ mb: 3 }}>
          {analysisResult.riskAssessment.highRisk.length > 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="h6">High Risk Patients ({analysisResult.riskAssessment.highRisk.length})</Typography>
              <Typography variant="body2">
                {analysisResult.riskAssessment.highRisk.map(p => p.name).join(', ')} require immediate attention
              </Typography>
            </Alert>
          )}
          {analysisResult.riskAssessment.mediumRisk.length > 0 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="h6">Medium Risk Patients ({analysisResult.riskAssessment.mediumRisk.length})</Typography>
              <Typography variant="body2">
                {analysisResult.riskAssessment.mediumRisk.map(p => p.name).join(', ')} need close monitoring
              </Typography>
            </Alert>
          )}
        </Box>
      )}

      {patients.length > 0 && (
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent sx={{ textAlign: 'center', bgcolor: 'primary.main', color: 'primary.contrastText', borderRadius: 1 }}><Typography variant="h4">{totalPatients}</Typography><Typography variant="body2">Total Patients</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent sx={{ textAlign: 'center', bgcolor: 'primary.main', color: 'primary.contrastText', borderRadius: 1 }}><Typography variant="h4">{avgAge.toFixed(1)}</Typography><Typography variant="body2">Average Age</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent sx={{ textAlign: 'center', bgcolor: 'primary.main', color: 'primary.contrastText', borderRadius: 1 }}><Typography variant="h4">{male}</Typography><Typography variant="body2">Male Patients</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent sx={{ textAlign: 'center', bgcolor: 'primary.main', color: 'primary.contrastText', borderRadius: 1 }}><Typography variant="h4">{female}</Typography><Typography variant="body2">Female Patients</Typography></CardContent></Card>
        </Grid>
      </Grid>
      )}

      {patients.length > 0 && (
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" align="center" gutterBottom>Patients by Gender</Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={genderData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={2}>
                      {genderData.map((d, i) => (<Cell key={i} fill={d.color} />))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" align="center" gutterBottom>Age Distribution</Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={ageData} dataKey="value" nameKey="name" outerRadius={100} paddingAngle={2}>
                      {ageData.map((d, i) => (<Cell key={i} fill={d.color} />))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" align="center" gutterBottom>Average Test Values</Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={testBarData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value">
                      {testBarData.map((d, i) => (<Cell key={i} fill={d.color} />))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      )}

      {/* Removed Patient Details Table per requirement */}

      {/* Removed Test Results Summary per requirement */}

      {/* Dynamic Analysis Results */}
      {patients.length > 0 && analysisResult && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h5" gutterBottom>Dynamic Analysis & Recommendations</Typography>
          
          {/* Disease Pattern Detection */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocalHospitalIcon />
                Detected Disease Patterns
              </Typography>
              <Grid container spacing={2}>
                {analysisResult.diseasePatterns.map((pattern, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle1">{pattern.name}</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body2" paragraph>{pattern.description}</Typography>
                        <Typography variant="subtitle2" gutterBottom>Symptoms:</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                          {pattern.symptoms.map((symptom, i) => (
                            <Chip key={i} label={symptom} size="small" color="primary" />
                          ))}
                        </Box>
                        <Typography variant="subtitle2" gutterBottom>Recommendations:</Typography>
                        <List dense>
                          {pattern.recommendations.map((rec, i) => (
                            <ListItem key={i}>
                              <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                              <ListItemText primary={rec} />
                            </ListItem>
                          ))}
                        </List>
                      </AccordionDetails>
                    </Accordion>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          {/* Test Correlations */}
          {analysisResult.correlations.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon />
                  Test Value Correlations
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Test 1</TableCell>
                        <TableCell>Test 2</TableCell>
                        <TableCell>Correlation</TableCell>
                        <TableCell>Strength</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {analysisResult.correlations.map((corr, index) => (
                        <TableRow key={index}>
                          <TableCell>{corr.test1.toUpperCase()}</TableCell>
                          <TableCell>{corr.test2.toUpperCase()}</TableCell>
                          <TableCell>{corr.correlation.toFixed(3)}</TableCell>
                          <TableCell>
                            <Chip 
                              label={
                                Math.abs(corr.correlation) > 0.7 ? 'Strong' :
                                Math.abs(corr.correlation) > 0.4 ? 'Moderate' : 'Weak'
                              }
                              color={
                                Math.abs(corr.correlation) > 0.7 ? 'success' :
                                Math.abs(corr.correlation) > 0.4 ? 'warning' : 'default'
                              }
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}

          {/* Patient Recommendations */}
          {analysisResult.recommendations.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PeopleIcon />
                  Patient-Specific Recommendations
                </Typography>
                {analysisResult.recommendations.map((rec, index) => (
                  <Accordion key={index} sx={{ mb: 1 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                        <Typography variant="subtitle1">{rec.patientId}</Typography>
                        <Chip 
                          label={`${Math.round(rec.confidence * 100)}% confidence`}
                          color={rec.confidence > 0.7 ? 'success' : rec.confidence > 0.4 ? 'warning' : 'default'}
                          size="small"
                        />
                        <Typography variant="body2" color="text.secondary">
                          Similar to {rec.similarPatients.length} other patients
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" gutterBottom>Similar Patients:</Typography>
                          <List dense>
                            {rec.similarPatients.map((patient, i) => (
                              <ListItem key={i}>
                                <ListItemText 
                                  primary={patient.name}
                                  secondary={`Age: ${patient.age}, Diagnosis: ${patient.diagnosis || 'Unknown'}`}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" gutterBottom>Recommended Actions:</Typography>
                          <List dense>
                            {rec.suggestedActions.map((action, i) => (
                              <ListItem key={i}>
                                <ListItemIcon><InfoIcon color="primary" /></ListItemIcon>
                                <ListItemText primary={action} />
                              </ListItem>
                            ))}
                          </List>
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Risk Distribution Chart */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Risk Distribution</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Card sx={{ bgcolor: 'error.light', color: 'error.contrastText' }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4">{analysisResult.riskAssessment.highRisk.length}</Typography>
                      <Typography variant="body2">High Risk</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4">{analysisResult.riskAssessment.mediumRisk.length}</Typography>
                      <Typography variant="body2">Medium Risk</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4">{analysisResult.riskAssessment.lowRisk.length}</Typography>
                      <Typography variant="body2">Low Risk</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
};

export default PatientMedicalDashboard;


