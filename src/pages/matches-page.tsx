import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    AlertCircleIcon,
    ArrowRightIcon,
    BookmarkIcon,
    BriefcaseIcon,
    CalendarIcon,
    ChevronDownIcon,
    CompassIcon,
    CpuIcon,
    ExternalLinkIcon,
    EyeOffIcon,
    MapPinIcon,
    RefreshCwIcon,
    SkipForwardIcon,
    SparklesIcon,
} from "lucide-react";
import { toast } from "sonner";
import { jobsApi, matchesApi } from "@/api";
import { AddExternalJobDialog } from "@/components/add-external-job-dialog";
import {
    ApplicationsFilterSidebar,
    DEFAULT_MATCH_FILTERS,
    loadPersistedMatchFilters,
    MatchFilters,
    MatchSortField,
    savePersistedMatchFilters,
    SortDirection,
    STATUS_GROUPS,
} from "@/components/applications/applications-filter-sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { formatJobSalary } from "@/components/workspace/workspace-header";
import {
    formatPipelineStatus,
    Job,
    MatchWithJob,
    SuitabilityTier,
    WorkspaceMatch,
    WorkspaceStatus,
} from "@/lib/types";

const API_PAGE_SIZE = 250; // Litestar maximum per request
const MAX_MATCHES = 2000; // Safety cap when loading all matches
const VISIBLE_PAGE_SIZE = 50;

const EMPTY_TIER_COUNTS: Record<SuitabilityTier, number> = {
    SUITABLE: 0,
    STRETCH: 0,
    RUNWAY: 0,
    REJECTED: 0,
};

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

function toTimestamp(value: string): number {
    const parsed = new Date(value).getTime();
    return Number.isNaN(parsed) ? 0 : parsed;
}

function getSortValue(match: WorkspaceMatch, field: MatchSortField): number {
    if (field === "technical") {
        return match.technicalCapabilityScore;
    }
    if (field === "strategic") {
        return match.strategicValueScore;
    }
    // "latest": the API exposes created_at only (no updated_at yet)
    return toTimestamp(match.createdAt);
}

function sortMatches(
    matches: WorkspaceMatch[],
    field: MatchSortField,
    direction: SortDirection
): WorkspaceMatch[] {
    const sign = direction === "desc" ? -1 : 1;
    return [...matches].sort((a, b) => {
        const primary = getSortValue(a, field) - getSortValue(b, field);
        if (primary !== 0) {
            return sign * primary;
        }
        // Tie-breaker: newest first
        return toTimestamp(b.createdAt) - toTimestamp(a.createdAt);
    });
}

async function fetchAllMatches(
    tiers: SuitabilityTier[],
    statuses: WorkspaceStatus[]
): Promise<WorkspaceMatch[]> {
    const collected: WorkspaceMatch[] = [];
    let offset = 0;

    while (offset < MAX_MATCHES) {
        const page = await matchesApi.list({
            limit: API_PAGE_SIZE,
            offset,
            tiers,
            pipelineStatus: statuses,
        });
        collected.push(...page.matches);
        offset += page.matches.length;

        if (page.matches.length === 0 || offset >= page.total) {
            break;
        }
    }

    return collected;
}

