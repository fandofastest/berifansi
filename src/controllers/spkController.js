const Spk = require('../models/Spk');
const Item = require('../models/Item');
const { validationResult } = require('express-validator');

// Get all SPKs
exports.getAllSpks = async (req, res) => {
  try {
    const spks = await Spk.find()
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

// Create new SPK
exports.createSpk = async (req, res) => {
  try {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    // Pre-process items to add unitRate from the item's rate
    const processedItems = [];
    
    for (const spkItem of req.body.items) {
      console.log('Processing item:', spkItem.item);
      
      const item = await Item.findById(spkItem.item);
      if (!item) {
        console.log('Item not found:', spkItem.item);
        return res.status(400).json({ message: `Item ${spkItem.item} not found` });
      }
      console.log('Found item:', item.itemCode);

      const selectedRate = item.rates.find(rate => rate.rateCode === spkItem.rateCode);
      if (!selectedRate) {
        console.log('Rate not found:', spkItem.rateCode, 'for item:', item.itemCode);
        return res.status(400).json({ 
          message: `Rate code ${spkItem.rateCode} not found for item ${item.itemCode}` 
        });
      }
      console.log('Found rate:', selectedRate);
      
      // Add unitRate from item's rate
      processedItems.push({
        ...spkItem,
        unitRate: {
          nonRemoteAreas: selectedRate.nonRemoteAreas,
          remoteAreas: selectedRate.remoteAreas
        }
      });
    }
    
    // Replace the items with processed items that include unitRate
    req.body.items = processedItems;
    console.log('Processed items:', JSON.stringify(req.body.items, null, 2));

    const newSpk = new Spk(req.body);
    console.log('SPK before save:', newSpk);
    
    const savedSpk = await newSpk.save();
    console.log('SPK saved with ID:', savedSpk._id);
    
    const populatedSpk = await Spk.findById(savedSpk._id)
      .populate({
        path: 'items.item',
        populate: {
          path: 'category subCategory'
        }
      });

    res.status(201).json(populatedSpk);
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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    if (req.body.items) {
      // Validate all items and rates exist
      for (const spkItem of req.body.items) {
        const item = await Item.findById(spkItem.item);
        if (!item) {
          return res.status(400).json({ message: `Item ${spkItem.item} not found` });
        }

        const rateExists = item.rates.some(rate => rate.rateCode === spkItem.rateCode);
        if (!rateExists) {
          return res.status(400).json({ 
            message: `Rate code ${spkItem.rateCode} not found for item ${item.itemCode}` 
          });
        }
      }
    }

    const updatedSpk = await Spk.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate({
      path: 'items.item',
      populate: {
        path: 'category subCategory'
      }
    });

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