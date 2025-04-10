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

module.exports = mongoose.model('SolarPrice', SolarPriceSchema);