import { useState, useEffect } from "react";
import {
  Search,
  Wallet,
  CheckCircle,
  XCircle,
  Clock,
  ArrowDownCircle,
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Withdrawal {
  _id: string;
  centerId: {
    _id: string;
    centerName: string;
    ownerName: string;
    email: string;
    phone?: string;
    bankDetails?: {
      accountNumber?: string;
      ifscCode?: string;
      bankName?: string;
      accountHolderName?: string;
    };
  };
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'rejected' | 'cancelled';
  reference?: string;
  adminNote?: string;
  processedAt?: string;
  createdAt: string;
}

interface Stats {
  pending: number;
  completed: number;
  rejected: number;
  pendingAmount: number;
  completedAmount: number;
}

const statusColors = {
  pending: "bg-warning/10 text-warning border-warning/20",
  completed: "bg-success/10 text-success border-success/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
  cancelled: "bg-muted/10 text-muted-foreground border-muted/20",
};

const statusIcons = {
  pending: Clock,
  completed: CheckCircle,
  rejected: XCircle,
  cancelled: XCircle,
};

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [stats, setStats] = useState<Stats>({ pending: 0, completed: 0, rejected: 0, pendingAmount: 0, completedAmount: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [reference, setReference] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchWithdrawals = async () => {
    try {
      const response = await fetch(`/api/admin/withdrawals?status=${statusFilter}`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok) {
        setWithdrawals(data.withdrawals || []);
      }
    } catch (error) {
      console.error('Failed to fetch withdrawals:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/withdrawals/stats', {
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
    fetchWithdrawals();
    fetchStats();
  }, [statusFilter]);

  const handleApprove = async () => {
    if (!selectedWithdrawal) return;
    setProcessingId(selectedWithdrawal._id);
    try {
      const response = await fetch(`/api/admin/withdrawals/${selectedWithdrawal._id}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reference, adminNote })
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('Withdrawal approved successfully');
        setShowApproveDialog(false);
        setReference("");
        setAdminNote("");
        setSelectedWithdrawal(null);
        fetchWithdrawals();
        fetchStats();
      } else {
        toast.error(data.message || 'Failed to approve withdrawal');
      }
    } catch (error) {
      toast.error('Failed to approve withdrawal');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!selectedWithdrawal) return;
    setProcessingId(selectedWithdrawal._id);
    try {
      const response = await fetch(`/api/admin/withdrawals/${selectedWithdrawal._id}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ adminNote })
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('Withdrawal rejected and amount refunded to wallet');
        setShowRejectDialog(false);
        setAdminNote("");
        setSelectedWithdrawal(null);
        fetchWithdrawals();
        fetchStats();
      } else {
        toast.error(data.message || 'Failed to reject withdrawal');
      }
    } catch (error) {
      toast.error('Failed to reject withdrawal');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredWithdrawals = withdrawals.filter((w) => {
    const matchesSearch =
      w.centerId?.centerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.centerId?.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.centerId?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Wallet Withdrawals
          </h1>
          <p className="text-muted-foreground">
            Manage CSC center withdrawal requests.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
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
              <p className="text-2xl font-bold">{stats.completed}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
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
            <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <ArrowDownCircle className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-xl font-bold">₹{stats.pendingAmount.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Pending Amount</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-xl font-bold">₹{stats.completedAmount.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Paid</p>
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
                placeholder="Search by center name or owner..."
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
                <SelectItem value="completed">Completed</SelectItem>
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
                  <TableHead>CSC Center</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="hidden md:table-cell">Bank Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Requested</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading withdrawals...
                    </TableCell>
                  </TableRow>
                ) : filteredWithdrawals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No withdrawal requests found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredWithdrawals.map((w) => {
                    const Icon = statusIcons[w.status];
                    return (
                      <TableRow key={w._id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{w.centerId?.centerName || 'Unknown'}</p>
                            <p className="text-sm text-muted-foreground">{w.centerId?.ownerName}</p>
                            <p className="text-xs text-muted-foreground">{w.centerId?.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-lg font-bold">₹{w.amount.toLocaleString()}</p>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {w.centerId?.bankDetails ? (
                            <div className="text-sm">
                              <p>{w.centerId.bankDetails.bankName}</p>
                              <p className="text-muted-foreground">
                                A/C: {w.centerId.bankDetails.accountNumber}
                              </p>
                              <p className="text-muted-foreground">
                                IFSC: {w.centerId.bankDetails.ifscCode}
                              </p>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Not provided</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusColors[w.status]}>
                            <Icon className="h-3 w-3 mr-1" />
                            {w.status}
                          </Badge>
                          {w.reference && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Ref: {w.reference}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {new Date(w.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {w.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-success hover:text-success"
                                onClick={() => {
                                  setSelectedWithdrawal(w);
                                  setShowApproveDialog(true);
                                }}
                                disabled={processingId === w._id}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => {
                                  setSelectedWithdrawal(w);
                                  setShowRejectDialog(true);
                                }}
                                disabled={processingId === w._id}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
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

      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Withdrawal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedWithdrawal && (
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <p><strong>Center:</strong> {selectedWithdrawal.centerId?.centerName}</p>
                <p><strong>Amount:</strong> ₹{selectedWithdrawal.amount.toLocaleString()}</p>
                {selectedWithdrawal.centerId?.bankDetails && (
                  <>
                    <p><strong>Bank:</strong> {selectedWithdrawal.centerId.bankDetails.bankName}</p>
                    <p><strong>Account:</strong> {selectedWithdrawal.centerId.bankDetails.accountNumber}</p>
                    <p><strong>IFSC:</strong> {selectedWithdrawal.centerId.bankDetails.ifscCode}</p>
                    <p><strong>Account Holder:</strong> {selectedWithdrawal.centerId.bankDetails.accountHolderName}</p>
                  </>
                )}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="reference">Transaction Reference / UTR</Label>
              <Input
                id="reference"
                placeholder="Enter bank transaction reference"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">Admin Note (optional)</Label>
              <Textarea
                id="note"
                placeholder="Add any notes..."
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleApprove}
              disabled={processingId !== null}
              className="bg-success hover:bg-success/90"
            >
              Approve & Mark Paid
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Withdrawal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Are you sure you want to reject this withdrawal? The amount will be refunded back to the CSC center's wallet.
            </p>
            {selectedWithdrawal && (
              <div className="p-4 bg-muted rounded-lg">
                <p><strong>Center:</strong> {selectedWithdrawal.centerId?.centerName}</p>
                <p><strong>Amount:</strong> ₹{selectedWithdrawal.amount.toLocaleString()}</p>
              </div>
            )}
            <Textarea
              placeholder="Reason for rejection"
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
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
              Reject & Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
