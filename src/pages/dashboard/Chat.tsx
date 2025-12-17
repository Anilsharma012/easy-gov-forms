import { useState, useEffect, useRef } from "react";
import { Send, MessageCircle, Loader2, AlertCircle, Paperclip, Image, FileText, X, Download } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Message {
  _id: string;
  senderId: string;
  senderType: string;
  receiverId: string;
  receiverType: string;
  content: string;
  type: string;
  fileUrl?: string;
  fileName?: string;
  createdAt: string;
}

interface CSCCenter {
  _id: string;
  centerName: string;
  mobile?: string;
  email?: string;
  address?: string;
  district?: string;
  state?: string;
}

export default function Chat() {
  const [cscCenter, setCSCCenter] = useState<CSCCenter | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState<string>("");
  const [leadId, setLeadId] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ name: string; url: string; type: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCSCCenter();
  }, []);

  useEffect(() => {
    if (conversationId) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 10000);
      return () => clearInterval(interval);
    }
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchCSCCenter = async () => {
    try {
      const response = await fetch("/api/user-chat/my-csc", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setCSCCenter(data.cscCenter);
        if (data.cscCenter && data.leadId) {
          setLeadId(data.leadId);
          const convId = [data.leadId, data.cscCenter._id].sort().join("_");
          setConversationId(convId);
        }
      }
    } catch (error) {
      console.error("Failed to fetch CSC center:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!conversationId) return;
    try {
      const response = await fetch(`/api/user-chat/messages/${conversationId}`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result as string;
        
        const response = await fetch("/api/user-chat/upload", {
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
          toast.success("File uploaded successfully");
        } else {
          const errorData = await response.json();
          toast.error(errorData.message || "Failed to upload file");
        }
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Failed to upload file:", error);
      toast.error("Failed to upload file");
      setUploading(false);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || !cscCenter || !leadId) return;

    setSending(true);
    try {
      const messageType = selectedFile ? (["jpg", "jpeg", "png", "gif"].includes(selectedFile.type) ? "image" : "file") : "text";
      
      const response = await fetch("/api/user-chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          receiverId: cscCenter._id,
          receiverType: "csc",
          content: newMessage.trim() || (selectedFile ? `Sent a ${messageType}` : ""),
          type: messageType,
          fileUrl: selectedFile?.url,
          fileName: selectedFile?.name,
          leadId: leadId,
        }),
      });

      if (response.ok) {
        setNewMessage("");
        setSelectedFile(null);
        fetchMessages();
      } else {
        const errorData = await response.json();
        console.error("Send message error:", errorData);
        toast.error(errorData.message || "Failed to send message");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }
    return date.toLocaleDateString();
  };

  const isImageFile = (fileName?: string, type?: string) => {
    if (type === "image") return true;
    if (!fileName) return false;
    const ext = fileName.split(".").pop()?.toLowerCase();
    return ["jpg", "jpeg", "png", "gif"].includes(ext || "");
  };

  const renderMessageContent = (message: Message) => {
    const isUser = message.senderType === "user" || message.senderType === "lead";
    
    if (message.type === "image" || isImageFile(message.fileName, message.type)) {
      return (
        <div className="space-y-2">
          {message.fileUrl && (
            <a href={message.fileUrl} target="_blank" rel="noopener noreferrer">
              <img 
                src={message.fileUrl} 
                alt={message.fileName || "Image"} 
                className="max-w-[200px] rounded-lg cursor-pointer hover:opacity-90"
              />
            </a>
          )}
          {message.content && message.content !== "Sent a image" && (
            <p className="text-sm">{message.content}</p>
          )}
        </div>
      );
    }

    if (message.type === "file" && message.fileUrl) {
      return (
        <div className="space-y-2">
          <a 
            href={message.fileUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className={`flex items-center gap-2 p-2 rounded ${isUser ? "bg-primary-foreground/10" : "bg-background"}`}
          >
            <FileText className="h-5 w-5" />
            <span className="text-sm truncate max-w-[150px]">{message.fileName}</span>
            <Download className="h-4 w-4" />
          </a>
          {message.content && message.content !== "Sent a file" && (
            <p className="text-sm">{message.content}</p>
          )}
        </div>
      );
    }

    return <p className="text-sm">{message.content}</p>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!cscCenter) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Chat with CSC Center</h1>
          <p className="text-muted-foreground">
            Connect with your assigned CSC center for assistance.
          </p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No CSC Center Assigned</h3>
            <p className="text-muted-foreground text-center max-w-md">
              You don't have a CSC center assigned to your account yet. 
              Once assigned, you'll be able to chat with them for help with your applications.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Chat with CSC Center</h1>
        <p className="text-muted-foreground">
          Get help from your assigned CSC center.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Your CSC Center</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {cscCenter.centerName?.charAt(0) || "C"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{cscCenter.centerName}</p>
                <p className="text-sm text-muted-foreground">CSC Center</p>
              </div>
            </div>
            {cscCenter.mobile && (
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="text-sm">{cscCenter.mobile}</p>
              </div>
            )}
            {cscCenter.address && (
              <div>
                <p className="text-xs text-muted-foreground">Address</p>
                <p className="text-sm">
                  {cscCenter.address}
                  {cscCenter.district && `, ${cscCenter.district}`}
                  {cscCenter.state && `, ${cscCenter.state}`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 flex flex-col h-[600px]">
          <CardHeader className="border-b pb-4">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Messages</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
            <ScrollArea className="flex-1 p-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No messages yet</p>
                  <p className="text-sm text-muted-foreground">
                    Start a conversation with your CSC center
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, index) => {
                    const isUser = message.senderType === "user" || message.senderType === "lead";
                    const showDate =
                      index === 0 ||
                      formatDate(message.createdAt) !==
                        formatDate(messages[index - 1].createdAt);

                    return (
                      <div key={message._id}>
                        {showDate && (
                          <div className="flex justify-center my-4">
                            <span className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
                              {formatDate(message.createdAt)}
                            </span>
                          </div>
                        )}
                        <div
                          className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg px-4 py-2 ${
                              isUser
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            {renderMessageContent(message)}
                            <p
                              className={`text-xs mt-1 ${
                                isUser
                                  ? "text-primary-foreground/70"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {formatTime(message.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>
            
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
            
            <form
              onSubmit={handleSendMessage}
              className="border-t p-4 flex gap-2"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.xls,.xlsx"
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || sending}
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Paperclip className="h-4 w-4" />
                )}
              </Button>
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                disabled={sending}
                className="flex-1"
              />
              <Button type="submit" disabled={sending || (!newMessage.trim() && !selectedFile)}>
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
