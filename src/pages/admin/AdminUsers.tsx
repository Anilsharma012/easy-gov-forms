import { useState, useEffect, useMemo } from "react";
import {
  Search,
  MoreVertical,
  Eye,
  Ban,
  CheckCircle,
  UserCheck,
  Download,
  FileText,
  Briefcase,
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

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  city?: string;
  state?: string;
  isActive: boolean;
  kycVerified: boolean;
  activePackage?: string;
  totalApplications: number;
  createdAt: string;
}

interface Application {
  _id: string;
  formName: string;
  type: string;
  status: string;
  createdAt: string;
}

interface UserDocument {
  _id: string;
  name: string;
  type: string;
  status: string;
  uploadedAt: string;
}

const statusColors = {
  active: "bg-success/10 text-success border-success/20",
  inactive: "bg-muted text-muted-foreground",
  banned: "bg-destructive/10 text-destructive border-destructive/20",
};

function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

function getFilenameFromDisposition(disposition: string | null) {
  if (!disposition) return null;
  // content-disposition: attachment; filename="users.csv"
  const match = disposition.match(/filename\*?=(?:UTF-8''|")?([^;"\n]+)"?/i);
  if (!match?.[1]) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

function csvEscape(v: unknown) {
  if (v === null || v === undefined) return '""';
  const s = String(v).replace(/"/g, '""');
  return `"${s}"`;
}

function makeUsersCsv(rows: AdminUser[]) {
  const header = [
    "Name",
    "Email",
    "Mobile",
    "City",
    "State",
    "Status",
    "KYC",
    "Active Package",
    "Total Applications",
    "Registered",
  ];

  const lines = rows.map((u) => {
    return [
      csvEscape(u.name),
      csvEscape(u.email),
      csvEscape(u.phone),
      csvEscape(u.city || "-"),
      csvEscape(u.state || "-"),
      csvEscape(u.isActive ? "active" : "inactive"),
      csvEscape(u.kycVerified ? "verified" : "pending"),
      csvEscape(u.activePackage || "-"),
      csvEscape(u.totalApplications),
      csvEscape(new Date(u.createdAt).toLocaleDateString()),
    ].join(",");
  });

  return [header.join(","), ...lines].join("\n");
}

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [kycFilter, setKycFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [applicationsDialogOpen, setApplicationsDialogOpen] = useState(false);
  const [documentsDialogOpen, setDocumentsDialogOpen] = useState(false);

  const [applications, setApplications] = useState<Application[]>([]);
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [loadingDocuments, setLoadingDocuments] = useState(false);

  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        toast.error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async (userId: string) => {
    setLoadingApplications(true);
    setApplications([]);
    try {
      const response = await fetch(`/api/applications/user/${userId}`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications || []);
      } else {
        const txt = await response.text().catch(() => "");
        console.error("Applications fetch failed:", response.status, txt);
        toast.error("Failed to fetch applications");
      }
    } catch (error) {
      console.error("Failed to fetch applications:", error);
      toast.error("Failed to fetch applications");
    } finally {
      setLoadingApplications(false);
    }
  };

  const fetchDocuments = async (userId: string) => {
    setLoadingDocuments(true);
    setDocuments([]);
    try {
      const response = await fetch(`/api/applications/user/${userId}/documents`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      } else {
        const txt = await response.text().catch(() => "");
        console.error("Documents fetch failed:", response.status, txt);
        toast.error("Failed to fetch documents");
      }
    } catch (error) {
      console.error("Failed to fetch documents:", error);
      toast.error("Failed to fetch documents");
    } finally {
      setLoadingDocuments(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.includes(searchTerm);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && user.isActive) ||
        (statusFilter === "inactive" && !user.isActive);

      const matchesKyc =
        kycFilter === "all" ||
        (kycFilter === "verified" && user.kycVerified) ||
        (kycFilter === "pending" && !user.kycVerified);

      return matchesSearch && matchesStatus && matchesKyc;
    });
  }, [users, searchTerm, statusFilter, kycFilter]);

  const stats = useMemo(
    () => ({
      total: users.length,
      active: users.filter((u) => u.isActive).length,
      kycVerified: users.filter((u) => u.kycVerified).length,
      banned: users.filter((u) => !u.isActive).length,
    }),
    [users]
  );

  // ✅ FIX #1: nested dialog stacking issue -> close "User Details" before opening next
  const openApplicationsForSelected = () => {
    if (!selectedUser?._id) return;
    setViewDialogOpen(false);
    setDocumentsDialogOpen(false);
    setApplicationsDialogOpen(true);
    fetchApplications(selectedUser._id);
  };

  const openDocumentsForSelected = () => {
    if (!selectedUser?._id) return;
    setViewDialogOpen(false);
    setApplicationsDialogOpen(false);
    setDocumentsDialogOpen(true);
    fetchDocuments(selectedUser._id);
  };

  // ✅ FIX #2: Export CSV server + fallback (client-side)
  const handleExportCSV = async () => {
    if (exporting) return;

    setExporting(true);
    try {
      const response = await fetch("/api/applications/users/export", {
        credentials: "include",
        headers: {
          Accept: "text/csv",
        },
      });

      if (response.ok) {
        const contentType = response.headers.get("content-type") || "";
        // agar backend JSON de raha hai to file download mat karna
        if (contentType.includes("application/json")) {
          const j = await response.json().catch(() => null);
          throw new Error(j?.message || "Export API returned JSON, not CSV");
        }

        const blob = await response.blob();
        const filename =
          getFilenameFromDisposition(response.headers.get("content-disposition")) ||
          "users.csv";
        downloadBlob(blob, filename);
        toast.success("Users exported successfully");
        return;
      }

      // non-200 => fallback
      const errText = await response.text().catch(() => "");
      console.error("Export failed:", response.status, errText);
      throw new Error("Export API failed");
    } catch (error) {
      console.error("Failed to export:", error);

      // fallback: export currently filtered users
      if (filteredUsers.length === 0) {
        toast.error("No users to export");
      } else {
        const csv = makeUsersCsv(filteredUsers);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        downloadBlob(blob, "users.csv");
        toast.success("Exported using client-side CSV");
      }
    } finally {
      setExporting(false);
    }
  };

  const handleToggleStatus = async (user: AdminUser) => {
    try {
      const response = await fetch(`/api/admin/users/${user._id}/toggle-status`, {
        method: "PATCH",
        credentials: "include",
      });
      if (response.ok) {
        toast.success(
          `User ${user.isActive ? "banned" : "activated"} successfully`
        );
        fetchUsers();
      } else {
        toast.error("Failed to update user status");
      }
    } catch (error) {
      console.error("Failed to toggle status:", error);
      toast.error("Failed to update user status");
    }
  };

  const handleVerifyKYC = async (user: AdminUser) => {
    try {
      const response = await fetch(`/api/admin/users/${user._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ kycVerified: true }),
      });
      if (response.ok) {
        toast.success("KYC verified successfully");
        fetchUsers();
      } else {
        toast.error("Failed to verify KYC");
      }
    } catch (error) {
      console.error("Failed to verify KYC:", error);
      toast.error("Failed to verify KYC");
    }
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
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground">
            Manage all registered users and their KYC verification.
          </p>
        </div>

        <Button variant="outline" onClick={handleExportCSV} disabled={exporting}>
          <Download className="h-4 w-4 mr-2" />
          {exporting ? "Exporting..." : "Export CSV"}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Users</p>
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
            <p className="text-sm text-muted-foreground">KYC Verified</p>
            <p className="text-2xl font-bold text-primary">{stats.kycVerified}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Banned</p>
            <p className="text-2xl font-bold text-destructive">{stats.banned}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, mobile..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <Select value={kycFilter} onValueChange={setKycFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="KYC" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All KYC</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead className="hidden md:table-cell">Location</TableHead>
                  <TableHead className="hidden lg:table-cell">Registered</TableHead>
                  <TableHead>KYC</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Package</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground md:hidden">
                          {(user.city || "-") + ", " + (user.state || "-")}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell className="hidden md:table-cell">
                      {user.city || "-"}, {user.state || "-"}
                    </TableCell>

                    <TableCell className="hidden lg:table-cell">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>

                    <TableCell>
                      {user.kycVerified ? (
                        <Badge
                          variant="outline"
                          className="bg-success/10 text-success border-success/20"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-warning/10 text-warning border-warning/20"
                        >
                          Pending
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="outline"
                        className={user.isActive ? statusColors.active : statusColors.inactive}
                      >
                        {user.isActive ? "active" : "inactive"}
                      </Badge>
                    </TableCell>

                    <TableCell className="hidden lg:table-cell">
                      {user.activePackage || "-"}
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
                              // reset old data so stale list na dikhe
                              setApplications([]);
                              setDocuments([]);
                              setApplicationsDialogOpen(false);
                              setDocumentsDialogOpen(false);

                              setSelectedUser(user);
                              setViewDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>

                          {!user.kycVerified && (
                            <DropdownMenuItem onClick={() => handleVerifyKYC(user)}>
                              <UserCheck className="h-4 w-4 mr-2" />
                              Verify KYC
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuSeparator />

                          <DropdownMenuItem onClick={() => handleToggleStatus(user)}>
                            {user.isActive ? (
                              <>
                                <Ban className="h-4 w-4 mr-2" />
                                Ban User
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Activate User
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No users found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog
        open={viewDialogOpen}
        onOpenChange={(open) => {
          setViewDialogOpen(open);
          if (!open) {
            // close child dialogs if user closes parent
            setApplicationsDialogOpen(false);
            setDocumentsDialogOpen(false);
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>Complete information about the user.</DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{selectedUser.name}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge
                    variant="outline"
                    className={selectedUser.isActive ? statusColors.active : statusColors.inactive}
                  >
                    {selectedUser.isActive ? "active" : "inactive"}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p>{selectedUser.email}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Mobile</p>
                  <p>{selectedUser.phone}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p>
                    {selectedUser.city || "-"}, {selectedUser.state || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Registered</p>
                  <p>{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">KYC Status</p>
                  <Badge
                    variant="outline"
                    className={
                      selectedUser.kycVerified
                        ? "bg-success/10 text-success"
                        : "bg-warning/10 text-warning"
                    }
                  >
                    {selectedUser.kycVerified ? "Verified" : "Pending"}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Applications</p>
                  <p>{selectedUser.totalApplications}</p>
                </div>

                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Active Package</p>
                  <p>{selectedUser.activePackage || "No active package"}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={openApplicationsForSelected}>
                  <Briefcase className="h-4 w-4 mr-2" />
                  View Applications
                </Button>

                <Button variant="outline" className="flex-1" onClick={openDocumentsForSelected}>
                  <FileText className="h-4 w-4 mr-2" />
                  View Documents
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Applications Dialog */}
      <Dialog open={applicationsDialogOpen} onOpenChange={setApplicationsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Applications</DialogTitle>
            <DialogDescription>
              Applications submitted by {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>

          {loadingApplications ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : applications.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Form Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((app) => (
                    <TableRow key={app._id}>
                      <TableCell className="font-medium">{app.formName}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{app.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{app.status}</Badge>
                      </TableCell>
                      <TableCell>{new Date(app.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No applications found</div>
          )}
        </DialogContent>
      </Dialog>

      {/* Documents Dialog */}
      <Dialog open={documentsDialogOpen} onOpenChange={setDocumentsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Documents</DialogTitle>
            <DialogDescription>
              Documents uploaded by {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>

          {loadingDocuments ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : documents.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Uploaded</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc._id}>
                      <TableCell className="font-medium">{doc.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{doc.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            doc.status === "verified"
                              ? "bg-success/10 text-success"
                              : doc.status === "rejected"
                              ? "bg-destructive/10 text-destructive"
                              : "bg-warning/10 text-warning"
                          }
                        >
                          {doc.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(doc.uploadedAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No documents found</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
