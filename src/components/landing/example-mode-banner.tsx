import { useNavigate } from "react-router-dom";
import {
    ArrowLeftIcon,
    FlaskConicalIcon,
    RotateCcwIcon,
    SparklesIcon,
} from "lucide-react";
import { toast } from "sonner";
import { jobsApi, matchesApi } from "@/api";
import { resetSyntheticStore } from "@/api/synthetic-adapter";
import { BetaAccessDialog } from "@/components/landing/beta-access-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    getLandingPageUrl,
    getRealAppUrl,
    isLocalHostname,
    setLocalhostMode,
} from "@/lib/app-mode";

export function ExampleModeBanner() {
    const navigate = useNavigate();

    const handleResetDemo = () => {
        resetSyntheticStore();
        jobsApi.clearCache();
        matchesApi.clearCache();
        toast.success("Synthetic sandbox reset to initial state");
        window.location.reload();
    };

    const handleBackToLanding = () => {
        if (isLocalHostname(window.location.hostname)) {
            setLocalhostMode("landing");
            navigate("/?mode=landing");
        } else {
            window.location.href = getLandingPageUrl();
        }
    };

    const handleOpenRealApp = () => {
        if (isLocalHostname(window.location.hostname)) {
            setLocalhostMode("app");
            jobsApi.clearCache();
            matchesApi.clearCache();
            navigate("/matches?mode=app");
        } else {
            window.location.href = getRealAppUrl("/matches");
        }
    };

    return (
        <div
            role="region"
            aria-label="Example sandbox notice"
            className="sticky top-0 z-30 md:ml-[16rem] border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 px-4 py-1.5"
        >
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                    <Badge
                        variant="outline"
                        className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 font-medium shrink-0"
                    >
                        <FlaskConicalIcon className="size-3 mr-1" />
                        example.dorker.space
                    </Badge>
                    <span className="text-muted-foreground truncate">
                        <strong className="text-foreground font-medium">
                            Interactive Sandbox:
                        </strong>{" "}
                        Real Dorker UI fed with synthetic data from Serafym’s
                        pipeline. Filter matches, chat in Discussion, generate
                        drafts, or edit the Dossier.
                    </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground"
                        onClick={handleBackToLanding}
                    >
                        <ArrowLeftIcon className="size-3.5 mr-1" />
                        Intro & Story
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 px-2.5 text-xs"
                        onClick={handleResetDemo}
                    >
                        <RotateCcwIcon className="size-3 mr-1" />
                        Reset Sandbox
                    </Button>

                    <BetaAccessDialog
                        onOpenRealApp={handleOpenRealApp}
                        trigger={
                            <Button size="sm" className="h-7 px-2.5 text-xs">
                                <SparklesIcon className="size-3 mr-1" />
                                Request Beta Access
                            </Button>
                        }
                    />
                </div>
            </div>
        </div>
    );
}
