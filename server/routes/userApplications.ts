import { Router, Response } from 'express';
import { verifyToken, AuthRequest } from '../middleware/auth';
import { Application } from '../models/Application';
import { Job } from '../models/Job';
import { UserPackage } from '../models/UserPackage';
import { User } from '../models/User';

const router = Router();

router.get('/my-applications', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const applications = await Application.find({ userId })
      .populate('jobId')
      .sort({ createdAt: -1 });
    res.json({ applications });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch applications' });
  }
});

router.post('/apply', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { jobId, formData } = req.body;

    const activePackage = await UserPackage.findOne({
      userId,
      status: 'active',
      remainingForms: { $gt: 0 },
      expiresAt: { $gt: new Date() },
    });

    if (!activePackage) {
      return res.status(400).json({ 
        message: 'No active package with remaining forms. Please purchase a package to apply.',
        needsPackage: true,
      });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const existingApplication = await Application.findOne({ userId, jobId });
    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    const applicationId = `EGF-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    const application = new Application({
      userId,
      jobId,
      formName: job.title,
      type: 'job',
      status: 'pending',
      applicationId,
      formData,
      packageUsed: activePackage.packageName,
    });

    await application.save();

    activePackage.usedForms += 1;
    activePackage.remainingForms -= 1;
    await activePackage.save();

    await User.findByIdAndUpdate(userId, {
      $inc: { totalApplications: 1 },
    });

    res.status(201).json({
      message: 'Application submitted successfully',
      application,
      remainingForms: activePackage.remainingForms,
    });
  } catch (error: any) {
    console.error('Apply error:', error);
    res.status(500).json({ message: error.message || 'Failed to submit application' });
  }
});

router.get('/check-eligibility/:jobId', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { jobId } = req.params;

    const existingApplication = await Application.findOne({ userId, jobId });
    if (existingApplication) {
      return res.json({ 
        canApply: false, 
        reason: 'already_applied',
        application: existingApplication,
      });
    }

    const activePackage = await UserPackage.findOne({
      userId,
      status: 'active',
      remainingForms: { $gt: 0 },
      expiresAt: { $gt: new Date() },
    });

    if (!activePackage) {
      return res.json({ 
        canApply: false, 
        reason: 'no_package',
        message: 'No active package with remaining forms',
      });
    }

    res.json({
      canApply: true,
      remainingForms: activePackage.remainingForms,
      packageName: activePackage.packageName,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to check eligibility' });
  }
});

export default router;
