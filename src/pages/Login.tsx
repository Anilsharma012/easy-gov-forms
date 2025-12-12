import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Mail, Lock, Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login - frontend only
    console.log("Login:", formData);
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - Form */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Logo */}
          <Link to="/" className="mb-8 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <FileText className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">
              Easy<span className="text-primary">Gov</span> Forms
            </span>
          </Link>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">Welcome back!</h2>
            <p className="mt-2 text-muted-foreground">
              Sign in to continue applying for government jobs.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email or Mobile</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="text"
                  placeholder="Enter email or mobile number"
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
                <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg">
              Sign In
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            New to Easy Gov Forms?{" "}
            <Link to="/register" className="font-medium text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Decorative */}
      <div className="relative hidden flex-1 lg:block">
        <div className="absolute inset-0 bg-primary">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZ2LTRoLTJ2NGgyek0yNiAyNHYtNGgtMnY0aDJ6bTAgNmgtMnY0aDJ2LTR6bS0xMCAxMHYtNGgtMnY0aDJ6bTAgNmgtMnY0aDJ2LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="max-w-md text-center text-primary-foreground">
            <h2 className="mb-4 text-3xl font-bold">Apply for 1000+ Government Jobs</h2>
            <p className="mb-8 text-primary-foreground/80">
              AI-assisted form filling, secure document storage, and real-time application tracking.
            </p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold">50K+</p>
                <p className="text-sm text-primary-foreground/70">Users</p>
              </div>
              <div>
                <p className="text-3xl font-bold">1K+</p>
                <p className="text-sm text-primary-foreground/70">Jobs</p>
              </div>
              <div>
                <p className="text-3xl font-bold">99%</p>
                <p className="text-sm text-primary-foreground/70">Success</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
