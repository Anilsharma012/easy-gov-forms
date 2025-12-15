import { useState, useEffect } from "react";
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
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";

interface Application {
  _id: string;
  applicationId: string;
  formName: string;
  status: string;
  createdAt: string;
  jobId?: {
    _id: string;
    title: string;
    department: string;
    applicationDeadline: string;
  };
}

interface UserPackage {
  _id: string;
  packageId: {
    _id: string;
    name: string;
    totalForms: number;
  };
  status: string;
  formsUsed: number;
  purchaseDate: string;
  expiryDate: string;
}

interface Job {
  _id: string;
  title: string;
  department: string;
  applicationDeadline: string;
}

interface DocumentStatus {
  hasAllRequired: boolean;
  allVerified: boolean;
  missingDocuments: string[];
  pendingDocuments: string[];
  uploadedCount: number;
}

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  processing: "bg-info/10 text-info border-info/20",
  submitted: "bg-primary/10 text-primary border-primary/20",
  completed: "bg-success/10 text-success border-success/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function DashboardHome() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);
  const [packages, setPackages] = useState<UserPackage[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [documentStatus, setDocumentStatus] = useState<DocumentStatus | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [appsRes, packagesRes, jobsRes, docsRes] = await Promise.all([
        fetch("/api/user-applications/my-applications", { credentials: "include" }),
        fetch("/api/user-packages/my-packages", { credentials: "include" }),
        fetch("/api/jobs?limit=5", { credentials: "include" }),
        fetch("/api/documents/check-required", { credentials: "include" }),
      ]);

      if (appsRes.ok) {
        const data = await appsRes.json();
        setApplications(data.applications || []);
      }

      if (packagesRes.ok) {
        const data = await packagesRes.json();
        setPackages(data.packages || []);
      }

      if (jobsRes.ok) {
        const data = await jobsRes.json();
        setJobs(data.jobs || []);
      }

      if (docsRes.ok) {
        const data = await docsRes.json();
        setDocumentStatus(data);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const activePackage = packages.find(p => p.status === "active");
  const totalForms = activePackage?.packageId?.totalForms || 0;
  const usedForms = activePackage?.formsUsed || 0;
  const remainingForms = totalForms - usedForms;
  const packageProgress = totalForms > 0 ? (usedForms / totalForms) * 100 : 0;

  const upcomingDeadlines = jobs
    .filter((job) => new Date(job.applicationDeadline) > new Date())
    .slice(0, 3);

  const processingCount = applications.filter((a) => a.status === "processing").length;
  const completedCount = applications.filter((a) => a.status === "completed").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const documentTypeLabels: Record<string, string> = {
    aadhaar: "Aadhaar Card",
    photo: "Passport Photo",
    signature: "Signature",
    "10th_marksheet": "10th Marksheet",
  };

  const showDocumentAlert = activePackage && documentStatus && !documentStatus.hasAllRequired;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, {user?.name || "User"}!
        </h1>
        <p className="text-muted-foreground">
          Here's an overview of your applications and packages.
        </p>
      </div>

      {showDocumentAlert && (
        <Card className="border-warning bg-warning/10 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-warning mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-warning text-lg">
                  Upload Required Documents
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  You need to upload the following documents before you can apply for jobs:
                </p>
                <ul className="mt-2 space-y-1">
                  {documentStatus.missingDocuments.map((docType) => (
                    <li key={docType} className="text-sm flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-warning" />
                      {documentTypeLabels[docType] || docType}
                    </li>
                  ))}
                </ul>
                <Button asChild className="mt-3" size="sm">
                  <Link to="/dashboard/documents">
                    <FileText className="h-4 w-4 mr-2" />
                    Upload Documents Now
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Package</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {remainingForms}
            </div>
            <p className="text-xs text-muted-foreground">
              forms remaining of {totalForms}
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
            <div className="text-2xl font-bold">{applications.length}</div>
            <p className="text-xs text-muted-foreground">
              submitted applications
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{processingCount}</div>
            <p className="text-xs text-muted-foreground">being processed</p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCount}</div>
            <p className="text-xs text-muted-foreground">successfully submitted</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
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
            {applications.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No applications yet
              </p>
            ) : (
              applications.slice(0, 3).map((app) => (
                <div
                  key={app._id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-sm line-clamp-1">
                      {app.jobId?.title || app.formName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {app.applicationId}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={statusColors[app.status] || "bg-muted"}
                  >
                    {app.status}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

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
            {upcomingDeadlines.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No upcoming deadlines
              </p>
            ) : (
              upcomingDeadlines.map((job) => (
                <div
                  key={job._id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-sm line-clamp-1">{job.title}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      Last Date: {new Date(job.applicationDeadline).toLocaleDateString()}
                    </div>
                  </div>
                  <Button size="sm" asChild>
                    <Link to={`/job/${job._id}`}>Apply</Link>
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

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
