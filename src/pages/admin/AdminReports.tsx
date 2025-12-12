import {
  BarChart3,
  Download,
  Calendar,
  Users,
  CreditCard,
  FileText,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminStats } from "@/data/adminMockData";

const reportsData = [
  {
    title: "User Registrations",
    icon: Users,
    thisMonth: 156,
    lastMonth: 142,
    change: 9.8,
  },
  {
    title: "Package Sales",
    icon: CreditCard,
    thisMonth: 89,
    lastMonth: 76,
    change: 17.1,
  },
  {
    title: "Form Submissions",
    icon: FileText,
    thisMonth: 342,
    lastMonth: 298,
    change: 14.8,
  },
  {
    title: "Revenue",
    icon: TrendingUp,
    thisMonth: 125000,
    lastMonth: 108000,
    change: 15.7,
    isCurrency: true,
  },
];

const exportOptions = [
  { label: "User Report", description: "All registered users with KYC status" },
  { label: "Payment Report", description: "Transaction history and revenue" },
  { label: "Application Report", description: "Form submissions and status" },
  { label: "CSC Performance", description: "CSC center leads and conversions" },
];

export default function AdminReports() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            View platform statistics and export reports.
          </p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="thisMonth">
            <SelectTrigger className="w-40">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="thisWeek">This Week</SelectItem>
              <SelectItem value="thisMonth">This Month</SelectItem>
              <SelectItem value="lastMonth">Last Month</SelectItem>
              <SelectItem value="thisYear">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {reportsData.map((report) => {
          const Icon = report.icon;
          return (
            <Card key={report.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {report.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {report.isCurrency ? "₹" : ""}
                  {report.thisMonth.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <span className="text-success">+{report.change}%</span>
                  vs last month ({report.isCurrency ? "₹" : ""}
                  {report.lastMonth.toLocaleString()})
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Placeholder */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              User Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/50 rounded-lg">
              <p className="text-muted-foreground">Chart visualization here</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/50 rounded-lg">
              <p className="text-muted-foreground">Chart visualization here</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold">{adminStats.totalUsers}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Active Users</p>
              <p className="text-2xl font-bold">{adminStats.activeUsers}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">CSC Centers</p>
              <p className="text-2xl font-bold">{adminStats.cscCenters}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Total Applications</p>
              <p className="text-2xl font-bold">{adminStats.totalApplications}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Export Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {exportOptions.map((option) => (
              <div
                key={option.label}
                className="flex items-center justify-between p-4 rounded-lg border"
              >
                <div>
                  <p className="font-medium">{option.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {option.description}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    CSV
                  </Button>
                  <Button variant="outline" size="sm">
                    Excel
                  </Button>
                  <Button variant="outline" size="sm">
                    PDF
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}