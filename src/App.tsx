import { lazy, Suspense, useEffect, useState } from "react";
import {
    BrowserRouter,
    Navigate,
    Route,
    Routes,
    useLocation,
} from "react-router-dom";
import { ExampleModeBanner } from "@/components/landing/example-mode-banner";
import { ThemeProvider } from "@/components/providers/theme-provider";
import {
    type AppMode,
    onAppModeChange,
    resolveAppMode,
} from "@/lib/app-mode";

const HomePage = lazy(() => import("@/pages/home-page"));
const DashboardRoutes = lazy(() => import("@/routes/dashboard-routes"));

function AppModeRouter() {
    // Subscribe to location so route/query changes re-evaluate resolveAppMode()
    useLocation();
    const [, setExternalModeTick] = useState<AppMode>(() => resolveAppMode());

    useEffect(() => {
        return onAppModeChange((nextMode) => {
            setExternalModeTick(nextMode);
        });
    }, []);

    const mode = resolveAppMode();

    if (mode === "landing") {
        return (
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route
                    path="/example"
                    element={<Navigate to="/matches?mode=example" replace />}
                />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        );
    }

    if (mode === "example") {
        return (
            <>
                <ExampleModeBanner />
                <Routes>
                    <Route
                        path="/"
                        element={<Navigate to="/matches" replace />}
                    />
                    <Route
                        path="/example"
                        element={<Navigate to="/matches" replace />}
                    />
                    <Route path="/*" element={<DashboardRoutes />} />
                </Routes>
            </>
        );
    }

    return <DashboardRoutes />;
}

export default function App() {
    return (
        <ThemeProvider>
            <BrowserRouter>
                <Suspense
                    fallback={
                        <div
                            className="flex min-h-screen items-center justify-center text-sm text-muted-foreground"
                            role="status"
                        >
                            Loading Dorker…
                        </div>
                    }
                >
                    <AppModeRouter />
                </Suspense>
            </BrowserRouter>
        </ThemeProvider>
    );
}
