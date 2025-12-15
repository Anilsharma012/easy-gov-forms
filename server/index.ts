import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { connectDB } from './db';
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import cscCentersRoutes from './routes/cscCenters';
import leadsRoutes from './routes/leads';
import jobsRoutes from './routes/jobs';
import applicationsRoutes from './routes/applications';
import paymentsRoutes from './routes/payments';
import supportRoutes from './routes/support';
import referralsRoutes from './routes/referrals';
import documentsRoutes from './routes/documents';
import userApplicationsRoutes from './routes/userApplications';
import cscAuthRoutes from './routes/cscAuth';
import cscDashboardRoutes from './routes/cscDashboard';
import userKycRoutes from './routes/userKyc';
import userChatRoutes from './routes/userChat';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/csc-centers', cscCentersRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/referrals', referralsRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/user-applications', userApplicationsRoutes);
app.use('/api/csc/auth', cscAuthRoutes);
app.use('/api/csc/dashboard', cscDashboardRoutes);
app.use('/api/kyc', userKycRoutes);
app.use('/api/user-chat', userChatRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
