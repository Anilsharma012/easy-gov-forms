import { useState, useEffect } from "react";
import {
  Search,
  Download,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
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

interface Payment {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  packageId: {
    _id: string;
    name: string;
  };
  packageName: string;
  amount: number;
  paymentId: string;
  orderId: string;
  status: 'active' | 'expired';
  purchasedAt: string;
  createdAt: string;
}

interface Stats {
  totalPayments: number;
  activePackages: number;
  expiredPackages: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

const statusColors = {
  active: "bg-success/10 text-success border-success/20",
  expired: "bg-muted/10 text-muted-foreground border-muted/20",
};

const statusIcons = {
  active: CheckCircle,
  expired: Clock,
};

export default function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<Stats>({ 
    totalPayments: 0, 
    activePackages: 0, 
    expiredPackages: 0, 
    totalRevenue: 0, 
    monthlyRevenue: 0 
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    try {
      const response = await fetch(`/api/admin/payments?status=${statusFilter}`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok) {
        setPayments(data.payments || []);
      }
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/payments/stats', {
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
    fetchPayments();
    fetchStats();
  }, [statusFilter]);

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.paymentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.orderId?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const totalAmount = filteredPayments.reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Payments & Transactions
          </h1>
          <p className="text-muted-foreground">
            View and manage all payment transactions.
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                ₹{stats.totalRevenue.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                ₹{stats.monthlyRevenue.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">This Month</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.activePackages}</p>
              <p className="text-sm text-muted-foreground">Active Packages</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-muted/10 flex items-center justify-center">
              <XCircle className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.expiredPackages}</p>
              <p className="text-sm text-muted-foreground">Expired</p>
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
                placeholder="Search by name, email, or payment ID..."
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead className="hidden md:table-cell">Package</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading payments...
                    </TableCell>
                  </TableRow>
                ) : filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No payments found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment) => {
                    const Icon = statusIcons[payment.status];
                    return (
                      <TableRow key={payment._id}>
                        <TableCell className="font-mono text-sm">
                          {payment.paymentId}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{payment.userId?.name || 'Unknown'}</p>
                            <p className="text-sm text-muted-foreground">{payment.userId?.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {payment.packageName}
                        </TableCell>
                        <TableCell className="font-bold">
                          ₹{payment.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={statusColors[payment.status]}
                          >
                            <Icon className="h-3 w-3 mr-1" />
                            {payment.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {new Date(payment.purchasedAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {filteredPayments.length > 0 && (
            <div className="mt-4 p-4 rounded-lg bg-muted/50 flex justify-between items-center">
              <span className="text-muted-foreground">
                Showing {filteredPayments.length} transactions
              </span>
              <span className="font-bold">
                Total: ₹{totalAmount.toLocaleString()}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
