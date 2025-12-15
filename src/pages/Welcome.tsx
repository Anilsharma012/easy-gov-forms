import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle2, Users, Briefcase, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import Ballpit from "@/components/Ballpit";

const BALLPIT_COLORS = [0x22c55e, 0x16a34a, 0x15803d, 0x166534, 0x4ade80, 0x86efac, 0x10b981];

const Welcome = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* 3D Ballpit Background */}
      <Ballpit 
        count={60} 
        colors={BALLPIT_COLORS}
        minSize={0.4}
        maxSize={1.2}
        gravity={0.3}
        friction={0.995}
        followCursor={true}
      />

      {/* Overlay gradient for better readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row items-center justify-center px-4 py-8 lg:py-0">
        
        {/* Left Side - Branding & Info */}
        <div className="flex-1 max-w-xl lg:pl-12 mb-12 lg:mb-0 text-center lg:text-left">
          {/* Logo */}
          <div className="mb-8 flex items-center justify-center lg:justify-start gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/30">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <span className="text-3xl font-bold text-white">
              Easy<span className="text-green-400">Gov</span> Forms
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            Your Gateway to
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">
              Government Jobs
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg text-gray-300 mb-8 leading-relaxed">
            AI-powered form filling, secure document storage, and real-time tracking. 
            Apply to 1000+ government jobs with confidence.
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="flex items-center gap-3 text-gray-200">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
              </div>
              <span>AI Form Filling</span>
            </div>
            <div className="flex items-center gap-3 text-gray-200">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20">
                <Shield className="h-5 w-5 text-green-400" />
              </div>
              <span>Secure Storage</span>
            </div>
            <div className="flex items-center gap-3 text-gray-200">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20">
                <Briefcase className="h-5 w-5 text-green-400" />
              </div>
              <span>1000+ Jobs</span>
            </div>
            <div className="flex items-center gap-3 text-gray-200">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20">
                <Users className="h-5 w-5 text-green-400" />
              </div>
              <span>50K+ Users</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center lg:justify-start gap-8 pt-4 border-t border-white/10">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">99%</p>
              <p className="text-sm text-gray-400">Success Rate</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">24/7</p>
              <p className="text-sm text-gray-400">Support</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">100%</p>
              <p className="text-sm text-gray-400">Secure</p>
            </div>
          </div>
        </div>

        {/* Right Side - Login Card */}
        <div className="flex-1 max-w-md w-full lg:pr-12">
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 shadow-2xl border border-white/20">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
              <p className="mt-2 text-gray-300">Sign in to continue your journey</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-200">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-green-400 focus:ring-green-400/20"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-gray-200">Password</Label>
                  <Link to="/forgot-password" className="text-sm text-green-400 hover:text-green-300">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-green-400 focus:ring-green-400/20"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-6 rounded-xl shadow-lg shadow-green-500/30 transition-all hover:shadow-green-500/50" 
                size="lg" 
                disabled={isLoading}
              >
                {isLoading ? "Signing In..." : "Sign In"}
                {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </form>

            <div className="mt-6 space-y-3">
              <Link to="/admin/login" className="block">
                <Button variant="outline" className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10 hover:text-white">
                  Admin Login
                </Button>
              </Link>
              <Link to="/csc/login" className="block">
                <Button variant="outline" className="w-full bg-blue-500/10 border-blue-400/30 text-blue-300 hover:bg-blue-500/20 hover:text-blue-200">
                  CSC Partner Login
                </Button>
              </Link>
            </div>

            <p className="mt-6 text-center text-sm text-gray-300">
              New to Easy Gov Forms?{" "}
              <Link to="/register" className="font-medium text-green-400 hover:text-green-300">
                Create an account
              </Link>
            </p>

            {/* Explore link */}
            <div className="mt-6 pt-6 border-t border-white/10 text-center">
              <Link 
                to="/govt-jobs" 
                className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
              >
                <span>Explore Government Jobs</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 left-0 right-0 z-10 py-4 px-6">
        <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
          <Link to="/about" className="hover:text-white transition-colors">About</Link>
          <Link to="/how-it-works" className="hover:text-white transition-colors">How It Works</Link>
          <Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
          <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
          <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
