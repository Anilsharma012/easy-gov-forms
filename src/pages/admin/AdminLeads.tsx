import { useState, useEffect } from "react";
import {
  Search,
  MoreVertical,
  UserPlus,
  CheckCircle,
  Clock,
  FileSpreadsheet,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface Lead {
  _id: string;
  name: string;
  mobile: string;
  email?: string;
  formName: string;
  type: "job" | "scheme" | "document";
  status: "new" | "in-progress" | "completed" | "cancelled";
  assignedTo?: string;
  assignedCenterId?: {
    _id: string;
    centerName: string;
  };
  notes?: string;
  createdAt: string;
}

interface CSCCenter {
  _id: string;
  centerName: string;
  status: string;
}

const statusColors = {
  new: "bg-info/10 text-info border-info/20",
  "in-progress": "bg-warning/10 text-warning border-warning/20",
  completed: "bg-success/10 text-success border-success/20",
  cancelled: "bg-muted text-muted-foreground",
};

const typeColors = {
  job: "bg-primary/10 text-primary",
  scheme: "bg-success/10 text-success",
  document: "bg-info/10 text-info",
};

export default function AdminLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [centers, setCenters] = useState<CSCCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);

  useEffect(() => {
    fetchLeads();
    fetchCenters();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await fetch("/api/leads", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setLeads(data.leads || []);
      }
    } catch (error) {
      console.error("Failed to fetch leads:", error);
      toast.error("Failed to fetch leads");
    } finally {
      setLoading(false);
    }
  };

  const fetchCenters = async () => {
    try {
      const response = await fetch("/api/csc-centers", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setCenters(data.centers?.filter((c: CSCCenter) => c.status === "verified") || []);
      }
    } catch (error) {
      console.error("Failed to fetch centers:", error);
    }
  };

  const handleAssign = async (leadId: string, centerId: string) => {
    try {
      const response = await fetch(`/api/leads/${leadId}/assign`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ centerId }),
      });
      if (response.ok) {
        toast.success("Lead assigned successfully");
        setAssignDialogOpen(false);
        fetchLeads();
      }
    } catch (error) {
      console.error("Failed to assign lead:", error);
      toast.error("Failed to assign lead");
    }
  };

  const handleMarkComplete = async (leadId: string) => {
    try {
      const response = await fetch(`/api/leads/${leadId}/complete`, {
        method: "PATCH",
        credentials: "include",
      });
      if (response.ok) {
        toast.success("Lead marked as completed");
        fetchLeads();
      }
    } catch (error) {
      console.error("Failed to complete lead:", error);
      toast.error("Failed to mark lead as completed");
    }
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.formName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    const matchesType = typeFilter === "all" || lead.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    total: leads.length,
    new: leads.filter((l) => l.status === "new").length,
    inProgress: leads.filter((l) => l.status === "in-progress").length,
    completed: leads.filter((l) => l.status === "completed").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">E-Governance Leads</h1>
        <p className="text-muted-foreground">
          Manage form registrations and lead assignments.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Leads</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.new}</p>
              <p className="text-sm text-muted-foreground">New</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.inProgress}</p>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.completed}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="job">Job Form</SelectItem>
                <SelectItem value="scheme">Scheme</SelectItem>
                <SelectItem value="document">Document</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead</TableHead>
                  <TableHead className="hidden md:table-cell">Form/Service</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Assigned To</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => (
                  <TableRow key={lead._id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{lead.name}</p>
                        <p className="text-xs text-muted-foreground">{lead.mobile}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{lead.formName}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={typeColors[lead.type]}>
                        {lead.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColors[lead.status]}>
                        {lead.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {lead.assignedTo || (
                        <span className="text-muted-foreground">Unassigned</span>
                      )}
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
                              setSelectedLead(lead);
                              setViewDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {!lead.assignedTo && (
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedLead(lead);
                                setAssignDialogOpen(true);
                              }}
                            >
                              <UserPlus className="h-4 w-4 mr-2" />
                              Assign to Center
                            </DropdownMenuItem>
                          )}
                          {lead.status !== "completed" && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleMarkComplete(lead._id)}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark as Completed
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredLeads.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No leads found</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
            <DialogDescription>Complete information about the lead.</DialogDescription>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{selectedLead.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant="outline" className={statusColors[selectedLead.status]}>
                    {selectedLead.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Mobile</p>
                  <p>{selectedLead.mobile}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p>{selectedLead.email || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Form/Service</p>
                  <p>{selectedLead.formName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <Badge variant="secondary" className={typeColors[selectedLead.type]}>
                    {selectedLead.type}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Assigned To</p>
                  <p>{selectedLead.assignedTo || "Unassigned"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p>{new Date(selectedLead.createdAt).toLocaleDateString()}</p>
                </div>
                {selectedLead.notes && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Notes</p>
                    <p>{selectedLead.notes}</p>
                  </div>
                )}
              </div>
              {!selectedLead.assignedTo && (
                <div className="pt-4">
                  <Button
                    className="w-full"
                    onClick={() => {
                      setViewDialogOpen(false);
                      setAssignDialogOpen(true);
                    }}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Assign to Center
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Lead</DialogTitle>
            <DialogDescription>
              Select a CSC center to assign {selectedLead?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {centers.length > 0 ? (
              <div className="space-y-2">
                {centers.map((center) => (
                  <Button
                    key={center._id}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleAssign(selectedLead!._id, center._id)}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    {center.centerName}
                  </Button>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No verified centers available
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
