const mongoose = require('mongoose');

const materialUnitSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true  // Menjamin nama unit tidak duplikat.
  }
}, { timestamps: true }); // Added timestamps for consistency

module.exports = mongoose.model('MaterialUnit', materialUnitSchema);