import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  CheckCircle,
  Clock,
  ShoppingCart,
  History,
  Zap,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PackageType {
  _id: string;
  name: string;
  forms: number;
  price: number;
  originalPrice: number;
  features: string[];
  popular: boolean;
  validity: number;
}

interface UserPackageType {
  _id: string;
  packageName: string;
  totalForms: number;
  usedForms: number;
  remainingForms: number;
  purchasedAt: string;
  expiresAt: string;
  status: "active" | "expired";
  amount: number;
}

export default function Packages() {
  const [packages, setPackages] = useState<PackageType[]>([]);
  const [userPackages, setUserPackages] = useState<UserPackageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
    loadRazorpay();
  }, []);

  const loadRazorpay = () => {
    if (!document.getElementById("razorpay-script")) {
      const script = document.createElement("script");
      script.id = "razorpay-script";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  };

  const fetchData = async () => {
    try {
      const [packagesRes, userPackagesRes] = await Promise.all([
        fetch("/api/payments/packages"),
        fetch("/api/payments/my-packages", { credentials: "include" }),
      ]);

      if (packagesRes.ok) {
        const data = await packagesRes.json();
        setPackages(data.packages || []);
      }

      if (userPackagesRes.ok) {
        const data = await userPackagesRes.json();
        setUserPackages(data.packages || []);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyPackage = async (pkg: PackageType) => {
    setBuying(pkg._id);
    try {
      const response = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ packageId: pkg._id }),
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error(data.message || "Failed to create order");
        setBuying(null);
        return;
      }

      const orderData = await response.json();

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Easy Gov Forms",
        description: `${pkg.name} Package - ${pkg.forms} Forms`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/payments/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                packageId: pkg._id,
              }),
            });

            if (verifyRes.ok) {
              toast.success("Payment successful! Package activated.");
              fetchData();
            } else {
              const data = await verifyRes.json();
              toast.error(data.message || "Payment verification failed");
            }
          } catch (error) {
            toast.error("Payment verification failed");
          }
          setBuying(null);
        },
        prefill: {
          name: "",
          email: "",
          contact: "",
        },
        theme: {
          color: "#16a34a",
        },
        modal: {
          ondismiss: function () {
            setBuying(null);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      toast.error("Failed to initiate payment");
      setBuying(null);
    }
  };

  const activePackages = userPackages.filter((p) => p.status === "active");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Packages & Credits</h1>
        <p className="text-muted-foreground">
          Manage your packages and track remaining credits.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Active Packages
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activePackages.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                You don't have any active packages.
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Purchase a package below to start applying for jobs.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activePackages.map((pkg) => {
                const progress = (pkg.usedForms / pkg.totalForms) * 100;
                const daysLeft = Math.ceil(
                  (new Date(pkg.expiresAt).getTime() - new Date().getTime()) /
                    (1000 * 60 * 60 * 24)
                );

                return (
                  <div
                    key={pkg._id}
                    className="p-6 rounded-xl bg-gradient-to-r from-primary/10 to-accent border border-primary/20"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold">{pkg.packageName}</h3>
                          <Badge className="bg-primary">Active</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Purchased on{" "}
                          {new Date(pkg.purchasedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {daysLeft <= 7 && (
                          <AlertCircle className="h-4 w-4 text-warning" />
                        )}
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {daysLeft > 0 ? `${daysLeft} days remaining` : "Expiring soon"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Forms Used</span>
                        <span className="font-medium">
                          {pkg.usedForms} / {pkg.totalForms}
                        </span>
                      </div>
                      <Progress value={progress} className="h-3" />
                      <p className="text-sm text-muted-foreground">
                        <span className="text-primary font-bold">
                          {pkg.remainingForms}
                        </span>{" "}
                        forms remaining
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {userPackages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Purchase History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userPackages.map((pkg) => (
                <div
                  key={pkg._id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{pkg.packageName}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(pkg.purchasedAt).toLocaleDateString()} • ₹{pkg.amount}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      pkg.status === "active"
                        ? "bg-success/10 text-success border-success/20"
                        : "bg-muted text-muted-foreground"
                    }
                  >
                    {pkg.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Buy Packages
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {packages.map((pkg) => (
            <Card
              key={pkg._id}
              className={`relative ${
                pkg.popular ? "border-primary shadow-lg" : ""
              }`}
            >
              {pkg.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  Most Popular
                </Badge>
              )}
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-lg">{pkg.name}</CardTitle>
                <p className="text-3xl font-bold text-primary">
                  ₹{pkg.price}
                  <span className="text-sm text-muted-foreground line-through ml-2">
                    ₹{pkg.originalPrice}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">
                  {pkg.forms} Form Applications
                </p>
                <p className="text-xs text-muted-foreground">
                  Valid for {pkg.validity} days
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-4">
                  {pkg.features.slice(0, 4).map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={pkg.popular ? "default" : "outline"}
                  onClick={() => handleBuyPackage(pkg)}
                  disabled={buying === pkg._id}
                >
                  {buying === pkg._id ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <ShoppingCart className="h-4 w-4 mr-2" />
                  )}
                  Buy Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
