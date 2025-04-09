const Item = require('../models/Item');
const Rate = require('../models/Rate');
const { validationResult } = require('express-validator');

// Get all items
exports.getAllItems = async (req, res) => {
  try {
    const items = await Item.find()
      .populate('category')
      .populate('subCategory')
      .populate('rates');
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single item by ID
exports.getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('category')
      .populate('subCategory')
      .populate('rates');
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new item
exports.createItem = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const newItem = new Item(req.body);
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update an item
exports.updateItem = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete an item
exports.deleteItem = async (req, res) => {
  try {
    const deletedItem = await Item.findByIdAndDelete(req.params.id);
    if (!deletedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get items by category
exports.getItemsByCategory = async (req, res) => {
  try {
    const items = await Item.find({ category: req.params.categoryId })
      .populate('category')
      .populate('subCategory')
      .populate('rates');
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get items by subcategory
exports.getItemsBySubCategory = async (req, res) => {
  try {
    const items = await Item.find({ subCategory: req.params.subCategoryId })
      .populate('category')
      .populate('subCategory')
      .populate('rates');
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addItemRate = async (req, res) => {
  try {
    const { rateCode, nonRemoteAreas, remoteAreas } = req.body;
    
    // Check if rate exists
    const rate = await Rate.findOne({ rateCode });
    if (!rate) {
      return res.status(404).json({ message: 'Rate code not found' });
    }

    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if rate already exists for this item
    if (item.rates.some(r => r.rateCode === rateCode)) {
      return res.status(400).json({ message: 'Rate already exists for this item' });
    }

    item.rates.push({
      rateCode,
      nonRemoteAreas,
      remoteAreas
    });

    const updatedItem = await item.save();
    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateItemRate = async (req, res) => {
  try {
    const { rateCode, nonRemoteAreas, remoteAreas } = req.body;
    
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const rateIndex = item.rates.findIndex(r => r.rateCode === rateCode);
    if (rateIndex === -1) {
      return res.status(404).json({ message: 'Rate not found for this item' });
    }

    item.rates[rateIndex] = {
      rateCode,
      nonRemoteAreas,
      remoteAreas
    };

    const updatedItem = await item.save();
    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.removeItemRate = async (req, res) => {
  try {
    const { rateCode } = req.params;
    
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    item.rates = item.rates.filter(r => r.rateCode !== rateCode);
    const updatedItem = await item.save();
    
    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.activateItemRate = async (req, res) => {
  try {
    const { itemId, rateCode } = req.params;

    // First deactivate all rates for this item
    await Item.updateOne(
      { _id: itemId },
      { $set: { "rates.$[].isActive": false } }
    );

    // Then activate the specified rate
    const updatedItem = await Item.findOneAndUpdate(
      { _id: itemId, "rates.rateCode": rateCode },
      { $set: { "rates.$.isActive": true } },
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: 'Item or rate code not found' });
    }

    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};