const express = require('express');
const router = express.Router();
const diseaseController = require('../controllers/diseaseController');

router.post('/', diseaseController.createDisease);
router.get('/', diseaseController.getAllDiseases);
router.get('/:id', diseaseController.getDiseaseById);

module.exports = router;
