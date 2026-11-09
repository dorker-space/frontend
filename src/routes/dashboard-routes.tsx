import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { QueryProvider } from "@/components/providers/query-provider";
import { DashboardLayout } from "@/layouts/dashboard-layout";
import { JobsPage } from "@/pages/jobs-page";
import { ApplicationWorkspacePage } from "@/pages/application-workspace-page";
import { ApplicationsPage } from "@/pages/applications-page";
import { MatchesPage } from "@/pages/matches-page";
import { SavedJobsPage } from "@/pages/saved-jobs-page";
import { ProfilePage } from "@/pages/profile-page";
import { DossierPage } from "@/pages/dossier-page";

export default function DashboardRoutes() {
    useEffect(() => {
        const previous = document.title;
        document.title = "Dorker";
        return () => {
            document.title = previous;
        };
    }, []);

    return (
        <QueryProvider>
            <Routes>
                <Route element={<DashboardLayout />}>
                    <Route index element={<Navigate to="/jobs" replace />} />
                    <Route path="/jobs" element={<JobsPage />} />
                    <Route path="/application/:id" element={<ApplicationWorkspacePage />} />
                    <Route path="/matches" element={<MatchesPage />} />
                    <Route path="/applications" element={<ApplicationsPage />} />
                    <Route path="/saved" element={<SavedJobsPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/dossier" element={<DossierPage />} />
                    <Route path="*" element={<Navigate to="/jobs" replace />} />
                </Route>
            </Routes>
        </QueryProvider>
    );
}
