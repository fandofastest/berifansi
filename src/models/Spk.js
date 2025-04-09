const mongoose = require('mongoose');
const spkItemSchema = require('./SpkItem');

const spkSchema = new mongoose.Schema({
  spkNo: {
    type: String,
    required: true,
    unique: true
  },
  spkTitle: {
    type: String,
    required: true
  },
  // Tanggal mulai pengerjaan proyek
  projectStartDate: {
    type: Date,
    required: true
  },
  // Tanggal selesai pengerjaan proyek
  projectEndDate: {
    type: Date,
    required: true
  },
  // Daftar item dalam SPK
  items: {
    type: [spkItemSchema],
    default: []
  },
  // Status SPK
  status: {
    type: String,
    enum: ['draft', 'active', 'completed', 'cancelled'],
    default: 'draft'
  },
  // Total amount dari semua items
  totalAmount: {
    type: Number,
    default: 0
  }
}, { 
  timestamps: true 
});

// Pre-save middleware untuk menghitung total amount
spkSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    this.totalAmount = this.items.reduce((total, item) => total + item.estQty.amount, 0);
  }
  next();
});

// Virtual untuk durasi proyek dalam hari
spkSchema.virtual('projectDuration').get(function() {
  return Math.ceil((this.projectEndDate - this.projectStartDate) / (1000 * 60 * 60 * 24));
});

// Ensure virtuals are included when converting document to JSON
spkSchema.set('toJSON', { virtuals: true });
spkSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Spk', spkSchema);