function applyMatchStatusToCache(
    queryClient: ReturnType<typeof useQueryClient>,
    listQueryKey: readonly unknown[],
    countsQueryKey: readonly unknown[],
    match: WorkspaceMatch,
    fromStatus: WorkspaceStatus,
    toStatus: WorkspaceStatus,
    activeTiers: SuitabilityTier[],
    activeStatuses: WorkspaceStatus[]
) {
    const tierMatchesFilter = activeTiers.includes(match.suitabilityTier);
    const wasInFilter =
        tierMatchesFilter && activeStatuses.includes(fromStatus);
    const isNowInFilter =
        tierMatchesFilter && activeStatuses.includes(toStatus);

    queryClient.setQueryData<WorkspaceMatch[]>(listQueryKey, (old) => {
        if (!old) return old;
        if (isNowInFilter) {
            const exists = old.some((item) => item.id === match.id);
            if (exists) {
                return old.map((item) =>
                    item.id === match.id
                        ? { ...item, pipelineStatus: toStatus }
                        : item
                );
            }
            return [{ ...match, pipelineStatus: toStatus }, ...old];
        }
        return old.filter((item) => item.id !== match.id);
    });

    if (wasInFilter !== isNowInFilter) {
        const delta = isNowInFilter ? 1 : -1;
        queryClient.setQueryData<Record<SuitabilityTier, number>>(
            countsQueryKey,
            (old) => {
                if (!old) return old;
                const current = old[match.suitabilityTier] ?? 0;
                return {
                    ...old,
                    [match.suitabilityTier]: Math.max(0, current + delta),
                };
            }
        );
    }
}

interface MatchApplicationRowProps {
    item: MatchWithJob;
    isUpdating: boolean;
    onStatusChange: (
        match: WorkspaceMatch,
        nextStatus: WorkspaceStatus,
        jobTitle?: string
    ) => void;
}

function MatchApplicationRow({
    item,
    isUpdating,
    onStatusChange,
}: MatchApplicationRowProps) {
    const { match, job } = item;
    const title = job?.title || "Loading job…";
    const company = job?.company || "—";
    const location = job?.location || "Remote";
    const salaryLabel = job ? formatJobSalary(job) : null;
    const postedSource = job?.postedAt || job?.fetchedAt || match.createdAt;
    const postedLabel = postedSource
        ? new Date(postedSource).toLocaleDateString()
        : null;

    const techPercent = Math.round(match.technicalCapabilityScore * 100);
    const stratPercent = Math.round(match.strategicValueScore * 100);

    return (
        <Card className="py-3.5 hover:bg-muted/20 transition-colors">
            <CardContent className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <Link
                            to={`/application/${encodeURIComponent(match.id)}`}
                            className="font-semibold text-sm hover:underline truncate"
                        >
                            {title}
                        </Link>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild disabled={isUpdating}>
                                <button
                                    type="button"
                                    aria-label="Change pipeline status"
                                    className="inline-flex focus:outline-none disabled:opacity-50"
                                >
                                    <Badge
                                        variant="outline"
                                        className={`cursor-pointer hover:opacity-80 transition-opacity ${getStatusBadgeClass(
                                            match.pipelineStatus
                                        )}`}
                                    >
                                        {formatPipelineStatus(
                                            match.pipelineStatus
                                        )}
                                        <ChevronDownIcon className="size-3 ml-0.5 opacity-70" />
                                    </Badge>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-44">
                                <DropdownMenuRadioGroup
                                    value={match.pipelineStatus}
                                    onValueChange={(value) =>
                                        onStatusChange(
                                            match,
                                            value as WorkspaceStatus,
                                            job?.title
                                        )
                                    }
                                >
                                    {STATUS_GROUPS.map((group, groupIndex) => (
                                        <DropdownMenuGroup key={group.label}>
                                            {groupIndex > 0 && (
                                                <DropdownMenuSeparator />
                                            )}
                                            <DropdownMenuLabel className="text-xs text-muted-foreground">
                                                {group.label}
                                            </DropdownMenuLabel>
                                            {group.statuses.map((status) => (
                                                <DropdownMenuRadioItem
                                                    key={status}
                                                    value={status}
                                                    className="text-xs cursor-pointer"
                                                >
                                                    {formatPipelineStatus(
                                                        status
                                                    )}
                                                </DropdownMenuRadioItem>
                                            ))}
                                        </DropdownMenuGroup>
                                    ))}
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Badge
                            variant="outline"
                            className={TIER_BADGE_CLASSES[match.suitabilityTier]}
                        >
                            <SparklesIcon className="size-3 mr-1" />
                            {formatTierLabel(match.suitabilityTier)}
                        </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground/80">
                            {company}
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <MapPinIcon className="size-3" />
                            {location}
                        </span>
                        {salaryLabel && (
                            <span className="font-medium text-foreground/80">
                                {salaryLabel}
                            </span>
                        )}
                        {postedLabel && (
                            <span className="inline-flex items-center gap-1">
                                <CalendarIcon className="size-3" />
                                {postedLabel}
                            </span>
                        )}
                        <span className="inline-flex items-center gap-1">
                            <CpuIcon className="size-3" />
                            Tech {techPercent}%
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <CompassIcon className="size-3" />
                            Strategic {stratPercent}%
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                    {match.pipelineStatus !== "SKIPPED" && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={isUpdating}
                            className="text-muted-foreground hover:text-amber-700 dark:hover:text-amber-400 hover:bg-amber-500/10"
                            title="Mark as Skipped"
                            onClick={() =>
                                onStatusChange(match, "SKIPPED", job?.title)
                            }
                        >
                            <SkipForwardIcon className="size-3.5 mr-1" />
                            Skip
                        </Button>
                    )}

                    {match.pipelineStatus !== "IGNORED" && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={isUpdating}
                            className="text-muted-foreground hover:text-rose-700 dark:hover:text-rose-400 hover:bg-rose-500/10"
                            title="Mark as Ignored"
                            onClick={() =>
                                onStatusChange(match, "IGNORED", job?.title)
                            }
                        >
                            <EyeOffIcon className="size-3.5 mr-1" />
                            Ignore
                        </Button>
                    )}

                    {job?.link && (
                        <Button variant="ghost" size="sm" asChild>
                            <a
                                href={job.link}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <ExternalLinkIcon className="size-3.5 mr-1" />
                                ATS
                            </a>
                        </Button>
                    )}

                    <Button variant="outline" size="sm" asChild>
                        <Link
                            to={`/application/${encodeURIComponent(match.id)}`}
                        >
                            Open Workspace
                            <ArrowRightIcon className="size-3.5 ml-1.5" />
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

