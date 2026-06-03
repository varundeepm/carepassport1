const express = require('express');
const transferController = require('../controllers/transferController');

const router = express.Router();

router.post('/', transferController.initiateTransfer);

module.exports = router;