import { useMemo, useState } from "react";
import {
    ArrowLeftIcon,
    ArrowRightIcon,
    ArrowUpRightIcon,
    BookmarkIcon,
    BriefcaseIcon,
    CalendarIcon,
    CompassIcon,
    CpuIcon,
    EyeOffIcon,
    FolderOpenIcon,
    MapPinIcon,
    RefreshCwIcon,
    RotateCcwIcon,
    SearchCheckIcon,
    SearchIcon,
    SkipForwardIcon,
    SlidersHorizontalIcon,
    SparklesIcon,
    UserIcon,
} from "lucide-react";
import { mapApiJobToJob, mapApiMatchToWorkspaceMatch } from "@/api/mappers";
import {
    INITIAL_SYNTHETIC_JOBS,
    INITIAL_SYNTHETIC_MATCHES,
} from "@/api/synthetic-data";
import { DorkerFullLogo } from "@/components/logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { JobDescriptionPanel } from "@/components/workspace/job-description-panel";
import { MatchTab } from "@/components/workspace/match-tab";
import { formatJobSalary } from "@/components/workspace/workspace-header";
import {
    formatPipelineStatus,
    SuitabilityTier,
    WorkspaceStatus,
} from "@/lib/types";

const TIER_BADGE_CLASSES: Record<SuitabilityTier, string> = {
    SUITABLE:
        "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    STRETCH:
        "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    RUNWAY:
        "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    REJECTED:
        "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
};

function getStatusBadgeClass(status: WorkspaceStatus): string {
    switch (status) {
        case "APPLIED":
        case "INTERVIEWING":
        case "OFFER":
            return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
        case "PENDING":
            return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
        case "SKIPPED":
        case "IGNORED":
        case "GHOSTED":
            return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
        case "DECLINED":
        case "REJECTED_EARLY":
        case "REJECTED_LATE":
            return "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20";
    }
}

function formatTierLabel(tier: SuitabilityTier): string {
    return tier.charAt(0) + tier.slice(1).toLowerCase();
}

interface WorkspacePreviewProps {
    onLaunchExample: (targetPath?: string) => void;
}

