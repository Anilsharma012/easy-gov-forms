import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Search, Eye, CheckCircle, XCircle, Loader2, ShieldCheck, FileText } from "lucide-react";
import { format } from "date-fns";

interface KYCDocument {
  documentType: string;
  fileName: string;
  filePath: string;
  status: string;
  uploadedAt: string;
  verifiedAt?: string;
  rejectionReason?: string;
}

interface KYCRecord {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  documents: KYCDocument[];
  overallStatus: string;
  submittedAt?: string;
  verifiedAt?: string;
  rejectionReason?: string;
}

const documentTypeLabels: Record<string, string> = {
  aadhaar: "Aadhaar Card",
  pan: "PAN Card",
  photo: "Passport Photo",
  signature: "Signature",
  address_proof: "Address Proof",
};

const statusColors: Record<string, string> = {
  not_started: "bg-gray-100 text-gray-800",
  in_progress: "bg-blue-100 text-blue-800",
  pending_review: "bg-yellow-100 text-yellow-800",
  verified: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  pending: "bg-yellow-100 text-yellow-800",
};

export default function AdminKYC() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedKYC, setSelectedKYC] = useState<KYCRecord | null>(null);
  const [viewingDoc, setViewingDoc] = useState<{ userId: string; docType: string; data?: string; mimeType?: string; loading?: boolean } | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<{ userId: string; docType?: string } | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: kycsData, isLoading } = useQuery({
    queryKey: ["admin-kycs"],
    queryFn: async () => {
      const res = await fetch("/api/user-kyc/admin/all", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch KYCs");
      return res.json();
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async ({ userId, status, rejectionReason }: { userId: string; status: string; rejectionReason?: string }) => {
      const res = await fetch(`/api/user-kyc/admin/${userId}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status, rejectionReason }),
      });
      if (!res.ok) throw new Error("Failed to update KYC");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-kycs"] });
      setSelectedKYC(null);
      setShowRejectDialog(false);
      setRejectReason("");
      toast({ title: "KYC status updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update KYC", variant: "destructive" });
    },
  });

  const verifyDocMutation = useMutation({
    mutationFn: async ({ userId, docType, status, rejectionReason }: { userId: string; docType: string; status: string; rejectionReason?: string }) => {
      const res = await fetch(`/api/user-kyc/admin/${userId}/document/${docType}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status, rejectionReason }),
      });
      if (!res.ok) throw new Error("Failed to update document");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-kycs"] });
      if (data.kyc) {
        setSelectedKYC({ ...selectedKYC!, ...data.kyc });
      }
      setShowRejectDialog(false);
      setRejectReason("");
      toast({ title: "Document status updated" });
    },
    onError: () => {
      toast({ title: "Failed to update document", variant: "destructive" });
    },
  });

  const viewDocument = async (userId: string, docType: string) => {
    setViewingDoc({ userId, docType, loading: true });
    try {
      const res = await fetch(`/api/user-kyc/admin/${userId}/document/${docType}/view`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch document");
      const data = await res.json();
      setViewingDoc({ userId, docType, data: data.data, mimeType: data.mimeType });
    } catch (error) {
      toast({ title: "Failed to load document", variant: "destructive" });
      setViewingDoc(null);
    }
  };

  const handleReject = () => {
    if (!rejectTarget || !rejectReason.trim()) return;
    
    if (rejectTarget.docType) {
      verifyDocMutation.mutate({
        userId: rejectTarget.userId,
        docType: rejectTarget.docType,
        status: "rejected",
        rejectionReason: rejectReason,
      });
    } else {
      verifyMutation.mutate({
        userId: rejectTarget.userId,
        status: "rejected",
        rejectionReason: rejectReason,
      });
    }
  };

  const kycs: KYCRecord[] = kycsData?.kycs || [];
  
  const filteredKYCs = kycs.filter((kyc) => {
    const matchesSearch =
      kyc.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      kyc.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || kyc.overallStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-primary" />
            KYC Verification
          </h1>
          <p className="text-muted-foreground">Review and verify user KYC documents</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending_review">Pending Review</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredKYCs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No KYC submissions found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredKYCs.map((kyc) => (
                  <TableRow key={kyc._id}>
                    <TableCell className="font-medium">{kyc.userId?.name || "N/A"}</TableCell>
                    <TableCell>{kyc.userId?.email || "N/A"}</TableCell>
                    <TableCell>{kyc.documents?.length || 0} / 5</TableCell>
                    <TableCell>
                      <Badge className={statusColors[kyc.overallStatus] || "bg-gray-100"}>
                        {kyc.overallStatus?.replace("_", " ").toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {kyc.submittedAt ? format(new Date(kyc.submittedAt), "MMM d, yyyy") : "-"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedKYC(kyc)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedKYC} onOpenChange={() => setSelectedKYC(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>KYC Review - {selectedKYC?.userId?.name}</DialogTitle>
          </DialogHeader>
          
          {selectedKYC && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Email:</span>
                  <p className="font-medium">{selectedKYC.userId?.email}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Phone:</span>
                  <p className="font-medium">{selectedKYC.userId?.phone || "N/A"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <Badge className={statusColors[selectedKYC.overallStatus] || "bg-gray-100"}>
                    {selectedKYC.overallStatus?.replace("_", " ").toUpperCase()}
                  </Badge>
                </div>
                {selectedKYC.rejectionReason && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Rejection Reason:</span>
                    <p className="text-red-600">{selectedKYC.rejectionReason}</p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-semibold mb-3">Documents</h3>
                <div className="space-y-3">
                  {selectedKYC.documents?.map((doc) => (
                    <div
                      key={doc.documentType}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{documentTypeLabels[doc.documentType] || doc.documentType}</p>
                          <p className="text-sm text-muted-foreground">{doc.fileName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={statusColors[doc.status] || "bg-gray-100"}>
                          {doc.status?.toUpperCase()}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewDocument(selectedKYC.userId._id, doc.documentType)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {doc.status === "pending" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600"
                              onClick={() => verifyDocMutation.mutate({
                                userId: selectedKYC.userId._id,
                                docType: doc.documentType,
                                status: "verified",
                              })}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600"
                              onClick={() => {
                                setRejectTarget({ userId: selectedKYC.userId._id, docType: doc.documentType });
                                setShowRejectDialog(true);
                              }}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedKYC.overallStatus === "pending_review" && (
                <DialogFooter className="gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setRejectTarget({ userId: selectedKYC.userId._id });
                      setShowRejectDialog(true);
                    }}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject All
                  </Button>
                  <Button
                    onClick={() => verifyMutation.mutate({
                      userId: selectedKYC.userId._id,
                      status: "verified",
                    })}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Verify All
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewingDoc && !viewingDoc.loading} onOpenChange={() => setViewingDoc(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Document Preview</DialogTitle>
          </DialogHeader>
          {viewingDoc?.data && (
            <div className="flex justify-center">
              {viewingDoc.mimeType?.startsWith("image/") ? (
                <img src={viewingDoc.data} alt="Document" className="max-h-[70vh] object-contain" />
              ) : (
                <iframe src={viewingDoc.data} className="w-full h-[70vh]" title="Document" />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejection Reason</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Enter reason for rejection..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectReason.trim()}
            >
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {viewingDoc?.loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      )}
    </div>
  );
}
