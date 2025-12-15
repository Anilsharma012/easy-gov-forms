import { Router, Response } from 'express';
import { CSCCenter } from '../models/CSCCenter';
import { Lead } from '../models/Lead';
import { verifyToken, isAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const centers = await CSCCenter.find().sort({ createdAt: -1 });
    res.json({ centers });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch centers' });
  }
});

router.get('/stats', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const totalCenters = await CSCCenter.countDocuments();
    const verified = await CSCCenter.countDocuments({ status: 'verified' });
    const pending = await CSCCenter.countDocuments({ status: 'pending' });
    const totalLeads = await CSCCenter.aggregate([
      { $group: { _id: null, total: { $sum: '$leadsAssigned' } } }
    ]);
    
    res.json({
      stats: {
        totalCenters,
        verified,
        pending,
        totalLeads: totalLeads[0]?.total || 0,
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch stats' });
  }
});

router.get('/:id', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const center = await CSCCenter.findById(req.params.id);
    if (!center) {
      return res.status(404).json({ message: 'Center not found' });
    }
    res.json({ center });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch center' });
  }
});

router.post('/', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { centerName, ownerName, email, mobile, address, district, state } = req.body;
    
    const center = new CSCCenter({
      centerName,
      ownerName,
      email,
      mobile,
      address,
      district,
      state,
      status: 'pending',
    });
    
    await center.save();
    res.status(201).json({ message: 'Center created successfully', center });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to create center' });
  }
});

router.patch('/:id', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const center = await CSCCenter.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!center) {
      return res.status(404).json({ message: 'Center not found' });
    }
    res.json({ message: 'Center updated successfully', center });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to update center' });
  }
});

router.patch('/:id/status', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const center = await CSCCenter.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!center) {
      return res.status(404).json({ message: 'Center not found' });
    }
    res.json({ message: 'Center status updated', center });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to update status' });
  }
});

router.delete('/:id', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const center = await CSCCenter.findByIdAndDelete(req.params.id);
    if (!center) {
      return res.status(404).json({ message: 'Center not found' });
    }
    res.json({ message: 'Center deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to delete center' });
  }
});

router.post('/:id/assign-leads', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { leadIds } = req.body;
    const center = await CSCCenter.findById(req.params.id);
    
    if (!center) {
      return res.status(404).json({ message: 'Center not found' });
    }
    
    await Lead.updateMany(
      { _id: { $in: leadIds } },
      { 
        assignedTo: center.centerName,
        assignedCenterId: center._id,
        status: 'in-progress'
      }
    );
    
    center.leadsAssigned += leadIds.length;
    await center.save();
    
    res.json({ message: `${leadIds.length} leads assigned successfully`, center });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to assign leads' });
  }
});

router.get('/:id/performance', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const center = await CSCCenter.findById(req.params.id);
    if (!center) {
      return res.status(404).json({ message: 'Center not found' });
    }
    
    const totalLeads = await Lead.countDocuments({ assignedCenterId: center._id });
    const completedLeads = await Lead.countDocuments({ assignedCenterId: center._id, status: 'completed' });
    const inProgressLeads = await Lead.countDocuments({ assignedCenterId: center._id, status: 'in-progress' });
    const newLeads = await Lead.countDocuments({ assignedCenterId: center._id, status: 'new' });
    
    res.json({
      performance: {
        centerName: center.centerName,
        totalLeads,
        completedLeads,
        inProgressLeads,
        newLeads,
        completionRate: totalLeads > 0 ? ((completedLeads / totalLeads) * 100).toFixed(1) : 0,
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch performance' });
  }
});

router.get('/export/csv', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const centers = await CSCCenter.find().sort({ createdAt: -1 });
    
    const csvHeader = 'Center Name,Owner Name,Email,Mobile,Address,District,State,Status,Leads Assigned,Registered At\n';
    const csvRows = centers.map(c => 
      `"${c.centerName}","${c.ownerName}","${c.email}","${c.mobile}","${c.address}","${c.district}","${c.state}","${c.status}",${c.leadsAssigned},"${c.registeredAt.toISOString()}"`
    ).join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=csc_centers.csv');
    res.send(csvHeader + csvRows);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to export' });
  }
});

export default router;
