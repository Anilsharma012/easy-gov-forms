import { useState, useEffect, useRef } from "react";
import {
  Search,
  Plus,
  MoreVertical,
  Eye,
  CheckCircle,
  XCircle,
  Building2,
  Download,
  Users,
  BarChart3,
  FileText,
  Upload,
  Image,
  IdCard,
  Home,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface FileUpload {
  fileName: string;
  fileData: string;
}

interface CSCDocument {
  _id?: string;
  type: string;
  fileName: string;
  originalFileName: string;
  filePath: string;
  status: string;
  uploadedAt: string;
}

interface CSCCenter {
  _id: string;
  centerName: string;
  ownerName: string;
  email: string;
  mobile: string;
  address: string;
  district: string;
  state: string;
  status: "verified" | "pending" | "rejected";
  totalLeads: number;
  usedLeads: number;
  registeredAt: string;
  registrationNumber?: string;
  documents?: CSCDocument[];
}

interface Lead {
  _id: string;
  name: string;
  mobile: string;
  email?: string;
  formName: string;
  type: string;
  status: string;
  createdAt: string;
  userId?: {
    name: string;
    email: string;
    phone: string;
  };
}

interface Performance {
  centerName: string;
  totalLeads: number;
  completedLeads: number;
  inProgressLeads: number;
  newLeads: number;
  completionRate: string;
}

interface LeadsData {
  center: {
    _id: string;
    centerName: string;
    ownerName: string;
  };
  leads: Lead[];
  stats: {
    total: number;
    new: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  };
}

const statusColors = {
  verified: "bg-success/10 text-success border-success/20",
  pending: "bg-warning/10 text-warning border-warning/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

const leadStatusColors: Record<string, string> = {
  new: "bg-info/10 text-info border-info/20",
  "in-progress": "bg-warning/10 text-warning border-warning/20",
  completed: "bg-success/10 text-success border-success/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

const documentTypeLabels: Record<string, string> = {
  addressProof: "Address Proof",
  identityProof: "Identity Proof",
  photo: "Photo",
  other: "Other",
};

export default function AdminCSCCenters() {
  const [centers, setCenters] = useState<CSCCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCenter, setSelectedCenter] = useState<CSCCenter | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [assignLeadsDialogOpen, setAssignLeadsDialogOpen] = useState(false);
  const [performanceDialogOpen, setPerformanceDialogOpen] = useState(false);
  const [leadsDialogOpen, setLeadsDialogOpen] = useState(false);
  const [unassignedLeads, setUnassignedLeads] = useState<Lead[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [performance, setPerformance] = useState<Performance | null>(null);
  const [leadsData, setLeadsData] = useState<LeadsData | null>(null);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [loadingPerformance, setLoadingPerformance] = useState(false);
  const [loadingCenterLeads, setLoadingCenterLeads] = useState(false);
  
  const [addressProof, setAddressProof] = useState<FileUpload | null>(null);
  const [identityProof, setIdentityProof] = useState<FileUpload | null>(null);
  const [photo, setPhoto] = useState<FileUpload | null>(null);
  
  const addressProofRef = useRef<HTMLInputElement>(null);
  const identityProofRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  
  const [newCenter, setNewCenter] = useState({
    centerName: "",
    ownerName: "",
    email: "",
    mobile: "",
    address: "",
    district: "",
    state: "",
    registrationNumber: "",
  });

  useEffect(() => {
    fetchCenters();
  }, []);

  const fetchCenters = async () => {
    try {
      const response = await fetch("/api/csc-centers", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setCenters(data.centers || []);
      }
    } catch (error) {
      console.error("Failed to fetch centers:", error);
      toast.error("Failed to fetch centers");
    } finally {
      setLoading(false);
    }
  };

  const fetchUnassignedLeads = async () => {
    setLoadingLeads(true);
    try {
      const response = await fetch("/api/leads/unassigned", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setUnassignedLeads(data.leads || []);
      }
    } catch (error) {
      console.error("Failed to fetch leads:", error);
      toast.error("Failed to fetch unassigned leads");
    } finally {
      setLoadingLeads(false);
    }
  };

  const fetchPerformance = async (centerId: string) => {
    setLoadingPerformance(true);
    try {
      const response = await fetch(`/api/csc-centers/${centerId}/performance`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setPerformance(data.performance);
      }
    } catch (error) {
      console.error("Failed to fetch performance:", error);
      toast.error("Failed to fetch performance data");
    } finally {
      setLoadingPerformance(false);
    }
  };

  const fetchCenterLeads = async (centerId: string) => {
    setLoadingCenterLeads(true);
    try {
      const response = await fetch(`/api/csc-centers/${centerId}/leads`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setLeadsData(data);
      }
    } catch (error) {
      console.error("Failed to fetch center leads:", error);
      toast.error("Failed to fetch center leads");
    } finally {
      setLoadingCenterLeads(false);
    }
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setFile: React.Dispatch<React.SetStateAction<FileUpload | null>>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload JPG, PNG or PDF files only");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFile({
        fileName: file.name,
        fileData: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleAddCenter = async () => {
    try {
      const response = await fetch("/api/csc-centers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...newCenter,
          addressProof,
          identityProof,
          photo,
        }),
      });
      if (response.ok) {
        toast.success("Center added successfully");
        setAddDialogOpen(false);
        setNewCenter({
          centerName: "",
          ownerName: "",
          email: "",
          mobile: "",
          address: "",
          district: "",
          state: "",
          registrationNumber: "",
        });
        setAddressProof(null);
        setIdentityProof(null);
        setPhoto(null);
        fetchCenters();
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to add center");
      }
    } catch (error) {
      console.error("Failed to add center:", error);
      toast.error("Failed to add center");
    }
  };

  const handleUpdateStatus = async (centerId: string, status: string) => {
    try {
      const response = await fetch(`/api/csc-centers/${centerId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        toast.success(`Center ${status} successfully`);
        fetchCenters();
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update status");
    }
  };

  const handleAssignLeads = async () => {
    if (!selectedCenter || selectedLeads.length === 0) return;
    try {
      const response = await fetch(`/api/csc-centers/${selectedCenter._id}/assign-leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ leadIds: selectedLeads }),
      });
      if (response.ok) {
        toast.success(`${selectedLeads.length} leads assigned successfully`);
        setAssignLeadsDialogOpen(false);
        setSelectedLeads([]);
        fetchCenters();
      }
    } catch (error) {
      console.error("Failed to assign leads:", error);
      toast.error("Failed to assign leads");
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await fetch("/api/csc-centers/export/csv", {
        credentials: "include",
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "csc_centers.csv";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("Centers exported successfully");
      }
    } catch (error) {
      console.error("Failed to export:", error);
      toast.error("Failed to export centers");
    }
  };

  const filteredCenters = centers.filter((center) => {
    const matchesSearch =
      center.centerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      center.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      center.district.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || center.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: centers.length,
    verified: centers.filter((c) => c.status === "verified").length,
    pending: centers.filter((c) => c.status === "pending").length,
    totalLeads: centers.reduce((acc, c) => acc + (c.totalLeads || 0), 0),
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
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">CSC Center Management</h1>
          <p className="text-muted-foreground">
            Manage Common Service Centers and their verification.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Center
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Centers</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.verified}</p>
              <p className="text-sm text-muted-foreground">Verified</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalLeads}</p>
              <p className="text-sm text-muted-foreground">Total Leads</p>
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
                placeholder="Search centers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Center Name</TableHead>
                  <TableHead className="hidden md:table-cell">Owner</TableHead>
                  <TableHead className="hidden lg:table-cell">Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Leads</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCenters.map((center) => (
                  <TableRow key={center._id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{center.centerName}</p>
                        <p className="text-xs text-muted-foreground">{center.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div>
                        <p>{center.ownerName}</p>
                        <p className="text-xs text-muted-foreground">{center.mobile}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {center.district}, {center.state}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColors[center.status]}>
                        {center.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {center.usedLeads || 0} / {center.totalLeads || 0}
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
                              setSelectedCenter(center);
                              setViewDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedCenter(center);
                              fetchCenterLeads(center._id);
                              setLeadsDialogOpen(true);
                            }}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            View Leads
                          </DropdownMenuItem>
                          {center.status === "pending" && (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleUpdateStatus(center._id, "verified")}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleUpdateStatus(center._id, "rejected")}
                                className="text-destructive"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedCenter(center);
                              fetchUnassignedLeads();
                              setAssignLeadsDialogOpen(true);
                            }}
                          >
                            <Users className="h-4 w-4 mr-2" />
                            Assign Leads
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedCenter(center);
                              fetchPerformance(center._id);
                              setPerformanceDialogOpen(true);
                            }}
                          >
                            <BarChart3 className="h-4 w-4 mr-2" />
                            View Performance
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredCenters.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No centers found</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>CSC Center Details</DialogTitle>
            <DialogDescription>Complete information about the center.</DialogDescription>
          </DialogHeader>
          {selectedCenter && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Center Name</p>
                  <p className="font-medium">{selectedCenter.centerName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Owner</p>
                  <p>{selectedCenter.ownerName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant="outline" className={statusColors[selectedCenter.status]}>
                    {selectedCenter.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p>{selectedCenter.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Mobile</p>
                  <p>{selectedCenter.mobile}</p>
                </div>
                {selectedCenter.registrationNumber && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Registration Number</p>
                    <p className="font-medium">{selectedCenter.registrationNumber}</p>
                  </div>
                )}
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p>
                    {selectedCenter.address}, {selectedCenter.district}, {selectedCenter.state}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Registered</p>
                  <p>{new Date(selectedCenter.registeredAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Leads</p>
                  <p>{selectedCenter.usedLeads || 0} used / {selectedCenter.totalLeads || 0} total</p>
                </div>
              </div>
              
              {selectedCenter.documents && selectedCenter.documents.length > 0 && (
                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-3">Documents</h4>
                  <div className="space-y-2">
                    {selectedCenter.documents.map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{documentTypeLabels[doc.type] || doc.type}</p>
                            <p className="text-xs text-muted-foreground">{doc.originalFileName}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className={
                          doc.status === 'verified' ? 'bg-success/10 text-success' :
                          doc.status === 'rejected' ? 'bg-destructive/10 text-destructive' :
                          'bg-warning/10 text-warning'
                        }>
                          {doc.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New CSC Center</DialogTitle>
            <DialogDescription>Enter the details of the new center.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Center Name</Label>
                <Input
                  value={newCenter.centerName}
                  onChange={(e) =>
                    setNewCenter({ ...newCenter, centerName: e.target.value })
                  }
                  placeholder="Enter center name"
                />
              </div>
              <div>
                <Label>Owner Name</Label>
                <Input
                  value={newCenter.ownerName}
                  onChange={(e) =>
                    setNewCenter({ ...newCenter, ownerName: e.target.value })
                  }
                  placeholder="Enter owner name"
                />
              </div>
              <div>
                <Label>Mobile</Label>
                <Input
                  value={newCenter.mobile}
                  onChange={(e) => setNewCenter({ ...newCenter, mobile: e.target.value })}
                  placeholder="Enter mobile number"
                />
              </div>
              <div className="col-span-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={newCenter.email}
                  onChange={(e) => setNewCenter({ ...newCenter, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
              <div className="col-span-2">
                <Label>Registration Number</Label>
                <Input
                  value={newCenter.registrationNumber}
                  onChange={(e) => setNewCenter({ ...newCenter, registrationNumber: e.target.value })}
                  placeholder="Enter CSC registration number"
                />
              </div>
              <div className="col-span-2">
                <Label>Address</Label>
                <Input
                  value={newCenter.address}
                  onChange={(e) =>
                    setNewCenter({ ...newCenter, address: e.target.value })
                  }
                  placeholder="Enter address"
                />
              </div>
              <div>
                <Label>District</Label>
                <Input
                  value={newCenter.district}
                  onChange={(e) =>
                    setNewCenter({ ...newCenter, district: e.target.value })
                  }
                  placeholder="Enter district"
                />
              </div>
              <div>
                <Label>State</Label>
                <Input
                  value={newCenter.state}
                  onChange={(e) => setNewCenter({ ...newCenter, state: e.target.value })}
                  placeholder="Enter state"
                />
              </div>
            </div>
            
            <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Documents (Optional)
              </h4>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1 text-xs">
                    <Home className="h-3 w-3" />
                    Address Proof
                  </Label>
                  <input
                    ref={addressProofRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, setAddressProof)}
                  />
                  <Button
                    type="button"
                    variant={addressProof ? "default" : "outline"}
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => addressProofRef.current?.click()}
                  >
                    {addressProof ? "Uploaded" : "Upload"}
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-1 text-xs">
                    <IdCard className="h-3 w-3" />
                    Identity Proof
                  </Label>
                  <input
                    ref={identityProofRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, setIdentityProof)}
                  />
                  <Button
                    type="button"
                    variant={identityProof ? "default" : "outline"}
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => identityProofRef.current?.click()}
                  >
                    {identityProof ? "Uploaded" : "Upload"}
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-1 text-xs">
                    <Image className="h-3 w-3" />
                    Photo
                  </Label>
                  <input
                    ref={photoRef}
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, setPhoto)}
                  />
                  <Button
                    type="button"
                    variant={photo ? "default" : "outline"}
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => photoRef.current?.click()}
                  >
                    {photo ? "Uploaded" : "Upload"}
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddCenter}>Add Center</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={leadsDialogOpen} onOpenChange={setLeadsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assigned Leads</DialogTitle>
            <DialogDescription>
              Leads assigned to {leadsData?.center?.centerName}
            </DialogDescription>
          </DialogHeader>
          {loadingCenterLeads ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : leadsData ? (
            <div className="space-y-4">
              <div className="grid grid-cols-5 gap-2">
                <Card>
                  <CardContent className="p-3 text-center">
                    <p className="text-xl font-bold">{leadsData.stats.total}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <p className="text-xl font-bold text-info">{leadsData.stats.new}</p>
                    <p className="text-xs text-muted-foreground">New</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <p className="text-xl font-bold text-warning">{leadsData.stats.inProgress}</p>
                    <p className="text-xs text-muted-foreground">In Progress</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <p className="text-xl font-bold text-success">{leadsData.stats.completed}</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <p className="text-xl font-bold text-destructive">{leadsData.stats.cancelled}</p>
                    <p className="text-xs text-muted-foreground">Cancelled</p>
                  </CardContent>
                </Card>
              </div>
              
              {leadsData.leads.length > 0 ? (
                <div className="rounded-md border max-h-80 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Lead</TableHead>
                        <TableHead>Form</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leadsData.leads.map((lead) => (
                        <TableRow key={lead._id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{lead.name}</p>
                              <p className="text-xs text-muted-foreground">{lead.mobile}</p>
                              {lead.email && <p className="text-xs text-muted-foreground">{lead.email}</p>}
                            </div>
                          </TableCell>
                          <TableCell>{lead.formName}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{lead.type}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={leadStatusColors[lead.status] || ""}>
                              {lead.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(lead.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No leads assigned to this center
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Failed to load leads data
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={assignLeadsDialogOpen} onOpenChange={setAssignLeadsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assign Leads</DialogTitle>
            <DialogDescription>
              Select leads to assign to {selectedCenter?.centerName}
            </DialogDescription>
          </DialogHeader>
          {loadingLeads ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : unassignedLeads.length > 0 ? (
            <div className="space-y-4">
              <div className="rounded-md border max-h-64 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Select</TableHead>
                      <TableHead>Lead</TableHead>
                      <TableHead>Form</TableHead>
                      <TableHead>Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unassignedLeads.map((lead) => (
                      <TableRow key={lead._id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedLeads.includes(lead._id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedLeads([...selectedLeads, lead._id]);
                              } else {
                                setSelectedLeads(selectedLeads.filter((id) => id !== lead._id));
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{lead.name}</p>
                            <p className="text-xs text-muted-foreground">{lead.mobile}</p>
                          </div>
                        </TableCell>
                        <TableCell>{lead.formName}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{lead.type}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  {selectedLeads.length} lead(s) selected
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setAssignLeadsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAssignLeads} disabled={selectedLeads.length === 0}>
                    Assign Selected
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No unassigned leads available
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={performanceDialogOpen} onOpenChange={setPerformanceDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Center Performance</DialogTitle>
            <DialogDescription>
              Performance metrics for {selectedCenter?.centerName}
            </DialogDescription>
          </DialogHeader>
          {loadingPerformance ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : performance ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold">{performance.totalLeads}</p>
                    <p className="text-sm text-muted-foreground">Total Leads</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-success">{performance.completedLeads}</p>
                    <p className="text-sm text-muted-foreground">Completed</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-warning">{performance.inProgressLeads}</p>
                    <p className="text-sm text-muted-foreground">In Progress</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-info">{performance.newLeads}</p>
                    <p className="text-sm text-muted-foreground">New</p>
                  </CardContent>
                </Card>
              </div>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-primary">{performance.completionRate}%</p>
                  <p className="text-sm text-muted-foreground">Completion Rate</p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No performance data available
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
