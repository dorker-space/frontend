import { Link, useLocation } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavJobs({
    items,
}: {
    items: { title: string; url: string; icon?: LucideIcon }[];
}) {
    const location = useLocation();

    return (
        <SidebarGroup>
            <SidebarGroupLabel className="flex items-center gap-2">
                Workspace
            </SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item) => {
                        const isActive =
                            location.pathname === item.url ||
                            (item.url === "/jobs" &&
                                location.pathname.startsWith("/application/"));

                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    tooltip={item.title}
                                    isActive={isActive}
                                >
                                    <Link to={item.url}>
                                        {item.icon && (
                                            <item.icon className="size-4" />
                                        )}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
