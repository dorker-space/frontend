import type * as React from "react";
import { Link } from "react-router-dom";
import {
    BookmarkIcon,
    BriefcaseIcon,
    SearchIcon,
    SearchCheck,
    UserIcon,
} from "lucide-react";

import { NavJobs } from "@/components/nav/jobs";
import { NavSecondary } from "@/components/nav/secondary";
import { NavUser } from "@/components/nav/user";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
} from "@/components/ui/sidebar";
import {Dorker, DorkerFullLogo} from "@/components/logo";

const navigationData = {
    jobCategories: [
        {
            title: "All Jobs",
            url: "/jobs",
            icon: SearchIcon,
        },
        {
            title: "Matches",
            url: "/matches",
            icon: SearchCheck,
        },
        {
            title: "Applications",
            url: "/applications",
            icon: BriefcaseIcon,
        },
        {
            title: "Saved Jobs",
            url: "/saved",
            icon: BookmarkIcon,
        },
        {
            title: "Profile & Preferences",
            url: "/profile",
            icon: UserIcon,
        },
    ],
    navSecondary: [],
};

export function AppSidebar({
    ...props
}: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar collapsible="offcanvas" {...props} className="flex flex-col">
            <SidebarHeader>
                <div className="flex items-center justify-center gap-2 py-1">
                    <Link to="/jobs">
                        <DorkerFullLogo
                            className="text-2xl tracking-tight"
                        />
                    </Link>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <NavJobs items={navigationData.jobCategories} />
                <NavSecondary
                    items={navigationData.navSecondary}
                    className="mt-auto"
                />
            </SidebarContent>
            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
