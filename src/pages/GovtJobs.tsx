import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import JobCard from "@/components/jobs/JobCard";
import JobFilters from "@/components/jobs/JobFilters";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Briefcase, 
  Loader2, 
  Menu, 
  Bell, 
  Home, 
  Bookmark, 
  Plus, 
  FileText, 
  User,
  Users,
  Clock,
  Search,
  Filter,
  MapPin,
  Calendar
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

const GovtJobs = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [state, setState] = useState("All States");
  const [education, setEducation] = useState("All Levels");
  const [isMobile, setIsMobile] = useState(false);
  const [mobileCategory, setMobileCategory] = useState("All");

  const mobileCategories = ["All", "Central Government", "Banking", "Defence", "Railways", "SSC"];

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch("/api/jobs");
        if (response.ok) {
          const data = await response.json();
          setJobs(data.jobs || []);
        }
      } catch (error) {
        console.error("Failed to fetch jobs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.department.toLowerCase().includes(searchQuery.toLowerCase());

      if (isMobile) {
        const matchesCategory = mobileCategory === "All" || job.category === mobileCategory;
        return matchesSearch && matchesCategory;
      }

      const matchesCategory =
        category === "All Categories" || job.category === category;
      const matchesState =
        state === "All States" || job.location === state || job.location === "All India";
      const matchesEducation =
        education === "All Levels" ||
        job.eligibility.toLowerCase().includes(education.toLowerCase());

      return matchesSearch && matchesCategory && matchesState && matchesEducation;
    });
  }, [jobs, searchQuery, category, state, education, isMobile, mobileCategory]);

  const isJobActive = (job: Job) => {
    const lastDate = new Date(job.lastDate);
    return lastDate >= new Date() && job.isActive;
  };

  const getDaysRemaining = (lastDate: string) => {
    const end = new Date(lastDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const handleApply = () => {
    if (!isAuthenticated) {
      navigate("/login");
    } else {
      navigate("/dashboard/jobs");
    }
  };

  if (isMobile) {
    return (
      <div className="min-h-screen bg-slate-900 pb-20">
        <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 px-4 py-3">
          <div className="flex items-center justify-between">
            <button className="p-2 text-slate-400 hover:text-white">
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-semibold text-green-400">Govt Jobs</h1>
            <button className="p-2 text-slate-400 hover:text-white relative">
              <Bell className="w-6 h-6" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </header>

        <main className="px-4 py-4 space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {mobileCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setMobileCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  mobileCategory === cat
                    ? "bg-green-500 text-white"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-slate-400 text-sm">
              Showing <span className="text-white font-medium">{filteredJobs.length}</span> jobs
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((job) => {
                const active = isJobActive(job);
                const daysLeft = getDaysRemaining(job.lastDate);

                return (
                  <div
                    key={job._id}
                    className="bg-slate-800 rounded-2xl p-4 border border-slate-700"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
                          <Briefcase className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white text-base">{job.title}</h3>
                          <p className="text-slate-400 text-sm">{job.department}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        active 
                          ? "bg-green-500/20 text-green-400" 
                          : "bg-slate-600 text-slate-400"
                      }`}>
                        {active ? "Active" : "Closed"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Users className="w-4 h-4 text-blue-400" />
                        <span>{job.vacancies.toLocaleString()} Vacancies</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <MapPin className="w-4 h-4 text-green-400" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Calendar className="w-4 h-4 text-orange-400" />
                        <span>{new Date(job.lastDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                      </div>
                      {active && daysLeft > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-red-400" />
                          <span className={daysLeft <= 7 ? "text-red-400" : "text-slate-400"}>
                            {daysLeft} days left
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="bg-slate-900/50 rounded-xl p-3 mb-4">
                      <div className="grid grid-cols-4 gap-2 text-center text-xs">
                        <div>
                          <p className="font-semibold text-white">₹{job.fees.general}</p>
                          <p className="text-slate-500">General</p>
                        </div>
                        <div>
                          <p className="font-semibold text-white">₹{job.fees.obc}</p>
                          <p className="text-slate-500">OBC</p>
                        </div>
                        <div>
                          <p className="font-semibold text-white">₹{job.fees.sc}</p>
                          <p className="text-slate-500">SC</p>
                        </div>
                        <div>
                          <p className="font-semibold text-white">₹{job.fees.st}</p>
                          <p className="text-slate-500">ST</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1 bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                        asChild
                      >
                        <Link to={`/job/${job._id}`}>View Details</Link>
                      </Button>
                      <Button
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                        onClick={handleApply}
                        disabled={!active}
                      >
                        {active ? "Apply Now" : "Closed"}
                      </Button>
                    </div>
                  </div>
                );
              })}

              {filteredJobs.length === 0 && !loading && (
                <div className="text-center py-12">
                  <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-white font-medium mb-2">No jobs found</h3>
                  <p className="text-slate-400 text-sm">Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          )}
        </main>

        <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 px-4 py-2 z-50">
          <div className="flex items-center justify-around">
            <Link to="/home" className="flex flex-col items-center gap-1 text-slate-400 hover:text-white">
              <Home className="w-5 h-5" />
              <span className="text-xs">Home</span>
            </Link>
            <Link to={user ? "/dashboard" : "/login"} className="flex flex-col items-center gap-1 text-slate-400 hover:text-white">
              <Bookmark className="w-5 h-5" />
              <span className="text-xs">Saved</span>
            </Link>
            <Link 
              to={user ? "/dashboard/jobs" : "/login"} 
              className="flex items-center justify-center w-12 h-12 bg-green-500 rounded-full -mt-4 shadow-lg"
            >
              <Plus className="w-6 h-6 text-white" />
            </Link>
            <Link to="/govt-jobs" className="flex flex-col items-center gap-1 text-green-400">
              <Briefcase className="w-5 h-5" />
              <span className="text-xs">Jobs</span>
            </Link>
            <Link to={user ? "/dashboard/settings" : "/login"} className="flex flex-col items-center gap-1 text-slate-400 hover:text-white">
              <User className="w-5 h-5" />
              <span className="text-xs">Profile</span>
            </Link>
          </div>
        </nav>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-8 md:py-12">
        <div className="container mx-auto px-4">
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

          <div className="mb-6">
            <p className="text-muted-foreground">
              Showing <span className="font-medium text-foreground">{filteredJobs.length}</span> jobs
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredJobs.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredJobs.map((job) => (
                <JobCard key={job._id} job={job} />
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
