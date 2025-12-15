import { Router, Response } from 'express';
import { verifyToken, isAdmin, AuthRequest } from '../middleware/auth';
import { UserKYC } from '../models/UserKYC';
import { User } from '../models/User';
import fs from 'fs';
import path from 'path';

const router = Router();

const uploadsDir = path.join(process.cwd(), 'uploads', 'kyc');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const requiredDocuments = [
  { type: 'aadhaar', name: 'Aadhaar Card', description: 'Front and back of Aadhaar card' },
  { type: 'pan', name: 'PAN Card', description: 'Clear photo of PAN card' },
  { type: 'photo', name: 'Passport Photo', description: 'Recent passport size photo' },
  { type: 'signature', name: 'Signature', description: 'Your signature on white paper' },
  { type: 'address_proof', name: 'Address Proof', description: 'Utility bill, bank statement, or rent agreement' },
];

router.get('/requirements', verifyToken, async (req: AuthRequest, res: Response) => {
  res.json({ documents: requiredDocuments });
});

router.get('/status', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    
    let kyc = await UserKYC.findOne({ userId });
    
    if (!kyc) {
      kyc = new UserKYC({
        userId,
        documents: [],
        overallStatus: 'not_started',
      });
      await kyc.save();
    }

    const documentStatus = requiredDocuments.map(req => {
      const uploaded = kyc!.documents.find(d => d.documentType === req.type);
      return {
        ...req,
        status: uploaded?.status || 'not_uploaded',
        fileName: uploaded?.fileName,
        uploadedAt: uploaded?.uploadedAt,
        rejectionReason: uploaded?.rejectionReason,
      };
    });

    res.json({
      overallStatus: kyc.overallStatus,
      documents: documentStatus,
      submittedAt: kyc.submittedAt,
      verifiedAt: kyc.verifiedAt,
      rejectionReason: kyc.rejectionReason,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch KYC status' });
  }
});

router.post('/upload', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { documentType, fileData, fileName } = req.body;

    if (!documentType || !fileData || !fileName) {
      return res.status(400).json({ message: 'Document type, file data and file name are required' });
    }

    const validTypes = requiredDocuments.map(d => d.type);
    if (!validTypes.includes(documentType)) {
      return res.status(400).json({ message: 'Invalid document type' });
    }

    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/\.\./g, '');
    const ext = path.extname(sanitizedFileName).toLowerCase();
    const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
    if (!allowedExtensions.includes(ext)) {
      return res.status(400).json({ message: 'Only PDF, JPG, and PNG files are allowed' });
    }

    const base64Data = fileData.replace(/^data:.*;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const maxSize = 5 * 1024 * 1024;
    if (buffer.length > maxSize) {
      return res.status(400).json({ message: 'File size must be less than 5MB' });
    }

    const userDir = path.join(uploadsDir, userId as string);
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }

    const uniqueFileName = `${documentType}_${Date.now()}${ext}`;
    const filePath = path.join(userDir, uniqueFileName);
    fs.writeFileSync(filePath, buffer);

    let kyc = await UserKYC.findOne({ userId });
    if (!kyc) {
      kyc = new UserKYC({
        userId,
        documents: [],
        overallStatus: 'not_started',
      });
    }

    const existingDocIndex = kyc.documents.findIndex(d => d.documentType === documentType);
    const newDoc = {
      documentType: documentType as any,
      fileName: uniqueFileName,
      filePath: `/uploads/kyc/${userId}/${uniqueFileName}`,
      status: 'pending' as const,
      uploadedAt: new Date(),
    };

    if (existingDocIndex >= 0) {
      const oldFilePath = path.join(process.cwd(), kyc.documents[existingDocIndex].filePath);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
      kyc.documents[existingDocIndex] = newDoc;
    } else {
      kyc.documents.push(newDoc);
    }

    const uploadedCount = kyc.documents.length;
    if (uploadedCount === requiredDocuments.length) {
      kyc.overallStatus = 'pending_review';
      kyc.submittedAt = new Date();
    } else if (uploadedCount > 0) {
      kyc.overallStatus = 'in_progress';
    }

    await kyc.save();

    res.json({ 
      message: 'Document uploaded successfully',
      overallStatus: kyc.overallStatus,
      uploadedCount,
      requiredCount: requiredDocuments.length,
    });
  } catch (error: any) {
    console.error('KYC Upload error:', error);
    res.status(500).json({ message: error.message || 'Failed to upload document' });
  }
});

