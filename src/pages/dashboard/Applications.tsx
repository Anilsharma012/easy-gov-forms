import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Download,
  Eye,
  TicketCheck,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";

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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { mockApplications, Application } from "@/data/mockData";

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  processing: "bg-info/10 text-info border-info/20",
  submitted: "bg-primary/10 text-primary border-primary/20",
  completed: "bg-success/10 text-success border-success/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
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

function buildReceiptHtml(app: Application) {
  const subDate = new Date(app.submissionDate).toLocaleDateString();
  const lastDate = new Date(app.lastDate).toLocaleDateString();

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Receipt - ${app.applicationId}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
    .wrap { max-width: 720px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; }
    h1 { margin: 0 0 8px; font-size: 20px; }
    .muted { color: #6b7280; margin: 0 0 16px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .box { border: 1px solid #e5e7eb; border-radius: 10px; padding: 12px; }
    .label { font-size: 12px; color: #6b7280; margin-bottom: 6px; }
    .value { font-weight: 600; }
    .full { grid-column: 1 / -1; }
    .footer { margin-top: 18px; font-size: 12px; color: #6b7280; }
    .btns { margin-top: 16px; display: flex; gap: 10px; }
    button { padding: 10px 14px; border-radius: 10px; border: 1px solid #e5e7eb; background: #fff; cursor: pointer; }
    button:hover { background: #f9fafb; }
    @media print { .btns { display: none; } .wrap { border: none; } }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>Easy Gov Forms - Receipt</h1>
    <p class="muted">Application receipt (demo receipt generated from your dashboard data).</p>

    <div class="grid">
      <div class="box">
        <div class="label">Application ID</div>
        <div class="value">${app.applicationId}</div>
      </div>

      <div class="box">
        <div class="label">Status</div>
        <div class="value">${app.status}</div>
      </div>

      <div class="box full">
        <div class="label">Job Title</div>
        <div class="value">${app.jobTitle}</div>
      </div>

      <div class="box">
        <div class="label">Department</div>
        <div class="value">${app.department}</div>
      </div>

      <div class="box">
        <div class="label">Package Used</div>
        <div class="value">${app.packageUsed}</div>
      </div>

      <div class="box">
        <div class="label">Submission Date</div>
        <div class="value">${subDate}</div>
      </div>

      <div class="box">
        <div class="label">Last Date</div>
        <div class="value">${lastDate}</div>
      </div>
    </div>

    <div class="btns">
      <button onclick="window.print()">Print / Save as PDF</button>
    </div>

    <div class="footer">
      Note: This receipt is generated on client-side (mock/demo). If you want server-verified PDF, we’ll connect it to backend API later.
    </div>
  </div>
</body>
</html>`;
}

export default function Applications() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const filteredApplications = useMemo(() => {
    return mockApplications.filter((app) => {
      const matchesSearch =
        app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.applicationId.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || app.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  const openDetails = (app: Application) => {
    setSelectedApp(app);
    setDetailsOpen(true);
  };

  const handleDownloadReceipt = (app: Application) => {
    try {
      const html = buildReceiptHtml(app);
      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      downloadBlob(blob, `receipt-${app.applicationId}.html`);
      toast.success("Receipt downloaded");
    } catch (e) {
      console.error(e);
      toast.error("Receipt download failed");
    }
  };

  const handleRaiseTicket = (app: Application) => {
    // ✅ Working action: redirect user to Support page with prefilled query params
    const qs = new URLSearchParams({
      appId: app.applicationId,
      job: app.jobTitle,
      status: app.status,
    }).toString();

    toast.success("Opening Support & Tickets...");
    navigate(`/dashboard/support?${qs}`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Applications</h1>
        <p className="text-muted-foreground">
          Track and manage all your job applications.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by job title or application ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
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
                  <TableHead>Job Title</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Application ID
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Submission Date
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">Last Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredApplications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium line-clamp-1">{app.jobTitle}</p>
                        <p className="text-xs text-muted-foreground md:hidden">
                          {app.applicationId}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell className="hidden md:table-cell font-mono text-sm">
                      {app.applicationId}
                    </TableCell>

                    <TableCell className="hidden lg:table-cell">
                      {new Date(app.submissionDate).toLocaleDateString()}
                    </TableCell>

                    <TableCell className="hidden lg:table-cell">
                      {new Date(app.lastDate).toLocaleDateString()}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="outline"
                        className={statusColors[app.status] || "bg-muted text-muted-foreground"}
                      >
                        {app.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {/* ✅ VIEW (working) */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDetails(app)}
                          aria-label="View Application"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        {/* ✅ QUICK DOWNLOAD (working) */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownloadReceipt(app)}
                          aria-label="Download Receipt"
                          title="Download Receipt"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredApplications.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No applications found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ✅ Single details dialog (clean + reliable) */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              View complete details of your application.
            </DialogDescription>
          </DialogHeader>

          {selectedApp && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Application ID</p>
                  <p className="font-mono font-medium">{selectedApp.applicationId}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge
                    variant="outline"
                    className={statusColors[selectedApp.status] || "bg-muted text-muted-foreground"}
                  >
                    {selectedApp.status}
                  </Badge>
                </div>

                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Job Title</p>
                  <p className="font-medium">{selectedApp.jobTitle}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p>{selectedApp.department}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Package Used</p>
                  <p>{selectedApp.packageUsed}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Submission Date</p>
                  <p>{new Date(selectedApp.submissionDate).toLocaleDateString()}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Last Date</p>
                  <p>{new Date(selectedApp.lastDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                {/* ✅ Download Receipt (working) */}
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleDownloadReceipt(selectedApp)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Receipt
                </Button>

                {/* ✅ Raise Ticket (working) */}
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleRaiseTicket(selectedApp)}
                >
                  <TicketCheck className="h-4 w-4 mr-2" />
                  Raise Ticket
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
