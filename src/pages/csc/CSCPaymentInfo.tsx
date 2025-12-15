import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Building, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PaymentInfo {
  _id?: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
  accountType: string;
  upiId: string;
  status: string;
}

const CSCPaymentInfo = () => {
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    accountHolderName: "",
    accountType: "savings",
    upiId: "",
    status: "pending",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPaymentInfo();
  }, []);

  const fetchPaymentInfo = async () => {
    try {
      const response = await fetch("/api/csc/dashboard/payment-info", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        if (data.paymentInfo) {
          setPaymentInfo(data.paymentInfo);
        }
      }
    } catch (error) {
      console.error("Error fetching payment info:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await fetch("/api/csc/dashboard/payment-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(paymentInfo),
      });

      if (response.ok) {
        toast({ title: "Success", description: "Payment information saved for approval" });
        fetchPaymentInfo();
      } else {
        const data = await response.json();
        toast({ title: "Error", description: data.message || "Failed to save", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to save payment information", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = () => {
    switch (paymentInfo.status) {
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Approved
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" /> Pending Approval
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800">
            <AlertCircle className="w-3 h-3 mr-1" /> Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading payment information...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Payment Information</h1>
          <p className="text-muted-foreground">Add your bank details for receiving payments</p>
        </div>
        {paymentInfo._id && getStatusBadge()}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Bank Account Details
            </CardTitle>
            <CardDescription>Enter your bank account information for withdrawals</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="accountHolderName">Account Holder Name</Label>
                <Input
                  id="accountHolderName"
                  value={paymentInfo.accountHolderName}
                  onChange={(e) => setPaymentInfo({ ...paymentInfo, accountHolderName: e.target.value })}
                  placeholder="Enter name as per bank account"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name</Label>
                <Input
                  id="bankName"
                  value={paymentInfo.bankName}
                  onChange={(e) => setPaymentInfo({ ...paymentInfo, bankName: e.target.value })}
                  placeholder="e.g., State Bank of India"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  value={paymentInfo.accountNumber}
                  onChange={(e) => setPaymentInfo({ ...paymentInfo, accountNumber: e.target.value })}
                  placeholder="Enter account number"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ifscCode">IFSC Code</Label>
                <Input
                  id="ifscCode"
                  value={paymentInfo.ifscCode}
                  onChange={(e) => setPaymentInfo({ ...paymentInfo, ifscCode: e.target.value.toUpperCase() })}
                  placeholder="e.g., SBIN0001234"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountType">Account Type</Label>
                <Select 
                  value={paymentInfo.accountType} 
                  onValueChange={(value) => setPaymentInfo({ ...paymentInfo, accountType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="savings">Savings Account</SelectItem>
                    <SelectItem value="current">Current Account</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? "Saving..." : "Save Bank Details"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              UPI Details
            </CardTitle>
            <CardDescription>Add your UPI ID for quick payments (optional)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="upiId">UPI ID</Label>
                <Input
                  id="upiId"
                  value={paymentInfo.upiId}
                  onChange={(e) => setPaymentInfo({ ...paymentInfo, upiId: e.target.value })}
                  placeholder="e.g., yourname@upi"
                />
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Note</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Your payment information will be verified by admin</li>
                  <li>• Once approved, you can request withdrawals</li>
                  <li>• Ensure all details are correct to avoid delays</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CSCPaymentInfo;
