import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { DashboardLayout } from "@/layouts/dashboard-layout";
import { JobsPage } from "@/pages/jobs-page";
import { ApplicationWorkspacePage } from "@/pages/application-workspace-page";
import { MatchesPage } from "@/pages/matches-page.tsx";
import { SavedJobsPage } from "@/pages/saved-jobs-page";
import { ProfilePage } from "@/pages/profile-page";

export default function App() {
    return (
        <ThemeProvider>
            <QueryProvider>
                <BrowserRouter>
                    <Routes>
                        <Route element={<DashboardLayout />}>
                            <Route
                                index
                                element={<Navigate to="/jobs" replace />}
                            />
                            <Route path="/jobs" element={<JobsPage />} />
                            <Route
                                path="/application/:id"
                                element={<ApplicationWorkspacePage />}
                            />
                            <Route
                                path="/matches"
                                element={<MatchesPage />}
                            />
                            <Route path="/saved" element={<SavedJobsPage />} />
                            <Route path="/profile" element={<ProfilePage />} />
                            <Route
                                path="*"
                                element={<Navigate to="/jobs" replace />}
                            />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </QueryProvider>
        </ThemeProvider>
    );
}
