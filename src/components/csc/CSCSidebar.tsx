import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Package,
  User,
  LogOut,
  Building2,
  Briefcase,
  Wallet,
  Receipt,
  CreditCard,
  ClipboardList,
  FileArchive,
  UserCircle,
  MessageSquare,
  HeadphonesIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    url: "/csc/dashboard",
  },
  {
    title: "Jobs Applied",
    icon: Briefcase,
    url: "/csc/dashboard/jobs-applied",
  },
  {
    title: "My Leads",
    icon: Users,
    url: "/csc/dashboard/leads",
  },
  {
    title: "Lead Packages",
    icon: Package,
    url: "/csc/dashboard/packages",
  },
  {
    title: "Task Assignment",
    icon: ClipboardList,
    url: "/csc/dashboard/tasks",
  },
  {
    title: "User Information",
    icon: UserCircle,
    url: "/csc/dashboard/users",
  },
  {
    title: "Old Documentation",
    icon: FileArchive,
    url: "/csc/dashboard/old-docs",
  },
  {
    title: "Wallet",
    icon: Wallet,
    url: "/csc/dashboard/wallet",
  },
  {
    title: "Transactions",
    icon: Receipt,
    url: "/csc/dashboard/transactions",
  },
  {
    title: "Payment Info",
    icon: CreditCard,
    url: "/csc/dashboard/payment-info",
  },
  {
    title: "Chat",
    icon: MessageSquare,
    url: "/csc/dashboard/chat",
  },
  {
    title: "Support",
    icon: HeadphonesIcon,
    url: "/csc/dashboard/support",
  },
  {
    title: "Profile",
    icon: User,
    url: "/csc/dashboard/profile",
  },
];

export function CSCSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = useSidebar();
  const { toast } = useToast();
  const isCollapsed = state === "collapsed";

  const handleLogout = async () => {
    try {
      await fetch("/api/csc/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully.",
      });
      navigate("/csc/login");
    } catch (error) {
      navigate("/csc/login");
    }
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <Link to="/csc/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <span className="font-bold text-lg text-sidebar-foreground">
              CSC Portal
            </span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <Link
                        to={item.url}
                        className={cn(
                          "flex items-center gap-3 transition-colors",
                          isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                        )}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Logout"
              onClick={handleLogout}
              className="flex items-center gap-3 text-destructive hover:bg-destructive/10 cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
