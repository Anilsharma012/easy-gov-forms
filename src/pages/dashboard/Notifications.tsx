import { useState } from "react";
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Info,
  Clock,
  Check,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockNotifications, Notification } from "@/data/mockData";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const notificationIcons = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  deadline: Clock,
};

const notificationColors = {
  info: "text-info",
  success: "text-success",
  warning: "text-warning",
  deadline: "text-destructive",
};

export default function Notifications() {
  const [notifications, setNotifications] = useState(mockNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast.success("Notification deleted");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return `${minutes} minutes ago`;
      }
      return `${hours} hours ago`;
    } else if (days === 1) {
      return "Yesterday";
    } else if (days < 7) {
      return `${days} days ago`;
    }
    return date.toLocaleDateString();
  };

  const filterNotifications = (type: string) => {
    if (type === "all") return notifications;
    if (type === "unread") return notifications.filter((n) => !n.read);
    return notifications.filter((n) => n.type === type);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated with your applications and deadlines.
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllAsRead}>
            <Check className="h-4 w-4 mr-2" />
            Mark All as Read
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              All Notifications
              {unreadCount > 0 && (
                <Badge className="ml-2">{unreadCount} new</Badge>
              )}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all">
                All ({notifications.length})
              </TabsTrigger>
              <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
              <TabsTrigger value="deadline">Deadlines</TabsTrigger>
              <TabsTrigger value="success">Updates</TabsTrigger>
            </TabsList>

            {["all", "unread", "deadline", "success"].map((tab) => (
              <TabsContent key={tab} value={tab} className="space-y-3">
                {filterNotifications(tab).length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No notifications</p>
                  </div>
                ) : (
                  filterNotifications(tab).map((notification) => {
                    const Icon = notificationIcons[notification.type];
                    return (
                      <div
                        key={notification.id}
                        className={cn(
                          "flex items-start gap-4 p-4 rounded-lg transition-colors cursor-pointer",
                          notification.read
                            ? "bg-muted/30"
                            : "bg-primary/5 border border-primary/10"
                        )}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div
                          className={cn(
                            "h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0",
                            notification.type === "success" && "bg-success/10",
                            notification.type === "info" && "bg-info/10",
                            notification.type === "warning" && "bg-warning/10",
                            notification.type === "deadline" && "bg-destructive/10"
                          )}
                        >
                          <Icon
                            className={cn(
                              "h-5 w-5",
                              notificationColors[notification.type]
                            )}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-medium">{notification.title}</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {formatDate(notification.createdAt)}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              {!notification.read && (
                                <div className="h-2 w-2 rounded-full bg-primary" />
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}