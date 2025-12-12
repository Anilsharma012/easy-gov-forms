import { useState } from "react";
import {
  LifeBuoy,
  Plus,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  Phone,
  Mail,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { mockSupportTickets, SupportTicket } from "@/data/mockData";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const statusColors = {
  open: "bg-info/10 text-info border-info/20",
  "in-progress": "bg-warning/10 text-warning border-warning/20",
  resolved: "bg-success/10 text-success border-success/20",
  closed: "bg-muted text-muted-foreground border-muted",
};

const statusIcons = {
  open: AlertCircle,
  "in-progress": Clock,
  resolved: CheckCircle,
  closed: CheckCircle,
};

export default function Support() {
  const [tickets, setTickets] = useState(mockSupportTickets);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const handleCreateTicket = () => {
    toast.success("Ticket created successfully!");
    setCreateDialogOpen(false);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedTicket) return;

    setTickets((prev) =>
      prev.map((t) =>
        t.id === selectedTicket.id
          ? {
              ...t,
              messages: [
                ...t.messages,
                {
                  sender: "user" as const,
                  message: newMessage,
                  timestamp: new Date().toISOString(),
                },
              ],
            }
          : t
      )
    );

    setSelectedTicket((prev) =>
      prev
        ? {
            ...prev,
            messages: [
              ...prev.messages,
              {
                sender: "user" as const,
                message: newMessage,
                timestamp: new Date().toISOString(),
              },
            ],
          }
        : null
    );

    setNewMessage("");
    toast.success("Message sent!");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Support & Tickets</h1>
          <p className="text-muted-foreground">
            Get help and track your support requests.
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Ticket
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Support Ticket</DialogTitle>
              <DialogDescription>
                Describe your issue and we'll get back to you soon.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="payment">Payment Issue</SelectItem>
                    <SelectItem value="form">Form Issue</SelectItem>
                    <SelectItem value="technical">Technical Problem</SelectItem>
                    <SelectItem value="query">General Query</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="Brief description of your issue" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Describe your issue in detail..."
                  rows={4}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateTicket}>Create Ticket</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Contact */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-gradient-to-r from-primary/10 to-accent">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
              <Phone className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <p className="font-medium">WhatsApp Support</p>
              <p className="text-sm text-muted-foreground">+91 98765 43210</p>
            </div>
            <Button variant="outline" className="ml-auto">
              Chat Now
            </Button>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-info/10 to-info/5">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-info flex items-center justify-center">
              <Mail className="h-6 w-6 text-info-foreground" />
            </div>
            <div>
              <p className="font-medium">Email Support</p>
              <p className="text-sm text-muted-foreground">support@easygovforms.com</p>
            </div>
            <Button variant="outline" className="ml-auto">
              Send Email
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Tickets */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Ticket List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LifeBuoy className="h-5 w-5 text-primary" />
              My Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="open">Open</TabsTrigger>
                <TabsTrigger value="resolved">Resolved</TabsTrigger>
              </TabsList>

              {["all", "open", "resolved"].map((tab) => {
                const filteredTickets =
                  tab === "all"
                    ? tickets
                    : tickets.filter((t) =>
                        tab === "resolved"
                          ? t.status === "resolved" || t.status === "closed"
                          : t.status === tab || t.status === "in-progress"
                      );

                return (
                  <TabsContent key={tab} value={tab} className="space-y-3">
                    {filteredTickets.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        No tickets found
                      </p>
                    ) : (
                      filteredTickets.map((ticket) => {
                        const Icon = statusIcons[ticket.status];
                        return (
                          <div
                            key={ticket.id}
                            className={cn(
                              "p-4 rounded-lg border cursor-pointer transition-colors",
                              selectedTicket?.id === ticket.id
                                ? "border-primary bg-primary/5"
                                : "hover:bg-muted/50"
                            )}
                            onClick={() => setSelectedTicket(ticket)}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-medium">{ticket.subject}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="capitalize">
                                    {ticket.category}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(ticket.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              <Badge
                                variant="outline"
                                className={statusColors[ticket.status]}
                              >
                                <Icon className="h-3 w-3 mr-1" />
                                {ticket.status}
                              </Badge>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </TabsContent>
                );
              })}
            </Tabs>
          </CardContent>
        </Card>

        {/* Ticket Detail / Chat */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Conversation
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedTicket ? (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Select a ticket to view conversation
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="font-medium">{selectedTicket.subject}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="capitalize">
                      {selectedTicket.category}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={statusColors[selectedTicket.status]}
                    >
                      {selectedTicket.status}
                    </Badge>
                  </div>
                </div>

                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {selectedTicket.messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "p-3 rounded-lg max-w-[80%]",
                          msg.sender === "user"
                            ? "bg-primary text-primary-foreground ml-auto"
                            : "bg-muted"
                        )}
                      >
                        <p className="text-sm">{msg.message}</p>
                        <p
                          className={cn(
                            "text-xs mt-1",
                            msg.sender === "user"
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
                          )}
                        >
                          {new Date(msg.timestamp).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {(selectedTicket.status === "open" ||
                  selectedTicket.status === "in-progress") && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSendMessage();
                      }}
                    />
                    <Button onClick={handleSendMessage}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}