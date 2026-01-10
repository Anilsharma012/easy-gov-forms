import { Router, Response } from 'express';
import { Lead } from '../models/Lead';
import { CSCCenter } from '../models/CSCCenter';
import { Application } from '../models/Application';
import { User } from '../models/User';
import { verifyToken, isAdmin, AuthRequest } from '../middleware/auth';
import { sendEmail } from '../utils/emailService';

const router = Router();

router.post('/enquiry', async (req, res: Response) => {
  try {
    const { name, mobile, email, formName, type, message } = req.body;
    
    if (!name || !mobile || !formName || !type) {
      return res.status(400).json({ message: 'Name, mobile, form name and type are required' });
    }
    
    const lead = new Lead({
      name,
      mobile,
      email,
      formName,
      type,
      notes: message,
      status: 'new',
    });
    
    await lead.save();
    res.status(201).json({ 
      message: 'Your enquiry has been submitted successfully. We will contact you soon.',
      leadId: lead._id 
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to submit enquiry' });
  }
});

router.get('/', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const leads = await Lead.find().populate('assignedCenterId').sort({ createdAt: -1 });
    res.json({ leads });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch leads' });
  }
});

// ✅ One-time / safe sync endpoint
// Existing applications (already applied) ko leads me convert karne ke liye.
// This solves: "Applications dikh rahi hain but Admin > E-Gov Leads blank".
router.post('/sync-from-applications', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const limit = Number(req.body?.limit || 500);

    const applications = await Application.find({
      applicationId: { $exists: true, $ne: null },
      type: 'job',
    })
      .select('applicationId userId jobId formName type createdAt')
      .sort({ createdAt: -1 })
      .limit(limit);

    const appIds = applications.map((a) => a.applicationId).filter(Boolean) as string[];

    const existingLeads = await Lead.find({ applicationId: { $in: appIds } })
      .select('applicationId')
      .lean();

    const existingSet = new Set(existingLeads.map((l: any) => l.applicationId).filter(Boolean));

    const userIds = Array.from(
      new Set(applications.map((a) => String(a.userId)).filter(Boolean))
    );

    const users = await User.find({ _id: { $in: userIds } })
      .select('name email phone')
      .lean();

    const userMap = new Map<string, any>();
    for (const u of users) userMap.set(String(u._id), u);

    let created = 0;
    let skipped = 0;

    for (const app of applications) {
      const appId = (app as any).applicationId as string | undefined;
      if (!appId) {
        skipped += 1;
        continue;
      }

      if (existingSet.has(appId)) {
        skipped += 1;
        continue;
      }

      const u = userMap.get(String((app as any).userId));
      const mobile = u?.phone || 'NA';

      await Lead.create({
        userId: (app as any).userId,
        name: u?.name || 'User',
        mobile,
        email: u?.email || '',
        formName: (app as any).formName,
        type: 'job',
        status: 'new',
        applicationId: appId,
        jobId: (app as any).jobId,
        notes: `Auto lead created from application sync. ApplicationId: ${appId}`,
      });

      existingSet.add(appId);
      created += 1;
    }

    res.json({
      message: 'Sync completed',
      checkedApplications: applications.length,
      created,
      skipped,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to sync leads from applications' });
  }
});

router.get('/stats', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const totalLeads = await Lead.countDocuments();
    const newLeads = await Lead.countDocuments({ status: 'new' });
    const inProgress = await Lead.countDocuments({ status: 'in-progress' });
    const completed = await Lead.countDocuments({ status: 'completed' });
    
    res.json({
      stats: {
        totalLeads,
        newLeads,
        inProgress,
        completed,
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch stats' });
  }
});

router.get('/unassigned', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const leads = await Lead.find({ assignedTo: { $exists: false } }).sort({ createdAt: -1 });
    res.json({ leads });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch unassigned leads' });
  }
});

router.get('/:id', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const lead = await Lead.findById(req.params.id).populate('assignedCenterId');
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    res.json({ lead });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch lead' });
  }
});

router.post('/', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, mobile, email, formName, type } = req.body;
    
    const lead = new Lead({
      name,
      mobile,
      email,
      formName,
      type,
      status: 'new',
    });
    
    await lead.save();
    res.status(201).json({ message: 'Lead created successfully', lead });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to create lead' });
  }
});

router.patch('/:id', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).populate('assignedCenterId');
    
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    res.json({ message: 'Lead updated successfully', lead });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to update lead' });
  }
});

router.patch('/:id/status', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    res.json({ message: 'Lead status updated', lead });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to update status' });
  }
});

router.patch('/:id/assign', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { centerId } = req.body;
    const center = await CSCCenter.findById(centerId);
    
    if (!center) {
      return res.status(404).json({ message: 'Center not found' });
    }
    
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { 
        assignedTo: center.centerName,
        assignedCenterId: center._id,
        status: 'in-progress'
      },
      { new: true }
    );
    
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    
    center.totalLeads += 1;
    await center.save();

    // Send email notification for lead transfer
    await sendEmail(
      center.email,
      'New Lead Assigned',
      `Hello ${center.ownerName},\n\nA new lead "${lead.name}" for "${lead.formName}" has been assigned to your center.`,
      `<h1>New Lead Assigned</h1><p>Hello ${center.ownerName},</p><p>A new lead <strong>"${lead.name}"</strong> for <strong>"${lead.formName}"</strong> has been assigned to your center.</p><p>Please check your dashboard for details.</p>`
    );
    
    res.json({ message: 'Lead assigned successfully', lead });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to assign lead' });
  }
});

router.patch('/:id/complete', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { status: 'completed' },
      { new: true }
    );
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    res.json({ message: 'Lead marked as completed', lead });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to complete lead' });
  }
});

router.delete('/:id', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    res.json({ message: 'Lead deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to delete lead' });
  }
});

router.get('/admin', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const leads = await Lead.find().populate('assignedCenterId').sort({ createdAt: -1 });
    res.json({ leads });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch leads' });
  }
});


export default router;
