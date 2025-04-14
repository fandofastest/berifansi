const SolarPrice = require('../models/SolarPrice');
const { validationResult } = require('express-validator');

// Create new solar price
exports.createSolarPrice = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const newSolarPrice = new SolarPrice(req.body);
    const savedSolarPrice = await newSolarPrice.save();
    
    res.status(201).json(savedSolarPrice);
  } catch (error) {
    res.status(400).json({ 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get all solar prices
exports.getAllSolarPrices = async (req, res) => {
  try {
    const solarPrices = await SolarPrice.find().sort({ createdAt: -1 });
    res.status(200).json(solarPrices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get solar price by ID
exports.getSolarPriceById = async (req, res) => {
  try {
    const solarPrice = await SolarPrice.findById(req.params.id);
    if (!solarPrice) {
      return res.status(404).json({ message: 'Solar price not found' });
    }
    res.status(200).json(solarPrice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update solar price
exports.updateSolarPrice = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updatedSolarPrice = await SolarPrice.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedSolarPrice) {
      return res.status(404).json({ message: 'Solar price not found' });
    }
    res.status(200).json(updatedSolarPrice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete solar price
exports.deleteSolarPrice = async (req, res) => {
  try {
    const deletedSolarPrice = await SolarPrice.findByIdAndDelete(req.params.id);
    if (!deletedSolarPrice) {
      return res.status(404).json({ message: 'Solar price not found' });
    }
    res.status(200).json({ 
      message: 'Solar price deleted successfully',
      id: req.params.id 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCurrentPrice = async (req, res) => {
  try {
    const currentPrice = await SolarPrice.getCurrentPrice();
    res.status(200).json({
      data : currentPrice
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error getting current solar price',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};