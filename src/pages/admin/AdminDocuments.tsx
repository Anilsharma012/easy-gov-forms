import { useState, useEffect } from "react";
import {
  Search,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Download,
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface UserDoc {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  name: string;
  type: string;
  documentNumber?: string;
  fileName: string;
  originalFileName: string;
  filePath: string;
  status: 'pending' | 'verified' | 'rejected';
  uploadedAt: string;
  verifiedAt?: string;
  createdAt: string;
}

interface Stats {
  pending: number;
  verified: number;
  rejected: number;
  total: number;
}

const statusColors = {
  pending: "bg-warning/10 text-warning border-warning/20",
  verified: "bg-success/10 text-success border-success/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

const statusIcons = {
  pending: Clock,
  verified: CheckCircle,
  rejected: XCircle,
};

export default function AdminDocuments() {
  const [documents, setDocuments] = useState<UserDoc[]>([]);
  const [stats, setStats] = useState<Stats>({ pending: 0, verified: 0, rejected: 0, total: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<UserDoc | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`/api/admin/documents?status=${statusFilter}`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok) {
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/documents/stats', {
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
    fetchStats();
  }, [statusFilter]);

  const handleApprove = async (docId: string) => {
    setProcessingId(docId);
    try {
      const response = await fetch(`/api/admin/documents/${docId}/approve`, {
        method: 'PATCH',
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('Document approved successfully');
        fetchDocuments();
        fetchStats();
      } else {
        toast.error(data.message || 'Failed to approve document');
      }
    } catch (error) {
      toast.error('Failed to approve document');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!selectedDoc) return;
    setProcessingId(selectedDoc._id);
    try {
      const response = await fetch(`/api/admin/documents/${selectedDoc._id}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason: rejectReason })
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('Document rejected');
        setShowRejectDialog(false);
        setRejectReason("");
        setSelectedDoc(null);
        fetchDocuments();
        fetchStats();
      } else {
        toast.error(data.message || 'Failed to reject document');
      }
    } catch (error) {
      toast.error('Failed to reject document');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.type?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Document Verification
          </h1>
          <p className="text-muted-foreground">
            Review and approve user-uploaded documents.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
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
            <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <XCircle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.rejected}</p>
              <p className="text-sm text-muted-foreground">Rejected</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total</p>
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
                placeholder="Search by name, email, or document type..."
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
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
                  <TableHead>User</TableHead>
                  <TableHead>Document</TableHead>
                  <TableHead className="hidden md:table-cell">Type</TableHead>
                  <TableHead className="hidden lg:table-cell">Doc Number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Uploaded</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading documents...
                    </TableCell>
                  </TableRow>
                ) : filteredDocuments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No documents found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDocuments.map((doc) => {
                    const Icon = statusIcons[doc.status];
                    return (
                      <TableRow key={doc._id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{doc.userId?.name || 'Unknown'}</p>
                            <p className="text-sm text-muted-foreground">{doc.userId?.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-sm text-muted-foreground">{doc.originalFileName}</p>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {doc.type}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {doc.documentNumber || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusColors[doc.status]}>
                            <Icon className="h-3 w-3 mr-1" />
                            {doc.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {new Date(doc.uploadedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(doc.filePath, '_blank')}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {doc.status === 'pending' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-success hover:text-success"
                                  onClick={() => handleApprove(doc._id)}
                                  disabled={processingId === doc._id}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => {
                                    setSelectedDoc(doc);
                                    setShowRejectDialog(true);
                                  }}
                                  disabled={processingId === doc._id}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Are you sure you want to reject this document? The user will be notified.
            </p>
            <Textarea
              placeholder="Reason for rejection (optional)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={processingId !== null}
            >
              Reject Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
