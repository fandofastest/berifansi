const mongoose = require('mongoose');

// Cost Used Schema
const costUsedSchema = new mongoose.Schema({
  itemCost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ItemCost',
    required: true
  },

  details: {
    manpower: {
      jumlahOrang: { type: Number, default: 0 },
      jamKerja: { type: Number, default: 0 }
    },
    equipment: {
      jumlah: { type: Number, default: 0 }, // Add this line
      jamPakai: { type: Number, default: 0 },
      jumlahSolar: { type: Number, default: 0 }
    },
    material: {
      materialUnit: { type: mongoose.Schema.Types.ObjectId, ref: 'MaterialUnit' },
      jumlahUnit: { type: Number, default: 0 }
    },
    security: {
      nominal: { type: Number, default: 0 }
    },
    other: {
      nominal: { type: Number, default: 0 }
    }
  }
}, { _id: false });

// SPK Progress Item Schema
const spkProgressItemSchema = new mongoose.Schema({
  spkItemSnapshot: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  workQty: {
    quantity: {
      nr: { type: Number, default: 0 },
      r: { type: Number, default: 0 }
    },
    amount: { type: Number, default: 0 }
  },
  unitRate: {
    nonRemoteAreas: { type: Number, default: 0 },
    remoteAreas: { type: Number, default: 0 }
  }
}, { _id: false });

// Main SPK Progress Schema
const spkProgressSchema = new mongoose.Schema({
  spk: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Spk',
    required: true
  },
  progressItems: [spkProgressItemSchema],
  progressDate: {
    type: Date,
    default: Date.now
  },
  timeDetails: {
    startTime: { type: Date },
    endTime: { type: Date },
    dcuTime: { type: Date }
  },
  images: {
    startImage: { type: String }, // URL or path to image
    endImage: { type: String },
    dcuImage: { type: String }
  },
  costUsed: [{
    type: costUsedSchema,
    required: true
  }],
  totalProgressItem: {
    type: Number,
    default: 0
  },
  totalCostUsed: {
    type: Number,
    default: 0
  },
  grandTotal: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Pre-save middleware
spkProgressSchema.pre('save', async function(next) {
  try {
    const ItemCost = mongoose.model('ItemCost');
    
    // Calculate total progress items
    this.totalProgressItem = this.progressItems.reduce(
      (sum, item) => sum + (item.workQty.amount || 0), 0
    );

    // Initialize total cost
    this.totalCostUsed = 0;

    // Calculate total cost used for each cost entry
    if (this.costUsed && this.costUsed.length > 0) {
      for (const cost of this.costUsed) {
        const costDoc = await ItemCost.findById(cost.itemCost);
        if (costDoc) {
          switch(costDoc.kategori) {
            case 'manpower':
              this.costUsed.unit = 'man-hour';
              this.totalCostUsed = (costDoc.details.manpowerDetails?.costPerHour || 0) * 
                (this.costUsed.details.manpower?.jamKerja || 0) +
                (costDoc.details.manpowerDetails?.costPerMonth || 0) * 
                (this.costUsed.details.manpower?.jumlahOrang || 0);
              break;
  
              case 'equipment':
                this.costUsed.unit = 'equipment-hour';
                this.totalCostUsed = (costDoc.details.equipmentDetails?.costPerHour || 0) * 
                  (this.costUsed.details.equipment?.jamPakai || 0) *
                  (this.costUsed.details.equipment?.jumlah || 0) + // Add quantity multiplier
                  (costDoc.details.equipmentDetails?.fuelConsumptionPerHour || 0) * 
                  (this.costUsed.details.equipment?.jumlahSolar || 0);
                break;
  
            case 'material':
              this.costUsed.unit = costDoc.details.materialDetails?.materialUnit || 'unit';
              this.totalCostUsed = (costDoc.details.materialDetails?.pricePerUnit || 0) * 
                (this.costUsed.details.material?.jumlahUnit || 0);
              break;
  
            case 'security':
              this.costUsed.unit = 'day';
              this.totalCostUsed = this.costUsed.details.security?.nominal || 0;
              break;
  
            default:
              this.costUsed.unit = 'nominal';
              this.totalCostUsed = this.costUsed.details.other?.nominal || 0;
          }
  
          // Clean up irrelevant details
          const categories = ['manpower', 'equipment', 'material', 'security', 'other'];
          categories.forEach(cat => {
            if (cat !== costDoc.kategori) {
              this.costUsed.details[cat] = undefined;
            }
          });
        }
        // Add the individual cost to total
        this.totalCostUsed += cost.totalCostUsed;
      }
    }

    // Calculate grand total
    this.grandTotal = this.totalProgressItem + this.totalCostUsed;
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('SpkProgress', spkProgressSchema);