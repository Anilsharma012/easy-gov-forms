import { useState, useEffect } from "react";
import {
  Search,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Download,
  Loader2,
  X,
  RefreshCw,
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
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [previewData, setPreviewData] = useState<{ fileData: string; fileName: string } | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [showResendDialog, setShowResendDialog] = useState(false);
  const [resendReason, setResendReason] = useState("");

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

  const handleViewDocument = async (doc: UserDoc) => {
    setPreviewLoading(true);
    setShowPreviewDialog(true);
    setSelectedDoc(doc);
    try {
      const response = await fetch(`/api/documents/view/${doc._id}`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok) {
        setPreviewData({ fileData: data.fileData, fileName: data.fileName });
      } else {
        toast.error(data.message || 'Failed to load document');
        setShowPreviewDialog(false);
      }
    } catch (error) {
      toast.error('Failed to load document');
      setShowPreviewDialog(false);
    } finally {
      setPreviewLoading(false);
    }
  };

  const getFileType = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'pdf';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return 'image';
    return 'unknown';
  };

  const handleDownload = async (doc: UserDoc) => {
    try {
      const response = await fetch(`/api/documents/download/${doc._id}`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok) {
        const link = document.createElement('a');
        link.href = `data:${data.mimeType};base64,${data.fileData}`;
        link.download = data.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Document downloaded');
      } else {
        toast.error(data.message || 'Failed to download');
      }
    } catch (error) {
      toast.error('Failed to download document');
    }
  };

  const handleResendRequest = async () => {
    if (!selectedDoc) return;
    setProcessingId(selectedDoc._id);
    try {
      const response = await fetch(`/api/documents/resend-request/${selectedDoc._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason: resendReason })
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('Resend request sent to user');
        setShowResendDialog(false);
        setResendReason("");
        setSelectedDoc(null);
        fetchDocuments();
        fetchStats();
      } else {
        toast.error(data.message || 'Failed to send resend request');
      }
    } catch (error) {
      toast.error('Failed to send resend request');
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
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDocument(doc)}
                              title="View"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownload(doc)}
                              title="Download"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            {doc.status === 'pending' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-success hover:text-success"
                                  onClick={() => handleApprove(doc._id)}
                                  disabled={processingId === doc._id}
                                  title="Approve"
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
                                  title="Reject"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-warning hover:text-warning"
                              onClick={() => {
                                setSelectedDoc(doc);
                                setShowResendDialog(true);
                              }}
                              disabled={processingId === doc._id}
                              title="Request Re-upload"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
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

      <Dialog open={showPreviewDialog} onOpenChange={(open) => {
        setShowPreviewDialog(open);
        if (!open) {
          setPreviewData(null);
          setSelectedDoc(null);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Document Preview: {selectedDoc?.name}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedDoc && (
              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>User:</strong> {selectedDoc.userId?.name} ({selectedDoc.userId?.email})</p>
                <p><strong>Type:</strong> {selectedDoc.type}</p>
                <p><strong>File:</strong> {selectedDoc.originalFileName}</p>
                {selectedDoc.documentNumber && <p><strong>Document Number:</strong> {selectedDoc.documentNumber}</p>}
              </div>
            )}
            <div className="border rounded-lg overflow-hidden bg-muted/50 min-h-[400px] flex items-center justify-center">
              {previewLoading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Loading document...</p>
                </div>
              ) : previewData ? (
                getFileType(previewData.fileName) === 'image' ? (
                  <img 
                    src={`data:image/${previewData.fileName.split('.').pop()};base64,${previewData.fileData}`} 
                    alt={previewData.fileName}
                    className="max-w-full max-h-[60vh] object-contain"
                  />
                ) : getFileType(previewData.fileName) === 'pdf' ? (
                  <iframe
                    src={`data:application/pdf;base64,${previewData.fileData}`}
                    className="w-full h-[60vh]"
                    title="PDF Preview"
                  />
                ) : (
                  <p className="text-muted-foreground">Cannot preview this file type</p>
                )
              ) : (
                <p className="text-muted-foreground">No preview available</p>
              )}
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            {selectedDoc?.status === 'pending' && (
              <>
                <Button 
                  variant="outline" 
                  className="text-success border-success hover:bg-success/10"
                  onClick={() => {
                    handleApprove(selectedDoc._id);
                    setShowPreviewDialog(false);
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button 
                  variant="outline" 
                  className="text-destructive border-destructive hover:bg-destructive/10"
                  onClick={() => {
                    setShowPreviewDialog(false);
                    setShowRejectDialog(true);
                  }}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </>
            )}
            <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showResendDialog} onOpenChange={setShowResendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Re-upload</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Request the user to re-upload this document. They will be notified with the reason you provide.
            </p>
            <Textarea
              placeholder="Reason for re-upload request (e.g., 'Document is blurry', 'Wrong document type', etc.)"
              value={resendReason}
              onChange={(e) => setResendReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowResendDialog(false);
              setResendReason("");
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleResendRequest}
              disabled={processingId !== null || !resendReason.trim()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
