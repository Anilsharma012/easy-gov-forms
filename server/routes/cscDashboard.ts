import { Router, Response } from 'express';
import { verifyToken, isCSC, AuthRequest } from '../middleware/auth';
import { CSCCenter } from '../models/CSCCenter';
import { CSCPackageAssignment } from '../models/CSCPackageAssignment';
import { CSCLeadPackage } from '../models/CSCLeadPackage';
import { Lead } from '../models/Lead';
import { CSCWallet } from '../models/CSCWallet';
import { WalletTransaction } from '../models/WalletTransaction';
import { CSCPaymentInfo } from '../models/CSCPaymentInfo';
import { CSCTask } from '../models/CSCTask';
import { Application } from '../models/Application';
import { UserDocument } from '../models/UserDocument';
import { ChatMessage } from '../models/ChatMessage';
import { CSCSupportTicket } from '../models/CSCSupportTicket';
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

router.get('/wallet', verifyToken, isCSC, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const cscCenter = await CSCCenter.findOne({ userId });
    
    if (!cscCenter) {
      return res.status(404).json({ message: 'CSC Center not found' });
    }

    let wallet = await CSCWallet.findOne({ centerId: cscCenter._id });
    if (!wallet) {
      wallet = new CSCWallet({
        centerId: cscCenter._id,
        balance: 0,
        pendingWithdrawal: 0,
        totalEarnings: 0,
        totalWithdrawn: 0,
      });
      await wallet.save();
    }

    res.json({ wallet });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch wallet' });
  }
});

router.post('/wallet/withdraw', verifyToken, isCSC, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid withdrawal amount' });
    }

    const cscCenter = await CSCCenter.findOne({ userId });
    if (!cscCenter) {
      return res.status(404).json({ message: 'CSC Center not found' });
    }

    const wallet = await CSCWallet.findOne({ centerId: cscCenter._id });
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    if (wallet.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    const paymentInfo = await CSCPaymentInfo.findOne({ centerId: cscCenter._id, status: 'verified' });
    if (!paymentInfo) {
      return res.status(400).json({ message: 'Please add and verify your payment details first' });
    }

    wallet.balance -= amount;
    wallet.pendingWithdrawal += amount;
    await wallet.save();

    const transaction = new WalletTransaction({
      walletId: wallet._id,
      centerId: cscCenter._id,
      type: 'withdrawal',
      amount,
      description: 'Withdrawal request',
      status: 'pending',
      reference: `WD-${Date.now()}`,
    });
    await transaction.save();

    res.json({ message: 'Withdrawal request submitted', transaction });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to request withdrawal' });
  }
});

router.get('/transactions', verifyToken, isCSC, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const cscCenter = await CSCCenter.findOne({ userId });
    
    if (!cscCenter) {
      return res.status(404).json({ message: 'CSC Center not found' });
    }

    const transactions = await WalletTransaction.find({ centerId: cscCenter._id })
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ transactions });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch transactions' });
  }
});

router.get('/payment-info', verifyToken, isCSC, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const cscCenter = await CSCCenter.findOne({ userId });
    
    if (!cscCenter) {
      return res.status(404).json({ message: 'CSC Center not found' });
    }

    const paymentInfo = await CSCPaymentInfo.findOne({ centerId: cscCenter._id });
    res.json({ paymentInfo });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch payment info' });
  }
});

router.post('/payment-info', verifyToken, isCSC, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { bankName, accountNumber, ifscCode, accountHolderName, accountType, upiId } = req.body;

    const cscCenter = await CSCCenter.findOne({ userId });
    if (!cscCenter) {
      return res.status(404).json({ message: 'CSC Center not found' });
    }

    let paymentInfo = await CSCPaymentInfo.findOne({ centerId: cscCenter._id });
    if (paymentInfo) {
      paymentInfo.bankName = bankName;
      paymentInfo.accountNumber = accountNumber;
      paymentInfo.ifscCode = ifscCode;
      paymentInfo.accountHolderName = accountHolderName;
      paymentInfo.accountType = accountType;
      paymentInfo.upiId = upiId;
      paymentInfo.status = 'pending';
      await paymentInfo.save();
    } else {
      paymentInfo = new CSCPaymentInfo({
        centerId: cscCenter._id,
        bankName,
        accountNumber,
        ifscCode,
        accountHolderName,
        accountType,
        upiId,
        status: 'pending',
      });
      await paymentInfo.save();
    }

    res.json({ message: 'Payment info saved', paymentInfo });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to save payment info' });
  }
});