let persistedVisibleCount = VISIBLE_PAGE_SIZE;

export function MatchesPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [filters, setFiltersState] = useState<MatchFilters>(() =>
        loadPersistedMatchFilters()
    );
    const [jobsById, setJobsById] = useState<Record<string, Job | null>>({});
    const [updatingMatchIds, setUpdatingMatchIds] = useState<Set<string>>(
        new Set()
    );
    const [visibleCount, setVisibleCountState] = useState<number>(
        () => persistedVisibleCount
    );

    const requestedJobIdsRef = useRef<Set<string>>(new Set());

    const setVisibleCount = useCallback(
        (updater: number | ((prev: number) => number)) => {
            setVisibleCountState((prev) => {
                const next =
                    typeof updater === "function" ? updater(prev) : updater;
                persistedVisibleCount = next;
                return next;
            });
        },
        []
    );

    const handleFiltersChange = useCallback(
        (nextFilters: MatchFilters) => {
            setFiltersState((prev) => {
                const tiersOrStatusesChanged =
                    prev.tiers.length !== nextFilters.tiers.length ||
                    prev.statuses.length !== nextFilters.statuses.length ||
                    !prev.tiers.every((t) => nextFilters.tiers.includes(t)) ||
                    !prev.statuses.every((s) =>
                        nextFilters.statuses.includes(s)
                    );
                if (tiersOrStatusesChanged) {
                    setVisibleCount(VISIBLE_PAGE_SIZE);
                }
                return nextFilters;
            });
            savePersistedMatchFilters(nextFilters);
        },
        [setVisibleCount]
    );

    const { tiers, statuses } = filters;

    const sortedTiers = useMemo(() => [...tiers].sort(), [tiers]);
    const sortedStatuses = useMemo(() => [...statuses].sort(), [statuses]);
    const tiersKey = sortedTiers.join(",");
    const statusesKey = sortedStatuses.join(",");

    const matchesQuery = useQuery({
        queryKey: ["matches", "list", tiersKey, statusesKey],
        queryFn: async () => {
            if (sortedStatuses.length === 0 || sortedTiers.length === 0) {
                return [] as WorkspaceMatch[];
            }
            return fetchAllMatches(sortedTiers, sortedStatuses);
        },
    });

    const countsQuery = useQuery({
        queryKey: ["matches", "counts", statusesKey],
        queryFn: async () => {
            if (sortedStatuses.length === 0) {
                return EMPTY_TIER_COUNTS;
            }
            const counts = await matchesApi.getCounts(sortedStatuses);
            return { ...EMPTY_TIER_COUNTS, ...counts };
        },
    });

    const matches = matchesQuery.data ?? [];
    const tierCounts = countsQuery.data ?? EMPTY_TIER_COUNTS;
    const isLoading = matchesQuery.isLoading || countsQuery.isLoading;
    const isRefreshing = matchesQuery.isFetching || countsQuery.isFetching;
    const queryError = matchesQuery.error ?? countsQuery.error;
    const error = queryError
        ? queryError instanceof Error
            ? queryError.message
            : "Failed to load matches"
        : null;

    const handleRefresh = useCallback(() => {
        void Promise.all([matchesQuery.refetch(), countsQuery.refetch()]);
    }, [matchesQuery, countsQuery]);

    const handleQuickStatusChange = useCallback(
        async (
            match: WorkspaceMatch,
            nextStatus: WorkspaceStatus,
            jobTitle?: string,
            isUndo = false
        ) => {
            const previousStatus = match.pipelineStatus;
            if (previousStatus === nextStatus) return;

            const listQueryKey = [
                "matches",
                "list",
                tiersKey,
                statusesKey,
            ] as const;
            const countsQueryKey = [
                "matches",
                "counts",
                statusesKey,
            ] as const;

            setUpdatingMatchIds((prev) => new Set(prev).add(match.id));

            await queryClient.cancelQueries({ queryKey: ["matches"] });

            applyMatchStatusToCache(
                queryClient,
                listQueryKey,
                countsQueryKey,
                match,
                previousStatus,
                nextStatus,
                sortedTiers,
                sortedStatuses
            );

            try {
                const confirmed = await matchesApi.updateStatus(
                    match.id,
                    nextStatus
                );
                void queryClient.invalidateQueries({
                    queryKey: ["matches"],
                    refetchType: "inactive",
                });

                const label = formatPipelineStatus(confirmed);
                const message = jobTitle
                    ? `Marked "${jobTitle}" as ${label}`
                    : `Application status updated to ${label}`;

                if (isUndo) {
                    toast.success(message);
                } else {
                    toast.success(message, {
                        action: {
                            label: "Undo",
                            onClick: () => {
                                void handleQuickStatusChange(
                                    { ...match, pipelineStatus: confirmed },
                                    previousStatus,
                                    jobTitle,
                                    true
                                );
                            },
                        },
                    });
                }
            } catch (err) {
                applyMatchStatusToCache(
                    queryClient,
                    listQueryKey,
                    countsQueryKey,
                    match,
                    nextStatus,
                    previousStatus,
                    sortedTiers,
                    sortedStatuses
                );
                toast.error(
                    err instanceof Error
                        ? err.message
                        : "Failed to update pipeline status"
                );
            } finally {
                setUpdatingMatchIds((prev) => {
                    const next = new Set(prev);
                    next.delete(match.id);
                    return next;
                });
            }
        },
        [queryClient, sortedStatuses, sortedTiers, statusesKey, tiersKey]
    );

    const sortedMatches = useMemo(
        () => sortMatches(matches, filters.sortField, filters.sortDirection),
        [matches, filters.sortField, filters.sortDirection]
    );

    const visibleMatches = useMemo(
        () => sortedMatches.slice(0, visibleCount),
        [sortedMatches, visibleCount]
    );

    // Load job details only for the cards currently on screen that aren't already cached.
    useEffect(() => {
        const missingJobIds = Array.from(
            new Set(
                visibleMatches
                    .map((match) => match.jobId)
                    .filter(
                        (jobId) =>
                            !jobsApi.getCached(jobId) &&
                            !requestedJobIdsRef.current.has(jobId)
                    )
            )
        );
        if (missingJobIds.length === 0) return;

        missingJobIds.forEach((jobId) => requestedJobIdsRef.current.add(jobId));

        Promise.all(
            missingJobIds.map(async (jobId) => {
                try {
                    return [jobId, await jobsApi.getById(jobId)] as const;
                } catch {
                    return [jobId, null] as const;
                }
            })
        ).then((entries) => {
            setJobsById((prev) => ({
                ...prev,
                ...Object.fromEntries(entries),
            }));
        });
    }, [visibleMatches]);

    const visibleItems: MatchWithJob[] = visibleMatches.map((match) => ({
        match,
        job: jobsById[match.jobId] ?? jobsApi.getCached(match.jobId) ?? null,
    }));

    const canShowMore = visibleCount < sortedMatches.length;

    return (
        <div className="flex flex-col gap-4 p-4">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
                <div>
                    <h1 className="text-lg font-medium">Matches</h1>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {isLoading
                            ? "Loading matches…"
                            : `${sortedMatches.length} match${sortedMatches.length === 1 ? "" : "es"} for the selected filters`}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <AddExternalJobDialog
                        onSuccess={() => {
                            handleRefresh();
                        }}
                    />
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                    >
                        <RefreshCwIcon
                            className={`size-3.5 mr-1.5 ${isRefreshing ? "animate-spin" : ""}`}
                        />
                        Refresh
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate("/saved")}
                    >
                        <BookmarkIcon className="size-3.5 mr-1.5" />
                        Saved Jobs
                    </Button>
                    <Button size="sm" onClick={() => navigate("/jobs")}>
                        <BriefcaseIcon className="size-3.5 mr-1.5" />
                        All Jobs
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-12 items-start">
                {/* Right sidebar (first in DOM so it sits on top on mobile) */}
                <aside className="lg:col-span-3 lg:order-2 lg:sticky lg:top-4">
                    <ApplicationsFilterSidebar
                        filters={filters}
                        tierCounts={tierCounts}
                        onChange={handleFiltersChange}
                    />
                </aside>

                {/* Match list */}
                <div className="lg:col-span-9 lg:order-1 min-w-0">
                    {isLoading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 5 }).map((_, index) => (
                                <Skeleton
                                    key={index}
                                    className="h-20 w-full rounded-xl"
                                />
                            ))}
                        </div>
                    ) : error ? (
                        <div className="text-center py-10">
                            <AlertCircleIcon className="size-8 text-destructive mx-auto mb-2" />
                            <h3 className="text-base font-medium mb-1">
                                Unable to Load Matches
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                {error}
                            </p>
                            <Button size="sm" onClick={handleRefresh}>
                                Try Again
                            </Button>
                        </div>
                    ) : visibleItems.length > 0 ? (
                        <div className="space-y-2.5">
                            {visibleItems.map((item) => (
                                <MatchApplicationRow
                                    key={item.match.id}
                                    item={item}
                                    isUpdating={updatingMatchIds.has(
                                        item.match.id
                                    )}
                                    onStatusChange={handleQuickStatusChange}
                                />
                            ))}

                            {canShowMore && (
                                <div className="flex justify-center pt-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            setVisibleCount(
                                                (count) =>
                                                    count + VISIBLE_PAGE_SIZE
                                            )
                                        }
                                    >
                                        Show More ({visibleItems.length} of{" "}
                                        {sortedMatches.length})
                                    </Button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <BriefcaseIcon className="size-8 text-muted-foreground mx-auto mb-2" />
                            <h3 className="text-base font-medium mb-1">
                                No Matches Found
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                {tiers.length === 0 || statuses.length === 0
                                    ? "Select at least one tier and one pipeline status."
                                    : "No matches fit the selected tiers and statuses."}
                            </p>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                    handleFiltersChange(DEFAULT_MATCH_FILTERS)
                                }
                            >
                                Reset Filters
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
