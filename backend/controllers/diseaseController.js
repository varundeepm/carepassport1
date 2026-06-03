const Disease = require('../models/Disease');

// Create a new disease
exports.createDisease = async (req, res) => {
  try {
    const disease = new Disease(req.body);
    await disease.save();
    res.status(201).json({
      success: true,
      message: 'Disease created successfully',
      data: disease
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating disease',
      error: error.message
    });
  }
};

// Get all diseases
exports.getAllDiseases = async (req, res) => {
  try {
    const diseases = await Disease.find().sort({ name: 1 });
    res.status(200).json({
      success: true,
      data: diseases
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching diseases',
      error: error.message
    });
  }
};

// Get disease by ID
exports.getDiseaseById = async (req, res) => {
  try {
    const disease = await Disease.findOne({ diseaseId: req.params.id });
    if (!disease) {
      return res.status(404).json({
        success: false,
        message: 'Disease not found'
      });
    }
    res.status(200).json({
      success: true,
      data: disease
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching disease details',
      error: error.message
    });
  }
};
