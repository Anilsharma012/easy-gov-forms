import { Router, Response } from 'express';
import { Application } from '../models/Application';
import { UserDocument } from '../models/UserDocument';
import { verifyToken, isAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/user/:userId', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const applications = await Application.find({ userId: req.params.userId })
      .populate('jobId')
      .sort({ createdAt: -1 });
    res.json({ applications });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch applications' });
  }
});

router.get('/user/:userId/documents', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const documents = await UserDocument.find({ userId: req.params.userId })
      .sort({ createdAt: -1 });
    res.json({ documents });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch documents' });
  }
});

router.get('/', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const applications = await Application.find()
      .populate('userId', 'name email')
      .populate('jobId')
      .sort({ createdAt: -1 });
    res.json({ applications });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch applications' });
  }
});

router.patch('/:id/status', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.json({ message: 'Application status updated', application });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to update status' });
  }
});

router.get('/users/export', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { User } = await import('../models/User');
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    const csvHeader = 'Name,Email,Phone,City,State,Status,KYC Verified,Created At\n';
    const csvRows = users.map(u => 
      `"${u.name}","${u.email}","${u.phone || ''}","${u.city || ''}","${u.state || ''}","${u.isActive ? 'Active' : 'Inactive'}","${u.kycVerified ? 'Yes' : 'No'}","${u.createdAt.toISOString()}"`
    ).join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
    res.send(csvHeader + csvRows);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to export' });
  }
});

export default router;
