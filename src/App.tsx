import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminLogin from "./pages/AdminLogin";
import ForgotPassword from "./pages/ForgotPassword";
import GovtJobs from "./pages/GovtJobs";
import JobDetail from "./pages/JobDetail";
import Pricing from "./pages/Pricing";
import HowItWorksPage from "./pages/HowItWorksPage";
import Contact from "./pages/Contact";
import About from "./pages/About";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Refund from "./pages/Refund";
import NotFound from "./pages/NotFound";

// Dashboard
import { DashboardLayout } from "./components/dashboard/DashboardLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";
import Applications from "./pages/dashboard/Applications";
import Documents from "./pages/dashboard/Documents";
import Notifications from "./pages/dashboard/Notifications";
import Packages from "./pages/dashboard/Packages";
import Support from "./pages/dashboard/Support";
import Referrals from "./pages/dashboard/Referrals";
import Settings from "./pages/dashboard/Settings";
import AvailableJobs from "./pages/dashboard/AvailableJobs";
import JobApply from "./pages/dashboard/JobApply";
import KYC from "./pages/dashboard/KYC";

// Admin
import { AdminLayout } from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminCSCCenters from "./pages/admin/AdminCSCCenters";
import AdminLeads from "./pages/admin/AdminLeads";
import AdminJobs from "./pages/admin/AdminJobs";
import AdminPackages from "./pages/admin/AdminPackages";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminSupport from "./pages/admin/AdminSupport";
import AdminContent from "./pages/admin/AdminContent";
import AdminLegal from "./pages/admin/AdminLegal";
import AdminReports from "./pages/admin/AdminReports";
import AdminAIMonitoring from "./pages/admin/AdminAIMonitoring";
import AdminSettings from "./pages/admin/AdminSettings";

// CSC Portal
import { CSCLayout } from "./components/csc/CSCLayout";
import CSCLogin from "./pages/csc/CSCLogin";
import CSCRegister from "./pages/csc/CSCRegister";
import CSCDashboard from "./pages/csc/CSCDashboard";
import CSCLeads from "./pages/csc/CSCLeads";
import CSCPackages from "./pages/csc/CSCPackages";
import CSCProfile from "./pages/csc/CSCProfile";
import CSCJobsApplied from "./pages/csc/CSCJobsApplied";
import CSCWallet from "./pages/csc/CSCWallet";
import CSCTransactions from "./pages/csc/CSCTransactions";
import CSCPaymentInfo from "./pages/csc/CSCPaymentInfo";
import CSCTasks from "./pages/csc/CSCTasks";
import CSCOldDocs from "./pages/csc/CSCOldDocs";
import CSCUsers from "./pages/csc/CSCUsers";
import CSCChat from "./pages/csc/CSCChat";
import CSCSupport from "./pages/csc/CSCSupport";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Welcome />} />
            <Route path="/home" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/govt-jobs" element={<GovtJobs />} />
          <Route path="/job/:id" element={<JobDetail />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/refund" element={<Refund />} />

          {/* User Dashboard Routes */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="applications" element={<Applications />} />
            <Route path="jobs" element={<AvailableJobs />} />
            <Route path="jobs/apply/:id" element={<JobApply />} />
            <Route path="packages" element={<Packages />} />
            <Route path="documents" element={<Documents />} />
            <Route path="kyc" element={<KYC />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="support" element={<Support />} />
            <Route path="referrals" element={<Referrals />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Admin Dashboard Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="csc-centers" element={<AdminCSCCenters />} />
            <Route path="leads" element={<AdminLeads />} />
            <Route path="jobs" element={<AdminJobs />} />
            <Route path="packages" element={<AdminPackages />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="support" element={<AdminSupport />} />
            <Route path="content" element={<AdminContent />} />
            <Route path="legal" element={<AdminLegal />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="ai-monitoring" element={<AdminAIMonitoring />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* CSC Portal Routes */}
          <Route path="/csc/login" element={<CSCLogin />} />
          <Route path="/csc/register" element={<CSCRegister />} />
          <Route path="/csc/dashboard" element={<CSCLayout />}>
            <Route index element={<CSCDashboard />} />
            <Route path="jobs-applied" element={<CSCJobsApplied />} />
            <Route path="leads" element={<CSCLeads />} />
            <Route path="packages" element={<CSCPackages />} />
            <Route path="tasks" element={<CSCTasks />} />
            <Route path="users" element={<CSCUsers />} />
            <Route path="old-docs" element={<CSCOldDocs />} />
            <Route path="wallet" element={<CSCWallet />} />
            <Route path="transactions" element={<CSCTransactions />} />
            <Route path="payment-info" element={<CSCPaymentInfo />} />
            <Route path="chat" element={<CSCChat />} />
            <Route path="support" element={<CSCSupport />} />
            <Route path="profile" element={<CSCProfile />} />
          </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;