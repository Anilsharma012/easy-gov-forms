import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { CSCCenter } from '../models/CSCCenter';
import { User } from '../models/User';
import { verifyToken, isCSC, AuthRequest, generateToken } from '../middleware/auth';
import fs from 'fs';
import path from 'path';
import { sendEmail } from '../utils/emailService';

const router = Router();

const cscUploadsDir = path.join(process.cwd(), 'uploads', 'csc');
if (!fs.existsSync(cscUploadsDir)) {
  fs.mkdirSync(cscUploadsDir, { recursive: true });
}

function saveBase64File(base64Data: string, fileName: string, centerId: string): { fileName: string; filePath: string } {
  const centerDir = path.join(cscUploadsDir, centerId);
  if (!fs.existsSync(centerDir)) {
    fs.mkdirSync(centerDir, { recursive: true });
  }
  
  const cleanBase64 = base64Data.replace(/^data:.*;base64,/, '');
  const buffer = Buffer.from(cleanBase64, 'base64');
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/\.\./g, '');
  const uniqueFileName = `${Date.now()}_${sanitizedFileName}`;
  const fullPath = path.join(centerDir, uniqueFileName);
  
  fs.writeFileSync(fullPath, buffer);
  
  return {
    fileName: uniqueFileName,
    filePath: `/uploads/csc/${centerId}/${uniqueFileName}`,
  };
}

router.post('/register', async (req, res: Response) => {
  try {
    const { 
      centerName, ownerName, email, mobile, password, 
      address, district, state, pincode, cscId, registrationNumber,
      addressProof, identityProof, photo
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
      password: hashedPassword,
      role: 'csc',
      city: district,
      state,
    });
    await user.save();

    const tempCenterId = user._id.toString();
    const documents: any[] = [];
    
    if (addressProof && addressProof.fileData && addressProof.fileName) {
      const saved = saveBase64File(addressProof.fileData, addressProof.fileName, tempCenterId);
      documents.push({
        type: 'addressProof',
        fileName: saved.fileName,
        originalFileName: addressProof.fileName,
        filePath: saved.filePath,
        status: 'pending',
        uploadedAt: new Date(),
      });
    }
    
    if (identityProof && identityProof.fileData && identityProof.fileName) {
      const saved = saveBase64File(identityProof.fileData, identityProof.fileName, tempCenterId);
      documents.push({
        type: 'identityProof',
        fileName: saved.fileName,
        originalFileName: identityProof.fileName,
        filePath: saved.filePath,
        status: 'pending',
        uploadedAt: new Date(),
      });
    }
    
    if (photo && photo.fileData && photo.fileName) {
      const saved = saveBase64File(photo.fileData, photo.fileName, tempCenterId);
      documents.push({
        type: 'photo',
        fileName: saved.fileName,
        originalFileName: photo.fileName,
        filePath: saved.filePath,
        status: 'pending',
        uploadedAt: new Date(),
      });
    }

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
      registrationNumber,
      status: 'pending',
      documents,
    });
    await cscCenter.save();

    // Send Registration Notification
    await sendEmail(
      email,
      'CSC Center Registration Received',
      `Hello ${ownerName},\n\nYour CSC Center registration for "${centerName}" has been received and is currently under review by our admin team. You will be notified once your account is verified.`,
      `<h1>CSC Center Registration Received</h1><p>Hello ${ownerName},</p><p>Your CSC Center registration for <strong>"${centerName}"</strong> has been received and is currently under review by our admin team.</p><p>You will be notified once your account is verified.</p>`
    );

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

    if (cscCenter.status === 'pending') {
      return res.status(403).json({ 
        message: 'Your account is pending verification. You can login once an admin approves your registration.' 
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
