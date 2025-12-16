import { useEffect, useMemo, useState } from "react";
import {
  Search,
  MoreVertical,
  UserPlus,
  CheckCircle,
  Clock,
  FileSpreadsheet,
  Eye,
  RefreshCw,
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

const statusColors: Record<Lead["status"], string> = {
  new: "bg-info/10 text-info border-info/20",
  "in-progress": "bg-warning/10 text-warning border-warning/20",
  completed: "bg-success/10 text-success border-success/20",
  cancelled: "bg-muted text-muted-foreground",
};

const typeColors: Record<Lead["type"], string> = {
  job: "bg-primary/10 text-primary",
  scheme: "bg-success/10 text-success",
  document: "bg-info/10 text-info",
};

function getAssignedLabel(lead: Lead) {
  if (lead.assignedCenterId?.centerName) return lead.assignedCenterId.centerName;
  if (lead.assignedTo) return lead.assignedTo;
  return "";
}

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

  const fetchLeads = async (showToast = false) => {
  try {
    // ✅ Correct endpoint
    let res = await fetch("/api/leads", { credentials: "include" });

    // fallback (just in case future me /admin route add ho)
    if (res.status === 404) {
      res = await fetch("/api/leads/admin", { credentials: "include" });
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.message || "Failed to fetch leads");
    }

    const data = await res.json();
    const fetchedLeads = data.leads || [];

    // ✅ If leads are empty but applications exist, auto-sync once.
    if (fetchedLeads.length === 0) {
      try {
        await fetch("/api/leads/sync-from-applications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ limit: 500 }),
        });

        const re = await fetch("/api/leads", { credentials: "include" });
        if (re.ok) {
          const reData = await re.json();
          setLeads(reData.leads || []);
        } else {
          setLeads(fetchedLeads);
        }
      } catch (syncErr) {
        setLeads(fetchedLeads);
      }
    } else {
      setLeads(fetchedLeads);
    }

    if (showToast) toast.success("Leads refreshed");
  } catch (e: any) {
    console.error(e);
    toast.error(e?.message || "Failed to fetch leads");
  } finally {
    setLoading(false);
  }
};


  const fetchCenters = async () => {
    try {
      const response = await fetch("/api/csc-centers", {
        credentials: "include",
      });

      if (!response.ok) return;

      const data = await response.json();
      const verified =
        data.centers?.filter((c: CSCCenter) => c.status === "verified") || [];
      setCenters(verified);
    } catch (error) {
      console.error("Failed to fetch centers:", error);
    }
  };

  useEffect(() => {
    fetchLeads();
    fetchCenters();
  }, []);

  const handleAssign = async (leadId: string, centerId: string) => {
    try {
      const response = await fetch(`/api/leads/${leadId}/assign`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ centerId }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.message || "Failed to assign lead");
      }

      toast.success("Lead assigned successfully");
      setAssignDialogOpen(false);
      await fetchLeads();
    } catch (error: any) {
      console.error("Failed to assign lead:", error);
      toast.error(error?.message || "Failed to assign lead");
    }
  };

  const handleMarkComplete = async (leadId: string) => {
    try {
      const response = await fetch(`/api/leads/${leadId}/complete`, {
        method: "PATCH",
        credentials: "include",
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.message || "Failed to complete lead");
      }

      toast.success("Lead marked as completed");
      await fetchLeads();
    } catch (error: any) {
      console.error("Failed to complete lead:", error);
      toast.error(error?.message || "Failed to mark lead as completed");
    }
  };

  const filteredLeads = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return leads.filter((lead) => {
      const matchesSearch =
        !q ||
        lead.name?.toLowerCase().includes(q) ||
        lead.mobile?.toLowerCase().includes(q) ||
        lead.email?.toLowerCase().includes(q) ||
        lead.formName?.toLowerCase().includes(q);

      const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
      const matchesType = typeFilter === "all" || lead.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [leads, searchTerm, statusFilter, typeFilter]);

  const stats = useMemo(() => {
    return {
      total: leads.length,
      new: leads.filter((l) => l.status === "new").length,
      inProgress: leads.filter((l) => l.status === "in-progress").length,
      completed: leads.filter((l) => l.status === "completed").length,
    };
  }, [leads]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">E-Governance Leads</h1>
          <p className="text-muted-foreground">
            Manage form registrations and lead assignments.
          </p>
        </div>

        <Button variant="outline" onClick={() => fetchLeads(true)}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
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
          <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search name / mobile / email / form..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-44">
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
                <SelectTrigger className="w-44">
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
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead</TableHead>
                  <TableHead className="hidden md:table-cell">Form/Service</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Assigned To</TableHead>
                  <TableHead className="hidden xl:table-cell">Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredLeads.map((lead) => {
                  const assignedLabel = getAssignedLabel(lead);

                  return (
                    <TableRow key={lead._id}>
                      <TableCell>
                        <div className="space-y-0.5">
                          <p className="font-medium leading-tight">{lead.name}</p>
                          <p className="text-xs text-muted-foreground">{lead.mobile}</p>
                          {lead.email ? (
                            <p className="text-xs text-muted-foreground">{lead.email}</p>
                          ) : null}
                        </div>
                      </TableCell>

                      <TableCell className="hidden md:table-cell">
                        <div className="max-w-[360px] truncate">{lead.formName}</div>
                      </TableCell>

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
                        {assignedLabel ? (
                          <span className="font-medium">{assignedLabel}</span>
                        ) : (
                          <span className="text-muted-foreground">Unassigned</span>
                        )}
                      </TableCell>

                      <TableCell className="hidden xl:table-cell">
                        {new Date(lead.createdAt).toLocaleDateString()}
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

                            {!assignedLabel && (
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
                  );
                })}
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

                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Form/Service</p>
                  <p className="font-medium">{selectedLead.formName}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <Badge variant="secondary" className={typeColors[selectedLead.type]}>
                    {selectedLead.type}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Assigned To</p>
                  <p>{getAssignedLabel(selectedLead) || "Unassigned"}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p>{new Date(selectedLead.createdAt).toLocaleString()}</p>
                </div>

                {selectedLead.notes && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Notes</p>
                    <p>{selectedLead.notes}</p>
                  </div>
                )}
              </div>

              {!getAssignedLabel(selectedLead) && (
                <div className="pt-2">
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

          <div className="space-y-3">
            {centers.length > 0 ? (
              centers.map((center) => (
                <Button
                  key={center._id}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleAssign(selectedLead!._id, center._id)}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  {center.centerName}
                </Button>
              ))
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
