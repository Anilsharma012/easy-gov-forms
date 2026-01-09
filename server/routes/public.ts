import { Router, Response, Request } from 'express';
import IndianGovForm from '../models/IndianGovForm';
import UrgentBanner from '../models/UrgentBanner';

const router = Router();

router.get('/forms', async (req: Request, res: Response) => {
  try {
    const forms = await IndianGovForm.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    res.json({ forms });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch forms' });
  }
});

router.get('/banners', async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const banners = await UrgentBanner.find({
      isActive: true,
      $or: [
        { startDate: { $exists: false }, endDate: { $exists: false } },
        { startDate: { $lte: now }, endDate: { $gte: now } },
        { startDate: { $lte: now }, endDate: { $exists: false } },
        { startDate: { $exists: false }, endDate: { $gte: now } },
      ]
    }).sort({ priority: -1, createdAt: -1 }).limit(5);
    res.json({ banners });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch banners' });
  }
});

export default router;
