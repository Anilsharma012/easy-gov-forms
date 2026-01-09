import { Router, Response } from 'express';
import { User } from '../models/User';
import { UserDocument } from '../models/UserDocument';
import { UserPackage } from '../models/UserPackage';
import { WalletTransaction } from '../models/WalletTransaction';
import { CSCWallet } from '../models/CSCWallet';
import IndianGovForm from '../models/IndianGovForm';
import UrgentBanner from '../models/UrgentBanner';
import { verifyToken, isAdmin, AuthRequest } from '../middleware/auth';
import { seedFormsAndBanners } from '../scripts/seedFormsAndBanners';

const router = Router();

router.get('/users', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch users' });
  }
});

router.patch('/users/:id/toggle-status', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({ message: 'User status updated', user: { id: user._id, isActive: user.isActive } });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to update user' });
  }
});

router.patch('/users/:id', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User updated successfully', user });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to update user' });
  }
});

router.delete('/users/:id', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to delete user' });
  }
});

router.get('/stats', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const activeUsers = await User.countDocuments({ role: 'user', isActive: true });
    const admins = await User.countDocuments({ role: 'admin' });
    
    res.json({
      stats: {
        totalUsers,
        activeUsers,
        admins,
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch stats' });
  }
});

// ===== DOCUMENT APPROVAL ROUTES =====

router.get('/documents', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query;
    const filter: any = {};
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    const documents = await UserDocument.find(filter)
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });
    
    res.json({ documents });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch documents' });
  }
});

router.get('/documents/stats', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const pending = await UserDocument.countDocuments({ status: 'pending' });
    const verified = await UserDocument.countDocuments({ status: 'verified' });
    const rejected = await UserDocument.countDocuments({ status: 'rejected' });
    const total = pending + verified + rejected;
    
    res.json({ stats: { pending, verified, rejected, total } });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch document stats' });
  }
});

router.patch('/documents/:id/approve', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const document = await UserDocument.findByIdAndUpdate(
      req.params.id,
      { status: 'verified', verifiedAt: new Date() },
      { new: true }
    ).populate('userId', 'name email');
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    res.json({ message: 'Document approved successfully', document });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to approve document' });
  }
});

router.patch('/documents/:id/reject', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { reason } = req.body;
    const document = await UserDocument.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'rejected', 
        rejectionReason: reason || 'Rejected by admin',
        rejectedAt: new Date()
      },
      { new: true }
    ).populate('userId', 'name email');
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    res.json({ message: 'Document rejected', document, reason: reason || 'Rejected by admin' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to reject document' });
  }
});

// ===== PAYMENT ROUTES =====

router.get('/payments', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query;
    const filter: any = {};
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    const payments = await UserPackage.find(filter)
      .populate('userId', 'name email phone')
      .populate('packageId', 'name')
      .sort({ createdAt: -1 });
    
    res.json({ payments });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch payments' });
  }
});

