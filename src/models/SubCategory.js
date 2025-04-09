const mongoose = require('mongoose');

const subCategorySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  // Mereferensikan collection Category
  category: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category', 
    required: true 
  }
}, { timestamps: true });

module.exports = mongoose.model('SubCategory', subCategorySchema);