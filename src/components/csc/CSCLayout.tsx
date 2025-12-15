import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { CSCSidebar } from "./CSCSidebar";
import { CSCHeader } from "./CSCHeader";

export function CSCLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <CSCSidebar />
        <div className="flex-1 flex flex-col">
          <CSCHeader />
          <main className="flex-1 p-6 bg-muted/30 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
