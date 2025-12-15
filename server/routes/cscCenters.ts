import { Router, Response } from 'express';
import { CSCCenter } from '../models/CSCCenter';
import { Lead } from '../models/Lead';
import { CSCLeadPackage } from '../models/CSCLeadPackage';
import { CSCPackageAssignment } from '../models/CSCPackageAssignment';
import { verifyToken, isAdmin, AuthRequest } from '../middleware/auth';
import bcrypt from 'bcryptjs';

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
    const leadsAggregate = await CSCCenter.aggregate([
      { $group: { _id: null, total: { $sum: '$totalLeads' }, used: { $sum: '$usedLeads' } } }
    ]);
    
    res.json({
      stats: {
        totalCenters,
        verified,
        pending,
        totalLeads: leadsAggregate[0]?.total || 0,
        usedLeads: leadsAggregate[0]?.used || 0,
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch stats' });
  }
});

router.get('/lead-packages/all', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const packages = await CSCLeadPackage.find().sort({ leads: 1 });
    res.json({ packages });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch packages' });
  }
});

router.post('/lead-packages', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, leads, price, originalPrice, validity, features } = req.body;
    
    const pkg = new CSCLeadPackage({
      name,
      leads,
      price,
      originalPrice: originalPrice || price,
      validity: validity || 30,
      features: features || [],
    });
    
    await pkg.save();
    res.status(201).json({ message: 'Package created', package: pkg });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to create package' });
  }
});

router.patch('/lead-packages/:pkgId', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const pkg = await CSCLeadPackage.findByIdAndUpdate(
      req.params.pkgId,
      { $set: req.body },
      { new: true }
    );
    
    if (!pkg) {
      return res.status(404).json({ message: 'Package not found' });
    }
    
    res.json({ message: 'Package updated', package: pkg });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to update package' });
  }
});

router.delete('/lead-packages/:pkgId', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const pkg = await CSCLeadPackage.findByIdAndDelete(req.params.pkgId);
    
    if (!pkg) {
      return res.status(404).json({ message: 'Package not found' });
    }
    
    res.json({ message: 'Package deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to delete package' });
  }
});

router.get('/export/csv', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const centers = await CSCCenter.find().sort({ createdAt: -1 });
    
    const csvHeader = 'Center Name,Owner Name,Email,Mobile,Address,District,State,Status,Total Leads,Used Leads,Registered At\n';
    const csvRows = centers.map(c => 
      `"${c.centerName}","${c.ownerName}","${c.email}","${c.mobile}","${c.address}","${c.district}","${c.state}","${c.status}",${c.totalLeads || 0},${c.usedLeads || 0},"${c.registeredAt.toISOString()}"`
    ).join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=csc_centers.csv');
    res.send(csvHeader + csvRows);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to export' });
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
    const { centerName, ownerName, email, mobile, address, district, state, pincode } = req.body;
    
    const salt = await bcrypt.genSalt(10);
    const defaultPassword = await bcrypt.hash('csc123456', salt);
    
    const center = new CSCCenter({
      centerName,
      ownerName,
      email,
      mobile,
      address,
      district,
      state,
      pincode: pincode || '000000',
      password: defaultPassword,
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
    
    center.usedLeads += leadIds.length;
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

router.post('/:id/request-verification', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { type, message } = req.body;
    const center = await CSCCenter.findById(req.params.id);
    
    if (!center) {
      return res.status(404).json({ message: 'Center not found' });
    }
    
    center.verificationRequests.push({
      type,
      message,
      requestedAt: new Date(),
      status: 'pending',
    });
    
    await center.save();
    res.json({ message: 'Verification request sent', center });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to request verification' });
  }
});

router.patch('/:id/approve', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const center = await CSCCenter.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'verified',
        verifiedAt: new Date(),
      },
      { new: true }
    );
    
    if (!center) {
      return res.status(404).json({ message: 'Center not found' });
    }
    
    res.json({ message: 'Center approved successfully', center });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to approve center' });
  }
});

router.patch('/:id/reject', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { reason } = req.body;
    const center = await CSCCenter.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'rejected',
        rejectionReason: reason,
      },
      { new: true }
    );
    
    if (!center) {
      return res.status(404).json({ message: 'Center not found' });
    }
    
    res.json({ message: 'Center rejected', center });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to reject center' });
  }
});

router.post('/:id/assign-package', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { packageId } = req.body;
    const adminId = req.user?.userId;
    
    const center = await CSCCenter.findById(req.params.id);
    if (!center) {
      return res.status(404).json({ message: 'Center not found' });
    }
    
    const pkg = await CSCLeadPackage.findById(packageId);
    if (!pkg) {
      return res.status(404).json({ message: 'Package not found' });
    }
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + pkg.validity);
    
    const assignment = new CSCPackageAssignment({
      cscCenterId: center._id,
      packageId: pkg._id,
      packageName: pkg.name,
      totalLeads: pkg.leads,
      remainingLeads: pkg.leads,
      price: pkg.price,
      expiresAt,
      assignedBy: adminId,
    });
    
    await assignment.save();
    
    center.totalLeads += pkg.leads;
    center.assignedPackages.push(assignment._id);
    await center.save();
    
    res.json({ message: 'Package assigned successfully', assignment });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to assign package' });
  }
});

export default router;