router.get('/payments/stats', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const totalPayments = await UserPackage.countDocuments();
    const activePackages = await UserPackage.countDocuments({ status: 'active' });
    const expiredPackages = await UserPackage.countDocuments({ status: 'expired' });
    
    const revenueResult = await UserPackage.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;
    
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    
    const monthlyRevenueResult = await UserPackage.aggregate([
      { $match: { createdAt: { $gte: thisMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const monthlyRevenue = monthlyRevenueResult[0]?.total || 0;
    
    res.json({ 
      stats: { 
        totalPayments, 
        activePackages, 
        expiredPackages, 
        totalRevenue, 
        monthlyRevenue 
      } 
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch payment stats' });
  }
});

// ===== WALLET WITHDRAWAL APPROVAL ROUTES =====

router.get('/withdrawals', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query;
    const filter: any = { type: 'withdrawal' };
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    const withdrawals = await WalletTransaction.find(filter)
      .populate({
        path: 'centerId',
        select: 'centerName ownerName email phone bankDetails'
      })
      .sort({ createdAt: -1 });
    
    res.json({ withdrawals });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch withdrawals' });
  }
});

router.get('/withdrawals/stats', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const pending = await WalletTransaction.countDocuments({ type: 'withdrawal', status: 'pending' });
    const completed = await WalletTransaction.countDocuments({ type: 'withdrawal', status: 'completed' });
    const rejected = await WalletTransaction.countDocuments({ type: 'withdrawal', status: 'rejected' });
    
    const pendingAmountResult = await WalletTransaction.aggregate([
      { $match: { type: 'withdrawal', status: 'pending' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const pendingAmount = pendingAmountResult[0]?.total || 0;
    
    const completedAmountResult = await WalletTransaction.aggregate([
      { $match: { type: 'withdrawal', status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const completedAmount = completedAmountResult[0]?.total || 0;
    
    res.json({ 
      stats: { 
        pending, 
        completed, 
        rejected, 
        pendingAmount, 
        completedAmount 
      } 
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch withdrawal stats' });
  }
});

router.patch('/withdrawals/:id/approve', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { adminNote, reference } = req.body;
    
    const withdrawal = await WalletTransaction.findById(req.params.id);
    if (!withdrawal) {
      return res.status(404).json({ message: 'Withdrawal request not found' });
    }
    
    if (withdrawal.status !== 'pending') {
      return res.status(400).json({ message: 'Withdrawal is not pending' });
    }
    
    withdrawal.status = 'completed';
    withdrawal.adminNote = adminNote || 'Approved by admin';
    withdrawal.reference = reference;
    withdrawal.processedAt = new Date();
    withdrawal.processedBy = req.user?.userId as any;
    await withdrawal.save();
    
    res.json({ message: 'Withdrawal approved successfully', withdrawal });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to approve withdrawal' });
  }
});

router.patch('/withdrawals/:id/reject', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { adminNote } = req.body;
    
    const withdrawal = await WalletTransaction.findById(req.params.id);
    if (!withdrawal) {
      return res.status(404).json({ message: 'Withdrawal request not found' });
    }
    
    if (withdrawal.status !== 'pending') {
      return res.status(400).json({ message: 'Withdrawal is not pending' });
    }
    
    // Refund the amount back to wallet
    const wallet = await CSCWallet.findById(withdrawal.walletId);
    if (wallet) {
      wallet.balance += withdrawal.amount;
      await wallet.save();
    }
    
    withdrawal.status = 'rejected';
    withdrawal.adminNote = adminNote || 'Rejected by admin';
    withdrawal.processedAt = new Date();
    withdrawal.processedBy = req.user?.userId as any;
    await withdrawal.save();
    
    res.json({ message: 'Withdrawal rejected and amount refunded to wallet', withdrawal });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to reject withdrawal' });
  }
});

// ===== INDIAN GOVERNMENT FORMS ROUTES =====

router.get('/forms', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const forms = await IndianGovForm.find().sort({ order: 1, createdAt: -1 });
    res.json({ forms });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch forms' });
  }
});

router.post('/forms', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const form = new IndianGovForm(req.body);
    await form.save();
    res.status(201).json({ message: 'Form created successfully', form });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to create form' });
  }
});

router.patch('/forms/:id', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const form = await IndianGovForm.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }
    res.json({ message: 'Form updated successfully', form });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to update form' });
  }
});

router.delete('/forms/:id', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const form = await IndianGovForm.findByIdAndDelete(req.params.id);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }
    res.json({ message: 'Form deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to delete form' });
  }
});

// ===== URGENT BANNERS ROUTES =====

router.get('/banners', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const banners = await UrgentBanner.find().sort({ priority: -1, createdAt: -1 });
    res.json({ banners });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch banners' });
  }
});

router.post('/banners', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const banner = new UrgentBanner(req.body);
    await banner.save();
    res.status(201).json({ message: 'Banner created successfully', banner });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to create banner' });
  }
});

router.patch('/banners/:id', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const banner = await UrgentBanner.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    res.json({ message: 'Banner updated successfully', banner });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to update banner' });
  }
});

router.delete('/banners/:id', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const banner = await UrgentBanner.findByIdAndDelete(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    res.json({ message: 'Banner deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to delete banner' });
  }
});

router.post('/seed-forms-banners', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const result = await seedFormsAndBanners();
    res.json({ message: 'Seed completed', ...result });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to seed data' });
  }
});

export default router;
