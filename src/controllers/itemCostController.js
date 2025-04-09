const ItemCost = require('../models/Costs/itemCost'); // Updated path
const MaterialUnit = require('../models/Costs/materialUnit'); // Required for population
const { validationResult } = require('express-validator');

// Create new ItemCost
exports.createItemCost = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const newItemCost = new ItemCost(req.body);
    const savedItemCost = await newItemCost.save();
    res.status(201).json(savedItemCost);
  } catch (error) {
    console.error("Error creating ItemCost:", error); // Added logging
    res.status(400).json({ message: error.message });
  }
};

// Get all ItemCosts
exports.getAllItemCosts = async (req, res) => {
  try {
    // Optionally add query parameters for filtering, sorting, pagination
    const itemCosts = await ItemCost.find().populate({
        path: 'details.materialDetails.materialUnit',
        model: 'MaterialUnit' // Explicitly specify model if needed
    });
    res.status(200).json(itemCosts);
  } catch (error) {
    console.error("Error getting all ItemCosts:", error); // Added logging
    res.status(500).json({ message: error.message });
  }
};

// Get ItemCost by ID
exports.getItemCostById = async (req, res) => {
  try {
    const itemCost = await ItemCost.findById(req.params.id).populate({
        path: 'details.materialDetails.materialUnit',
        model: 'MaterialUnit'
    });
    if (!itemCost) {
      return res.status(404).json({ message: 'ItemCost not found' });
    }
    res.status(200).json(itemCost);
  } catch (error) {
    console.error(`Error getting ItemCost by ID ${req.params.id}:`, error); // Added logging
    // Handle potential CastError if ID format is invalid
    if (error.kind === 'ObjectId') {
        return res.status(400).json({ message: 'Invalid ItemCost ID format' });
    }
    res.status(500).json({ message: error.message });
  }
};

// Update ItemCost by ID
exports.updateItemCost = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Ensure the category-specific details logic in the pre-save hook works correctly on update
    // findByIdAndUpdate might bypass some middleware, though runValidators: true helps.
    // Consider findById and then save() if complex pre-save logic is critical for updates.
    const updatedItemCost = await ItemCost.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true } // Return updated doc and run schema validators
    ).populate({ // Re-populate after update
        path: 'details.materialDetails.materialUnit',
        model: 'MaterialUnit'
    });

    if (!updatedItemCost) {
      return res.status(404).json({ message: 'ItemCost not found' });
    }
    res.status(200).json(updatedItemCost);
  } catch (error) {
    console.error(`Error updating ItemCost ${req.params.id}:`, error); // Added logging
    // Handle potential CastError if ID format is invalid
    if (error.kind === 'ObjectId') {
        return res.status(400).json({ message: 'Invalid ItemCost ID format' });
    }
    res.status(400).json({ message: error.message });
  }
};

// Delete ItemCost by ID
exports.deleteItemCost = async (req, res) => {
  try {
    const deletedItemCost = await ItemCost.findByIdAndDelete(req.params.id);
    if (!deletedItemCost) {
      return res.status(404).json({ message: 'ItemCost not found' });
    }
    res.status(200).json({ message: 'ItemCost deleted successfully', _id: req.params.id }); // Return ID for frontend confirmation
  } catch (error) {
    console.error(`Error deleting ItemCost ${req.params.id}:`, error); // Added logging
    // Handle potential CastError if ID format is invalid
    if (error.kind === 'ObjectId') {
        return res.status(400).json({ message: 'Invalid ItemCost ID format' });
    }
    res.status(500).json({ message: error.message });
  }
};