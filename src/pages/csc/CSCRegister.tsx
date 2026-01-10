import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, User, Mail, Phone, Lock, Eye, EyeOff, MapPin, FileText, Upload, Image, IdCard, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import CSCPhoneAuthForm from "@/components/CSCPhoneAuthForm";

interface FileUpload {
  fileName: string;
  fileData: string;
}

const CSCRegister = () => {
  const [authMode, setAuthMode] = useState<'phone' | 'traditional'>('phone');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    centerName: "",
    ownerName: "",
    email: "",
    mobile: "",
    password: "",
    address: "",
    district: "",
    state: "",
    pincode: "",
    cscId: "",
    registrationNumber: "",
  });

  const [addressProof, setAddressProof] = useState<FileUpload | null>(null);
  const [identityProof, setIdentityProof] = useState<FileUpload | null>(null);
  const [photo, setPhoto] = useState<FileUpload | null>(null);

  const addressProofRef = useRef<HTMLInputElement>(null);
  const identityProofRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { cscPhoneAuth } = useAuth();

  const handlePhoneAuthSuccess = async (idToken: string, firebaseUser: any) => {
    try {
      await cscPhoneAuth(idToken, firebaseUser.phoneNumber, "signup");
      toast({
        title: "Account Created",
        description: "Your CSC account has been created successfully!",
      });
      navigate("/csc/dashboard");
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    }
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setFile: React.Dispatch<React.SetStateAction<FileUpload | null>>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload JPG, PNG or PDF files only",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "File size should be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFile({
        fileName: file.name,
        fileData: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!acceptTerms) {
      toast({
        title: "Terms Required",
        description: "Please accept the terms and conditions",
        variant: "destructive",
      });
      return;
    }

    if (!formData.registrationNumber) {
      toast({
        title: "Registration Number Required",
        description: "Please enter your CSC registration number",
        variant: "destructive",
      });
      return;
    }

    if (!addressProof || !identityProof || !photo) {
      toast({
        title: "Documents Required",
        description: "Please upload all required documents (Address Proof, Identity Proof, Photo)",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/csc/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          addressProof,
          identityProof,
          photo,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      toast({
        title: "Registration Submitted",
        description: "Your application is under review. We'll notify you once approved.",
      });
      navigate("/csc/login");
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden flex-1 lg:block">
        <div className="absolute inset-0 bg-blue-600">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZ2LTRoLTJ2NGgyek0yNiAyNHYtNGgtMnY0aDJ6bTAgNmgtMnY0aDJ2LTR6bS0xMCAxMHYtNGgtMnY0aDJ6bTAgNmgtMnY0aDJ2LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="max-w-md text-white">
            <h2 className="mb-6 text-3xl font-bold">Become a CSC Partner</h2>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20">
                  <span className="text-sm font-medium">1</span>
                </div>
                <div>
                  <p className="font-medium">Register Your Center</p>
                  <p className="text-sm text-white/70">Provide your CSC details & documents</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20">
                  <span className="text-sm font-medium">2</span>
                </div>
                <div>
                  <p className="font-medium">Get Verified</p>
                  <p className="text-sm text-white/70">We verify your credentials</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20">
                  <span className="text-sm font-medium">3</span>
                </div>
                <div>
                  <p className="font-medium">Start Earning</p>
                  <p className="text-sm text-white/70">Refer users and earn commissions</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24 overflow-auto">
        <div className="mx-auto w-full max-w-lg">
          <Link to="/" className="mb-8 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">
              CSC <span className="text-blue-600">Partner Portal</span>
            </span>
          </Link>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground">Register as CSC Partner</h2>
            <p className="mt-2 text-muted-foreground">
              Join our network and help citizens with government applications.
            </p>
          </div>

          <Tabs value={authMode} onValueChange={(value) => setAuthMode(value as 'phone' | 'traditional')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="phone">Quick Registration</TabsTrigger>
              <TabsTrigger value="traditional">Full Registration</TabsTrigger>
            </TabsList>

            <TabsContent value="phone">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground mb-4">
                    Sign up with your mobile number and verify via OTP. Complete your profile details later.
                  </p>
                  <CSCPhoneAuthForm
                    mode="signup"
                    onSuccess={handlePhoneAuthSuccess}
                    onError={(error) =>
                      toast({
                        title: "Error",
                        description: error,
                        variant: "destructive",
                      })
                    }
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="traditional">
              <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="centerName">Center Name</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="centerName"
                    type="text"
                    placeholder="Your CSC center name"
                    className="pl-10"
                    value={formData.centerName}
                    onChange={(e) => setFormData({ ...formData, centerName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ownerName">Owner Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="ownerName"
                    type="text"
                    placeholder="Your full name"
                    className="pl-10"
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    className="pl-10"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="mobile"
                    type="tel"
                    placeholder="10-digit mobile"
                    className="pl-10"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="registrationNumber">Registration Number *</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="registrationNumber"
                    type="text"
                    placeholder="Your CSC registration number"
                    className="pl-10"
                    value={formData.registrationNumber}
                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cscId">CSC ID (Optional)</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="cscId"
                    type="text"
                    placeholder="Your official CSC ID"
                    className="pl-10"
                    value={formData.cscId}
                    onChange={(e) => setFormData({ ...formData, cscId: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea
                  id="address"
                  placeholder="Full address of your CSC center"
                  className="pl-10 min-h-[80px]"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="district">District</Label>
                <Input
                  id="district"
                  type="text"
                  placeholder="District"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  type="text"
                  placeholder="State"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  type="text"
                  placeholder="6-digit"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Required Documents
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Address Proof *
                  </Label>
                  <input
                    ref={addressProofRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, setAddressProof)}
                  />
                  <Button
                    type="button"
                    variant={addressProof ? "default" : "outline"}
                    className="w-full"
                    onClick={() => addressProofRef.current?.click()}
                  >
                    {addressProof ? (
                      <span className="truncate text-xs">{addressProof.fileName}</span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Upload
                      </span>
                    )}
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <IdCard className="h-4 w-4" />
                    Identity Proof *
                  </Label>
                  <input
                    ref={identityProofRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, setIdentityProof)}
                  />
                  <Button
                    type="button"
                    variant={identityProof ? "default" : "outline"}
                    className="w-full"
                    onClick={() => identityProofRef.current?.click()}
                  >
                    {identityProof ? (
                      <span className="truncate text-xs">{identityProof.fileName}</span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Upload
                      </span>
                    )}
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    Photo *
                  </Label>
                  <input
                    ref={photoRef}
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, setPhoto)}
                  />
                  <Button
                    type="button"
                    variant={photo ? "default" : "outline"}
                    className="w-full"
                    onClick={() => photoRef.current?.click()}
                  >
                    {photo ? (
                      <span className="truncate text-xs">{photo.fileName}</span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Upload
                      </span>
                    )}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Accepted formats: JPG, PNG, PDF (Max 5MB each)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password (min 6 chars)"
                  className="pl-10 pr-10"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
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

            <div className="flex items-start gap-2">
              <Checkbox
                id="terms"
                checked={acceptTerms}
                onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
              />
              <label htmlFor="terms" className="text-sm text-muted-foreground">
                I agree to the{" "}
                <Link to="/terms" className="text-blue-600 hover:underline">
                  Terms & Conditions
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-blue-600 hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" size="lg" disabled={!acceptTerms || isLoading}>
                  {isLoading ? "Submitting..." : "Submit Registration"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already a partner?{" "}
            <Link to="/csc/login" className="font-medium text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CSCRegister;
