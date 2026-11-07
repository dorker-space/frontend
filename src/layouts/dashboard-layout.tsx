import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export function DashboardLayout() {
    return (
        <SidebarProvider defaultOpen={true}>
            <AppSidebar variant="floating" />
            <SidebarInset>
                <SiteHeader />
                <div className="flex-1 px-4 flex flex-col">
                    <Outlet />
                </div>
            </SidebarInset>
            <Toaster />
        </SidebarProvider>
    );
}
