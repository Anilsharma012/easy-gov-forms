import { useState, useMemo } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import JobCard from "@/components/jobs/JobCard";
import JobFilters from "@/components/jobs/JobFilters";
import { mockJobs } from "@/data/mockData";
import { Briefcase } from "lucide-react";

const GovtJobs = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [state, setState] = useState("All States");
  const [education, setEducation] = useState("All Levels");

  const filteredJobs = useMemo(() => {
    return mockJobs.filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.department.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        category === "All Categories" || job.category === category;

      const matchesState =
        state === "All States" || job.location === state || job.location === "All India";

      const matchesEducation =
        education === "All Levels" ||
        job.eligibility.toLowerCase().includes(education.toLowerCase());

      return matchesSearch && matchesCategory && matchesState && matchesEducation;
    });
  }, [searchQuery, category, state, education]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="mb-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground md:text-3xl">
                  Government Jobs
                </h1>
                <p className="text-muted-foreground">
                  Browse and apply for latest government job opportunities
                </p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-8">
            <JobFilters
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              category={category}
              setCategory={setCategory}
              state={state}
              setState={setState}
              education={education}
              setEducation={setEducation}
            />
          </div>

          {/* Results count */}
          <div className="mb-6">
            <p className="text-muted-foreground">
              Showing <span className="font-medium text-foreground">{filteredJobs.length}</span> jobs
            </p>
          </div>

          {/* Job Cards */}
          {filteredJobs.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-card py-16 text-center">
              <Briefcase className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold text-foreground">No jobs found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or search query
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default GovtJobs;
