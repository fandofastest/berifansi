const User = require('../models/User');
const bcrypt = require('bcryptjs');

const initSuperAdmin = async () => {
  try {
    // Check if super admin already exists
    const superAdminExists = await User.findOne({ role: 'super_admin' });
    
    if (!superAdminExists) {
      console.log('Creating default super admin user...');
      
      // Create default super admin
      const superAdmin = new User({
        username: 'superadmin',
        password: 'superadmin123', // This will be hashed by the pre-save hook
        name: 'Super Admin',
        email: 'superadmin@example.com',
        role: 'super_admin',
        isActive: true
      });
      
      await superAdmin.save();
      console.log('Default super admin created successfully');
      console.log('Username: superadmin');
      console.log('Password: superadmin123');
      console.log('Please change the password after first login');
    }
  } catch (error) {
    console.error('Error creating super admin:', error);
  }
};

module.exports = initSuperAdmin;