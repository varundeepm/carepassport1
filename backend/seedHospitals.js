const mongoose = require('mongoose');
const Hospital = require('./models/Hospital');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/varun')
.then(() => console.log('✅ Connected to MongoDB database: varun'))
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});

// Sample hospital data
const sampleHospitals = [
  {
    id: "H001",
    name: "City General Hospital",
    address: "123 Medical Center Dr",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    phone: "+1-555-0100",
    email: "info@citygeneral.com",
    website: "https://citygeneral.com",
    specialties: ["Cardiology", "Emergency Medicine", "Internal Medicine", "General Surgery"],
    capacity: 500,
    accreditation: [{
      accreditedBy: "Joint Commission",
      accreditationDate: new Date("2020-01-15"),
      expiryDate: new Date("2023-01-15")
    }],
    facilities: ["ICU", "Cardiac Surgery", "Emergency Trauma", "Laboratory", "Pharmacy"],
    emergencyServices: {
      available: true,
      helpline: "+1-555-0100"
    },
    insuranceAccepted: [
      { providerName: "Blue Cross Blue Shield", inNetwork: true },
      { providerName: "Aetna", inNetwork: true },
      { providerName: "Cigna", inNetwork: true }
    ],
    operatingHours: {
      weekdays: { open: "06:00", close: "22:00" },
      weekends: { open: "08:00", close: "20:00" },
      emergency24x7: true
    },
    departments: [
      {
        name: "Cardiology",
        phone: "+1-555-0101",
        email: "cardiology@citygeneral.com",
        chiefOfDepartment: "Dr. Sarah Johnson"
      },
      {
        name: "Emergency Medicine",
        phone: "+1-555-0102",
        email: "emergency@citygeneral.com",
        chiefOfDepartment: "Dr. Michael Rodriguez"
      }
    ],
    services: [
      {
        category: "Primary Care",
        services: ["General Check-ups", "Preventive Care", "Chronic Disease Management"]
      },
      {
        category: "Emergency Services",
        services: ["Trauma Center", "Emergency Surgery", "Stroke Treatment"]
      }
    ],
    description: "Leading medical facility providing comprehensive healthcare services",
    foundedYear: 1985,
    ownership: "private"
  },
  {
    id: "H002",
    name: "Metro Medical Center",
    address: "456 Health Plaza",
    city: "Los Angeles",
    state: "CA",
    zipCode: "90210",
    phone: "+1-555-0200",
    email: "info@metromedical.com",
    website: "https://metromedical.com",
    specialties: ["Orthopedics", "Neurology", "Pediatrics", "Emergency Medicine"],
    capacity: 350,
    accreditation: [{
      accreditedBy: "Joint Commission",
      accreditationDate: new Date("2019-06-20"),
      expiryDate: new Date("2022-06-20")
    }],
    facilities: ["Orthopedic Surgery", "Pediatric ICU", "Neurology Lab", "Physical Therapy"],
    emergencyServices: {
      available: true,
      helpline: "+1-555-0200"
    },
    insuranceAccepted: [
      { providerName: "Blue Cross Blue Shield", inNetwork: true },
      { providerName: "United Healthcare", inNetwork: true },
      { providerName: "Kaiser Permanente", inNetwork: true }
    ],
    operatingHours: {
      weekdays: { open: "07:00", close: "21:00" },
      weekends: { open: "09:00", close: "19:00" },
      emergency24x7: true
    },
    departments: [
      {
        name: "Orthopedics",
        phone: "+1-555-0201",
        email: "orthopedics@metromedical.com",
        chiefOfDepartment: "Dr. Michael Chen"
      },
      {
        name: "Neurology",
        phone: "+1-555-0202",
        email: "neurology@metromedical.com",
        chiefOfDepartment: "Dr. Robert Wilson"
      }
    ],
    services: [
      {
        category: "Orthopedic Care",
        services: ["Joint Replacement", "Sports Medicine", "Spine Surgery"]
      },
      {
        category: "Neurological Services",
        services: ["Brain Surgery", "Neurological Testing", "Stroke Care"]
      }
    ],
    description: "Specialized medical center focusing on orthopedic and neurological care",
    foundedYear: 1992,
    ownership: "non_profit"
  },
  {
    id: "H003",
    name: "University Hospital",
    address: "789 Academic Blvd",
    city: "Chicago",
    state: "IL",
    zipCode: "60601",
    phone: "+1-555-0300",
    email: "info@universityhospital.org",
    website: "https://universityhospital.org",
    specialties: ["Dermatology", "Oncology", "Psychiatry", "Research"],
    capacity: 400,
    accreditation: [{
      accreditedBy: "Academic Medical Center Accreditation",
      accreditationDate: new Date("2021-03-10"),
      expiryDate: new Date("2024-03-10")
    }],
    facilities: ["Cancer Center", "Burn Unit", "Mental Health Unit", "Research Labs"],
    emergencyServices: {
      available: true,
      helpline: "+1-555-0300"
    },
    insuranceAccepted: [
      { providerName: "Blue Cross Blue Shield", inNetwork: true },
      { providerName: "Medicare", inNetwork: true },
      { providerName: "Medicaid", inNetwork: true }
    ],
    operatingHours: {
      weekdays: { open: "06:30", close: "23:00" },
      weekends: { open: "08:00", close: "18:00" },
      emergency24x7: true
    },
    departments: [
      {
        name: "Dermatology",
        phone: "+1-555-0301",
        email: "dermatology@universityhospital.org",
        chiefOfDepartment: "Dr. Emily Davis"
      },
      {
        name: "Oncology",
        phone: "+1-555-0302",
        email: "oncology@universityhospital.org",
        chiefOfDepartment: "Dr. Patricia Kim"
      }
    ],
    services: [
      {
        category: "Dermatology",
        services: ["Skin Cancer Treatment", "Cosmetic Surgery", "Allergy Testing"]
      },
      {
        category: "Oncology",
        services: ["Cancer Treatment", "Chemotherapy", "Radiation Therapy"]
      }
    ],
    description: "Academic medical center with advanced research and specialized treatments",
    foundedYear: 1978,
    ownership: "public"
  },
  {
    id: "H004",
    name: "Regional Medical Center",
    address: "321 Wellness Way",
    city: "Houston",
    state: "TX",
    zipCode: "77001",
    phone: "+1-555-0400",
    email: "info@regionalmedical.com",
    website: "https://regionalmedical.com",
    specialties: ["Emergency Medicine", "General Surgery", "Internal Medicine", "Pediatrics"],
    capacity: 300,
    accreditation: [{
      accreditedBy: "JCAHO",
      accreditationDate: new Date("2020-09-15"),
      expiryDate: new Date("2023-09-15")
    }],
    facilities: ["Trauma Center", "Surgical Suites", "Pediatric Wing", "Medical Imaging"],
    emergencyServices: {
      available: true,
      helpline: "+1-555-0400"
    },
    insuranceAccepted: [
      { providerName: "Blue Cross Blue Shield", inNetwork: true },
      { providerName: "Aetna", inNetwork: true },
      { providerName: "Humana", inNetwork: true }
    ],
    operatingHours: {
      weekdays: { open: "06:00", close: "22:00" },
      weekends: { open: "07:00", close: "21:00" },
      emergency24x7: true
    },
    departments: [
      {
        name: "General Surgery",
        phone: "+1-555-0401",
        email: "surgery@regionalmedical.com",
        chiefOfDepartment: "Dr. James Liu"
      },
      {
        name: "Pediatrics",
        phone: "+1-555-0402",
        email: "pediatrics@regionalmedical.com",
        chiefOfDepartment: "Dr. Susan Martinez"
      }
    ],
    services: [
      {
        category: "General Surgery",
        services: ["Laparoscopic Surgery", "Trauma Surgery", "Surgical Oncology"]
      },
      {
        category: "Pediatric Care",
        services: ["Well-child Visits", "Pediatric Emergency", "Child Development"]
      }
    ],
    description: "Community-focused medical center providing comprehensive healthcare",
    foundedYear: 1995,
    ownership: "private"
  },
  {
    id: "H005",
    name: "Community Health Clinic",
    address: "654 Healing Hills Dr",
    city: "Phoenix",
    state: "AZ",
    zipCode: "85001",
    phone: "+1-555-0500",
    email: "info@communityhealth.org",
    website: "https://communityhealth.org",
    specialties: ["Family Medicine", "Internal Medicine", "Pediatrics", "Women's Health"],
    capacity: 150,
    accreditation: [{
      accreditedBy: "Chamber of Commerce Health",
      accreditationDate: new Date("2021-01-20"),
      expiryDate: new Date("2024-01-20")
    }],
    facilities: ["Family Medicine", "Pediatric Clinic", "Women's Health Center", "Laboratory"],
    emergencyServices: {
      available: false,
      helpline: "Call 911"
    },
    insuranceAccepted: [
      { providerName: "Medicare", inNetwork: true },
      { providerName: "Medicaid", inNetwork: true },
      { providerName: "Sliding Scale", inNetwork: true }
    ],
    operatingHours: {
      weekdays: { open: "08:00", close: "18:00" },
      weekends: { open: "09:00", close: "17:00" },
      emergency24x7: false
    },
    departments: [
      {
        name: "Family Medicine",
        phone: "+1-555-0501",
        email: "familymed@communityhealth.org",
        chiefOfDepartment: "Dr. Jennifer Adams"
      },
      {
        name: "Women's Health",
        phone: "+1-555-0502",
        email: "womenshealth@communityhealth.org",
        chiefOfDepartment: "Dr. Maria Santos"
      }
    ],
    services: [
      {
        category: "Primary Care",
        services: ["Annual Check-ups", "Chronic Disease Management", "Preventive Care"]
      },
      {
        category: "Women's Health",
        services: ["Prenatal Care", "Gynecological Exams", "Family Planning"]
      }
    ],
    description: "Community-based clinic providing accessible healthcare for all",
    foundedYear: 2005,
    ownership: "non_profit"
  }
];

async function seedHospitals() {
  try {
    console.log('🏥 Starting hospital database seeding...');
    
    // Clear existing hospitals
    await Hospital.deleteMany({});
    console.log('🗑️  Cleared existing hospital data');
    
    // Insert sample hospitals
    const insertedHospitals = await Hospital.insertMany(sampleHospitals);
    console.log(`✅ Inserted ${insertedHospitals.length} hospitals into varun database`);
    
    // Display inserted hospitals
    console.log('\n🏥 Inserted Hospitals:');
    insertedHospitals.forEach(hospital => {
      console.log(`- ${hospital.id}: ${hospital.name} (${hospital.city}, ${hospital.state})`);
    });
    
    console.log('\n🎉 Hospital database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding hospital database:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the seeder
seedHospitals();

