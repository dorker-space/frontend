import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FileTextIcon,
    HeartIcon,
    MoonIcon,
    SunIcon,
    UserCircleIcon,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/providers/theme-provider";
import { profileApi } from "@/api/profile";

export function UserButton({
    variant = "sidebar",
}: {
    variant?: "sidebar" | "dropdown";
}) {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { data: profile } = useQuery({
        queryKey: ["profile"],
        queryFn: () => profileApi.get(),
        retry: false,
    });

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.ctrlKey || event.metaKey) && event.key === "\\") {
                event.preventDefault();
                toggleTheme();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [toggleTheme]);

    const name = profile?.name || [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || "Your profile";
    const email = profile?.email || "Email not provided";
    const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const ThemeIcon = theme === "dark" ? SunIcon : MoonIcon;
    const themeLabel =
        theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode";

    const navigateAndClose = (path: string) => {
        setIsDialogOpen(false);
        navigate(path);
    };

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                {variant === "sidebar" ? (
                    <SidebarMenuButton
                        size="lg"
                        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    >
                        <Avatar className="h-8 w-8 rounded-lg">
                            <AvatarFallback className="rounded-lg bg-muted border border-border text-foreground text-xs font-medium">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-semibold">
                                {name}
                            </span>
                            <span className="truncate text-xs text-muted-foreground">
                                {email}
                            </span>
                        </div>
                    </SidebarMenuButton>
                ) : (
                    <button
                        type="button"
                        className="rounded-lg focus:outline-none"
                        aria-label="Open user menu"
                    >
                        <Avatar className="h-7 w-7 rounded-lg">
                            <AvatarFallback className="rounded-lg text-xs bg-muted border border-border text-foreground font-medium">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                    </button>
                )}
            </DialogTrigger>

            <DialogContent className="w-80 p-3">
                <DialogHeader className="sr-only">
                    <DialogTitle>User Menu</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                    <div className="flex items-center space-x-3 pb-2 border-b border-border">
                        <Avatar className="h-10 w-10 rounded-lg">
                            <AvatarFallback className="rounded-lg bg-muted border border-border text-foreground font-medium">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">
                                {name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                                {email}
                            </p>
                            <Badge variant="secondary" className="mt-1 text-xs">
                                Local Workspace
                            </Badge>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <button
                            type="button"
                            onClick={() => navigateAndClose("/profile")}
                            className="w-full flex items-center space-x-2 px-2 py-1.5 text-sm rounded-md hover:bg-accent transition-colors text-left"
                        >
                            <UserCircleIcon className="h-4 w-4" />
                            <span>View Profile</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => navigateAndClose("/applications")}
                            className="w-full flex items-center space-x-2 px-2 py-1.5 text-sm rounded-md hover:bg-accent transition-colors text-left"
                        >
                            <FileTextIcon className="h-4 w-4" />
                            <span>My Applications</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => navigateAndClose("/saved")}
                            className="w-full flex items-center space-x-2 px-2 py-1.5 text-sm rounded-md hover:bg-accent transition-colors text-left"
                        >
                            <HeartIcon className="h-4 w-4" />
                            <span>Saved Jobs</span>
                        </button>
                    </div>

                    <div className="pt-2 border-t border-border">
                        <button
                            type="button"
                            onClick={toggleTheme}
                            className="w-full flex items-center justify-between px-2 py-1.5 text-sm rounded-md hover:bg-accent transition-colors text-left"
                        >
                            <div className="flex items-center space-x-2">
                                <ThemeIcon className="h-4 w-4" />
                                <span>{themeLabel}</span>
                            </div>
                            <kbd className="px-1.5 py-0.5 text-xs bg-muted border border-border rounded text-muted-foreground font-mono">
                                ⌘\
                            </kbd>
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
