import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
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
            <Route path="/" element={<Index />} />
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

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;