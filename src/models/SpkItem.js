const mongoose = require('mongoose');

const spkItemSchema = new mongoose.Schema({
  // Reference ke model Item (berdasarkan _id item)
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  // Rate code yang digunakan untuk item ini
  rateCode: {
    type: String,
    required: true
  },
  // Estimated Quantity (PGN) beserta amount-nya
  estQty: {
    quantity: {
      nr: { type: Number, default: 0 },
      r: { type: Number, default: 0 }
    },
    amount: { type: Number, default: 0 }
  },
  // Unit rate yang diambil dari Item.rates saat saving
  unitRate: {
    nonRemoteAreas: { type: Number, default: 0 },
    remoteAreas: { type: Number, default: 0 }
  }
}, { _id: false });

// Pre-save middleware untuk mengambil rate dari Item dan menghitung amount
spkItemSchema.pre('save', async function(next) {
  const Item = mongoose.model('Item');
  const item = await Item.findById(this.item);
  
  if (item) {
    const selectedRate = item.rates.find(rate => rate.rateCode === this.rateCode);
    if (selectedRate) {
      // Ambil rate dari Item dan simpan ke unitRate
      this.unitRate.nonRemoteAreas = selectedRate.nonRemoteAreas;
      this.unitRate.remoteAreas = selectedRate.remoteAreas;
      
      // Hitung amount berdasarkan rate yang diambil
      this.estQty.amount = 
        (this.unitRate.nonRemoteAreas * this.estQty.quantity.nr) +
        (this.unitRate.remoteAreas * this.estQty.quantity.r);
    }
  }
  next();
});

module.exports = spkItemSchema;