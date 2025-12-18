import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { 
  FileText, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  Users, 
  Briefcase, 
  Shield,
  Clock,
  Star,
  Award
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import SplashScreen from "@/components/layout/SplashScreen";

const Welcome = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    const splashSeen = sessionStorage.getItem("splash_seen");
    if (splashSeen) {
      setShowSplash(false);
    }
  }, []);

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

  const features = [
    { icon: CheckCircle2, title: "AI Form Filling", desc: "Auto-fill forms with your saved data" },
    { icon: Shield, title: "Secure Storage", desc: "Bank-grade encryption for documents" },
    { icon: Briefcase, title: "1000+ Jobs", desc: "Access all government job listings" },
    { icon: Clock, title: "Deadline Alerts", desc: "Never miss an application deadline" },
  ];

  const stats = [
    { value: "50,000+", label: "Happy Users" },
    { value: "99%", label: "Success Rate" },
    { value: "1,000+", label: "Jobs Listed" },
    { value: "24/7", label: "Support" },
  ];

  const handleSplashComplete = () => {
    sessionStorage.setItem("splash_seen", "true");
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                Easy<span className="text-green-600">Gov</span> Forms
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/govt-jobs" className="text-gray-600 hover:text-green-600 text-sm font-medium">
                Government Jobs
              </Link>
              <Link to="/how-it-works" className="text-gray-600 hover:text-green-600 text-sm font-medium">
                How It Works
              </Link>
              <Link to="/pricing" className="text-gray-600 hover:text-green-600 text-sm font-medium">
                Pricing
              </Link>
              <Link to="/contact" className="text-gray-600 hover:text-green-600 text-sm font-medium">
                Contact
              </Link>
            </nav>
            <div className="flex items-center gap-3">
              <Link to="/register">
                <Button variant="outline" size="sm" className="hidden sm:flex">
                  Register
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-green-50 to-white py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
                <Star className="h-4 w-4" />
                <span>Trusted by 50,000+ Government Job Seekers</span>
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                Your Gateway to
                <span className="text-green-600 block">Government Jobs</span>
              </h1>
              
              <p className="text-lg text-gray-600 leading-relaxed max-w-lg">
                Simplify your government job applications with AI-powered form filling, 
                secure document storage, and real-time application tracking.
              </p>

              {/* Feature Pills */}
              <div className="flex flex-wrap gap-3">
                {features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-full text-sm">
                    <feature.icon className="h-4 w-4 text-green-600" />
                    <span className="text-gray-700">{feature.title}</span>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <Link to="/register">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8">
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/govt-jobs">
                  <Button size="lg" variant="outline" className="border-gray-300">
                    Browse Jobs
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right - Login Card */}
            <div className="lg:pl-8">
              <Card className="shadow-xl border-0 bg-white">
                <CardContent className="p-8">
                  <div className="mb-6 text-center">
                    <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
                    <p className="mt-2 text-gray-500">Sign in to continue your journey</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          className="pl-10"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Link to="/forgot-password" className="text-sm text-green-600 hover:text-green-700">
                          Forgot password?
                        </Link>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          className="pl-10 pr-10"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-6" 
                      size="lg" 
                      disabled={isLoading}
                    >
                      {isLoading ? "Signing In..." : "Sign In"}
                      {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                    </Button>
                  </form>

                  <div className="mt-6 space-y-3">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">Or continue as</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Link to="/admin/login">
                        <Button variant="outline" className="w-full text-sm">
                          Admin
                        </Button>
                      </Link>
                      <Link to="/csc/login">
                        <Button variant="outline" className="w-full text-sm text-blue-600 border-blue-200 hover:bg-blue-50">
                          CSC Partner
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <p className="mt-6 text-center text-sm text-gray-500">
                    New to Easy Gov Forms?{" "}
                    <Link to="/register" className="font-medium text-green-600 hover:text-green-700">
                      Create an account
                    </Link>
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-y">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <p className="text-3xl lg:text-4xl font-bold text-green-600">{stat.value}</p>
                <p className="text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Why Choose Easy Gov Forms?</h2>
            <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
              Everything you need to successfully apply for government jobs, all in one place.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: CheckCircle2, title: "AI Form Filling", desc: "Our AI automatically fills your application forms using your saved profile data." },
              { icon: Shield, title: "Secure Document Storage", desc: "Bank-grade encryption keeps your sensitive documents safe and accessible." },
              { icon: Clock, title: "Deadline Reminders", desc: "Never miss an application deadline with our smart notification system." },
              { icon: Award, title: "Expert Support", desc: "Get help from our team of government job application specialists." },
            ].map((feature, idx) => (
              <Card key={idx} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-500">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-green-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Your Government Job Journey?
          </h2>
          <p className="text-green-100 mb-8 max-w-2xl mx-auto">
            Join thousands of successful applicants who have landed their dream government jobs with Easy Gov Forms.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100 px-8">
                Create Free Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/govt-jobs">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8">
                View Available Jobs
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600">
                  <FileText className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-bold text-white">
                  Easy<span className="text-green-500">Gov</span> Forms
                </span>
              </div>
              <p className="text-sm">
                Simplifying government job applications for everyone.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/govt-jobs" className="hover:text-white">Government Jobs</Link></li>
                <li><Link to="/how-it-works" className="hover:text-white">How It Works</Link></li>
                <li><Link to="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link to="/about" className="hover:text-white">About Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/contact" className="hover:text-white">Contact Us</Link></li>
                <li><Link to="/terms" className="hover:text-white">Terms of Service</Link></li>
                <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link to="/refund" className="hover:text-white">Refund Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Partners</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/csc/login" className="hover:text-white">CSC Partner Login</Link></li>
                <li><Link to="/admin/login" className="hover:text-white">Admin Portal</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} Easy Gov Forms. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Welcome;
