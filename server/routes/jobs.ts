import { Router, Response } from 'express';
import { Job } from '../models/Job';
import { verifyToken, isAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json({ jobs });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch jobs' });
  }
});

router.get('/stats', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ isActive: true });
    const totalVacancies = await Job.aggregate([
      { $group: { _id: null, total: { $sum: '$vacancies' } } }
    ]);
    const categories = await Job.distinct('category');
    
    res.json({
      stats: {
        totalJobs,
        activeJobs,
        totalVacancies: totalVacancies[0]?.total || 0,
        categoriesCount: categories.length,
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch stats' });
  }
});

router.get('/active', async (req: AuthRequest, res: Response) => {
  try {
    const jobs = await Job.find({ isActive: true, lastDate: { $gte: new Date() } })
      .sort({ lastDate: 1 });
    res.json({ jobs });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch active jobs' });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json({ job });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch job' });
  }
});

router.post('/', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { 
      title, department, category, location, eligibility, description,
      startDate, lastDate, vacancies, salaryRange, fees 
    } = req.body;
    
    const job = new Job({
      title,
      department,
      category,
      location,
      eligibility,
      description,
      startDate,
      lastDate,
      vacancies,
      salaryRange,
      fees,
      isActive: true,
    });
    
    await job.save();
    res.status(201).json({ message: 'Job created successfully', job });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to create job' });
  }
});

router.patch('/:id', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json({ message: 'Job updated successfully', job });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to update job' });
  }
});

router.patch('/:id/toggle-active', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    job.isActive = !job.isActive;
    await job.save();
    
    res.json({ message: 'Job status updated', job });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to update job status' });
  }
});

router.delete('/:id', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json({ message: 'Job deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to delete job' });
  }
});

export default router;
