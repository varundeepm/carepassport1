const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  zipCode: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  website: {
    type: String
  },
  specialties: [{
    type: String,
    enum: ['Cardiology', 'Orthopedics', 'Dermatology', 'Neurology', 'Pediatrics', 'Oncology', 'Psychiatry', 'Emergency Medicine', 'General Surgery', 'Internal Medicine', 'Research', 'Family Medicine', 'Women\'s Health']
  }],
  capacity: {
    type: Number,
    default: 0
  },
  accreditation: [{
    accreditedBy: String,
    accreditationDate: Date,
    expiryDate: Date
  }],
  facilities: [{
    type: String
  }],
  emergencyServices: {
    available: {
      type: Boolean,
      default: true
    },
    helpline: String
  },
  insuranceAccepted: [{
    providerName: String,
    inNetwork: Boolean
  }],
  // Operating hours
  operatingHours: {
    weekdays: {
      open: String,
      close: String
    },
    weekends: {
      open: String,
      close: String
    },
    emergency24x7: {
      type: Boolean,
      default: true
    }
  },
  // Contact information for different departments
  departments: [{
    name: String,
    phone: String,
    email: String,
    chiefOfDepartment: String
  }],
  // Review and ratings
  rating: {
    overall: {
      type: Number,
      min: 0,
      max: 5,
      default: 4.0
    },
    cleanliness: Number,
    staff: Number,
    facilities: Number,
    timeliness: Number,
    numberOfReviews: {
      type: Number,
      default: 0
    }
  },
  // Services offered
  services: [{
    category: String,
    services: [String]
  }],
  // Status
  status: {
    type: String,
    enum: ['active', 'maintenance', 'temporarily_closed'],
    default: 'active'
  },
  // Additional information
  description: String,
  foundedYear: Number,
  ownership: {
    type: String,
    enum: ['public', 'private', 'non_profit', 'government']
  }
}, {
  timestamps: true
});

// Indexes for better query performance
hospitalSchema.index({ name: 'text', city: 'text', specialties: 'text' });
hospitalSchema.index({ city: 1, state: 1 });
hospitalSchema.index({ specialties: 1 });
hospitalSchema.index({ status: 1 });

// Virtual for full address
hospitalSchema.virtual('fullAddress').get(function() {
  return `${this.address}, ${this.city}, ${this.state} ${this.zipCode}`;
});

// Virtual for is emergency available
hospitalSchema.virtual('isEmergencyAvailable').get(function() {
  return this.emergencyServices && this.emergencyServices.available;
});

// Virtual for formatted hours
hospitalSchema.virtual('formattedHours').get(function() {
  if (this.operatingHours) {
    return {
      weekdays: `${this.operatingHours.weekdays.open} - ${this.operatingHours.weekdays.close}`,
      weekends: `${this.operatingHours.weekends.open} - ${this.operatingHours.weekends.close}`,
      emergency: this.operatingHours.emergency24x7 ? '24/7 Available' : 'Limited Hours'
    };
  }
  return null;
});

// Ensure virtuals are included in JSON output
hospitalSchema.set('toJSON', { virtuals: true });
hospitalSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Hospital', hospitalSchema);
