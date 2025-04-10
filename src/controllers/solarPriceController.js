const SolarPrice = require('../models/SolarPrice');

// Create new solar price
exports.createSolarPrice = async (req, res) => {
  try {
    const { price } = req.body;
    
    if (!price) {
      return res.status(400).json({ message: 'Price is required' });
    }

    const newSolarPrice = new SolarPrice({ price });
    const savedPrice = await newSolarPrice.save();
    
    res.status(201).json(savedPrice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get latest solar price
exports.getLatestSolarPrice = async (req, res) => {
  try {
    const latestPrice = await SolarPrice.findOne()
      .sort({ createdAt: -1 });
    
    if (!latestPrice) {
      return res.status(404).json({ message: 'No solar price found' });
    }
    
    res.status(200).json(latestPrice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all solar prices
exports.getAllSolarPrices = async (req, res) => {
  try {
    const prices = await SolarPrice.find().sort({ createdAt: -1 });
    res.status(200).json(prices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update solar price
exports.updateSolarPrice = async (req, res) => {
  try {
    const { price } = req.body;
    const { id } = req.params;

    if (!price) {
      return res.status(400).json({ message: 'Price is required' });
    }

    const updatedPrice = await SolarPrice.findByIdAndUpdate(
      id,
      { price },
      { new: true, runValidators: true }
    );

    if (!updatedPrice) {
      return res.status(404).json({ message: 'Solar price not found' });
    }

    res.status(200).json(updatedPrice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete solar price
exports.deleteSolarPrice = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPrice = await SolarPrice.findByIdAndDelete(id);

    if (!deletedPrice) {
      return res.status(404).json({ message: 'Solar price not found' });
    }

    res.status(200).json({ message: 'Solar price deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};