export function WorkspacePreview({ onLaunchExample }: WorkspacePreviewProps) {
    const [screen, setScreen] = useState<"matches" | "workspace">("matches");
    const [selectedMatchId, setSelectedMatchId] = useState<string>(
        "019675c0-0001-7000-8000-000000000001"
    );

    const allMatches = useMemo(
        () => INITIAL_SYNTHETIC_MATCHES.map(mapApiMatchToWorkspaceMatch),
        []
    );
    const jobsById = useMemo(() => {
        const map = new Map<string, ReturnType<typeof mapApiJobToJob>>();
        for (const dto of INITIAL_SYNTHETIC_JOBS) {
            map.set(dto.id, mapApiJobToJob(dto));
        }
        return map;
    }, []);

    // Show the exact 5 Stretch matches from Screenshot 1 in order
    const previewMatches = useMemo(
        () =>
            allMatches
                .filter((m) => m.suitabilityTier === "STRETCH")
                .slice(0, 5),
        [allMatches]
    );

    const selectedMatch =
        allMatches.find((m) => m.id === selectedMatchId) ?? allMatches[0];
    const selectedJob =
        jobsById.get(selectedMatch.jobId) ??
        mapApiJobToJob(INITIAL_SYNTHETIC_JOBS[0]);

    const handleSelectMatch = (matchId: string) => {
        setSelectedMatchId(matchId);
        setScreen("workspace");
    };

    return (
        <div className="space-y-3">
            {/* Minimal switcher above the window */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex items-center rounded-lg border border-border bg-muted/30 p-1 text-xs">
                    <button
                        type="button"
                        onClick={() => setScreen("matches")}
                        className={`rounded-md px-3 py-1.5 font-medium transition-colors cursor-pointer ${
                            screen === "matches"
                                ? "bg-background text-foreground shadow-xs"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        1. Filtered Matches
                    </button>
                    <button
                        type="button"
                        onClick={() => setScreen("workspace")}
                        className={`rounded-md px-3 py-1.5 font-medium transition-colors cursor-pointer ${
                            screen === "workspace"
                                ? "bg-background text-foreground shadow-xs"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        2. Match Reasoning & Fit
                    </button>
                </div>

                <button
                    type="button"
                    onClick={() =>
                        onLaunchExample(
                            screen === "workspace"
                                ? `/application/${encodeURIComponent(selectedMatch.id)}`
                                : "/matches"
                        )
                    }
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                    Open full workspace in example.dorker.space
                    <ArrowUpRightIcon className="size-3.5" />
                </button>
            </div>

            {/* Exact App Shell matching Screenshots 1 & 2 */}
            <div className="rounded-2xl border border-border bg-background shadow-xl overflow-hidden text-left">
                <div className="grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] min-h-[580px]">
                    {/* Left Floating-Style Sidebar */}
                    <aside className="hidden lg:flex flex-col justify-between border-r border-border bg-sidebar p-3">
                        <div className="space-y-4">
                            <div className="flex items-center justify-center py-2">
                                <DorkerFullLogo height={26} />
                            </div>

                            <div className="space-y-1">
                                <div className="px-2.5 pb-1 text-[11px] font-medium text-muted-foreground">
                                    Workspace
                                </div>
                                {[
                                    {
                                        title: "All Jobs",
                                        icon: SearchIcon,
                                        path: "/jobs",
                                        active: false,
                                    },
                                    {
                                        title: "Matches",
                                        icon: SearchCheckIcon,
                                        path: "/matches",
                                        active: screen === "matches",
                                    },
                                    {
                                        title: "Applications",
                                        icon: BriefcaseIcon,
                                        path: "/applications",
                                        active: screen === "workspace",
                                    },
                                    {
                                        title: "Saved Jobs",
                                        icon: BookmarkIcon,
                                        path: "/saved",
                                        active: false,
                                    },
                                    {
                                        title: "Dossier",
                                        icon: FolderOpenIcon,
                                        path: "/dossier",
                                        active: false,
                                    },
                                    {
                                        title: "Profile & Preferences",
                                        icon: UserIcon,
                                        path: "/profile",
                                        active: false,
                                    },
                                ].map((nav) => {
                                    const Icon = nav.icon;
                                    return (
                                        <button
                                            key={nav.title}
                                            type="button"
                                            onClick={() => {
                                                if (nav.title === "Matches") {
                                                    setScreen("matches");
                                                } else {
                                                    onLaunchExample(nav.path);
                                                }
                                            }}
                                            className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors cursor-pointer ${
                                                nav.active
                                                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                                    : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                                            }`}
                                        >
                                            <Icon className="size-3.5 shrink-0" />
                                            <span className="truncate">
                                                {nav.title}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5 rounded-lg p-2">
                            <div className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-xs font-medium">
                                S
                            </div>
                            <div className="min-w-0 flex-1 leading-tight">
                                <div className="truncate text-xs font-semibold text-foreground">
                                    Serafym
                                </div>
                                <div className="truncate text-[11px] text-muted-foreground">
                                    podolancukserafim@gmail.com
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <div className="flex flex-col min-w-0 p-5">
                        {screen === "matches" ? (
                            /* SCREENSHOT 1: Matches View */
                            <div className="space-y-4">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <h3 className="text-lg font-medium text-foreground">
                                            Matches
                                        </h3>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            453 matches for the selected filters
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="h-8 text-xs rounded-full px-3.5"
                                            onClick={() =>
                                                onLaunchExample("/matches")
                                            }
                                        >
                                            + Add External Job
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 text-xs rounded-full px-3"
                                            onClick={() =>
                                                onLaunchExample("/matches")
                                            }
                                        >
                                            <RefreshCwIcon className="size-3 mr-1.5" />
                                            Refresh
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 text-xs rounded-full px-3"
                                            onClick={() =>
                                                onLaunchExample("/saved")
                                            }
                                        >
                                            <BookmarkIcon className="size-3 mr-1.5" />
                                            Saved Jobs
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="h-8 text-xs rounded-full px-3.5"
                                            onClick={() =>
                                                onLaunchExample("/jobs")
                                            }
                                        >
                                            <BriefcaseIcon className="size-3 mr-1.5" />
                                            All Jobs
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid gap-4 xl:grid-cols-12 items-start">
                                    <div className="xl:col-span-9 space-y-2.5 min-w-0">
                                        {previewMatches.map((match) => {
                                            const job = jobsById.get(
                                                match.jobId
                                            );
                                            const title =
                                                job?.title ??
                                                "Software Engineer";
                                            const company = job?.company ?? "—";
                                            const location =
                                                job?.location ?? "Remote";
                                            const salaryLabel = job
                                                ? formatJobSalary(job)
                                                : null;
                                            const postedLabel = job?.postedAt
                                                ? new Date(
                                                      job.postedAt
                                                  ).toLocaleDateString()
                                                : null;
                                            const techPercent = Math.round(
                                                match.technicalCapabilityScore *
                                                    100
                                            );
                                            const stratPercent = Math.round(
                                                match.strategicValueScore * 100
                                            );

                                            return (
                                                <Card
                                                    key={match.id}
                                                    className="py-3.5 hover:bg-muted/20 transition-colors cursor-pointer"
                                                    onClick={() =>
                                                        handleSelectMatch(
                                                            match.id
                                                        )
                                                    }
                                                >
                                                    <CardContent className="flex flex-wrap items-center justify-between gap-3 px-4">
                                                        <div className="space-y-1.5 min-w-0 flex-1">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className="font-semibold text-sm text-foreground">
                                                                    {title}
                                                                </span>
                                                                <Badge
                                                                    variant="outline"
                                                                    className={getStatusBadgeClass(
                                                                        match.pipelineStatus
                                                                    )}
                                                                >
                                                                    {formatPipelineStatus(
                                                                        match.pipelineStatus
                                                                    )}
                                                                </Badge>
                                                                <Badge
                                                                    variant="outline"
                                                                    className={
                                                                        TIER_BADGE_CLASSES[
                                                                            match
                                                                                .suitabilityTier
                                                                        ]
                                                                    }
                                                                >
                                                                    <SparklesIcon className="size-3 mr-1" />
                                                                    {formatTierLabel(
                                                                        match.suitabilityTier
                                                                    )}
                                                                </Badge>
                                                            </div>

                                                            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                                                <span className="font-medium text-foreground/85">
                                                                    {company}
                                                                </span>
                                                                <span className="inline-flex items-center gap-1">
                                                                    <MapPinIcon className="size-3" />
                                                                    {location}
                                                                </span>
                                                                {salaryLabel && (
                                                                    <span className="font-medium text-foreground/85">
                                                                        {
                                                                            salaryLabel
                                                                        }
                                                                    </span>
                                                                )}
                                                                {postedLabel && (
                                                                    <span className="inline-flex items-center gap-1">
                                                                        <CalendarIcon className="size-3" />
                                                                        {
                                                                            postedLabel
                                                                        }
                                                                    </span>
                                                                )}
                                                                <span className="inline-flex items-center gap-1">
                                                                    <CpuIcon className="size-3" />
                                                                    Tech{" "}
                                                                    {
                                                                        techPercent
                                                                    }
                                                                    %
                                                                </span>
                                                                <span className="inline-flex items-center gap-1">
                                                                    <CompassIcon className="size-3" />
                                                                    Strategic{" "}
                                                                    {
                                                                        stratPercent
                                                                    }
                                                                    %
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-1 shrink-0">
                                                            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground">
                                                                <SkipForwardIcon className="size-3" />
                                                                Skip
                                                            </span>
                                                            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground">
                                                                <EyeOffIcon className="size-3" />
                                                                Ignore
                                                            </span>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-7 px-3 text-xs rounded-full"
                                                                onClick={(
                                                                    e
                                                                ) => {
                                                                    e.stopPropagation();
                                                                    handleSelectMatch(
                                                                        match.id
                                                                    );
                                                                }}
                                                            >
                                                                Open Workspace
                                                                <ArrowRightIcon className="size-3 ml-1" />
                                                            </Button>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                    </div>

                                    {/* Right Filters Card matching Screenshot 1 */}
                                    <aside className="xl:col-span-3">
                                        <Card className="py-4">
                                            <CardContent className="space-y-4 px-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5 text-xs font-medium">
                                                        <SlidersHorizontalIcon className="size-3.5 text-muted-foreground" />
                                                        Filters
                                                    </div>
                                                    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                                                        <RotateCcwIcon className="size-3" />
                                                        Reset
                                                    </span>
                                                </div>

                                                <div className="space-y-1.5">
                                                    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                                        Order By
                                                    </div>
                                                    <div className="rounded-md border border-border bg-background px-2.5 py-1.5 text-xs">
                                                        Technical score
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                                                        <div className="rounded-full border border-border px-2 py-1 text-center text-[11px] text-muted-foreground">
                                                            ↓ High → Low
                                                        </div>
                                                        <div className="rounded-full bg-primary text-primary-foreground px-2 py-1 text-center text-[11px] font-medium">
                                                            ↑ Low → High
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-1.5 border-t border-border pt-3">
                                                    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                                        Tiers
                                                    </div>
                                                    {[
                                                        {
                                                            label: "Suitable",
                                                            count: 0,
                                                            checked: false,
                                                        },
                                                        {
                                                            label: "Runway",
                                                            count: 18,
                                                            checked: false,
                                                        },
                                                        {
                                                            label: "Stretch",
                                                            count: 453,
                                                            checked: true,
                                                        },
                                                        {
                                                            label: "Rejected",
                                                            count: 1185,
                                                            checked: false,
                                                        },
                                                    ].map((tier) => (
                                                        <div
                                                            key={tier.label}
                                                            className="flex items-center justify-between text-xs py-0.5"
                                                        >
                                                            <span className="flex items-center gap-2 text-muted-foreground">
                                                                <span
                                                                    className={`size-3.5 rounded-xs border flex items-center justify-center text-[10px] ${
                                                                        tier.checked
                                                                            ? "bg-primary text-primary-foreground border-primary"
                                                                            : "border-border"
                                                                    }`}
                                                                >
                                                                    {tier.checked
                                                                        ? "✓"
                                                                        : ""}
                                                                </span>
                                                                <span
                                                                    className={
                                                                        tier.checked
                                                                            ? "text-foreground font-medium"
                                                                            : ""
                                                                    }
                                                                >
                                                                    {tier.label}
                                                                </span>
                                                            </span>
                                                            <span className="text-[11px] text-muted-foreground font-mono">
                                                                {tier.count}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </aside>
                                </div>
                            </div>
                        ) : (
                            /* SCREENSHOT 2: Application Workspace View */
                            <div className="space-y-4">
                                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 px-2 text-xs"
                                                onClick={() =>
                                                    setScreen("matches")
                                                }
                                            >
                                                <ArrowLeftIcon className="size-3.5 mr-1" />
                                                Back
                                            </Button>
                                            <h3 className="text-base font-semibold text-foreground">
                                                {selectedJob.title}
                                            </h3>
                                            <Badge
                                                variant="outline"
                                                className={
                                                    TIER_BADGE_CLASSES[
                                                        selectedMatch
                                                            .suitabilityTier
                                                    ]
                                                }
                                            >
                                                <SparklesIcon className="size-3 mr-1" />
                                                {formatTierLabel(
                                                    selectedMatch.suitabilityTier
                                                )}{" "}
                                                Match
                                            </Badge>
                                        </div>

                                        <div className="flex items-center gap-3 text-xs text-muted-foreground pl-1">
                                            <span className="font-medium text-foreground/85">
                                                {selectedJob.company}
                                            </span>
                                            <span>{selectedJob.location}</span>
                                        </div>
                                    </div>

                                    <Button
                                        size="sm"
                                        className="h-8 text-xs"
                                        onClick={() =>
                                            onLaunchExample(
                                                `/application/${encodeURIComponent(selectedMatch.id)}`
                                            )
                                        }
                                    >
                                        Open Discussion & Draft in Sandbox
                                        <ArrowRightIcon className="size-3.5 ml-1.5" />
                                    </Button>
                                </div>

                                <div className="grid gap-4 lg:grid-cols-12 items-start">
                                    <div className="lg:col-span-7 min-w-0">
                                        <MatchTab match={selectedMatch} />
                                    </div>
                                    <div className="lg:col-span-5 min-w-0">
                                        <JobDescriptionPanel
                                            job={selectedJob}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
