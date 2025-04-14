const SpkProgress = require('../models/SpkProgress');
const { validationResult } = require('express-validator');

// Create new SPK Progress
exports.createSpkProgress = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Validate that costUsed is an array
    if (!Array.isArray(req.body.costUsed)) {
      return res.status(400).json({ 
        message: 'costUsed must be an array'
      });
    }

    const newSpkProgress = new SpkProgress(req.body);
    const savedProgress = await newSpkProgress.save();
    
    // Populate the saved progress with related data
    const populatedProgress = await SpkProgress.findById(savedProgress._id)
      .populate('spk')
      .populate('costUsed.itemCost')
      .populate('costUsed.details.material.materialUnit');
    
    res.status(201).json(populatedProgress);
  } catch (error) {
    res.status(400).json({ 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get all SPK Progress
exports.getAllSpkProgress = async (req, res) => {
  try {
    const progress = await SpkProgress.find()
      .populate('spk')
      .populate('costUsed.itemCost')
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
    const progress = await SpkProgress.findById(req.params.id);

    if (!progress) {
      return res.status(404).json({ message: 'SPK Progress not found' });
    }

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

// Get SPK Progress by SPK ID
exports.getProgressBySpkId = async (req, res) => {
  try {
    const progress = await SpkProgress.find({ spk: req.params.spkId })
      .sort({ progressDate: -1 });

    res.status(200).json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
