const express = require('express');
const router = express.Router();
const patientDiseaseController = require('../controllers/patientDiseaseController');

router.post('/', patientDiseaseController.assignDiseaseToPatient);
router.get('/patient/:patientId', patientDiseaseController.getPatientDiseases);
router.put('/:id', patientDiseaseController.updatePatientDisease);

module.exports = router;
