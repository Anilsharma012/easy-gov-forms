import { Router, Response } from 'express';
import { CSCCenter } from '../models/CSCCenter';
import { Lead } from '../models/Lead';
import { CSCLeadPackage } from '../models/CSCLeadPackage';
import { CSCPackageAssignment } from '../models/CSCPackageAssignment';
import { verifyToken, isAdmin, AuthRequest } from '../middleware/auth';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const router = Router();

const cscUploadsDir = path.join(process.cwd(), 'uploads', 'csc');
if (!fs.existsSync(cscUploadsDir)) {
  fs.mkdirSync(cscUploadsDir, { recursive: true });
}

function saveBase64File(base64Data: string, fileName: string, centerId: string): { fileName: string; filePath: string } {
  const centerDir = path.join(cscUploadsDir, centerId);
  if (!fs.existsSync(centerDir)) {
    fs.mkdirSync(centerDir, { recursive: true });
  }
  
  const cleanBase64 = base64Data.replace(/^data:.*;base64,/, '');
  const buffer = Buffer.from(cleanBase64, 'base64');
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/\.\./g, '');
  const uniqueFileName = `${Date.now()}_${sanitizedFileName}`;
  const fullPath = path.join(centerDir, uniqueFileName);
  
  fs.writeFileSync(fullPath, buffer);
  
  return {
    fileName: uniqueFileName,
    filePath: `/uploads/csc/${centerId}/${uniqueFileName}`,
  };
}

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

router.post('/lead-packages/seed', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const existingPackages = await CSCLeadPackage.countDocuments();
    if (existingPackages > 0) {
      return res.json({ message: 'Packages already exist', seeded: false });
    }
    
    const seedPackages = [
      {
        name: 'Starter Pack',
        leads: 10,
        price: 499,
        originalPrice: 999,
        validity: 30,
        features: ['10 Lead Credits', '30 Days Validity', 'Email Support'],
        isActive: true,
      },
      {
        name: 'Growth Pack',
        leads: 25,
        price: 999,
        originalPrice: 1999,
        validity: 45,
        features: ['25 Lead Credits', '45 Days Validity', 'Priority Support', 'Lead Analytics'],
        isActive: true,
      },
      {
        name: 'Professional Pack',
        leads: 50,
        price: 1799,
        originalPrice: 3499,
        validity: 60,
        features: ['50 Lead Credits', '60 Days Validity', 'Dedicated Support', 'Lead Analytics', 'Custom Reports'],
        isActive: true,
      },
      {
        name: 'Enterprise Pack',
        leads: 100,
        price: 2999,
        originalPrice: 5999,
        validity: 90,
        features: ['100 Lead Credits', '90 Days Validity', '24/7 Support', 'Advanced Analytics', 'Custom Reports', 'API Access'],
        isActive: true,
      },
    ];
    
    await CSCLeadPackage.insertMany(seedPackages);
    res.status(201).json({ message: 'Seed packages created', seeded: true, count: seedPackages.length });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to seed packages' });
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
    const { 
      centerName, ownerName, email, mobile, address, district, state, pincode,
      registrationNumber, addressProof, identityProof, photo
    } = req.body;
    
    const salt = await bcrypt.genSalt(10);
    const defaultPassword = await bcrypt.hash('csc123456', salt);
    
    const tempCenterId = `admin_${Date.now()}`;
    const documents: any[] = [];
    
    if (addressProof && addressProof.fileData && addressProof.fileName) {
      const saved = saveBase64File(addressProof.fileData, addressProof.fileName, tempCenterId);
      documents.push({
        type: 'addressProof',
        fileName: saved.fileName,
        originalFileName: addressProof.fileName,
        filePath: saved.filePath,
        status: 'pending',
        uploadedAt: new Date(),
      });
    }
    
    if (identityProof && identityProof.fileData && identityProof.fileName) {
      const saved = saveBase64File(identityProof.fileData, identityProof.fileName, tempCenterId);
      documents.push({
        type: 'identityProof',
        fileName: saved.fileName,
        originalFileName: identityProof.fileName,
        filePath: saved.filePath,
        status: 'pending',
        uploadedAt: new Date(),
      });
    }
    
    if (photo && photo.fileData && photo.fileName) {
      const saved = saveBase64File(photo.fileData, photo.fileName, tempCenterId);
      documents.push({
        type: 'photo',
        fileName: saved.fileName,
        originalFileName: photo.fileName,
        filePath: saved.filePath,
        status: 'pending',
        uploadedAt: new Date(),
      });
    }
    
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
      registrationNumber,
      status: 'pending',
      documents,
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

router.get('/:id/leads', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const center = await CSCCenter.findById(req.params.id);
    if (!center) {
      return res.status(404).json({ message: 'Center not found' });
    }
    
    const leads = await Lead.find({ assignedCenterId: center._id })
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });
    
    const stats = {
      total: leads.length,
      new: leads.filter(l => l.status === 'new').length,
      inProgress: leads.filter(l => l.status === 'in-progress').length,
      completed: leads.filter(l => l.status === 'completed').length,
      cancelled: leads.filter(l => l.status === 'cancelled').length,
    };
    
    res.json({ 
      center: {
        _id: center._id,
        centerName: center.centerName,
        ownerName: center.ownerName,
      },
      leads,
      stats,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch leads' });
  }
});

router.get('/:id/documents', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const center = await CSCCenter.findById(req.params.id).select('centerName ownerName documents registrationNumber');
    if (!center) {
      return res.status(404).json({ message: 'Center not found' });
    }
    
    res.json({ 
      center: {
        _id: center._id,
        centerName: center.centerName,
        ownerName: center.ownerName,
        registrationNumber: center.registrationNumber,
      },
      documents: center.documents,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch documents' });
  }
});

router.get('/:id/documents/:docId/view', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const center = await CSCCenter.findById(req.params.id);
    if (!center) {
      return res.status(404).json({ message: 'Center not found' });
    }
    
    const doc = center.documents.find((d: any) => d._id?.toString() === req.params.docId);
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    const filePath = path.join(process.cwd(), doc.filePath);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }
    
    const ext = path.extname(doc.fileName).toLowerCase();
    let contentType = 'application/octet-stream';
    if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.pdf') contentType = 'application/pdf';
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${doc.originalFileName}"`);
    fs.createReadStream(filePath).pipe(res);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to view document' });
  }
});

router.get('/:id/documents/:docId/download', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const center = await CSCCenter.findById(req.params.id);
    if (!center) {
      return res.status(404).json({ message: 'Center not found' });
    }
    
    const doc = center.documents.find((d: any) => d._id?.toString() === req.params.docId);
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    const filePath = path.join(process.cwd(), doc.filePath);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }
    
    res.setHeader('Content-Disposition', `attachment; filename="${doc.originalFileName}"`);
    fs.createReadStream(filePath).pipe(res);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to download document' });
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
