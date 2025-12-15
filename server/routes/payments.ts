import { Router, Response } from 'express';
import { verifyToken, AuthRequest } from '../middleware/auth';
import { Package } from '../models/Package';
import { UserPackage } from '../models/UserPackage';
import { User } from '../models/User';
import { Referral } from '../models/Referral';
import crypto from 'crypto';
import Razorpay from 'razorpay';

const router = Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

router.get('/packages', async (req, res: Response) => {
  try {
    let packages = await Package.find({ isActive: true }).sort({ price: 1 });
    
    if (packages.length === 0) {
      const defaultPackages = [
        {
          name: 'Starter',
          forms: 10,
          price: 999,
          originalPrice: 1500,
          features: ['10 Form Applications', 'AI-Assisted Form Filling', 'Document Vault Access', 'Email Support', '30 Days Validity'],
          validity: 30,
          popular: false,
          isActive: true,
        },
        {
          name: 'Popular',
          forms: 20,
          price: 1799,
          originalPrice: 2800,
          features: ['20 Form Applications', 'AI-Assisted Form Filling', 'Document Vault Access', 'Priority Email Support', 'WhatsApp Support', '60 Days Validity'],
          validity: 60,
          popular: true,
          isActive: true,
        },
        {
          name: 'Professional',
          forms: 50,
          price: 3999,
          originalPrice: 6500,
          features: ['50 Form Applications', 'AI-Assisted Form Filling', 'Document Vault Access', 'Priority Support', 'WhatsApp + Call Support', '90 Days Validity', 'Dedicated Account Manager'],
          validity: 90,
          popular: false,
          isActive: true,
        },
        {
          name: 'Enterprise',
          forms: 100,
          price: 6999,
          originalPrice: 12000,
          features: ['100 Form Applications', 'AI-Assisted Form Filling', 'Document Vault Access', '24/7 Priority Support', 'WhatsApp + Call Support', '180 Days Validity', 'Dedicated Account Manager', 'Bulk Application Priority'],
          validity: 180,
          popular: false,
          isActive: true,
        },
      ];
      
      await Package.insertMany(defaultPackages);
      packages = await Package.find({ isActive: true }).sort({ price: 1 });
    }
    
    res.json({ packages });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch packages' });
  }
});

router.post('/create-order', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { packageId } = req.body;
    const userId = req.user?.userId;

    const pkg = await Package.findById(packageId);
    if (!pkg) {
      return res.status(404).json({ message: 'Package not found' });
    }

    if (!pkg.isActive) {
      return res.status(400).json({ message: 'Package is not available' });
    }

    const serverSidePrice = pkg.price * 100;

    const order = await razorpay.orders.create({
      amount: serverSidePrice,
      currency: 'INR',
      receipt: `ord_${Date.now()}`,
      notes: {
        packageId: pkg._id.toString(),
        userId: userId || '',
        price: String(pkg.price),
        forms: String(pkg.forms),
      },
    }) as any;

    res.json({
      orderId: order.id,
      amount: serverSidePrice,
      currency: order.currency,
      packageName: pkg.name,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error: any) {
    console.error('Create order error:', error);
    res.status(500).json({ message: error.message || 'Failed to create order' });
  }
});

router.post('/verify-payment', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const userId = req.user?.userId;

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    const order = await razorpay.orders.fetch(razorpay_order_id);
    if (!order || order.status !== 'paid') {
      const payment = await razorpay.payments.fetch(razorpay_payment_id);
      if (!payment || payment.status !== 'captured') {
        return res.status(400).json({ message: 'Payment not completed' });
      }
    }

    const packageId = order.notes?.packageId;
    if (!packageId) {
      return res.status(400).json({ message: 'Invalid order - missing package info' });
    }

    const existingPurchase = await UserPackage.findOne({ orderId: razorpay_order_id });
    if (existingPurchase) {
      return res.status(400).json({ message: 'This order has already been processed' });
    }

    const pkg = await Package.findById(packageId);
    if (!pkg) {
      return res.status(404).json({ message: 'Package not found' });
    }

    const expectedAmount = pkg.price * 100;
    if (order.amount !== expectedAmount) {
      return res.status(400).json({ message: 'Payment amount mismatch' });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + pkg.validity);

    const userPackage = new UserPackage({
      userId,
      packageId: pkg._id,
      packageName: pkg.name,
      totalForms: pkg.forms,
      remainingForms: pkg.forms,
      expiresAt,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      amount: pkg.price,
    });

    await userPackage.save();

    await User.findByIdAndUpdate(userId, {
      activePackage: pkg.name,
    });

    const user = await User.findById(userId);
    if (user?.referredBy) {
      const referrer = await User.findOne({ referralCode: user.referredBy });
      if (referrer) {
        const existingReferral = await Referral.findOne({
          referrerId: referrer._id,
          referredId: userId,
        });

        if (existingReferral && existingReferral.status === 'pending') {
          existingReferral.status = 'completed';
          existingReferral.completedAt = new Date();
          await existingReferral.save();

          await User.findByIdAndUpdate(referrer._id, {
            $inc: { referralCount: 1, rewardPoints: 50 },
          });

          await User.findByIdAndUpdate(userId, {
            $inc: { rewardPoints: 50 },
          });
        }
      }
    }

    res.json({
      message: 'Payment verified successfully',
      userPackage,
    });
  } catch (error: any) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: error.message || 'Failed to verify payment' });
  }
});

router.get('/my-packages', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    await UserPackage.updateMany(
      { userId, expiresAt: { $lt: new Date() }, status: 'active' },
      { status: 'expired' }
    );

    const userPackages = await UserPackage.find({ userId }).sort({ createdAt: -1 });
    res.json({ packages: userPackages });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch packages' });
  }
});

export default router;
