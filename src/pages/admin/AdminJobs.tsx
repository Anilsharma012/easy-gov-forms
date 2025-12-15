import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Briefcase,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

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
  createdAt: string;
}

const jobCategories = [
  "All Categories",
  "SSC",
  "Banking",
  "Railway",
  "Defense",
  "State PSC",
  "Central Govt",
  "Teaching",
  "PSU",
  "Other",
];

const emptyJob = {
  title: "",
  department: "",
  category: "",
  location: "",
  eligibility: "",
  description: "",
  startDate: "",
  lastDate: "",
  vacancies: 0,
  salaryRange: "",
  fees: {
    general: 0,
    obc: 0,
    sc: 0,
    st: 0,
  },
};

export default function AdminJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState(emptyJob);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch("/api/jobs", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
      }
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
      toast.error("Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        toast.success("Job created successfully");
        setCreateDialogOpen(false);
        setFormData(emptyJob);
        fetchJobs();
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to create job");
      }
    } catch (error) {
      console.error("Failed to create job:", error);
      toast.error("Failed to create job");
    }
  };

  const handleUpdate = async () => {
    if (!selectedJob) return;
    try {
      const response = await fetch(`/api/jobs/${selectedJob._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        toast.success("Job updated successfully");
        setEditDialogOpen(false);
        setFormData(emptyJob);
        fetchJobs();
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to update job");
      }
    } catch (error) {
      console.error("Failed to update job:", error);
      toast.error("Failed to update job");
    }
  };

  const handleDelete = async () => {
    if (!selectedJob) return;
    try {
      const response = await fetch(`/api/jobs/${selectedJob._id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (response.ok) {
        toast.success("Job deleted successfully");
        setDeleteDialogOpen(false);
        fetchJobs();
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to delete job");
      }
    } catch (error) {
      console.error("Failed to delete job:", error);
      toast.error("Failed to delete job");
    }
  };

  const handleToggleActive = async (job: Job) => {
    try {
      const response = await fetch(`/api/jobs/${job._id}/toggle-active`, {
        method: "PATCH",
        credentials: "include",
      });
      if (response.ok) {
        toast.success(`Job ${job.isActive ? "deactivated" : "activated"} successfully`);
        fetchJobs();
      }
    } catch (error) {
      console.error("Failed to toggle job:", error);
      toast.error("Failed to update job status");
    }
  };

  const openEditDialog = (job: Job) => {
    setSelectedJob(job);
    setFormData({
      title: job.title,
      department: job.department,
      category: job.category,
      location: job.location,
      eligibility: job.eligibility,
      description: job.description || "",
      startDate: job.startDate.split("T")[0],
      lastDate: job.lastDate.split("T")[0],
      vacancies: job.vacancies,
      salaryRange: job.salaryRange,
      fees: job.fees,
    });
    setEditDialogOpen(true);
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "All Categories" || job.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const stats = {
    total: jobs.length,
    active: jobs.filter((j) => j.isActive).length,
    totalVacancies: jobs.reduce((acc, j) => acc + j.vacancies, 0),
    categories: new Set(jobs.map((j) => j.category)).size,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const JobForm = ({ onSubmit, submitLabel }: { onSubmit: () => void; submitLabel: string }) => (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Job Title</Label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., SSC CGL 2024"
          />
        </div>
        <div className="space-y-2">
          <Label>Department</Label>
          <Input
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            placeholder="e.g., Staff Selection Commission"
          />
        </div>
        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {jobCategories
                .filter((c) => c !== "All Categories")
                .map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Location</Label>
          <Input
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="e.g., All India"
          />
        </div>
        <div className="space-y-2">
          <Label>Start Date</Label>
          <Input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Last Date</Label>
          <Input
            type="date"
            value={formData.lastDate}
            onChange={(e) => setFormData({ ...formData, lastDate: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Vacancies</Label>
          <Input
            type="number"
            value={formData.vacancies}
            onChange={(e) => setFormData({ ...formData, vacancies: parseInt(e.target.value) || 0 })}
            placeholder="e.g., 5000"
          />
        </div>
        <div className="space-y-2">
          <Label>Salary Range</Label>
          <Input
            value={formData.salaryRange}
            onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
            placeholder="e.g., Rs.25,500 - Rs.81,100"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Eligibility</Label>
        <Input
          value={formData.eligibility}
          onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
          placeholder="e.g., Graduate in any discipline"
        />
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          rows={3}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Job description..."
        />
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <div className="space-y-2">
          <Label>General Fee</Label>
          <Input
            type="number"
            value={formData.fees.general}
            onChange={(e) =>
              setFormData({
                ...formData,
                fees: { ...formData.fees, general: parseInt(e.target.value) || 0 },
              })
            }
            placeholder="100"
          />
        </div>
        <div className="space-y-2">
          <Label>OBC Fee</Label>
          <Input
            type="number"
            value={formData.fees.obc}
            onChange={(e) =>
              setFormData({
                ...formData,
                fees: { ...formData.fees, obc: parseInt(e.target.value) || 0 },
              })
            }
            placeholder="100"
          />
        </div>
        <div className="space-y-2">
          <Label>SC Fee</Label>
          <Input
            type="number"
            value={formData.fees.sc}
            onChange={(e) =>
              setFormData({
                ...formData,
                fees: { ...formData.fees, sc: parseInt(e.target.value) || 0 },
              })
            }
            placeholder="0"
          />
        </div>
        <div className="space-y-2">
          <Label>ST Fee</Label>
          <Input
            type="number"
            value={formData.fees.st}
            onChange={(e) =>
              setFormData({
                ...formData,
                fees: { ...formData.fees, st: parseInt(e.target.value) || 0 },
              })
            }
            placeholder="0"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => {
            setCreateDialogOpen(false);
            setEditDialogOpen(false);
            setFormData(emptyJob);
          }}
        >
          Cancel
        </Button>
        <Button onClick={onSubmit}>{submitLabel}</Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Jobs & Forms Catalog</h1>
          <p className="text-muted-foreground">Manage government job listings and forms.</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Job
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Jobs</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="text-2xl font-bold text-success">{stats.active}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Vacancies</p>
            <p className="text-2xl font-bold">{stats.totalVacancies.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Categories</p>
            <p className="text-2xl font-bold">{stats.categories}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
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
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Title</TableHead>
                  <TableHead className="hidden md:table-cell">Category</TableHead>
                  <TableHead className="hidden lg:table-cell">Last Date</TableHead>
                  <TableHead className="hidden lg:table-cell">Vacancies</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJobs.map((job) => (
                  <TableRow key={job._id}>
                    <TableCell>
                      <div>
                        <p className="font-medium line-clamp-1">{job.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {job.department}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="secondary">{job.category}</Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {new Date(job.lastDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {job.vacancies.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={job.isActive}
                        onCheckedChange={() => handleToggleActive(job)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedJob(job);
                              setViewDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditDialog(job)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setSelectedJob(job);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredJobs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No jobs found</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Job Details</DialogTitle>
            <DialogDescription>Complete information about the job.</DialogDescription>
          </DialogHeader>
          {selectedJob && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Title</p>
                  <p className="font-medium text-lg">{selectedJob.title}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p>{selectedJob.department}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <Badge variant="secondary">{selectedJob.category}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p>{selectedJob.location}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p>{new Date(selectedJob.startDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Date</p>
                  <p>{new Date(selectedJob.lastDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Vacancies</p>
                  <p>{selectedJob.vacancies.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Salary Range</p>
                  <p>{selectedJob.salaryRange}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Eligibility</p>
                  <p>{selectedJob.eligibility}</p>
                </div>
                {selectedJob.description && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p>{selectedJob.description}</p>
                  </div>
                )}
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground mb-2">Application Fees</p>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="text-center p-2 bg-muted rounded">
                      <p className="text-xs text-muted-foreground">General</p>
                      <p className="font-medium">Rs.{selectedJob.fees.general}</p>
                    </div>
                    <div className="text-center p-2 bg-muted rounded">
                      <p className="text-xs text-muted-foreground">OBC</p>
                      <p className="font-medium">Rs.{selectedJob.fees.obc}</p>
                    </div>
                    <div className="text-center p-2 bg-muted rounded">
                      <p className="text-xs text-muted-foreground">SC</p>
                      <p className="font-medium">Rs.{selectedJob.fees.sc}</p>
                    </div>
                    <div className="text-center p-2 bg-muted rounded">
                      <p className="text-xs text-muted-foreground">ST</p>
                      <p className="font-medium">Rs.{selectedJob.fees.st}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge
                    variant="outline"
                    className={
                      selectedJob.isActive
                        ? "bg-success/10 text-success"
                        : "bg-muted text-muted-foreground"
                    }
                  >
                    {selectedJob.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Job/Form</DialogTitle>
            <DialogDescription>Create a new government job or form entry.</DialogDescription>
          </DialogHeader>
          <JobForm onSubmit={handleCreate} submitLabel="Create Job" />
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Job</DialogTitle>
            <DialogDescription>Update the job details.</DialogDescription>
          </DialogHeader>
          <JobForm onSubmit={handleUpdate} submitLabel="Update Job" />
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the job
              "{selectedJob?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
