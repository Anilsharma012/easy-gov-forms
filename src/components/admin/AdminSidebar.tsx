import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Building2,
  FileSpreadsheet,
  Briefcase,
  Package,
  CreditCard,
  LifeBuoy,
  FileText,
  Scale,
  Bot,
  BarChart3,
  Settings,
  LogOut,
  Shield,
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

const menuItems = [
  {
    group: "Overview",
    items: [
      { title: "Dashboard", icon: LayoutDashboard, url: "/admin" },
    ],
  },
  {
    group: "Management",
    items: [
      { title: "Users", icon: Users, url: "/admin/users" },
      { title: "CSC Centers", icon: Building2, url: "/admin/csc-centers" },
      { title: "E-Gov Leads", icon: FileSpreadsheet, url: "/admin/leads" },
      { title: "Jobs Catalog", icon: Briefcase, url: "/admin/jobs" },
      { title: "Packages", icon: Package, url: "/admin/packages" },
    ],
  },
  {
    group: "Operations",
    items: [
      { title: "Payments", icon: CreditCard, url: "/admin/payments" },
      { title: "Support Tickets", icon: LifeBuoy, url: "/admin/support" },
      { title: "Content", icon: FileText, url: "/admin/content" },
      { title: "Legal & Policies", icon: Scale, url: "/admin/legal" },
    ],
  },
  {
    group: "Analytics",
    items: [
      { title: "Reports", icon: BarChart3, url: "/admin/reports" },
      { title: "AI Monitoring", icon: Bot, url: "/admin/ai-monitoring" },
    ],
  },
  {
    group: "Settings",
    items: [
      { title: "Admin Settings", icon: Settings, url: "/admin/settings" },
    ],
  },
];

export function AdminSidebar() {
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <Link to="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-destructive rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-destructive-foreground" />
          </div>
          {!isCollapsed && (
            <div>
              <span className="font-bold text-lg text-sidebar-foreground">
                Admin Panel
              </span>
              <p className="text-xs text-muted-foreground">Easy Gov Forms</p>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {menuItems.map((group) => (
          <SidebarGroup key={group.group}>
            <SidebarGroupLabel>{group.group}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive =
                    location.pathname === item.url ||
                    (item.url !== "/admin" &&
                      location.pathname.startsWith(item.url));
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
                            isActive &&
                              "bg-sidebar-accent text-sidebar-accent-foreground"
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
        ))}
      </SidebarContent>

      <SidebarFooter className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Back to Website">
              <Link to="/" className="flex items-center gap-3">
                <LogOut className="w-5 h-5" />
                <span>Exit Admin</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}