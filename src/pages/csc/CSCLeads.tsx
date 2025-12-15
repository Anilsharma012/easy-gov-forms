import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Users, Phone, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface Lead {
  _id: string;
  name: string;
  mobile: string;
  email?: string;
  formName: string;
  type: string;
  status: string;
  notes?: string;
  createdAt: string;
}

const CSCLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const fetchLeads = async () => {
    try {
      const response = await fetch("/api/csc/dashboard/leads", { credentials: "include" });
      if (response.ok) {
        const data = await response.json();
        setLeads(data.leads || []);
      }
    } catch (error) {
      console.error("Failed to fetch leads:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleStatusUpdate = async (leadId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/csc/dashboard/leads/${leadId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast({
          title: "Status Updated",
          description: `Lead marked as ${newStatus}`,
        });
        fetchLeads();
      } else {
        throw new Error("Failed to update status");
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update lead status",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "in-progress":
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case "new":
        return <Badge className="bg-yellow-100 text-yellow-800">New</Badge>;
      case "cancelled":
        return <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "job":
        return <Badge variant="outline" className="border-blue-500 text-blue-700">Job</Badge>;
      case "scheme":
        return <Badge variant="outline" className="border-green-500 text-green-700">Scheme</Badge>;
      case "document":
        return <Badge variant="outline" className="border-purple-500 text-purple-700">Document</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const filteredLeads = leads.filter(
    (lead) =>
      lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.mobile?.includes(searchTerm) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.formName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Leads</h1>
        <p className="text-muted-foreground">
          Track and manage leads assigned to your center
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                All Leads ({leads.length})
              </CardTitle>
              <CardDescription>Leads assigned to your CSC center</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search leads..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredLeads.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No leads yet</h3>
              <p className="text-muted-foreground">
                Leads assigned to your center will appear here
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Form</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => (
                  <TableRow key={lead._id}>
                    <TableCell className="font-medium">
                      {lead.name}
                    </TableCell>
                    <TableCell>
                      <a href={`tel:${lead.mobile}`} className="flex items-center gap-1 text-blue-600 hover:underline">
                        <Phone className="h-3 w-3" />
                        {lead.mobile}
                      </a>
                    </TableCell>
                    <TableCell>{lead.formName}</TableCell>
                    <TableCell>{getTypeBadge(lead.type)}</TableCell>
                    <TableCell>{getStatusBadge(lead.status)}</TableCell>
                    <TableCell>
                      {format(new Date(lead.createdAt), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {lead.status === "new" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-blue-600 border-blue-600 hover:bg-blue-50"
                            onClick={() => handleStatusUpdate(lead._id, "in-progress")}
                          >
                            Start
                          </Button>
                        )}
                        {lead.status === "in-progress" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 border-green-600 hover:bg-green-50"
                              onClick={() => handleStatusUpdate(lead._id, "completed")}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Complete
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-gray-600 border-gray-600 hover:bg-gray-50"
                              onClick={() => handleStatusUpdate(lead._id, "cancelled")}
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Cancel
                            </Button>
                          </>
                        )}
                        {(lead.status === "completed" || lead.status === "cancelled") && (
                          <span className="text-xs text-muted-foreground">No actions</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CSCLeads;
