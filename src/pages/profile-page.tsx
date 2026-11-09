import { Navigate, useSearchParams } from "react-router-dom";
import { Profile } from "@/components/profile";

export function ProfilePage() {
    const [searchParams] = useSearchParams();
    if (searchParams.get("tab") === "dossier") return <Navigate to="/dossier" replace />;
    return (
        <div className="flex w-full flex-col gap-4 p-4">
            <div className="border-b border-border/70 pb-3">
                <h1 className="text-lg font-medium text-foreground">Profile & Preferences</h1>
                <p className="mt-0.5 text-xs text-muted-foreground">
                    Configure your identity, work logistics, target compensation, and linked dossier evidence.
                </p>
            </div>
            <Profile />
        </div>
    );
}
