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
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb('Error: File upload only supports the following filetypes - ' + filetypes);
  }
}).single('image');

exports.uploadImage = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ 
        success: false,
        message: err
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