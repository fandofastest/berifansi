const SpkProgress = require('../models/SpkProgress');
const { validationResult } = require('express-validator');

// Create new SPK Progress
exports.createSpkProgress = async (req, res) => {
  try {
    console.log('Creating SPK Progress with data:', JSON.stringify(req.body, null, 2));
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    // Validate that costUsed is an array
    if (!Array.isArray(req.body.costUsed)) {
      console.error('costUsed is not an array:', req.body.costUsed);
      return res.status(400).json({ 
        message: 'costUsed must be an array'
      });
    }

    // Check if required fields are present
    if (!req.body.spk) {
      console.error('Missing required field: spk');
      return res.status(400).json({ message: 'SPK ID is required' });
    }

    const newSpkProgress = new SpkProgress(req.body);
    console.log('SPK Progress model created, about to save');
    
    try {
      const savedProgress = await newSpkProgress.save();
      console.log('SPK Progress saved successfully with ID:', savedProgress._id);
      
      // Populate the saved progress with related data
      const populatedProgress = await SpkProgress.findById(savedProgress._id)
        .populate('spk')
        .populate('costUsed.itemCost')
        .populate('costUsed.details.material.materialUnit');
      
      res.status(201).json({
        message: 'SPK Progress created successfully',
        status : 'success',
        data: populatedProgress
      });
    } catch (saveError) {
      console.error('Error saving SPK Progress:', saveError);
      return res.status(400).json({ 
        message: 'Error saving SPK Progress',
        error: saveError.message,
        stack: process.env.NODE_ENV === 'development' ? saveError.stack : undefined
      });
    }
  } catch (error) {
    console.error('Unexpected error in createSpkProgress:', error);
    res.status(500).json({ 
      message: 'Unexpected error creating SPK Progress',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get all SPK Progress
exports.getAllSpkProgress = async (req, res) => {
  try {
    const progress = await SpkProgress.find()
      .populate({
        path: 'spk',
        populate: {
          path: 'items.item',
          select: 'name description unit category'
        }
      })
      .populate('mandor', 'name email role')
      .populate({
        path: 'costUsed.itemCost',
        select: 'item kategori details'
      })
      .populate('costUsed.details.material.materialUnit')
      .sort({ progressDate: -1 });

    res.status(200).json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get SPK Progress by ID
exports.getSpkProgressById = async (req, res) => {
  try {
    const progress = await SpkProgress.findById(req.params.id)
      .populate({
        path: 'spk',
        populate: {
          path: 'items.item',
          select: 'name description unit category'
        }
      })
      .populate('mandor', 'name email role')
      .populate({
        path: 'costUsed.itemCost',
        select: 'item kategori details'
      })
      .populate('costUsed.details.material.materialUnit');

    if (!progress) {
      return res.status(404).json({ message: 'SPK Progress not found' });
    }

    res.status(200).json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get SPK Progress by SPK ID
exports.getProgressBySpkId = async (req, res) => {
  try {
    const progress = await SpkProgress.find({ spk: req.params.spkId })
      .populate({
        path: 'spk',
        populate: {
          path: 'items.item location', // Changed 'lokasi' to 'location' and combined with items.item
          select: 'name description unit category'
        }
      })
      .populate('mandor', 'name email role')
      .populate({
        path: 'costUsed.itemCost',
        select: 'item kategori details'
      })
      .populate('costUsed.details.material.materialUnit')
      .sort({ progressDate: -1 });

    res.status(200).json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update SPK Progress
exports.updateSpkProgress = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updatedProgress = await SpkProgress.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedProgress) {
      return res.status(404).json({ message: 'SPK Progress not found' });
    }

    res.status(200).json(updatedProgress);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete SPK Progress
exports.deleteSpkProgress = async (req, res) => {
  try {
    const deletedProgress = await SpkProgress.findByIdAndDelete(req.params.id);
    
    if (!deletedProgress) {
      return res.status(404).json({ message: 'SPK Progress not found' });
    }

    res.status(200).json({ 
      message: 'SPK Progress deleted successfully',
      id: req.params.id 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
