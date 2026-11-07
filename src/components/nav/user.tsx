import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";
import { UserButton } from "@/components/user-button";

export function NavUser() {
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <UserButton variant="sidebar" />
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
