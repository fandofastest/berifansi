const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
exports.authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Token is invalid' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'User account is deactivated' });
    }

    // Add user to request
    req.user = {
      id: user._id,
      username: user.username,
      role: user.role
    };
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is invalid' });
  }
};

// Middleware to check if user is admin or super admin
exports.isAdmin = (req, res, next) => {
  if (req.user.role === 'admin' || req.user.role === 'super_admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied, admin privileges required' });
  }
};

// Middleware to check if user is super admin
exports.isSuperAdmin = (req, res, next) => {
  if (req.user.role === 'super_admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied, super admin privileges required' });
  }
};

// Middleware to check if user is mandor
exports.isMandor = (req, res, next) => {
  if (req.user.role === 'mandor') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied, mandor privileges required' });
  }
};