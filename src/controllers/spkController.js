const Spk = require('../models/spk');
const SolarPrice = require('../models/SolarPrice');
const Item = require('../models/Item');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
// Get all SPKs
exports.getAllSpks = async (req, res) => {
  try {
    const spks = await Spk.find()
      .sort({ createdAt: -1 }) // Sort by createdAt in descending order
      .populate({
        path: 'items.item',
        populate: {
          path: 'category subCategory'
        }
      })
      .populate('location');

    res.status(200).json(spks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to get latest solar price
const getLatestSolarPrice = async () => {
  const latestPrice = await SolarPrice.findOne().sort({ createdAt: -1 });
  return latestPrice ? latestPrice.price : 0;
};

// Create new SPK
exports.createSpk = async (req, res) => {
  try {
    console.log('Request body:', req.body); // Log incoming request
    const { spkNo, spkTitle, projectStartDate, projectEndDate, items, location } = req.body;
    
    // Validate required fields
    if (!spkNo || !spkTitle || !projectStartDate || !projectEndDate || !location) {
      console.error('Missing required fields');
      return res.status(400).json({ 
        message: 'All fields are required: spkNo, spkTitle, projectStartDate, projectEndDate, location' 
      });
    }

    // Validate location as valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(location)) {
      console.error('Invalid location ID:', location);
      return res.status(400).json({ message: 'Invalid location ID' });
    }

    // Validate date format
    if (isNaN(Date.parse(projectStartDate)) || isNaN(Date.parse(projectEndDate))) {
      console.error('Invalid date format');
      return res.status(400).json({ message: 'Invalid date format' });
    }

    // Validate project dates
    if (new Date(projectStartDate) > new Date(projectEndDate)) {
      console.error('Invalid project dates');
      return res.status(400).json({ message: 'projectStartDate must be before projectEndDate' });
    }

    const latestSolarPrice = await getLatestSolarPrice();
    console.log('Latest solar price:', latestSolarPrice);

    const newSpk = new Spk({
      spkNo,
      spkTitle,
      projectStartDate: new Date(projectStartDate),
      projectEndDate: new Date(projectEndDate),
      items: items || [],
      location: location,
      solarPrice: latestSolarPrice
    });

    const savedSpk = await newSpk.save();
    console.log('SPK created successfully:', savedSpk._id);
    res.status(201).json(savedSpk);
  } catch (error) {
    console.error('Error creating SPK:', error);
    res.status(400).json({ 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Update SPK
exports.updateSpk = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Get latest solar price if updating
    if (Object.keys(updateData).length > 0) {
      updateData.solarPrice = await getLatestSolarPrice();
    }

    const updatedSpk = await Spk.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedSpk) {
      return res.status(404).json({ message: 'SPK not found' });
    }

    res.status(200).json(updatedSpk);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get SPK by ID
exports.getSpkById = async (req, res) => {
  try {
    const spk = await Spk.findById(req.params.id)
      .populate({
        path: 'items.item',
        populate: {
          path: 'category subCategory'
        }
      });
    
    if (!spk) {
      return res.status(404).json({ message: 'SPK not found' });
    }
    res.status(200).json(spk);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete SPK
exports.deleteSpk = async (req, res) => {
  try {
    const deletedSpk = await Spk.findByIdAndDelete(req.params.id);
    if (!deletedSpk) {
      return res.status(404).json({ message: 'SPK not found' });
    }
    res.status(200).json({ message: 'SPK deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update SPK Status
exports.updateSpkStatus = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const spk = await Spk.findById(req.params.id);
    if (!spk) {
      return res.status(404).json({ message: 'SPK not found' });
    }

    // Validate status transition
    const validTransitions = {
      draft: ['active', 'cancelled'],
      active: ['completed', 'cancelled'],
      completed: [],
      cancelled: []
    };

    if (!validTransitions[spk.status].includes(req.body.status)) {
      return res.status(400).json({ 
        message: `Cannot transition from ${spk.status} to ${req.body.status}` 
      });
    }

    spk.status = req.body.status;
    await spk.save();

    res.status(200).json(spk);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get SPKs by Status
exports.getSpksByStatus = async (req, res) => {
  try {
    const spks = await Spk.find({ status: req.params.status })
      .populate({
        path: 'items.item',
        populate: {
          path: 'category subCategory'
        }
      });
    res.status(200).json(spks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};