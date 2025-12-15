import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { CSCCenter } from '../models/CSCCenter';
import { User } from '../models/User';
import { verifyToken, isCSC, AuthRequest, generateToken } from '../middleware/auth';

const router = Router();

router.post('/register', async (req, res: Response) => {
  try {
    const { 
      centerName, ownerName, email, mobile, password, 
      address, district, state, pincode, cscId 
    } = req.body;

    const existingCenter = await CSCCenter.findOne({ email });
    if (existingCenter) {
      return res.status(400).json({ message: 'CSC Center with this email already exists' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name: ownerName,
      email,
      phone: mobile,
      password,
      role: 'csc',
      city: district,
      state,
    });
    await user.save();

    const cscCenter = new CSCCenter({
      userId: user._id,
      centerName,
      ownerName,
      email,
      mobile,
      password: hashedPassword,
      address,
      district,
      state,
      pincode,
      cscId,
      status: 'pending',
    });
    await cscCenter.save();

    res.status(201).json({ 
      message: 'CSC Center registered successfully. Please wait for admin verification.',
      centerId: cscCenter._id,
    });
  } catch (error: any) {
    console.error('CSC Register error:', error);
    res.status(500).json({ message: error.message || 'Registration failed' });
  }
});

router.post('/login', async (req, res: Response) => {
  try {
    const { email, password } = req.body;

    const cscCenter = await CSCCenter.findOne({ email });
    if (!cscCenter) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, cscCenter.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (cscCenter.status === 'rejected') {
      return res.status(403).json({ 
        message: 'Your CSC Center registration was rejected. Please contact support.',
        reason: cscCenter.rejectionReason
      });
    }

    const user = await User.findById(cscCenter.userId);
    if (!user) {
      return res.status(404).json({ message: 'User account not found' });
    }

    const token = generateToken(user._id.toString(), 'csc');

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: 'csc',
      },
      cscCenter: {
        id: cscCenter._id,
        centerName: cscCenter.centerName,
        status: cscCenter.status,
        totalLeads: cscCenter.totalLeads,
        usedLeads: cscCenter.usedLeads,
      },
    });
  } catch (error: any) {
    console.error('CSC Login error:', error);
    res.status(500).json({ message: error.message || 'Login failed' });
  }
});

router.get('/me', verifyToken, isCSC, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const cscCenter = await CSCCenter.findOne({ userId }).select('-password');
    if (!cscCenter) {
      return res.status(404).json({ message: 'CSC Center not found' });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      cscCenter: {
        id: cscCenter._id,
        centerName: cscCenter.centerName,
        ownerName: cscCenter.ownerName,
        address: cscCenter.address,
        district: cscCenter.district,
        state: cscCenter.state,
        pincode: cscCenter.pincode,
        cscId: cscCenter.cscId,
        status: cscCenter.status,
        totalLeads: cscCenter.totalLeads,
        usedLeads: cscCenter.usedLeads,
        totalEarnings: cscCenter.totalEarnings,
        verificationRequests: cscCenter.verificationRequests,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch profile' });
  }
});

router.post('/logout', (req, res: Response) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

export default router;