router.post('/submit', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    
    const kyc = await UserKYC.findOne({ userId });
    if (!kyc) {
      return res.status(404).json({ message: 'KYC not found' });
    }

    if (kyc.documents.length < requiredDocuments.length) {
      return res.status(400).json({ 
        message: 'Please upload all required documents before submitting',
        uploadedCount: kyc.documents.length,
        requiredCount: requiredDocuments.length,
      });
    }

    kyc.overallStatus = 'pending_review';
    kyc.submittedAt = new Date();
    await kyc.save();

    res.json({ message: 'KYC submitted for review', overallStatus: kyc.overallStatus });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to submit KYC' });
  }
});

router.get('/admin/all', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const kycs = await UserKYC.find()
      .populate('userId', 'name email phone')
      .sort({ submittedAt: -1 });

    res.json({ kycs });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch KYCs' });
  }
});

router.get('/admin/:userId', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    
    const kyc = await UserKYC.findOne({ userId })
      .populate('userId', 'name email phone');
    
    if (!kyc) {
      return res.status(404).json({ message: 'KYC not found' });
    }

    res.json({ kyc });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch KYC' });
  }
});

router.patch('/admin/:userId/verify', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { status, rejectionReason, adminNotes } = req.body;
    const adminId = req.user?.userId;

    const kyc = await UserKYC.findOne({ userId });
    if (!kyc) {
      return res.status(404).json({ message: 'KYC not found' });
    }

    kyc.overallStatus = status;
    if (status === 'verified') {
      kyc.verifiedAt = new Date();
      kyc.verifiedBy = adminId as any;
      kyc.documents.forEach(doc => {
        doc.status = 'verified';
        doc.verifiedAt = new Date();
        doc.verifiedBy = adminId as any;
      });
      await User.findByIdAndUpdate(userId, { kycVerified: true });
    } else if (status === 'rejected') {
      kyc.rejectionReason = rejectionReason;
    }
    
    if (adminNotes) {
      kyc.adminNotes = adminNotes;
    }

    await kyc.save();

    res.json({ message: 'KYC status updated', kyc });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to update KYC' });
  }
});

router.patch('/admin/:userId/document/:docType', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { userId, docType } = req.params;
    const { status, rejectionReason } = req.body;
    const adminId = req.user?.userId;

    const kyc = await UserKYC.findOne({ userId });
    if (!kyc) {
      return res.status(404).json({ message: 'KYC not found' });
    }

    const doc = kyc.documents.find(d => d.documentType === docType);
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    doc.status = status;
    if (status === 'verified') {
      doc.verifiedAt = new Date();
      doc.verifiedBy = adminId as any;
    } else if (status === 'rejected') {
      doc.rejectionReason = rejectionReason;
    }

    const allVerified = kyc.documents.every(d => d.status === 'verified');
    const anyRejected = kyc.documents.some(d => d.status === 'rejected');
    
    if (allVerified) {
      kyc.overallStatus = 'verified';
      kyc.verifiedAt = new Date();
      kyc.verifiedBy = adminId as any;
      await User.findByIdAndUpdate(userId, { kycVerified: true });
    } else if (anyRejected) {
      kyc.overallStatus = 'rejected';
    }

    await kyc.save();

    res.json({ message: 'Document status updated', kyc });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to update document' });
  }
});

router.get('/admin/:userId/document/:docType/view', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { userId, docType } = req.params;

    const kyc = await UserKYC.findOne({ userId });
    if (!kyc) {
      return res.status(404).json({ message: 'KYC not found' });
    }

    const doc = kyc.documents.find(d => d.documentType === docType);
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const filePath = path.join(process.cwd(), doc.filePath);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const base64 = fileBuffer.toString('base64');
    const ext = path.extname(doc.fileName).toLowerCase();
    
    let mimeType = 'application/octet-stream';
    if (ext === '.pdf') mimeType = 'application/pdf';
    else if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
    else if (ext === '.png') mimeType = 'image/png';

    res.json({
      fileName: doc.fileName,
      mimeType,
      data: `data:${mimeType};base64,${base64}`,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch document' });
  }
});

export default router;
