import { Router, Response } from 'express';
import { verifyToken, isCSC, AuthRequest } from '../middleware/auth';
import { CSCCenter } from '../models/CSCCenter';
import { CSCPackageAssignment } from '../models/CSCPackageAssignment';
import { Lead } from '../models/Lead';

const router = Router();

router.get('/stats', verifyToken, isCSC, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const cscCenter = await CSCCenter.findOne({ userId });
    
    if (!cscCenter) {
      return res.status(404).json({ message: 'CSC Center not found' });
    }

    const activePackages = await CSCPackageAssignment.find({
      cscCenterId: cscCenter._id,
      status: 'active',
      expiresAt: { $gt: new Date() },
    });

    const totalRemainingLeads = activePackages.reduce((sum, pkg) => sum + pkg.remainingLeads, 0);

    const leads = await Lead.find({ assignedCenterId: cscCenter._id });
    const pendingLeads = leads.filter(l => l.status === 'pending').length;
    const convertedLeads = leads.filter(l => l.status === 'converted').length;

    res.json({
      stats: {
        totalLeads: cscCenter.totalLeads,
        usedLeads: cscCenter.usedLeads,
        remainingLeads: totalRemainingLeads,
        pendingLeads,
        convertedLeads,
        totalEarnings: cscCenter.totalEarnings,
        centerStatus: cscCenter.status,
        activePackages: activePackages.length,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch stats' });
  }
});

router.get('/leads', verifyToken, isCSC, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const cscCenter = await CSCCenter.findOne({ userId });
    
    if (!cscCenter) {
      return res.status(404).json({ message: 'CSC Center not found' });
    }

    const leads = await Lead.find({ assignedCenterId: cscCenter._id })
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ leads });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch leads' });
  }
});

router.get('/packages', verifyToken, isCSC, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const cscCenter = await CSCCenter.findOne({ userId });
    
    if (!cscCenter) {
      return res.status(404).json({ message: 'CSC Center not found' });
    }

    await CSCPackageAssignment.updateMany(
      { cscCenterId: cscCenter._id, expiresAt: { $lt: new Date() }, status: 'active' },
      { status: 'expired' }
    );

    const packages = await CSCPackageAssignment.find({ cscCenterId: cscCenter._id })
      .populate('packageId')
      .sort({ createdAt: -1 });

    res.json({ packages });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch packages' });
  }
});

router.get('/verification-requests', verifyToken, isCSC, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const cscCenter = await CSCCenter.findOne({ userId });
    
    if (!cscCenter) {
      return res.status(404).json({ message: 'CSC Center not found' });
    }

    res.json({ 
      verificationRequests: cscCenter.verificationRequests,
      status: cscCenter.status,
      rejectionReason: cscCenter.rejectionReason,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch verification requests' });
  }
});

router.post('/submit-verification', verifyToken, isCSC, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { requestId, fileData, fileName } = req.body;
    
    const cscCenter = await CSCCenter.findOne({ userId });
    if (!cscCenter) {
      return res.status(404).json({ message: 'CSC Center not found' });
    }

    const request = cscCenter.verificationRequests.find(r => r._id?.toString() === requestId);
    if (!request) {
      return res.status(404).json({ message: 'Verification request not found' });
    }

    request.status = 'submitted';
    request.submittedAt = new Date();
    request.fileUrl = fileData;

    await cscCenter.save();

    res.json({ message: 'Verification submitted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to submit verification' });
  }
});

router.put('/profile', verifyToken, isCSC, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { centerName, address, district, state, pincode, mobile } = req.body;
    
    const cscCenter = await CSCCenter.findOneAndUpdate(
      { userId },
      { centerName, address, district, state, pincode, mobile },
      { new: true }
    ).select('-password');
    
    if (!cscCenter) {
      return res.status(404).json({ message: 'CSC Center not found' });
    }

    res.json({ message: 'Profile updated', cscCenter });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to update profile' });
  }
});

export default router;
