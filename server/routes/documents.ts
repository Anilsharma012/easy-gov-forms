import { Router, Response } from 'express';
import { verifyToken, isAdmin, AuthRequest } from '../middleware/auth';
import { UserDocument } from '../models/UserDocument';
import fs from 'fs';
import path from 'path';

const router = Router();

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

router.get('/my-documents', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const documents = await UserDocument.find({ userId }).sort({ createdAt: -1 });
    res.json({ documents });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch documents' });
  }
});

router.post('/upload', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { name, type, documentNumber, fileData, fileName, fileSize } = req.body;

    if (!fileData || !fileName) {
      return res.status(400).json({ message: 'File is required' });
    }

    const allowedTypes = ['aadhaar', 'pan', 'voter_id', 'passport', 'photo', 'signature', 
      '10th_marksheet', '12th_marksheet', 'graduation', 'postgraduation', 'diploma',
      'caste', 'income', 'domicile', 'disability', 'experience', 'other'];
    if (!allowedTypes.includes(type)) {
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

    const uniqueFileName = `${Date.now()}_${sanitizedFileName}`;
    const filePath = path.join(userDir, uniqueFileName);
    
    fs.writeFileSync(filePath, buffer);

    const document = new UserDocument({
      userId,
      name,
      type,
      documentNumber,
      fileName: uniqueFileName,
      originalFileName: fileName,
      fileSize,
      filePath: `/uploads/${userId}/${uniqueFileName}`,
      status: 'pending',
    });

    await document.save();
    res.status(201).json({ message: 'Document uploaded successfully', document });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ message: error.message || 'Failed to upload document' });
  }
});

router.get('/view/:documentId', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { documentId } = req.params;
    const isAdminUser = req.user?.role === 'admin';

    const query: any = { _id: documentId };
    if (!isAdminUser) {
      query.userId = userId;
    }

    const document = await UserDocument.findOne(query);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const filePath = path.join(process.cwd(), (document as any).filePath || '');
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const base64 = fileBuffer.toString('base64');
    
    res.json({
      document,
      fileData: base64,
      fileName: (document as any).originalFileName,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to view document' });
  }
});

router.delete('/:documentId', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { documentId } = req.params;

    const document = await UserDocument.findOne({ _id: documentId, userId });
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const filePath = path.join(process.cwd(), (document as any).filePath || '');
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await UserDocument.deleteOne({ _id: documentId });
    res.json({ message: 'Document deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to delete document' });
  }
});

const REQUIRED_DOCUMENT_TYPES = ['aadhaar', 'photo', 'signature', '10th_marksheet'];

router.get('/check-required', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    
    const userDocuments = await UserDocument.find({ userId });
    
    const uploadedTypes = userDocuments.map(doc => doc.type);
    const verifiedTypes = userDocuments
      .filter(doc => doc.status === 'verified')
      .map(doc => doc.type);
    
    const missingDocuments = REQUIRED_DOCUMENT_TYPES.filter(
      type => !uploadedTypes.includes(type)
    );
    
    const pendingDocuments = REQUIRED_DOCUMENT_TYPES.filter(
      type => uploadedTypes.includes(type) && !verifiedTypes.includes(type)
    );
    
    const hasAllRequired = missingDocuments.length === 0;
    const allVerified = missingDocuments.length === 0 && pendingDocuments.length === 0;
    
    res.json({
      hasAllRequired,
      allVerified,
      missingDocuments,
      pendingDocuments,
      requiredDocuments: REQUIRED_DOCUMENT_TYPES,
      uploadedCount: uploadedTypes.length,
      verifiedCount: verifiedTypes.length,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to check required documents' });
  }
});

router.get('/all', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const documents = await UserDocument.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json({ documents });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch documents' });
  }
});

router.patch('/admin/:documentId/verify', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { documentId } = req.params;
    const { status } = req.body;

    const document = await UserDocument.findByIdAndUpdate(
      documentId,
      { 
        status,
        verifiedAt: status === 'verified' ? new Date() : undefined,
      },
      { new: true }
    );

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json({ message: 'Document status updated', document });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to update document' });
  }
});

export default router;
