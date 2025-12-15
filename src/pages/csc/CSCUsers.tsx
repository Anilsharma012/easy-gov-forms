import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserCircle, Search, Mail, Phone, Calendar, Eye, MessageSquare, FileText } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

interface Lead {
  _id: string;
  name: string;
  email?: string;
  mobile: string;
  formName: string;
  type: string;
  status: string;
  notes?: string;
  createdAt: string;
}

const CSCUsers = () => {
  const [users, setUsers] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<Lead | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/csc/dashboard/users", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "in-progress": return "bg-yellow-100 text-yellow-800";
      case "new": return "bg-blue-100 text-blue-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "job": return "bg-purple-100 text-purple-800";
      case "scheme": return "bg-blue-100 text-blue-800";
      case "document": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredUsers = users.filter((user) =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.mobile?.includes(searchTerm)
  );

  const getInitials = (name: string) => {
    return name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Information</h1>
          <p className="text-muted-foreground">View leads and users assigned to you</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          <UserCircle className="w-4 h-4 mr-2" />
          {users.length} Leads
        </Badge>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="text-center py-8">Loading users...</div>
      ) : filteredUsers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <UserCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No users found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map((user) => (
            <Card key={user._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{user.name}</h3>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      <Badge className={getStatusColor(user.status)}>
                        {user.status}
                      </Badge>
                      <Badge className={getTypeColor(user.type)}>
                        {user.type}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {user.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{user.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{user.mobile}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span className="truncate">{user.formName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Added: {format(new Date(user.createdAt), "dd MMM yyyy")}</span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => setSelectedUser(user)}>
                        <Eye className="w-4 h-4 mr-1" /> Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Lead Details</DialogTitle>
                      </DialogHeader>
                      {selectedUser && (
                        <div className="space-y-4 pt-4">
                          <div className="flex items-center gap-4">
                            <Avatar className="w-16 h-16">
                              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                                {getInitials(selectedUser.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="text-xl font-bold">{selectedUser.name}</h3>
                              <div className="flex gap-2 mt-1">
                                <Badge className={getStatusColor(selectedUser.status)}>
                                  {selectedUser.status}
                                </Badge>
                                <Badge className={getTypeColor(selectedUser.type)}>
                                  {selectedUser.type}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="grid gap-3">
                            {selectedUser.email && (
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-muted-foreground" />
                                <span>{selectedUser.email}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-muted-foreground" />
                              <span>{selectedUser.mobile}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-muted-foreground" />
                              <span>{selectedUser.formName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span>{format(new Date(selectedUser.createdAt), "dd MMM yyyy, hh:mm a")}</span>
                            </div>
                          </div>
                          {selectedUser.notes && (
                            <div className="p-4 bg-muted rounded-lg">
                              <h4 className="font-medium mb-2">Notes</h4>
                              <p className="text-sm text-muted-foreground">{selectedUser.notes}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => navigate("/csc/dashboard/chat")}
                  >
                    <MessageSquare className="w-4 h-4 mr-1" /> Chat
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CSCUsers;
