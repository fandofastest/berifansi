const mongoose = require('mongoose');

const itemCostSchema = new mongoose.Schema({
  nama: {
    type: String,
    required: true,
  },
  costPerMonth: {
    type: Number,
    required: true,
  },
  costPerHour: {
    type: Number,
    required: true,
  },
  kategori: {
    type: String,
    enum: ['manpower', 'equipment', 'material', 'security','other'],
    required: true,
  },
  details: {
    manpowerDetails: {
      // Contoh menyimpan aturan lembur sebagai array (opsional, hanya untuk manpower)
      overtime: [
        {
          hari: {
            type: String,
            // Contoh: "weekday", "weekend", atau nama hari spesifik.
          },
          overtimeRate: {
            type: Number,
            // Tarif lembur per jam.
          }
        }
      ]
    },
    equipmentDetails: {
      fuelConsumptionPerHour: {
        type: Number,
        min: 0,
        get: v => v ? parseFloat(v.toFixed(2)) : v,
        set: v => v ? parseFloat(parseFloat(v).toFixed(2)) : v
      },
      gpsCostPerMonth: {
        type: Number,
        min: 0
      }
    },
    materialDetails: {
      // Untuk material, unit dipisahkan ke tabel tersendiri.
      materialUnit: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MaterialUnit', // Reference to the new MaterialUnit model
        // Making it conditionally required based on category might need a pre-save hook or application logic
      },
      pricePerUnit: {
        type: Number,
        // Making it conditionally required based on category might need a pre-save hook or application logic
      }
    },
    securityDetails: {
      dailyCost: {
        type: Number, // Biaya security per hari.
      }
    }
  }
}, { timestamps: true }); // Keep timestamps

// Optional pre-save hook to handle category-specific details and requirements
itemCostSchema.pre('save', function(next) {
  const category = this.kategori;
  const details = this.details;

  // Clear details not relevant to the selected category
  if (category !== 'manpower' && details.manpowerDetails) this.details.manpowerDetails = undefined;
  if (category !== 'equipment' && details.equipmentDetails) this.details.equipmentDetails = undefined;
  if (category !== 'material' && details.materialDetails) this.details.materialDetails = undefined;
  if (category !== 'security' && details.securityDetails) this.details.securityDetails = undefined;

  // Add validation for required fields based on category
  if (category === 'material') {
    if (!details.materialDetails?.materialUnit) {
      return next(new Error('MaterialUnit is required for material category'));
    }
    if (details.materialDetails?.pricePerUnit == null) { // Check for null or undefined
      return next(new Error('PricePerUnit is required for material category'));
    }
  }
  // Add similar checks for other categories if they have required details

  next();
});


module.exports = mongoose.model('ItemCost', itemCostSchema);