const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SolarPriceSchema = new Schema({
  price: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'IDR',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// Static method to get current price
SolarPriceSchema.statics.getCurrentPrice = async function() {
  try {
    const latestPrice = await this.findOne()
      .sort({ createdAt: -1 })
      .select('price currency')
      .lean();
    
    return latestPrice || { price: 0, currency: 'IDR' };
  } catch (error) {
    throw error;
  }
};

module.exports = mongoose.model('SolarPrice', SolarPriceSchema);