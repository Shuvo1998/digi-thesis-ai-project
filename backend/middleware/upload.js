// backend/middleware/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // For creating the uploads directory if it doesn't exist

// Ensure the 'uploads' directory exists in the backend root
// This is where Multer will store the uploaded thesis files.
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true }); // Create directory if it doesn't exist
}

// Set up storage for uploaded files using multer.diskStorage
const storage = multer.diskStorage({
    // Define the destination directory for uploaded files
    destination: (req, file, cb) => {
        // 'cb' is the callback function. First argument is error, second is destination.
        cb(null, uploadsDir); // Files will be stored in the 'backend/uploads' directory
    },
    // Define the filename for the uploaded file
    filename: (req, file, cb) => {
        // Generate a unique filename to prevent overwrites.
        // We'll prepend 'thesis-' and a timestamp to the original filename.
        // path.extname(file.originalname) gets the original file extension (e.g., .pdf).
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter to allow only specific file types (e.g., PDF)
const fileFilter = (req, file, cb) => {
    // Check if the file's mimetype is 'application/pdf'
    if (file.mimetype === 'application/pdf') {
        cb(null, true); // Accept the file
    } else {
        // Reject the file if it's not a PDF, and provide an error message
        cb(new Error('Only PDF files are allowed!'), false);
    }
};

// Configure Multer upload middleware
const upload = multer({
    storage: storage, // Use the defined storage configuration
    fileFilter: fileFilter, // Use the defined file filter
    limits: {
        fileSize: 50 * 1024 * 1024 // Set a file size limit (e.g., 50 MB)
    }
});

module.exports = upload; // Export the configured Multer upload middleware
