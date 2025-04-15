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
      jamKerja: { type: Number, default: 0 },
      costPerHour: { type: Number, default: 0 }
    },
    equipment: {
      jumlah: { type: Number, default: 0 },
      jumlahUnit: { type: Number, default: 0 },
      jamKerja: { type: Number, default: 0 },
      jamPakai: { type: Number, default: 0 },
      jumlahSolar: { type: Number, default: 0 },
      costPerHour: { type: Number, default: 0 },
      fuelUsage: { type: Number, default: 0 },
      fuelPrice: { type: Number, default: 0 }
    },
    material: {
      materialUnit: { type: mongoose.Schema.Types.ObjectId, ref: 'MaterialUnit' },
      jumlahUnit: { type: Number, default: 0 },
      pricePerUnit: { type: Number, default: 0 }
    },
    security: {
      nominal: { type: Number, default: 0 },
      jumlahOrang: { type: Number, default: 0 },
      dailyCost: { type: Number, default: 0 }
    },
    other: {
      nominal: { type: Number, default: 0 }
    }
  },
  itemCostDetails: {
    type: mongoose.Schema.Types.Mixed
  },
  totalCost: {
    type: Number,
    default: 0
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
  mandor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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
    // Convert mandor string ID to ObjectId if needed
    if (this.mandor && typeof this.mandor === 'string' && mongoose.Types.ObjectId.isValid(this.mandor)) {
      this.mandor = new mongoose.Types.ObjectId(this.mandor);
    }
    
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
        let costAmount = 0;
        const costDoc = await ItemCost.findById(cost.itemCost);
        
        if (costDoc) {
          const category = costDoc.kategori || (cost.itemCostDetails ? cost.itemCostDetails.category : null);
          
          switch(category) {
            case 'manpower':
              cost.unit = 'man-hour';
              costAmount = (cost.details.manpower?.costPerHour || 0) * 
                (cost.details.manpower?.jamKerja || 0) *
                (cost.details.manpower?.jumlahOrang || 0);
              break;
  
            case 'equipment':
              cost.unit = 'equipment-hour';
              costAmount = (cost.details.equipment?.costPerHour || 0) * 
                (cost.details.equipment?.jamKerja || 0) *
                (cost.details.equipment?.jumlahUnit || cost.details.equipment?.jumlah || 0) +
                (cost.details.equipment?.fuelUsage || 0) * 
                (cost.details.equipment?.fuelPrice || 0);
              break;
  
            case 'material':
              cost.unit = 'unit';
              costAmount = (cost.details.material?.pricePerUnit || 0) * 
                (cost.details.material?.jumlahUnit || 0);
              break;
  
            case 'security':
              cost.unit = 'day';
              costAmount = (cost.details.security?.dailyCost || 0) *
                (cost.details.security?.jumlahOrang || 0);
              break;
  
            default:
              cost.unit = 'nominal';
              costAmount = cost.details.other?.nominal || 0;
          }
          
          // Store the calculated cost
          cost.totalCost = costAmount;
          
          // Add to the total
          this.totalCostUsed += costAmount;
        }
      }
    }

    // Calculate grand total
    this.grandTotal = this.totalProgressItem + this.totalCostUsed;
    next();
  } catch (error) {
    console.error('Error in pre-save middleware:', error);
    next(error);
  }
});

module.exports = mongoose.model('SpkProgress', spkProgressSchema);