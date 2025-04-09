const mongoose = require('mongoose');

const rateSchema = new mongoose.Schema({
  // Kode rate yang akan digunakan sebagai referensi
  rateCode: {
    type: String,
    required: true,
    unique: true
  },
  // Tanggal berlaku rate
  effectiveDate: {
    type: Date,
    required: true
  },
  // Status aktif rate
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Rate', rateSchema);