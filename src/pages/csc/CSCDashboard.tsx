import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Package, IndianRupee, TrendingUp, Clock, CheckCircle } from "lucide-react";

interface DashboardStats {
  totalLeads: number;
  usedLeads: number;
  remainingLeads: number;
  pendingLeads: number;
  convertedLeads: number;
  totalEarnings: number;
  centerStatus: string;
  activePackages: number;
}

interface CSCCenter {
  centerName: string;
  ownerName: string;
  status: string;
  totalLeads: number;
  usedLeads: number;
  totalEarnings: number;
}

const CSCDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [center, setCenter] = useState<CSCCenter | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, profileRes] = await Promise.all([
          fetch("/api/csc/dashboard/stats", { credentials: "include" }),
          fetch("/api/csc/auth/me", { credentials: "include" }),
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData.stats);
        }

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setCenter(profileData.cscCenter);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending Verification</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome, {center?.ownerName || "Partner"}!
          </h1>
          <div className="text-muted-foreground flex items-center gap-2">
            <span>{center?.centerName}</span> {center && getStatusBadge(center.status)}
          </div>
        </div>
      </div>

      {center?.status === "pending" && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="flex items-center gap-4 p-4">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div>
              <h3 className="font-semibold text-yellow-800">Verification Pending</h3>
              <p className="text-sm text-yellow-700">
                Your CSC center is under review. You'll be able to generate leads once verified.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {center?.status === "verified" && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="flex items-center gap-4 p-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <h3 className="font-semibold text-green-800">Account Verified</h3>
              <p className="text-sm text-green-700">
                Your CSC center is verified. Start generating leads and earn commissions!
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalLeads || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.pendingLeads || 0} pending, {stats?.convertedLeads || 0} converted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats?.totalEarnings || 0}</div>
            <p className="text-xs text-muted-foreground">
              From {stats?.convertedLeads || 0} conversions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Packages</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activePackages || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.remainingLeads || 0} leads remaining
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalLeads ? Math.round((stats.convertedLeads / stats.totalLeads) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Lead to customer conversion
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks you can perform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <a
              href="/csc/dashboard/leads"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">View All Leads</p>
                <p className="text-sm text-muted-foreground">Manage your referred users</p>
              </div>
            </a>
            <a
              href="/csc/dashboard/packages"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <Package className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">Buy Lead Packages</p>
                <p className="text-sm text-muted-foreground">Purchase more leads capacity</p>
              </div>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
            <CardDescription>Start earning in 3 simple steps</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm font-medium">
                1
              </div>
              <div>
                <p className="font-medium">Buy a Lead Package</p>
                <p className="text-sm text-muted-foreground">Choose from various package sizes</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm font-medium">
                2
              </div>
              <div>
                <p className="font-medium">Generate Referral Links</p>
                <p className="text-sm text-muted-foreground">Share with potential users</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm font-medium">
                3
              </div>
              <div>
                <p className="font-medium">Earn Commission</p>
                <p className="text-sm text-muted-foreground">Get paid when users subscribe</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CSCDashboard;
