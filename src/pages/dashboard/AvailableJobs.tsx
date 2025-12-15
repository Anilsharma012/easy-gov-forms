import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  Users,
  Briefcase,
  ArrowRight,
  Loader2,
  X,
  IndianRupee,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

interface Job {
  _id: string;
  title: string;
  department: string;
  category: string;
  location: string;
  lastDate: string;
  eligibility: string;
  fees: {
    general: number;
    obc: number;
    sc: number;
    st: number;
  };
  vacancies: number;
  description: string;
  qualifications: string[];
  ageLimit: string;
  salary: string;
}

const jobCategories = [
  "All Categories",
  "Central Government",
  "State Government",
  "Banking",
  "Railways",
  "Defence",
  "PSU",
  "Teaching",
];

const states = [
  "All States",
  "All India",
  "Uttar Pradesh",
  "Maharashtra",
  "Delhi",
  "Gujarat",
  "Rajasthan",
  "Bihar",
  "Madhya Pradesh",
  "Karnataka",
  "Tamil Nadu",
];

const educationLevels = [
  "All Levels",
  "10th Pass",
  "12th Pass",
  "Graduate",
  "Post Graduate",
];

export default function AvailableJobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [state, setState] = useState("All States");
  const [education, setEducation] = useState("All Levels");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch("/api/jobs");
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
      }
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      category === "All Categories" || job.category === category;
    const matchesState =
      state === "All States" ||
      job.location === state ||
      job.location === "All India";
    return matchesSearch && matchesCategory && matchesState;
  });

  const handleViewDetails = (job: Job) => {
    setSelectedJob(job);
    setDetailsOpen(true);
  };

  const handleApply = (job: Job) => {
    navigate(`/dashboard/jobs/apply/${job._id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Available Jobs & Forms</h1>
        <p className="text-muted-foreground">
          Browse and apply for government jobs using your package credits.
        </p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {jobCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={state} onValueChange={setState}>
              <SelectTrigger>
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent>
                {states.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={education} onValueChange={setEducation}>
              <SelectTrigger>
                <SelectValue placeholder="Education" />
              </SelectTrigger>
              <SelectContent>
                {educationLevels.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          Showing <span className="font-medium text-foreground">{filteredJobs.length}</span> jobs
        </p>
        <Badge variant="secondary" className="gap-1">
          <Filter className="h-3 w-3" />
          {category !== "All Categories" || state !== "All States"
            ? "Filters Applied"
            : "No Filters"}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filteredJobs.map((job) => (
          <Card key={job._id} className="card-hover">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Badge variant="secondary" className="mb-2">
                    {job.category}
                  </Badge>
                  <CardTitle className="text-lg line-clamp-2">{job.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {job.department}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {job.location}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {new Date(job.lastDate).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  {job.vacancies?.toLocaleString()} vacancies
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Briefcase className="h-4 w-4" />
                  {job.eligibility}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div>
                  <p className="text-xs text-muted-foreground">Application Fee</p>
                  <p className="font-medium">
                    ₹{job.fees?.general}{" "}
                    <span className="text-xs text-muted-foreground">
                      (Gen/OBC) | ₹{job.fees?.sc} (SC/ST)
                    </span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleViewDetails(job)}>
                    Details
                  </Button>
                  <Button size="sm" onClick={() => handleApply(job)}>
                    Apply <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No jobs found matching your criteria</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setSearchTerm("");
              setCategory("All Categories");
              setState("All States");
              setEducation("All Levels");
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div>
                <Badge className="mb-2">{selectedJob?.category}</Badge>
                <DialogTitle className="text-xl">{selectedJob?.title}</DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedJob?.department}
                </p>
              </div>
            </div>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            {selectedJob && (
              <div className="space-y-6 pr-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedJob.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Last Date: {new Date(selectedJob.lastDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedJob.vacancies?.toLocaleString()} Vacancies</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedJob.eligibility}</span>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground">{selectedJob.description}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Qualifications</h3>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {selectedJob.qualifications?.map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Age Limit</h3>
                    <p className="text-sm text-muted-foreground">{selectedJob.ageLimit}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Salary</h3>
                    <p className="text-sm text-primary font-medium">{selectedJob.salary}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Application Fee</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="p-2 bg-muted rounded">
                      <p className="text-muted-foreground">General/OBC</p>
                      <p className="font-medium">₹{selectedJob.fees?.general}</p>
                    </div>
                    <div className="p-2 bg-muted rounded">
                      <p className="text-muted-foreground">SC/ST</p>
                      <p className="font-medium">₹{selectedJob.fees?.sc}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button variant="outline" onClick={() => setDetailsOpen(false)} className="flex-1">
                    Close
                  </Button>
                  <Button onClick={() => { setDetailsOpen(false); handleApply(selectedJob); }} className="flex-1">
                    Apply Now <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
