const mongoose = require('mongoose');

const itemRateSchema = new mongoose.Schema({
  rateCode: {
    type: String,
    required: true,
    ref: 'Rate'
  },
  nonRemoteAreas: {
    type: Number,
    default: 0
  },
  remoteAreas: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const itemSchema = new mongoose.Schema({
  itemCode: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String
  },
  unitMeasurement: {
    type: String,
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  subCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubCategory'
  },
  rates: [itemRateSchema]
}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);