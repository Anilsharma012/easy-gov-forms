import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, MapPin, Users, IndianRupee } from "lucide-react";
import { mockJobs } from "@/data/mockData";

const FeaturedJobs = () => {
  const featuredJobs = mockJobs.slice(0, 4);

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            Latest <span className="text-primary">Government Jobs</span>
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Browse through thousands of government job opportunities. Apply with ease using our AI-assisted form filling.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {featuredJobs.map((job, index) => (
            <div
              key={job.id}
              className="hover-lift group rounded-2xl border border-border bg-card p-6 transition-all"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="mb-4">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  {job.category}
                </span>
              </div>

              <h3 className="mb-2 line-clamp-2 font-semibold text-foreground group-hover:text-primary">
                {job.title}
              </h3>

              <p className="mb-4 text-sm text-muted-foreground">{job.department}</p>

              <div className="mb-4 space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>Last Date: {new Date(job.lastDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span>{job.vacancies.toLocaleString()} Vacancies</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-4">
                <div className="flex items-center gap-1 text-primary">
                  <IndianRupee className="h-4 w-4" />
                  <span className="font-semibold">{job.fees.general}</span>
                  <span className="text-xs text-muted-foreground">(Gen)</span>
                </div>
                <Button size="sm" variant="ghost" className="gap-1 text-primary" asChild>
                  <Link to={`/govt-jobs/${job.id}`}>
                    Apply
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button size="lg" variant="outline" asChild className="gap-2">
            <Link to="/govt-jobs">
              View All Jobs
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedJobs;