router.get('/tasks', verifyToken, isCSC, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const cscCenter = await CSCCenter.findOne({ userId });
    
    if (!cscCenter) {
      return res.status(404).json({ message: 'CSC Center not found' });
    }

    const tasks = await CSCTask.find({ centerId: cscCenter._id })
      .populate('userId', 'name email mobile')
      .populate('leadId', 'name email mobile')
      .sort({ createdAt: -1 });

    res.json({ tasks });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch tasks' });
  }
});

router.patch('/tasks/:taskId/status', verifyToken, isCSC, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { taskId } = req.params;
    const { status } = req.body;

    const cscCenter = await CSCCenter.findOne({ userId });
    if (!cscCenter) {
      return res.status(404).json({ message: 'CSC Center not found' });
    }

    const task = await CSCTask.findOne({ _id: taskId, centerId: cscCenter._id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.status = status;
    if (status === 'completed') {
      task.completedAt = new Date();
    }
    await task.save();

    res.json({ message: 'Task status updated', task });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to update task status' });
  }
});

router.get('/jobs-applied', verifyToken, isCSC, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const cscCenter = await CSCCenter.findOne({ userId });
    
    if (!cscCenter) {
      return res.status(404).json({ message: 'CSC Center not found' });
    }

    const leads = await Lead.find({ assignedCenterId: cscCenter._id });
    const leadEmails = leads.map(l => l.email).filter(Boolean);
    const leadMobiles = leads.map(l => l.mobile).filter(Boolean);

    const applications = await Application.find({})
      .populate('jobId', 'title department applicationDeadline')
      .populate({
        path: 'userId',
        match: { $or: [{ email: { $in: leadEmails } }, { mobile: { $in: leadMobiles } }] },
        select: 'name email mobile'
      })
      .sort({ createdAt: -1 });

    const filteredApplications = applications.filter(app => app.userId);

    res.json({ applications: filteredApplications });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch jobs applied' });
  }
});

router.get('/old-documents', verifyToken, isCSC, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const cscCenter = await CSCCenter.findOne({ userId });
    
    if (!cscCenter) {
      return res.status(404).json({ message: 'CSC Center not found' });
    }

    const leads = await Lead.find({ assignedCenterId: cscCenter._id });
    const leadEmails = leads.map(l => l.email).filter(Boolean);
    const leadMobiles = leads.map(l => l.mobile).filter(Boolean);

    const documents = await UserDocument.find({})
      .populate({
        path: 'userId',
        match: { $or: [{ email: { $in: leadEmails } }, { mobile: { $in: leadMobiles } }] },
        select: 'name email mobile'
      })
      .sort({ createdAt: -1 });

    const filteredDocuments = documents.filter(doc => doc.userId);

    res.json({ documents: filteredDocuments });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch documents' });
  }
});

router.get('/users', verifyToken, isCSC, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const cscCenter = await CSCCenter.findOne({ userId });
    
    if (!cscCenter) {
      return res.status(404).json({ message: 'CSC Center not found' });
    }

    const leads = await Lead.find({ assignedCenterId: cscCenter._id })
      .sort({ createdAt: -1 });

    res.json({ users: leads });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch users' });
  }
});

