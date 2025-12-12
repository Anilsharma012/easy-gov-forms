import { connectDB } from '../db';
import { User } from '../models/User';

async function createDefaultAdmin() {
  try {
    await connectDB();

    const adminEmail = 'admin@easygov.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    const admin = new User({
      name: 'Admin',
      email: adminEmail,
      phone: '9999999999',
      password: 'admin123',
      role: 'admin',
      isActive: true,
    });

    await admin.save();
    console.log('Default admin created successfully!');
    console.log('Email: admin@easygov.com');
    console.log('Password: admin123');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

createDefaultAdmin();
