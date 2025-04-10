const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const initSuperAdmin = require('./utils/initSuperAdmin');
const spkRoutes = require('./routes/spkRoutes');
const solarPriceRoutes = require('./routes/solarPriceRoutes');
const locationRoutes = require('./routes/locationRoutes');

// Load environment variables
dotenv.config();

// Import routes
const categoryRoutes = require('./routes/categoryRoutes');
const subCategoryRoutes = require('./routes/subCategoryRoutes');
const itemRoutes = require('./routes/itemRoutes');
const rateRoutes = require('./routes/rateRoutes');
const authRoutes = require('./routes/authRoutes');
const itemCostRoutes = require('./routes/itemCostRoutes');
const materialUnitRoutes = require('./routes/materialUnitRoutes'); // Import MaterialUnit routes

// Initialize express app
const app = express();

// Set up rate limiter: maximum of 100 requests per minute
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(limiter);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/projectManager')
  .then(() => {
    console.log('Connected to MongoDB');
    // Initialize super admin after successful connection
    initSuperAdmin();
  })
  .catch(err => console.error('Could not connect to MongoDB', err));

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/subcategories', subCategoryRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/rates', rateRoutes);
app.use('/api/spks', spkRoutes);
app.use('/api/item-costs', itemCostRoutes);
app.use('/api/material-units', materialUnitRoutes); // Register MaterialUnit routes
app.use('/api/solar-prices', solarPriceRoutes); // Add this line
app.use('/api/locations', locationRoutes); // Add this line

// Root route
app.get('/', (req, res) => {
  res.send('Project Manager API is running');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Disable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

module.exports = app;