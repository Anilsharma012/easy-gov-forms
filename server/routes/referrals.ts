import { Router, Response } from 'express';
import { verifyToken, AuthRequest } from '../middleware/auth';
import { User } from '../models/User';
import { Referral } from '../models/Referral';

const router = Router();

router.get('/my-referrals', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    const user = await User.findById(userId).select('referralCode referralCount rewardPoints name');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const referrals = await Referral.find({ referrerId: userId })
      .populate('referredId', 'name email createdAt')
      .sort({ createdAt: -1 });

    res.json({
      referralCode: user.referralCode,
      referralCount: user.referralCount,
      rewardPoints: user.rewardPoints,
      referrals: referrals.map(r => ({
        id: r._id,
        referredUser: r.referredId,
        status: r.status,
        rewardPoints: r.rewardPoints,
        completedAt: r.completedAt,
        createdAt: r.createdAt,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch referrals' });
  }
});

router.post('/apply-code', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { referralCode } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.referredBy) {
      return res.status(400).json({ message: 'You have already used a referral code' });
    }

    const referrer = await User.findOne({ referralCode });
    if (!referrer) {
      return res.status(404).json({ message: 'Invalid referral code' });
    }

    if (referrer._id.toString() === userId) {
      return res.status(400).json({ message: 'You cannot use your own referral code' });
    }

    user.referredBy = referralCode;
    await user.save();

    const referral = new Referral({
      referrerId: referrer._id,
      referredId: userId,
      referralCode,
      status: 'pending',
    });
    await referral.save();

    res.json({ message: 'Referral code applied successfully. You will both earn rewards after your first purchase!' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to apply referral code' });
  }
});

router.get('/rewards', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    const user = await User.findById(userId).select('rewardPoints referralCount');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const rewards = [
      { level: 1, referrals: 3, reward: '₹100 discount on next package', discount: 100 },
      { level: 2, referrals: 5, reward: '₹200 discount + 2 free forms', discount: 200, bonusForms: 2 },
      { level: 3, referrals: 10, reward: '₹500 discount + 5 free forms', discount: 500, bonusForms: 5 },
      { level: 4, referrals: 20, reward: 'Free Starter Package', freePackage: 'Starter' },
    ];

    const currentLevel = rewards.findIndex(r => user.referralCount < r.referrals);
    const nextReward = rewards[currentLevel >= 0 ? currentLevel : rewards.length - 1];

    res.json({
      rewardPoints: user.rewardPoints,
      referralCount: user.referralCount,
      rewards,
      currentLevel: currentLevel === -1 ? rewards.length : currentLevel,
      nextReward,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch rewards' });
  }
});

export default router;