router.get('/chat/users', verifyToken, isCSC, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const cscCenter = await CSCCenter.findOne({ userId });
    
    if (!cscCenter) {
      return res.status(404).json({ message: 'CSC Center not found' });
    }

    const leads = await Lead.find({ assignedCenterId: cscCenter._id })
      .sort({ createdAt: -1 });

    const users = leads.map(lead => ({
      _id: lead._id,
      name: lead.name,
      email: lead.email || '',
      type: 'lead',
      mobile: lead.mobile,
    }));

    res.json({ users });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch chat users' });
  }
});

router.get('/chat/conversations', verifyToken, isCSC, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const cscCenter = await CSCCenter.findOne({ userId });
    
    if (!cscCenter) {
      return res.status(404).json({ message: 'CSC Center not found' });
    }

    const messages = await ChatMessage.aggregate([
      {
        $match: {
          $or: [
            { senderId: cscCenter._id, senderType: 'csc' },
            { receiverId: cscCenter._id, receiverType: 'csc' },
          ],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$receiverId', cscCenter._id] }, { $eq: ['$read', false] }] },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { 'lastMessage.createdAt': -1 } },
    ]);

    res.json({ conversations: messages });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch conversations' });
  }
});

router.get('/chat/messages/:conversationId', verifyToken, isCSC, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { conversationId } = req.params;
    
    const cscCenter = await CSCCenter.findOne({ userId });
    if (!cscCenter) {
      return res.status(404).json({ message: 'CSC Center not found' });
    }

    const messages = await ChatMessage.find({ conversationId })
      .sort({ createdAt: 1 })
      .limit(100);

    await ChatMessage.updateMany(
      { conversationId, receiverId: cscCenter._id, read: false },
      { read: true, readAt: new Date() }
    );

    res.json({ messages });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch messages' });
  }
});

router.post('/chat/send', verifyToken, isCSC, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { receiverId, receiverType, content, type, fileUrl, fileName } = req.body;

    const cscCenter = await CSCCenter.findOne({ userId });
    if (!cscCenter) {
      return res.status(404).json({ message: 'CSC Center not found' });
    }

    const conversationId = [cscCenter._id.toString(), receiverId].sort().join('_');

    const message = new ChatMessage({
      senderId: cscCenter._id,
      senderType: 'csc',
      receiverId,
      receiverType,
      conversationId,
      content,
      type: type || 'text',
      fileUrl,
      fileName,
    });

    await message.save();

    res.json({ message });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to send message' });
  }
});

router.get('/support', verifyToken, isCSC, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const cscCenter = await CSCCenter.findOne({ userId });
    
    if (!cscCenter) {
      return res.status(404).json({ message: 'CSC Center not found' });
    }

    const tickets = await CSCSupportTicket.find({ centerId: cscCenter._id })
      .sort({ createdAt: -1 });

    res.json({ tickets });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch tickets' });
  }
});

router.post('/support', verifyToken, isCSC, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { subject, description, category, priority } = req.body;

    const cscCenter = await CSCCenter.findOne({ userId });
    if (!cscCenter) {
      return res.status(404).json({ message: 'CSC Center not found' });
    }

    const ticketNumber = `CSC-${Date.now().toString(36).toUpperCase()}`;

    const ticket = new CSCSupportTicket({
      centerId: cscCenter._id,
      ticketNumber,
      subject,
      description,
      category: category || 'other',
      priority: priority || 'medium',
      status: 'open',
    });

    await ticket.save();

    res.json({ message: 'Support ticket created', ticket });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to create ticket' });
  }
});

router.post('/support/:ticketId/reply', verifyToken, isCSC, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { ticketId } = req.params;
    const { message } = req.body;

    const cscCenter = await CSCCenter.findOne({ userId });
    if (!cscCenter) {
      return res.status(404).json({ message: 'CSC Center not found' });
    }

    const ticket = await CSCSupportTicket.findOne({ _id: ticketId, centerId: cscCenter._id });
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    ticket.responses.push({
      responderId: cscCenter._id,
      responderType: 'csc',
      message,
      createdAt: new Date(),
    });

    await ticket.save();

    res.json({ message: 'Reply added', ticket });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to add reply' });
  }
});

export default router;
