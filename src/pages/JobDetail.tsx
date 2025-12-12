import { useParams, Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { mockJobs } from "@/data/mockData";
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
} from "lucide-react";

const JobDetail = () => {
  const { id } = useParams();
  const job = mockJobs.find((j) => j.id === id);

  if (!job) {
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          {/* Back button */}
          <Link
            to="/govt-jobs"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to all jobs
          </Link>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main content */}
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
                    <p className="font-medium text-foreground">{job.salary}</p>
                  </div>
                </div>

                <div className="mb-8">
                  <h2 className="mb-4 text-xl font-semibold text-foreground">Description</h2>
                  <p className="text-muted-foreground">{job.description}</p>
                </div>

                <div className="mb-8">
                  <h2 className="mb-4 text-xl font-semibold text-foreground">Eligibility & Qualifications</h2>
                  <ul className="space-y-3">
                    {job.qualifications.map((qual, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                        <span className="text-muted-foreground">{qual}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h2 className="mb-4 text-xl font-semibold text-foreground">Age Limit</h2>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <span className="text-muted-foreground">{job.ageLimit}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Apply card */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="mb-4 text-lg font-semibold text-foreground">Application Fee</h3>
                <div className="mb-6 space-y-3">
                  <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                    <span className="text-muted-foreground">General / OBC</span>
                    <span className="font-semibold text-foreground">₹{job.fees.general}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                    <span className="text-muted-foreground">SC / ST</span>
                    <span className="font-semibold text-foreground">₹{job.fees.sc}</span>
                  </div>
                </div>

                <Button className="w-full" size="lg" asChild>
                  <Link to="/register">Apply with Easy Gov Forms</Link>
                </Button>

                <p className="mt-4 text-center text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link to="/register" className="text-primary hover:underline">
                    Register now
                  </Link>
                </p>
              </div>

              {/* Quick info */}
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
