import { Router, Response } from 'express';
import { User } from '../models/User';
import { verifyToken, isAdmin, AuthRequest } from '../middleware/auth';

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

export default router;
