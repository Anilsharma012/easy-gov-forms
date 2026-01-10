import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import CSCPhoneAuthForm from "@/components/CSCPhoneAuthForm";

const CSCLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { cscPhoneAuth } = useAuth();

  const handlePhoneAuthSuccess = async (idToken: string, firebaseUser: any) => {
    try {
      await cscPhoneAuth(idToken, firebaseUser.phoneNumber, "login");
      toast({
        title: "Login Successful",
        description: "Welcome to CSC Dashboard!",
      });
      navigate("/csc/dashboard");
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <Link to="/" className="mb-8 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">
              CSC <span className="text-blue-600">Partner Portal</span>
            </span>
          </Link>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">CSC Center Login</h2>
            <p className="mt-2 text-muted-foreground">
              Sign in to manage your leads and earn commissions.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" size="lg" disabled={isLoading}>
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6">
            <Link to="/login">
              <Button variant="outline" className="w-full">
                User Login
              </Button>
            </Link>
          </div>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Want to become a CSC Partner?{" "}
            <Link to="/csc/register" className="font-medium text-blue-600 hover:underline">
              Register Now
            </Link>
          </p>
        </div>
      </div>

      <div className="relative hidden flex-1 lg:block">
        <div className="absolute inset-0 bg-blue-600">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZ2LTRoLTJ2NGgyek0yNiAyNHYtNGgtMnY0aDJ6bTAgNmgtMnY0aDJ2LTR6bS0xMCAxMHYtNGgtMnY0aDJ6bTAgNmgtMnY0aDJ2LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="max-w-md text-center text-white">
            <h2 className="mb-4 text-3xl font-bold">Earn with Every Application</h2>
            <p className="mb-8 text-white/80">
              Help citizens apply for government jobs and earn commissions on every successful application.
            </p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold">500+</p>
                <p className="text-sm text-white/70">CSC Partners</p>
              </div>
              <div>
                <p className="text-3xl font-bold">10K+</p>
                <p className="text-sm text-white/70">Leads Generated</p>
              </div>
              <div>
                <p className="text-3xl font-bold">5L+</p>
                <p className="text-sm text-white/70">Earned</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CSCLogin;
