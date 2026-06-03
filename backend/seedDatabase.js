const mongoose = require('mongoose');
const Patient = require('./models/Patient');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/varun')
.then(() => console.log('✅ Connected to MongoDB database: varun'))
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});

// Sample patient data
const samplePatients = [
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
        date: "2024-02-22",
        time: "14:30",
        doctor: "Dr. Michael Chen",
        department: "Endocrinology",
        status: "scheduled",
        purpose: "Diabetes management consultation"
      }
    ]
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
        date: "2024-02-25",
        time: "09:00",
        doctor: "Dr. James Brown",
        department: "Pulmonology",
        status: "scheduled",
        purpose: "Asthma follow-up"
      }
    ]
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
        date: "2024-02-28",
        time: "10:30",
        doctor: "Dr. Sarah Johnson",
        department: "Cardiology",
        status: "scheduled",
        purpose: "Cholesterol management"
      }
    ]
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
        date: "2024-03-02",
        time: "15:15",
        doctor: "Dr. David Lee",
        department: "Hematology",
        status: "scheduled",
        purpose: "Anemia follow-up"
      }
    ]
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
        date: "2024-03-05",
        time: "12:00",
        doctor: "Dr. Patricia White",
        department: "Cardiology",
        status: "scheduled",
        purpose: "Stress test and evaluation"
      }
    ]
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Clear existing patients
    await Patient.deleteMany({});
    console.log('🗑️  Cleared existing patient data');
    
    // Insert sample patients
    const insertedPatients = await Patient.insertMany(samplePatients);
    console.log(`✅ Inserted ${insertedPatients.length} patients into varun database`);
    
    // Display inserted patients
    console.log('\n📊 Inserted Patients:');
    insertedPatients.forEach(patient => {
      console.log(`- ${patient.id}: ${patient.name} (${patient.email})`);
    });
    
    console.log('\n🎉 Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the seeder
seedDatabase();
