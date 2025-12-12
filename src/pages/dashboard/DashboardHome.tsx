import { Link } from "react-router-dom";
import {
  Package,
  FileText,
  Clock,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  mockUserPackages,
  mockApplications,
  mockJobs,
  mockNotifications,
} from "@/data/mockData";

const statusColors = {
  pending: "bg-warning/10 text-warning border-warning/20",
  processing: "bg-info/10 text-info border-info/20",
  submitted: "bg-primary/10 text-primary border-primary/20",
  completed: "bg-success/10 text-success border-success/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function DashboardHome() {
  const activePackage = mockUserPackages[0];
  const packageProgress = activePackage
    ? (activePackage.usedForms / activePackage.totalForms) * 100
    : 0;

  const upcomingDeadlines = mockJobs
    .filter((job) => new Date(job.lastDate) > new Date())
    .slice(0, 3);

  const unreadNotifications = mockNotifications.filter((n) => !n.read).slice(0, 3);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Welcome back, Rahul!</h1>
        <p className="text-muted-foreground">
          Here's an overview of your applications and packages.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Package</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {activePackage?.remainingForms || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              forms remaining of {activePackage?.totalForms || 0}
            </p>
            <Progress value={packageProgress} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockApplications.length}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success">+2</span> this month
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockApplications.filter((a) => a.status === "processing").length}
            </div>
            <p className="text-xs text-muted-foreground">being processed</p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockApplications.filter((a) => a.status === "completed").length}
            </div>
            <p className="text-xs text-muted-foreground">successfully submitted</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Applications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Applications</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard/applications">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockApplications.slice(0, 3).map((app) => (
              <div
                key={app.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div className="space-y-1">
                  <p className="font-medium text-sm line-clamp-1">{app.jobTitle}</p>
                  <p className="text-xs text-muted-foreground">
                    {app.applicationId}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={statusColors[app.status]}
                >
                  {app.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Upcoming Deadlines</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard/jobs">
                Browse Jobs <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingDeadlines.map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div className="space-y-1">
                  <p className="font-medium text-sm line-clamp-1">{job.title}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    Last Date: {new Date(job.lastDate).toLocaleDateString()}
                  </div>
                </div>
                <Button size="sm" asChild>
                  <Link to={`/job/${job.id}`}>Apply</Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-auto p-4 flex-col gap-2" asChild>
              <Link to="/dashboard/jobs">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span>Apply for New Job</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col gap-2" asChild>
              <Link to="/dashboard/documents">
                <FileText className="h-5 w-5 text-primary" />
                <span>Upload Documents</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col gap-2" asChild>
              <Link to="/dashboard/packages">
                <Package className="h-5 w-5 text-primary" />
                <span>Buy Package</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col gap-2" asChild>
              <Link to="/dashboard/support">
                <AlertTriangle className="h-5 w-5 text-primary" />
                <span>Contact Support</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}