import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, CheckCircle, Users, IndianRupee } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface LeadPackage {
  _id: string;
  name: string;
  leads: number;
  price: number;
  validity: number;
  features: string[];
  isActive: boolean;
}

interface AssignedPackage {
  _id: string;
  packageId?: {
    _id: string;
    name: string;
    leads: number;
  };
  packageName: string;
  totalLeads: number;
  usedLeads: number;
  remainingLeads: number;
  status: string;
  expiresAt: string;
  assignedAt: string;
}

const CSCPackages = () => {
  const [availablePackages, setAvailablePackages] = useState<LeadPackage[]>([]);
  const [myPackages, setMyPackages] = useState<AssignedPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const [packagesRes, myPackagesRes] = await Promise.all([
          fetch("/api/csc/dashboard/available-packages", { credentials: "include" }),
          fetch("/api/csc/dashboard/packages", { credentials: "include" }),
        ]);

        if (packagesRes.ok) {
          const data = await packagesRes.json();
          setAvailablePackages((data.packages || []).filter((pkg: LeadPackage) => pkg.isActive));
        }

        if (myPackagesRes.ok) {
          const data = await myPackagesRes.json();
          setMyPackages(data.packages || []);
        }
      } catch (error) {
        console.error("Failed to fetch packages:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPackages();
  }, []);

  const handlePurchase = async (packageId: string) => {
    try {
      const orderRes = await fetch("/api/csc/dashboard/purchase-package/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ packageId }),
      });

      if (!orderRes.ok) {
        const error = await orderRes.json();
        throw new Error(error.message || "Failed to create order");
      }

      const orderData = await orderRes.json();

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Easy Gov Forms",
        description: `CSC Lead Package - ${orderData.packageName}`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/csc/dashboard/purchase-package/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (verifyRes.ok) {
              toast({
                title: "Payment Successful",
                description: "Package has been added to your account!",
              });
              window.location.reload();
            } else {
              const error = await verifyRes.json();
              throw new Error(error.message || "Payment verification failed");
            }
          } catch (error: any) {
            toast({
              title: "Payment Failed",
              description: error.message || "Failed to verify payment",
              variant: "destructive",
            });
          }
        },
        prefill: {},
        theme: {
          color: "#2563eb",
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to initiate payment",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "exhausted":
        return <Badge className="bg-yellow-100 text-yellow-800">Exhausted</Badge>;
      case "expired":
        return <Badge className="bg-red-100 text-red-800">Expired</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Lead Packages</h1>
        <p className="text-muted-foreground">
          Purchase lead packages to refer more users
        </p>
      </div>

      {myPackages.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">My Active Packages</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {myPackages.map((pkg) => (
              <Card key={pkg._id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{pkg.packageId?.name || pkg.packageName}</CardTitle>
                    {getStatusBadge(pkg.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Leads Used:</span>
                      <span className="font-medium">{pkg.usedLeads} / {pkg.totalLeads}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Remaining:</span>
                      <span className="font-medium text-green-600">{pkg.remainingLeads}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Expires:</span>
                      <span className="font-medium">
                        {format(new Date(pkg.expiresAt), "dd MMM yyyy")}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${pkg.totalLeads > 0 ? (pkg.usedLeads / pkg.totalLeads) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Available Packages</h2>
        {availablePackages.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No packages available</h3>
              <p className="text-muted-foreground">
                Please contact admin for lead packages
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {availablePackages.map((pkg) => (
              <Card key={pkg._id} className="relative overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-blue-600" />
                    {pkg.name}
                  </CardTitle>
                  <CardDescription>
                    Valid for {pkg.validity} days
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-baseline gap-1">
                    <IndianRupee className="h-5 w-5" />
                    <span className="text-3xl font-bold">{pkg.price}</span>
                  </div>

                  <div className="flex items-center gap-2 text-lg">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold">{pkg.leads} Leads</span>
                  </div>

                  <ul className="space-y-2">
                    {pkg.features?.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => handlePurchase(pkg._id)}
                  >
                    Purchase Package
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CSCPackages;
