const Rate = require('../models/Rate');
const Item = require('../models/Item');

exports.getAllRates = async (req, res) => {
  try {
    const rates = await Rate.find();
    res.status(200).json(rates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createRate = async (req, res) => {
  try {
    const { rateCode, effectiveDate } = req.body;

    // Check if rate code already exists
    const existingRate = await Rate.findOne({ rateCode });
    if (existingRate) {
      return res.status(400).json({ message: 'Rate code already exists' });
    }

    const rate = new Rate({
      rateCode,
      effectiveDate,
      isActive: true
    });

    const savedRate = await rate.save();
    res.status(201).json(savedRate);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getRateById = async (req, res) => {
  try {
    const rate = await Rate.findById(req.params.id);
    if (!rate) {
      return res.status(404).json({ message: 'Rate not found' });
    }
    res.status(200).json(rate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateRate = async (req, res) => {
  try {
    const { effectiveDate, isActive } = req.body;
    
    const rate = await Rate.findById(req.params.id);
    if (!rate) {
      return res.status(404).json({ message: 'Rate not found' });
    }

    // Only allow updating effectiveDate and isActive
    if (effectiveDate) rate.effectiveDate = effectiveDate;
    if (typeof isActive === 'boolean') rate.isActive = isActive;

    const updatedRate = await rate.save();
    res.status(200).json(updatedRate);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getRatesByItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Get all rates associated with this item
    const itemRates = item.rates.map(rate => ({
      rateCode: rate.rateCode,
      nonRemoteAreas: rate.nonRemoteAreas,
      remoteAreas: rate.remoteAreas
    }));

    // Get the full rate details for each rate code
    const rateDetails = await Rate.find({
      rateCode: { $in: item.rates.map(r => r.rateCode) }
    });

    // Combine item rates with rate details
    const combinedRates = itemRates.map(itemRate => {
      const rateDetail = rateDetails.find(r => r.rateCode === itemRate.rateCode);
      return {
        ...itemRate,
        effectiveDate: rateDetail?.effectiveDate,
        isActive: rateDetail?.isActive
      };
    });

    res.status(200).json(combinedRates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteRate = async (req, res) => {
  try {
    const rate = await Rate.findById(req.params.id);
    if (!rate) {
      return res.status(404).json({ message: 'Rate not found' });
    }

    // Find all items using this rate
    const items = await Item.find({ 'rates.rateCode': rate.rateCode });

    // Remove the rate from all items that use it
    await Promise.all(items.map(async (item) => {
      item.rates = item.rates.filter(r => r.rateCode !== rate.rateCode);
      await item.save();
    }));

    // Delete the rate
    await Rate.findByIdAndDelete(req.params.id);

    res.status(200).json({ 
      message: 'Rate deleted successfully',
      affectedItems: items.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRatesByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const rates = await Rate.find({ _id: productId })
      .populate('item', 'itemCode description')
      .sort({ effectiveDate: -1 });
    
    if (!rates || rates.length === 0) {
      return res.status(404).json({ message: 'No rates found for this product' });
    }
    
    res.status(200).json(rates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};