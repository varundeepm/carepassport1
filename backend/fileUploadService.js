const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
const medicalFilesDir = path.join(uploadsDir, 'medical-files');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(medicalFilesDir)) {
  fs.mkdirSync(medicalFilesDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Define allowed file types
  const allowedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, PDFs, and documents are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Generate unique filename
const generateUniqueFileName = (originalName) => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const extension = path.extname(originalName);
  return `${timestamp}_${randomString}${extension}`;
};

let _uploadInstance = null;

function initializeUploadMiddleware() {
  if (_uploadInstance) {
    return _uploadInstance;
  }
  _uploadInstance = module.exports = {
    multer,
    uploadsDir,
    medicalFilesDir,
    // Define available middleware configurations
    single: upload.single('medicalFile'),
    multiple: upload.array('medicalFiles', 10),
    any: upload.any()
  };
  return _uploadInstance;
}
