const express = require('express');
const multer = require('multer');
const uploadController = require('../controllers/uploadController');

const router = express.Router();
const upload = multer();

router.post('/', upload.single('file'), uploadController.uploadToIPFS);
router.post('/xml', express.text({ type: 'application/xml' }), uploadController.uploadXML);

module.exports = router;