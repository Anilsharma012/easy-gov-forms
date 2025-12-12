import { Link } from "react-router-dom";
import {
  Package,
  CheckCircle,
  Clock,
  ShoppingCart,
  History,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { mockUserPackages, mockPackages } from "@/data/mockData";
import { toast } from "sonner";

export default function Packages() {
  const activePackages = mockUserPackages.filter((p) => p.status === "active");

  const handleBuyPackage = (packageName: string) => {
    toast.success(`Redirecting to payment for ${packageName} package...`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Packages & Credits</h1>
        <p className="text-muted-foreground">
          Manage your packages and track remaining credits.
        </p>
      </div>

      {/* Active Packages */}
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
              <Button asChild>
                <Link to="/pricing">Buy a Package</Link>
              </Button>
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
                    key={pkg.id}
                    className="p-6 rounded-xl bg-gradient-to-r from-primary/10 to-accent border border-primary/20"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold">{pkg.name}</h3>
                          <Badge className="bg-primary">Active</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Purchased on{" "}
                          {new Date(pkg.purchasedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {daysLeft} days remaining
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

      {/* Purchase History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Purchase History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockUserPackages.map((pkg) => (
              <div
                key={pkg.id}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{pkg.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(pkg.purchasedAt).toLocaleDateString()}
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

      <Separator />

      {/* Available Packages */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Buy More Credits
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {mockPackages.map((pkg) => (
            <Card
              key={pkg.id}
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
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-4">
                  {pkg.features.slice(0, 3).map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={pkg.popular ? "default" : "outline"}
                  onClick={() => handleBuyPackage(pkg.name)}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
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