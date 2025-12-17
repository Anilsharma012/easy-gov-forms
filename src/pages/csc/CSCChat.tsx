import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, Paperclip, Search, Circle, Loader2, FileText, Image, X, Download } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface ChatUser {
  _id: string;
  name: string;
  email: string;
  type: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  online?: boolean;
}

interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: string;
  fileUrl?: string;
  fileName?: string;
  createdAt: string;
  read: boolean;
}

const CSCChat = () => {
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [cscCenterId, setCscCenterId] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ name: string; url: string; type: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchChatUsers();
  }, []);

  useEffect(() => {
    if (selectedUser && cscCenterId) {
      fetchMessages(selectedUser._id, cscCenterId);
      const interval = setInterval(() => fetchMessages(selectedUser._id, cscCenterId), 5000);
      return () => clearInterval(interval);
    }
  }, [selectedUser, cscCenterId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchChatUsers = async () => {
    try {
      const response = await fetch("/api/csc/dashboard/chat/users", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
        if (data.cscCenterId) {
          setCscCenterId(data.cscCenterId);
        }
      }
    } catch (error) {
      console.error("Error fetching chat users:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId: string, cscCenterId?: string) => {
    try {
      const conversationId = cscCenterId 
        ? [cscCenterId, userId].sort().join('_')
        : userId;
      const response = await fetch(`/api/csc/dashboard/chat/messages/${conversationId}`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "Error", description: "File size must be less than 10MB", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result as string;
        
        const response = await fetch("/api/csc/dashboard/chat/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            fileData: base64Data,
            fileName: file.name,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setSelectedFile({
            name: data.fileName,
            url: data.fileUrl,
            type: data.fileType,
          });
          toast({ title: "Success", description: "File uploaded successfully" });
        } else {
          const errorData = await response.json();
          toast({ title: "Error", description: errorData.message || "Failed to upload file", variant: "destructive" });
        }
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Failed to upload file:", error);
      toast({ title: "Error", description: "Failed to upload file", variant: "destructive" });
      setUploading(false);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const sendMessage = async () => {
    if ((!newMessage.trim() && !selectedFile) || !selectedUser) return;

    setSending(true);
    try {
      const messageType = selectedFile ? (["jpg", "jpeg", "png", "gif"].includes(selectedFile.type) ? "image" : "file") : "text";
      
      const response = await fetch("/api/csc/dashboard/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          receiverId: selectedUser._id,
          receiverType: selectedUser.type || "lead",
          content: newMessage.trim() || (selectedFile ? `Sent a ${messageType}` : ""),
          type: messageType,
          fileUrl: selectedFile?.url,
          fileName: selectedFile?.name,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages([...messages, data.message]);
        setNewMessage("");
        setSelectedFile(null);
        if (cscCenterId) {
          fetchMessages(selectedUser._id, cscCenterId);
        }
      } else {
        const errorData = await response.json();
        console.error("Send message error:", errorData);
        toast({ title: "Error", description: errorData.message || "Failed to send message", variant: "destructive" });
      }
    } catch (error) {
      console.error("Send message error:", error);
      toast({ title: "Error", description: "Failed to send message", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getInitials = (name: string) => {
    return name?.split(" ").map(n => n[0]).join("").toUpperCase() || "?";
  };

  const filteredUsers = users.filter((user) =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isImageFile = (fileName?: string, type?: string) => {
    if (type === "image") return true;
    if (!fileName) return false;
    const ext = fileName.split(".").pop()?.toLowerCase();
    return ["jpg", "jpeg", "png", "gif"].includes(ext || "");
  };

  const renderMessageContent = (msg: Message) => {
    const isOwn = msg.senderId !== selectedUser?._id;
    
    if (msg.type === "image" || isImageFile(msg.fileName, msg.type)) {
      return (
        <div className="space-y-2">
          {msg.fileUrl && (
            <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer">
              <img 
                src={msg.fileUrl} 
                alt={msg.fileName || "Image"} 
                className="max-w-[200px] rounded-lg cursor-pointer hover:opacity-90"
              />
            </a>
          )}
          {msg.content && msg.content !== "Sent a image" && (
            <p>{msg.content}</p>
          )}
        </div>
      );
    }

    if (msg.type === "file" && msg.fileUrl) {
      return (
        <div className="space-y-2">
          <a 
            href={msg.fileUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className={`flex items-center gap-2 p-2 rounded ${isOwn ? "bg-primary-foreground/10" : "bg-background"}`}
          >
            <FileText className="h-5 w-5" />
            <span className="text-sm truncate max-w-[150px]">{msg.fileName}</span>
            <Download className="h-4 w-4" />
          </a>
          {msg.content && msg.content !== "Sent a file" && (
            <p>{msg.content}</p>
          )}
        </div>
      );
    }

    return <p>{msg.content}</p>;
  };

  return (
    <div className="h-[calc(100vh-12rem)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Chat</h1>
          <p className="text-muted-foreground">Communicate with users and admin</p>
        </div>
      </div>

      <div className="flex gap-4 h-full">
        <Card className="w-80 flex flex-col">
          <CardHeader className="pb-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <ScrollArea className="h-full">
              {loading ? (
                <div className="p-4 text-center text-muted-foreground">Loading...</div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">No users found</div>
              ) : (
                <div className="divide-y">
                  {filteredUsers.map((user) => (
                    <button
                      key={user._id}
                      className={`w-full p-4 text-left hover:bg-muted/50 transition-colors ${
                        selectedUser?._id === user._id ? "bg-muted" : ""
                      }`}
                      onClick={() => setSelectedUser(user)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                          </Avatar>
                          {user.online && (
                            <Circle className="absolute bottom-0 right-0 w-3 h-3 fill-green-500 text-green-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium truncate">{user.name}</p>
                            {user.unreadCount && user.unreadCount > 0 && (
                              <Badge className="bg-primary text-primary-foreground">
                                {user.unreadCount}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {user.lastMessage || user.email}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="flex-1 flex flex-col">
          {selectedUser ? (
            <>
              <CardHeader className="border-b pb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback>{getInitials(selectedUser.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{selectedUser.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-0 overflow-hidden">
                <ScrollArea className="h-full p-4">
                  {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <MessageSquare className="w-12 h-12 mx-auto mb-2" />
                        <p>No messages yet. Start the conversation!</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg) => {
                        const isOwn = msg.senderId !== selectedUser._id;
                        return (
                          <div
                            key={msg._id}
                            className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg p-3 ${
                                isOwn
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              }`}
                            >
                              {renderMessageContent(msg)}
                              <p className={`text-xs mt-1 ${isOwn ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                                {format(new Date(msg.createdAt), "hh:mm a")}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
              
              {selectedFile && (
                <div className="border-t p-2 bg-muted/50">
                  <div className="flex items-center gap-2 p-2 bg-background rounded">
                    {isImageFile(selectedFile.name) ? (
                      <Image className="h-5 w-5 text-primary" />
                    ) : (
                      <FileText className="h-5 w-5 text-primary" />
                    )}
                    <span className="text-sm flex-1 truncate">{selectedFile.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.xls,.xlsx"
                    className="hidden"
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading || sending}
                  >
                    {uploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Paperclip className="w-4 h-4" />
                    )}
                  </Button>
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={sending}
                  />
                  <Button onClick={sendMessage} disabled={sending || (!newMessage.trim() && !selectedFile)}>
                    {sending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MessageSquare className="w-16 h-16 mx-auto mb-4" />
                <h3 className="text-lg font-medium">Select a user to start chatting</h3>
                <p className="text-sm">Choose from your leads and users</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default CSCChat;
