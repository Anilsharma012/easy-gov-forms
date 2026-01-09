import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  Calendar,
  MapPin,
  Users,
  IndianRupee,
  ArrowLeft,
  Briefcase,
  GraduationCap,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface Job {
  _id: string;
  title: string;
  department: string;
  category: string;
  location: string;
  eligibility: string;
  description?: string;
  startDate: string;
  lastDate: string;
  vacancies: number;
  salaryRange: string;
  fees: {
    general: number;
    obc: number;
    sc: number;
    st: number;
  };
  isActive: boolean;
}

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/jobs/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError("Job not found");
          } else {
            setError("Failed to load job details");
          }
          return;
        }
        const data = await response.json();
        setJob(data.job);
      } catch (err) {
        setError("Failed to load job details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchJob();
    }
  }, [id]);

  const handleApply = () => {
    if (!isAuthenticated) {
      navigate("/login");
    } else {
      navigate("/dashboard/jobs");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16 text-center">
          <Loader2 className="mx-auto mb-4 h-16 w-16 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading job details...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16 text-center">
          <AlertCircle className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
          <h1 className="mb-2 text-2xl font-bold text-foreground">Job Not Found</h1>
          <p className="mb-6 text-muted-foreground">
            The job you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/govt-jobs">Browse All Jobs</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const qualifications = job.eligibility ? job.eligibility.split(",").map(q => q.trim()) : [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <Link
            to="/govt-jobs"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to all jobs
          </Link>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
                <div className="mb-6">
                  <span className="mb-3 inline-block rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
                    {job.category}
                  </span>
                  <h1 className="mb-2 text-2xl font-bold text-foreground md:text-3xl">
                    {job.title}
                  </h1>
                  <p className="flex items-center gap-2 text-lg text-muted-foreground">
                    <Briefcase className="h-5 w-5" />
                    {job.department}
                  </p>
                </div>

                <div className="mb-8 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                  <div className="rounded-xl bg-muted/50 p-4 text-center">
                    <MapPin className="mx-auto mb-2 h-5 w-5 text-primary" />
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium text-foreground">{job.location}</p>
                  </div>
                  <div className="rounded-xl bg-muted/50 p-4 text-center">
                    <Users className="mx-auto mb-2 h-5 w-5 text-primary" />
                    <p className="text-sm text-muted-foreground">Vacancies</p>
                    <p className="font-medium text-foreground">{job.vacancies.toLocaleString()}</p>
                  </div>
                  <div className="rounded-xl bg-muted/50 p-4 text-center">
                    <Calendar className="mx-auto mb-2 h-5 w-5 text-primary" />
                    <p className="text-sm text-muted-foreground">Last Date</p>
                    <p className="font-medium text-foreground">
                      {new Date(job.lastDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="rounded-xl bg-muted/50 p-4 text-center">
                    <IndianRupee className="mx-auto mb-2 h-5 w-5 text-primary" />
                    <p className="text-sm text-muted-foreground">Salary</p>
                    <p className="font-medium text-foreground">{job.salaryRange}</p>
                  </div>
                </div>

                {job.description && (
                  <div className="mb-8">
                    <h2 className="mb-4 text-xl font-semibold text-foreground">Description</h2>
                    <p className="text-muted-foreground">{job.description}</p>
                  </div>
                )}

                {qualifications.length > 0 && (
                  <div className="mb-8">
                    <h2 className="mb-4 text-xl font-semibold text-foreground">Eligibility & Qualifications</h2>
                    <ul className="space-y-3">
                      {qualifications.map((qual, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                          <span className="text-muted-foreground">{qual}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="mb-4 text-lg font-semibold text-foreground">Application Fee</h3>
                <div className="mb-6 space-y-3">
                  <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                    <span className="text-muted-foreground">General</span>
                    <span className="font-semibold text-foreground">₹{job.fees.general}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                    <span className="text-muted-foreground">OBC</span>
                    <span className="font-semibold text-foreground">₹{job.fees.obc}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                    <span className="text-muted-foreground">SC / ST</span>
                    <span className="font-semibold text-foreground">₹{job.fees.sc}</span>
                  </div>
                </div>

                <Button className="w-full" size="lg" onClick={handleApply}>
                  {isAuthenticated ? "Apply Now" : "Login to Apply"}
                </Button>

                {!isAuthenticated && (
                  <p className="mt-4 text-center text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <Link to="/register" className="text-primary hover:underline">
                      Register now
                    </Link>
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="mb-4 text-lg font-semibold text-foreground">Quick Info</h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-3">
                    <GraduationCap className="mt-0.5 h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">{job.eligibility}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">{job.location}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Briefcase className="mt-0.5 h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">{job.department}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default JobDetail;
