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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Users, Phone, CheckCircle, XCircle, FileText, Eye, Download, User, Mail, Calendar, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface UserDetails {
  _id: string;
  name: string;
  email: string;
  mobile?: string;
  address?: string;
  state?: string;
  city?: string;
  pincode?: string;
  dob?: string;
  gender?: string;
}

interface UserDocument {
  _id: string;
  name: string;
  type: string;
  originalFileName: string;
  status: string;
  uploadedAt: string;
  documentNumber?: string;
}

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
  userId?: UserDetails;
}

const CSCLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [userDocuments, setUserDocuments] = useState<UserDocument[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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

  const fetchUserDocuments = async (userId: string) => {
    setLoadingDocuments(true);
    try {
      const response = await fetch(`/api/documents/user/${userId}`, { credentials: "include" });
      if (response.ok) {
        const data = await response.json();
        setUserDocuments(data.documents || []);
      }
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    } finally {
      setLoadingDocuments(false);
    }
  };

  const handleViewUserDetails = (lead: Lead) => {
    setSelectedLead(lead);
    setShowUserDetails(true);
    if (lead.userId?._id) {
      fetchUserDocuments(lead.userId._id);
    }
  };

  const handleDownloadDocument = async (docId: string) => {
    try {
      const response = await fetch(`/api/documents/download/${docId}`, { credentials: 'include' });
      const data = await response.json();
      if (response.ok) {
        const link = document.createElement('a');
        link.href = `data:${data.mimeType};base64,${data.fileData}`;
        link.download = data.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({ title: "Downloaded", description: "Document downloaded successfully" });
      } else {
        toast({ title: "Error", description: data.message || "Failed to download", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to download document", variant: "destructive" });
    }
  };

  const getDocStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
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
                      <div className="flex gap-1 flex-wrap">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewUserDetails(lead)}
                          title="View Details & Documents"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-purple-600 border-purple-600 hover:bg-purple-50"
                          onClick={() => navigate(`/csc/dashboard/chat?leadId=${lead._id}`)}
                          title="Chat with this lead"
                        >
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Chat
                        </Button>
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
                              Done
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-gray-600 border-gray-600 hover:bg-gray-50"
                              onClick={() => handleStatusUpdate(lead._id, "cancelled")}
                            >
                              <XCircle className="h-3 w-3" />
                            </Button>
                          </>
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

      <Dialog open={showUserDetails} onOpenChange={(open) => {
        setShowUserDetails(open);
        if (!open) {
          setSelectedLead(null);
          setUserDocuments([]);
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              User Details - {selectedLead?.userId?.name || selectedLead?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedLead && (
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    {selectedLead.userId ? "Registered User Information" : "Lead Information"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Name:</span>
                      <p className="font-medium">{selectedLead.userId?.name || selectedLead.name}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Email:</span>
                      <p className="font-medium flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {selectedLead.userId?.email || selectedLead.email || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Mobile:</span>
                      <p className="font-medium flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {selectedLead.userId?.mobile || selectedLead.mobile}
                      </p>
                    </div>
                    {selectedLead.userId?.dob && (
                      <div>
                        <span className="text-muted-foreground">Date of Birth:</span>
                        <p className="font-medium flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(selectedLead.userId.dob), "dd MMM yyyy")}
                        </p>
                      </div>
                    )}
                    {selectedLead.userId?.gender && (
                      <div>
                        <span className="text-muted-foreground">Gender:</span>
                        <p className="font-medium capitalize">{selectedLead.userId.gender}</p>
                      </div>
                    )}
                    {selectedLead.userId?.address && (
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Address:</span>
                        <p className="font-medium">
                          {selectedLead.userId.address}
                          {selectedLead.userId.city && `, ${selectedLead.userId.city}`}
                          {selectedLead.userId.state && `, ${selectedLead.userId.state}`}
                          {selectedLead.userId.pincode && ` - ${selectedLead.userId.pincode}`}
                        </p>
                      </div>
                    )}
                    {!selectedLead.userId && (
                      <div className="col-span-2">
                        <Badge variant="outline" className="text-orange-600 border-orange-300">
                          User has not registered yet
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Documents ({userDocuments.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingDocuments ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-sm text-muted-foreground mt-2">Loading documents...</p>
                    </div>
                  ) : userDocuments.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No documents uploaded yet</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Document</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {userDocuments.map((doc) => (
                          <TableRow key={doc._id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{doc.name}</p>
                                <p className="text-xs text-muted-foreground">{doc.originalFileName}</p>
                              </div>
                            </TableCell>
                            <TableCell>{doc.type}</TableCell>
                            <TableCell>{getDocStatusBadge(doc.status)}</TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDownloadDocument(doc._id)}
                              >
                                <Download className="h-3 w-3 mr-1" />
                                Download
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Lead Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Form:</span>
                      <p className="font-medium">{selectedLead.formName}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <p className="font-medium">{getTypeBadge(selectedLead.type)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <p className="font-medium">{getStatusBadge(selectedLead.status)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Created:</span>
                      <p className="font-medium">{format(new Date(selectedLead.createdAt), "dd MMM yyyy")}</p>
                    </div>
                    {selectedLead.notes && (
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Notes:</span>
                        <p className="font-medium">{selectedLead.notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CSCLeads;
