import { Link } from "react-router-dom";
import {
  Users,
  CreditCard,
  FileText,
  LifeBuoy,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Building2,
  Package,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  adminStats,
  mockAdminUsers,
  mockAdminPayments,
  mockAdminTickets,
} from "@/data/adminMockData";

export default function AdminDashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of Easy Gov Forms platform statistics.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {adminStats.totalUsers.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-success" />
              <span className="text-success">+12%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{adminStats.monthlyRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-success" />
              <span className="text-success">+8%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {adminStats.totalApplications.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-warning">{adminStats.pendingApplications}</span>{" "}
              pending
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <LifeBuoy className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminStats.openTickets}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingDown className="h-3 w-3 text-success" />
              <span className="text-success">-5</span> from yesterday
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Users</p>
              <p className="text-2xl font-bold">{adminStats.activeUsers}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-info/10 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">CSC Centers</p>
              <p className="text-2xl font-bold">{adminStats.cscCenters}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold">
                ₹{adminStats.totalRevenue.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Registrations</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/users">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockAdminUsers.slice(0, 4).map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  {user.kycVerified ? (
                    <Badge variant="outline" className="bg-success/10 text-success">
                      KYC Verified
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-warning/10 text-warning">
                      Pending KYC
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Payments</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/payments">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockAdminPayments.slice(0, 4).map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div>
                  <p className="font-medium">{payment.userName}</p>
                  <p className="text-xs text-muted-foreground">
                    {payment.packageName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">₹{payment.amount}</p>
                  <Badge
                    variant="outline"
                    className={
                      payment.status === "success"
                        ? "bg-success/10 text-success"
                        : payment.status === "failed"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-warning/10 text-warning"
                    }
                  >
                    {payment.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Open Tickets */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-warning" />
            Tickets Requiring Attention
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin/support">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockAdminTickets
              .filter((t) => t.status !== "resolved" && t.status !== "closed")
              .slice(0, 3)
              .map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{ticket.subject}</p>
                      <Badge
                        variant="outline"
                        className={
                          ticket.priority === "urgent"
                            ? "bg-destructive/10 text-destructive"
                            : ticket.priority === "high"
                            ? "bg-warning/10 text-warning"
                            : "bg-muted"
                        }
                      >
                        {ticket.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {ticket.userName} • {ticket.ticketId}
                    </p>
                  </div>
                  <Button size="sm">Assign</Button>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}