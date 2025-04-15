const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs'); // Add this at the top with other requires

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Ensure uploads directory exists
    const uploadsDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// Initialize upload
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    // Check file size before processing (additional check)
    const fileSize = parseInt(req.headers['content-length']);
    if (fileSize > 5 * 1024 * 1024) {
      return cb(new Error('File size exceeds 5MB limit'));
    }
    
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    // Log file information
    console.log('File upload attempt:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      extension: path.extname(file.originalname).toLowerCase(),
      fileSize: fileSize ? (fileSize / 1024 / 1024).toFixed(2) + 'MB' : 'unknown'
    });

    // Accept file if extension is valid, regardless of mimetype
    if (extname) {
      return cb(null, true);
    }
    
    cb(`Error: File upload only supports images with extensions: .jpeg, .jpg, .png. Received file with extension: ${path.extname(file.originalname)}`);
  }
}).single('image');

exports.uploadImage = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error('Upload error:', err);
      // Check if error is related to file size
      if (err.message && err.message.includes('File size exceeds')) {
        return res.status(413).json({ 
          success: false,
          message: 'File size exceeds the 5MB limit'
        });
      }
      return res.status(400).json({ 
        success: false,
        message: err.toString()
      });
    }
    
    if (!req.file) {
      console.error('No file uploaded');
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    try {
      // Ensure uploads directory exists
      const uploadsDir = path.join(__dirname, '../../uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Ensure thumbnails directory exists
      const thumbnailsDir = path.join(__dirname, '../../thumbnails');
      if (!fs.existsSync(thumbnailsDir)) {
        fs.mkdirSync(thumbnailsDir, { recursive: true });
      }

      // Generate thumbnail
      const thumbnailPath = path.join(thumbnailsDir, req.file.filename);
      await sharp(req.file.path)
        .resize(200, 200)
        .toFile(thumbnailPath);

      console.log('Image and thumbnail successfully processed');
      res.status(200).json({
        success: true,
        imageUrl: `/uploads/${req.file.filename}`,
        thumbnailUrl: `/thumbnails/${req.file.filename}`
      });
    } catch (error) {
      console.error('Thumbnail generation error:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating thumbnail',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });
};