const MaterialUnit = require('../models/Costs/materialUnit');
const { validationResult } = require('express-validator');

// Create new MaterialUnit
exports.createMaterialUnit = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // Check if unit name already exists (case-insensitive check)
        const existingUnit = await MaterialUnit.findOne({ name: { $regex: new RegExp(`^${req.body.name}$`, 'i') } });
        if (existingUnit) {
            return res.status(400).json({ message: `Material unit '${req.body.name}' already exists.` });
        }

        const newMaterialUnit = new MaterialUnit({
            name: req.body.name // Ensure name is trimmed and maybe standardized (e.g., lowercase) if needed
        });
        const savedMaterialUnit = await newMaterialUnit.save();
        res.status(201).json(savedMaterialUnit);
    } catch (error) {
        // Handle potential duplicate key errors during save if regex check fails race condition
        if (error.code === 11000) {
             return res.status(400).json({ message: `Material unit '${req.body.name}' already exists.` });
        }
        console.error("Error creating MaterialUnit:", error);
        res.status(500).json({ message: error.message });
    }
};

// Get all MaterialUnits
exports.getAllMaterialUnits = async (req, res) => {
    try {
        const materialUnits = await MaterialUnit.find().sort({ name: 1 }); // Sort alphabetically
        res.status(200).json(materialUnits);
    } catch (error) {
        console.error("Error getting all MaterialUnits:", error);
        res.status(500).json({ message: error.message });
    }
};

// Get MaterialUnit by ID
exports.getMaterialUnitById = async (req, res) => {
    try {
        const materialUnit = await MaterialUnit.findById(req.params.id);
        if (!materialUnit) {
            return res.status(404).json({ message: 'MaterialUnit not found' });
        }
        res.status(200).json(materialUnit);
    } catch (error) {
        console.error(`Error getting MaterialUnit by ID ${req.params.id}:`, error);
         if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid MaterialUnit ID format' });
        }
        res.status(500).json({ message: error.message });
    }
};

// Update MaterialUnit by ID
exports.updateMaterialUnit = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // Check if the new name already exists (excluding the current document)
        const existingUnit = await MaterialUnit.findOne({
            name: { $regex: new RegExp(`^${req.body.name}$`, 'i') },
            _id: { $ne: req.params.id } // Exclude the document being updated
        });
        if (existingUnit) {
            return res.status(400).json({ message: `Material unit name '${req.body.name}' already used.` });
        }

        const updatedMaterialUnit = await MaterialUnit.findByIdAndUpdate(
            req.params.id,
            { name: req.body.name },
            { new: true, runValidators: true }
        );

        if (!updatedMaterialUnit) {
            return res.status(404).json({ message: 'MaterialUnit not found' });
        }
        res.status(200).json(updatedMaterialUnit);
    } catch (error) {
         if (error.code === 11000) {
             return res.status(400).json({ message: `Material unit name '${req.body.name}' already used.` });
        }
         if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid MaterialUnit ID format' });
        }
        console.error(`Error updating MaterialUnit ${req.params.id}:`, error);
        res.status(500).json({ message: error.message });
    }
};

// Delete MaterialUnit by ID
exports.deleteMaterialUnit = async (req, res) => {
    try {
        // Optional: Check if this unit is being used by any ItemCost before deleting
        // const itemCostsUsingUnit = await ItemCost.find({ 'details.materialDetails.materialUnit': req.params.id });
        // if (itemCostsUsingUnit.length > 0) {
        //     return res.status(400).json({ message: 'Cannot delete unit, it is currently used by ItemCosts.' });
        // }

        const deletedMaterialUnit = await MaterialUnit.findByIdAndDelete(req.params.id);
        if (!deletedMaterialUnit) {
            return res.status(404).json({ message: 'MaterialUnit not found' });
        }
        res.status(200).json({ message: 'MaterialUnit deleted successfully', _id: req.params.id });
    } catch (error) {
        console.error(`Error deleting MaterialUnit ${req.params.id}:`, error);
         if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid MaterialUnit ID format' });
        }
        res.status(500).json({ message: error.message });
    }
};