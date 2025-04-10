const Location = require('../models/Location');

// Create new location
exports.createLocation = async (req, res) => {
  try {
    console.log('Request body:', req.body); // Log incoming request
    const { name, latitude, longitude } = req.body;
    
    // Validate required fields
    if (!name || name.trim() === '' || latitude === undefined || longitude === undefined) {
      console.error('Missing required fields');
      return res.status(400).json({ 
        message: 'All fields are required: name, latitude, longitude' 
      });
    }

    // Validate latitude and longitude values
    if (isNaN(latitude) || latitude < -90 || latitude > 90) {
      console.error('Invalid latitude value:', latitude);
      return res.status(400).json({ message: 'Latitude must be between -90 and 90' });
    }

    if (isNaN(longitude) || longitude < -180 || longitude > 180) {
      console.error('Invalid longitude value:', longitude);
      return res.status(400).json({ message: 'Longitude must be between -180 and 180' });
    }

    // Check for existing location with same name
    const existingLocation = await Location.findOne({ name });
    if (existingLocation) {
      console.error('Location already exists:', name);
      return res.status(400).json({ message: 'Location with this name already exists' });
    }

    const newLocation = new Location({ 
      name, 
      latitude: parseFloat(latitude), 
      longitude: parseFloat(longitude) 
    });

    const savedLocation = await newLocation.save();
    console.log('Location created successfully:', savedLocation._id);
    res.status(201).json(savedLocation);
  } catch (error) {
    console.error('Error creating location:', error);
    res.status(400).json({ 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get all locations
exports.getAllLocations = async (req, res) => {
  try {
    const locations = await Location.find().sort({ createdAt: -1 });
    res.status(200).json(locations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single location by ID
exports.getLocationById = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }
    
    res.status(200).json(location);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update location
exports.updateLocation = async (req, res) => {
  try {
    const { name, latitude, longitude } = req.body;
    const { id } = req.params;

    const updatedLocation = await Location.findByIdAndUpdate(
      id,
      { name, latitude, longitude },
      { new: true, runValidators: true }
    );

    if (!updatedLocation) {
      return res.status(404).json({ message: 'Location not found' });
    }

    res.status(200).json(updatedLocation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete location
exports.deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedLocation = await Location.findByIdAndDelete(id);

    if (!deletedLocation) {
      return res.status(404).json({ message: 'Location not found' });
    }

    res.status(200).json({ message: 'Location deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};