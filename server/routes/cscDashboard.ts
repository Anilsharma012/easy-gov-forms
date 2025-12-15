import { Router, Response } from 'express';
import { verifyToken, isCSC, AuthRequest } from '../middleware/auth';
import { CSCCenter } from '../models/CSCCenter';
import { CSCPackageAssignment } from '../models/CSCPackageAssignment';
import { CSCLeadPackage } from '../models/CSCLeadPackage';
import { Lead } from '../models/Lead';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

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
    const pendingLeads = leads.filter(l => l.status === 'new' || l.status === 'in-progress').length;
    const convertedLeads = leads.filter(l => l.status === 'completed').length;

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

router.get('/available-packages', verifyToken, isCSC, async (req: AuthRequest, res: Response) => {
  try {
    const packages = await CSCLeadPackage.find({ isActive: true }).sort({ leads: 1 });
    res.json({ packages });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch packages' });
  }
});

router.put('/leads/:leadId/status', verifyToken, isCSC, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { leadId } = req.params;
    const { status, notes } = req.body;

    const cscCenter = await CSCCenter.findOne({ userId });
    if (!cscCenter) {
      return res.status(404).json({ message: 'CSC Center not found' });
    }

    const lead = await Lead.findOne({ _id: leadId, assignedCenterId: cscCenter._id });
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    const previousStatus = lead.status;
    lead.status = status;
    if (notes) {
      lead.notes = notes;
    }
    await lead.save();

    if (status === 'completed' && previousStatus !== 'completed') {
      cscCenter.usedLeads += 1;
      await cscCenter.save();

      const activePackage = await CSCPackageAssignment.findOne({
        cscCenterId: cscCenter._id,
        status: 'active',
        remainingLeads: { $gt: 0 },
        expiresAt: { $gt: new Date() },
      }).sort({ createdAt: 1 });

      if (activePackage) {
        activePackage.usedLeads += 1;
        activePackage.remainingLeads -= 1;
        if (activePackage.remainingLeads <= 0) {
          activePackage.status = 'exhausted';
        }
        await activePackage.save();
      }
    }

    res.json({ message: 'Lead status updated', lead });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to update lead status' });
  }
});

router.post('/purchase-package/create-order', verifyToken, isCSC, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { packageId } = req.body;

    const cscCenter = await CSCCenter.findOne({ userId });
    if (!cscCenter) {
      return res.status(404).json({ message: 'CSC Center not found' });
    }

    if (cscCenter.status !== 'verified') {
      return res.status(400).json({ message: 'Your center must be verified to purchase packages' });
    }

    const pkg = await CSCLeadPackage.findById(packageId);
    if (!pkg || !pkg.isActive) {
      return res.status(404).json({ message: 'Package not found or not available' });
    }

    const amount = pkg.price * 100;

    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `csc_${Date.now()}`,
      notes: {
        packageId: pkg._id.toString(),
        cscCenterId: cscCenter._id.toString(),
        userId: userId || '',
        leads: String(pkg.leads),
      },
    }) as any;

    res.json({
      orderId: order.id,
      amount,
      currency: order.currency,
      packageName: pkg.name,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error: any) {
    console.error('CSC Create order error:', error);
    res.status(500).json({ message: error.message || 'Failed to create order' });
  }
});

router.post('/purchase-package/verify', verifyToken, isCSC, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const cscCenter = await CSCCenter.findOne({ userId });
    if (!cscCenter) {
      return res.status(404).json({ message: 'CSC Center not found' });
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    const order = await razorpay.orders.fetch(razorpay_order_id);
    
    const packageId = order.notes?.packageId;
    if (!packageId) {
      return res.status(400).json({ message: 'Invalid order - missing package info' });
    }

    const existingAssignment = await CSCPackageAssignment.findOne({ orderId: razorpay_order_id });
    if (existingAssignment) {
      return res.status(400).json({ message: 'This order has already been processed' });
    }

    const pkg = await CSCLeadPackage.findById(packageId);
    if (!pkg) {
      return res.status(404).json({ message: 'Package not found' });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + pkg.validity);

    const assignment = new CSCPackageAssignment({
      cscCenterId: cscCenter._id,
      packageId: pkg._id,
      packageName: pkg.name,
      totalLeads: pkg.leads,
      usedLeads: 0,
      remainingLeads: pkg.leads,
      expiresAt,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      amount: pkg.price,
      status: 'active',
    });

    await assignment.save();

    cscCenter.totalLeads += pkg.leads;
    await cscCenter.save();

    res.json({
      message: 'Payment verified and package assigned successfully',
      assignment,
    });
  } catch (error: any) {
    console.error('CSC Verify payment error:', error);
    res.status(500).json({ message: error.message || 'Failed to verify payment' });
  }
});

export default router;
