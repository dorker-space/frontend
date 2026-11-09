import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    AlertCircleIcon,
    ArrowDownWideNarrowIcon,
    ArrowUpNarrowWideIcon,
    BriefcaseIcon,
    ChevronDownIcon,
    ExternalLinkIcon,
} from "lucide-react";
import { toast } from "sonner";
import { jobsApi, matchesApi } from "@/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
    formatPipelineStatus,
    Job,
    MatchWithJob,
    WorkspaceMatch,
    WorkspaceStatus,
} from "@/lib/types";

const API_PAGE_SIZE = 250;
const MAX_APPLICATIONS = 2000;

export type BoardColumnId =
    | "CLOSED"
    | "PENDING"
    | "APPLIED"
    | "INTERVIEWING"
    | "OFFER";

export type ClosedApplicationStatus =
    | "REJECTED_EARLY"
    | "GHOSTED"
    | "REJECTED_LATE"
    | "DECLINED";

export type ActiveApplicationStatus =
    | "PENDING"
    | "APPLIED"
    | "INTERVIEWING"
    | "OFFER";

export type BoardApplicationStatus =
    | ActiveApplicationStatus
    | ClosedApplicationStatus;

export type ColumnSortDirection = "desc" | "asc";

const DEFAULT_COLUMN_SORT: Record<BoardColumnId, ColumnSortDirection> = {
    CLOSED: "desc",
    PENDING: "desc",
    APPLIED: "desc",
    INTERVIEWING: "desc",
    OFFER: "desc",
};

function toTimestamp(value: string | undefined): number {
    if (!value) return 0;
    const parsed = new Date(value).getTime();
    return Number.isNaN(parsed) ? 0 : parsed;
}

const CLOSED_STATUSES: ReadonlySet<WorkspaceStatus> = new Set<WorkspaceStatus>([
    "REJECTED_EARLY",
    "GHOSTED",
    "REJECTED_LATE",
    "DECLINED",
]);

const BOARD_ALLOWED_STATUSES: ReadonlySet<WorkspaceStatus> =
    new Set<WorkspaceStatus>([
        "PENDING",
        "APPLIED",
        "INTERVIEWING",
        "OFFER",
        "REJECTED_EARLY",
        "GHOSTED",
        "REJECTED_LATE",
        "DECLINED",
    ]);

const ACTIVE_STAGE_ORDER: Record<ActiveApplicationStatus, number> = {
    PENDING: 1,
    APPLIED: 2,
    INTERVIEWING: 3,
    OFFER: 4,
};

interface BoardColumnConfig {
    id: BoardColumnId;
    title: string;
    accentClass: string;
}

// Column order on the page: Closed -> Pending -> Applied -> Interviewing -> Offer
const BOARD_COLUMNS: BoardColumnConfig[] = [
    {
        id: "CLOSED",
        title: "Closed",
        accentClass: "bg-rose-500/70",
    },
    {
        id: "PENDING",
        title: "Pending",
        accentClass: "bg-blue-500/70",
    },
    {
        id: "APPLIED",
        title: "Applied",
        accentClass: "bg-amber-500/70",
    },
    {
        id: "INTERVIEWING",
        title: "Interviewing",
        accentClass: "bg-violet-500/70",
    },
    {
        id: "OFFER",
        title: "Offer",
        accentClass: "bg-emerald-500/70",
    },
];

function isClosedStatus(
    status: WorkspaceStatus
): status is ClosedApplicationStatus {
    return CLOSED_STATUSES.has(status);
}

function isActiveStatus(
    status: WorkspaceStatus
): status is ActiveApplicationStatus {
    return (
        status === "PENDING" ||
        status === "APPLIED" ||
        status === "INTERVIEWING" ||
        status === "OFFER"
    );
}

function getColumnForStatus(status: WorkspaceStatus): BoardColumnId | null {
    if (!BOARD_ALLOWED_STATUSES.has(status)) {
        return null;
    }
    if (isClosedStatus(status)) {
        return "CLOSED";
    }
    return status as BoardColumnId;
}

/**
 * Forward-only active transitions:
 * Pending -> Applied -> Interviewing -> Offer
 */
function getAllowedForwardStatuses(
    status: WorkspaceStatus
): ActiveApplicationStatus[] {
    if (!isActiveStatus(status)) {
        return [];
    }
    const currentOrder = ACTIVE_STAGE_ORDER[status];
    return (
        ["PENDING", "APPLIED", "INTERVIEWING", "OFFER"] as const
    ).filter((candidate) => ACTIVE_STAGE_ORDER[candidate] > currentOrder);
}

/**
 * Stage-specific closing rules:
 * - Applied -> Closed: Rejected Early or Ghosted
 * - Interviewing -> Closed: Rejected Late or Declined
 * - Offer -> Closed: Declined
 * - Pending -> Closed: Declined
 */
function getAllowedClosedStatuses(
    status: WorkspaceStatus
): { status: ClosedApplicationStatus; label: string; description: string }[] {
    switch (status) {
        case "APPLIED":
            return [
                {
                    status: "REJECTED_EARLY",
                    label: "Rejected Early",
                    description:
                        "Rejected before having a chance to interview.",
                },
                {
                    status: "GHOSTED",
                    label: "Ghosted",
                    description:
                        "No response received after submitting the application.",
                },
            ];
        case "INTERVIEWING":
            return [
                {
                    status: "REJECTED_LATE",
                    label: "Rejected Late",
                    description:
                        "Reached the interview stage but was rejected by the company.",
                },
                {
                    status: "DECLINED",
                    label: "Declined",
                    description:
                        "Decided to withdraw and close the interview process.",
                },
            ];
        case "OFFER":
            return [
                {
                    status: "DECLINED",
                    label: "Declined",
                    description: "Declined the company's offer.",
                },
            ];
        case "PENDING":
            return [
                {
                    status: "DECLINED",
                    label: "Declined",
                    description: "Decided not to submit this application.",
                },
            ];
        default:
            return [];
    }
}

function canDropInColumn(
    sourceStatus: WorkspaceStatus,
    targetColumn: BoardColumnId
): boolean {
    if (!isActiveStatus(sourceStatus)) {
        // Closed cards cannot move backwards or out of Closed
        return false;
    }
    if (targetColumn === "CLOSED") {
        return getAllowedClosedStatuses(sourceStatus).length > 0;
    }
    const targetActive = targetColumn as ActiveApplicationStatus;
    return (
        ACTIVE_STAGE_ORDER[targetActive] > ACTIVE_STAGE_ORDER[sourceStatus]
    );
}

function getClosedBadgeClass(status: ClosedApplicationStatus): string {
    if (status === "GHOSTED") {
        return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
    }
    return "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20";
}

async function fetchAllApplicationMatches(): Promise<WorkspaceMatch[]> {
    const collected: WorkspaceMatch[] = [];
    let offset = 0;

    while (offset < MAX_APPLICATIONS) {
        const page = await matchesApi.listApplications({
            limit: API_PAGE_SIZE,
            offset,
        });
        collected.push(...page.matches);
        offset += page.matches.length;

        if (page.matches.length === 0 || offset >= page.total) {
            break;
        }
    }

    return collected.filter((match) =>
        BOARD_ALLOWED_STATUSES.has(match.pipelineStatus)
    );
}

interface TinyApplicationCardProps {
    item: MatchWithJob;
    isUpdating: boolean;
    isDragging: boolean;
    onDragStart: (match: WorkspaceMatch) => void;
    onDragEnd: () => void;
    onSelectStatus: (
        match: WorkspaceMatch,
        nextStatus: BoardApplicationStatus,
        jobTitle?: string
    ) => void;
}

function TinyApplicationCard({
    item,
    isUpdating,
    isDragging,
    onDragStart,
    onDragEnd,
    onSelectStatus,
}: TinyApplicationCardProps) {
    const { match, job } = item;
    const title = job?.title || "Loading job…";
    const company = job?.company || "—";
    const location = job?.location;

    const forwardStatuses = getAllowedForwardStatuses(match.pipelineStatus);
    const closeOptions = getAllowedClosedStatuses(match.pipelineStatus);
    const isDraggable =
        !isUpdating &&
        (forwardStatuses.length > 0 || closeOptions.length > 0);

    return (
        <div
            draggable={isDraggable}
            onDragStart={(event) => {
                if (!isDraggable) {
                    event.preventDefault();
                    return;
                }
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData("text/plain", match.id);
                onDragStart(match);
            }}
            onDragEnd={onDragEnd}
            className={`group rounded-lg border border-border bg-card p-2.5 shadow-2xs transition-all select-none ${
                isDraggable
                    ? "cursor-grab active:cursor-grabbing hover:border-foreground/25"
                    : "cursor-default"
            } ${isDragging ? "opacity-40 scale-[0.98]" : ""} ${
                isUpdating ? "opacity-60 pointer-events-none" : ""
            }`}
        >
            <div className="flex items-start justify-between gap-1.5">
                <Link
                    to={`/application/${encodeURIComponent(match.id)}`}
                    draggable={false}
                    className="text-xs font-medium text-foreground hover:underline line-clamp-1 leading-snug"
                    title={title}
                >
                    {title}
                </Link>

                <div className="flex items-center gap-0.5 shrink-0">
                    {job?.link && (
                        <a
                            href={job.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            draggable={false}
                            title="Open ATS posting"
                            className="text-muted-foreground hover:text-foreground p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <ExternalLinkIcon className="size-3" />
                        </a>
                    )}

                    {(forwardStatuses.length > 0 ||
                        closeOptions.length > 0) && (
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                asChild
                                disabled={isUpdating}
                            >
                                <button
                                    type="button"
                                    aria-label="Move application"
                                    className="text-muted-foreground hover:text-foreground p-0.5 rounded focus:outline-none"
                                >
                                    <ChevronDownIcon className="size-3.5" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                                {forwardStatuses.length > 0 && (
                                    <DropdownMenuGroup>
                                        <DropdownMenuLabel className="text-[11px] text-muted-foreground">
                                            Advance Stage
                                        </DropdownMenuLabel>
                                        {forwardStatuses.map((nextStatus) => (
                                            <DropdownMenuItem
                                                key={nextStatus}
                                                className="text-xs cursor-pointer"
                                                onClick={() =>
                                                    onSelectStatus(
                                                        match,
                                                        nextStatus,
                                                        job?.title
                                                    )
                                                }
                                            >
                                                {formatPipelineStatus(
                                                    nextStatus
                                                )}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuGroup>
                                )}

                                {forwardStatuses.length > 0 &&
                                    closeOptions.length > 0 && (
                                        <DropdownMenuSeparator />
                                    )}

                                {closeOptions.length > 0 && (
                                    <DropdownMenuGroup>
                                        <DropdownMenuLabel className="text-[11px] text-muted-foreground">
                                            Close Application
                                        </DropdownMenuLabel>
                                        {closeOptions.map((option) => (
                                            <DropdownMenuItem
                                                key={option.status}
                                                className="text-xs cursor-pointer text-rose-600 dark:text-rose-400 focus:text-rose-600 dark:focus:text-rose-400"
                                                onClick={() =>
                                                    onSelectStatus(
                                                        match,
                                                        option.status,
                                                        job?.title
                                                    )
                                                }
                                            >
                                                {option.label}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuGroup>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>

            <div className="mt-1 flex items-center justify-between gap-1.5 text-[11px] text-muted-foreground">
                <span className="truncate" title={company}>
                    {company}
                    {location ? ` · ${location}` : ""}
                </span>

                {isClosedStatus(match.pipelineStatus) && (
                    <Badge
                        variant="outline"
                        className={`h-4 px-1.5 text-[10px] font-normal shrink-0 ${getClosedBadgeClass(
                            match.pipelineStatus
                        )}`}
                    >
                        {formatPipelineStatus(match.pipelineStatus)}
                    </Badge>
                )}
            </div>
        </div>
    );
}

interface PendingCloseResolution {
    match: WorkspaceMatch;
    jobTitle?: string;
    options: {
        status: ClosedApplicationStatus;
        label: string;
        description: string;
    }[];
}

export function ApplicationsPage() {
    const queryClient = useQueryClient();

    const [jobsById, setJobsById] = useState<Record<string, Job | null>>({});
    const [updatingMatchIds, setUpdatingMatchIds] = useState<Set<string>>(
        new Set()
    );
    const [draggedMatch, setDraggedMatch] = useState<WorkspaceMatch | null>(
        null
    );
    const [dragOverColumn, setDragOverColumn] =
        useState<BoardColumnId | null>(null);
    const [pendingClose, setPendingClose] =
        useState<PendingCloseResolution | null>(null);
    const [columnSort, setColumnSort] =
        useState<Record<BoardColumnId, ColumnSortDirection>>(
            DEFAULT_COLUMN_SORT
        );

    const toggleColumnSort = useCallback((columnId: BoardColumnId) => {
        setColumnSort((prev) => ({
            ...prev,
            [columnId]: prev[columnId] === "desc" ? "asc" : "desc",
        }));
    }, []);

    const requestedJobIdsRef = useRef<Set<string>>(new Set());

    const applicationsQuery = useQuery({
        queryKey: ["applications-board"],
        queryFn: fetchAllApplicationMatches,
    });

    const matches = useMemo(
        () => applicationsQuery.data ?? [],
        [applicationsQuery.data]
    );
    const isLoading = applicationsQuery.isLoading;
    const error = applicationsQuery.error
        ? applicationsQuery.error instanceof Error
            ? applicationsQuery.error.message
            : "Failed to load applications"
        : null;

    // Hydrate job details for cards on the board
    useEffect(() => {
        const missingJobIds = Array.from(
            new Set(
                matches
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
    }, [matches]);

    const commitStatusChange = useCallback(
        async (
            match: WorkspaceMatch,
            nextStatus: BoardApplicationStatus,
            jobTitle?: string
        ) => {
            const previousStatus = match.pipelineStatus;
            if (previousStatus === nextStatus) return;

            const boardQueryKey = ["applications-board"] as const;

            setUpdatingMatchIds((prev) => new Set(prev).add(match.id));
            await queryClient.cancelQueries({ queryKey: boardQueryKey });

            const nowIso = new Date().toISOString();

            queryClient.setQueryData<WorkspaceMatch[]>(
                boardQueryKey,
                (old) =>
                    old?.map((item) =>
                        item.id === match.id
                            ? {
                                  ...item,
                                  pipelineStatus: nextStatus,
                                  updatedAt: nowIso,
                              }
                            : item
                    ) ?? []
            );

            try {
                const confirmed = await matchesApi.updateStatus(
                    match.id,
                    nextStatus
                );
                queryClient.setQueryData<WorkspaceMatch[]>(
                    boardQueryKey,
                    (old) =>
                        old?.map((item) =>
                            item.id === match.id
                                ? {
                                      ...item,
                                      pipelineStatus: confirmed,
                                      updatedAt: nowIso,
                                  }
                                : item
                        ) ?? []
                );
                void queryClient.invalidateQueries({
                    queryKey: ["matches"],
                    refetchType: "inactive",
                });

                const label = formatPipelineStatus(confirmed);
                toast.success(
                    jobTitle
                        ? `Moved "${jobTitle}" to ${label}`
                        : `Application moved to ${label}`
                );
            } catch (err) {
                queryClient.setQueryData<WorkspaceMatch[]>(
                    boardQueryKey,
                    (old) =>
                        old?.map((item) =>
                            item.id === match.id
                                ? { ...item, pipelineStatus: previousStatus }
                                : item
                        ) ?? []
                );
                toast.error(
                    err instanceof Error
                        ? err.message
                        : "Failed to update application status"
                );
            } finally {
                setUpdatingMatchIds((prev) => {
                    const next = new Set(prev);
                    next.delete(match.id);
                    return next;
                });
            }
        },
        [queryClient]
    );

    const handleDropOnColumn = useCallback(
        (targetColumn: BoardColumnId) => {
            const activeMatch = draggedMatch;
            setDraggedMatch(null);
            setDragOverColumn(null);

            if (!activeMatch) return;
            if (!canDropInColumn(activeMatch.pipelineStatus, targetColumn)) {
                return;
            }

            const job =
                jobsById[activeMatch.jobId] ??
                jobsApi.getCached(activeMatch.jobId) ??
                null;
            const jobTitle = job?.title;

            if (targetColumn === "CLOSED") {
                const options = getAllowedClosedStatuses(
                    activeMatch.pipelineStatus
                );
                if (options.length === 1) {
                    // e.g. Offer -> Closed (Declined) or Pending -> Closed (Declined)
                    void commitStatusChange(
                        activeMatch,
                        options[0].status,
                        jobTitle
                    );
                } else if (options.length > 1) {
                    // Applied -> Rejected Early | Ghosted
                    // Interviewing -> Rejected Late | Declined
                    setPendingClose({
                        match: activeMatch,
                        jobTitle,
                        options,
                    });
                }
                return;
            }

            void commitStatusChange(
                activeMatch,
                targetColumn as ActiveApplicationStatus,
                jobTitle
            );
        },
        [commitStatusChange, draggedMatch, jobsById]
    );

    const itemsByColumn = useMemo(() => {
        const grouped: Record<BoardColumnId, MatchWithJob[]> = {
            CLOSED: [],
            PENDING: [],
            APPLIED: [],
            INTERVIEWING: [],
            OFFER: [],
        };

        for (const match of matches) {
            const col = getColumnForStatus(match.pipelineStatus);
            if (!col) continue;
            grouped[col].push({
                match,
                job:
                    jobsById[match.jobId] ??
                    jobsApi.getCached(match.jobId) ??
                    null,
            });
        }

        for (const col of BOARD_COLUMNS) {
            const dir = columnSort[col.id];
            const sign = dir === "desc" ? -1 : 1;
            grouped[col.id].sort((a, b) => {
                const timeA = toTimestamp(
                    a.match.updatedAt || a.match.createdAt
                );
                const timeB = toTimestamp(
                    b.match.updatedAt || b.match.createdAt
                );
                if (timeA !== timeB) {
                    return sign * (timeA - timeB);
                }
                return a.match.id.localeCompare(b.match.id) * sign;
            });
        }

        return grouped;
    }, [columnSort, jobsById, matches]);

    return (
        <div className="flex flex-col h-[calc(100vh-48px)] p-4 gap-3">
            {/* Minimal Header */}
            <div className="flex items-center justify-between border-b border-border pb-2.5 shrink-0">
                <div className="flex items-baseline gap-2">
                    <h1 className="text-base font-medium">Applications</h1>
                    <span className="text-xs text-muted-foreground">
                        {isLoading ? "Loading…" : `${matches.length} total`}
                    </span>
                </div>
            </div>

            {/* Kanban Board */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 flex-1 min-h-0">
                    {BOARD_COLUMNS.map((col) => (
                        <div
                            key={col.id}
                            className="flex flex-col gap-2 rounded-xl border border-border/60 bg-muted/20 p-2.5"
                        >
                            <Skeleton className="h-5 w-24 rounded" />
                            <Skeleton className="h-14 w-full rounded-lg" />
                            <Skeleton className="h-14 w-full rounded-lg" />
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center flex-1 text-center py-12">
                    <AlertCircleIcon className="size-7 text-destructive mb-2" />
                    <p className="text-sm font-medium mb-1">
                        Unable to load applications
                    </p>
                    <p className="text-xs text-muted-foreground mb-3">
                        {error}
                    </p>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => void applicationsQuery.refetch()}
                    >
                        Retry
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 flex-1 min-h-0 overflow-x-auto">
                    {BOARD_COLUMNS.map((column) => {
                        const columnItems = itemsByColumn[column.id];
                        const isDropAllowed =
                            draggedMatch !== null &&
                            canDropInColumn(
                                draggedMatch.pipelineStatus,
                                column.id
                            );
                        const isDragOver =
                            dragOverColumn === column.id && isDropAllowed;

                        return (
                            <div
                                key={column.id}
                                onDragOver={(event) => {
                                    if (!isDropAllowed) return;
                                    event.preventDefault();
                                    event.dataTransfer.dropEffect = "move";
                                    if (dragOverColumn !== column.id) {
                                        setDragOverColumn(column.id);
                                    }
                                }}
                                onDragLeave={(event) => {
                                    if (
                                        !event.currentTarget.contains(
                                            event.relatedTarget as Node | null
                                        )
                                    ) {
                                        setDragOverColumn((prev) =>
                                            prev === column.id ? null : prev
                                        );
                                    }
                                }}
                                onDrop={(event) => {
                                    event.preventDefault();
                                    handleDropOnColumn(column.id);
                                }}
                                className={`flex flex-col rounded-xl border bg-muted/15 min-h-[280px] max-h-full transition-colors ${
                                    isDragOver
                                        ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                                        : isDropAllowed
                                          ? "border-dashed border-foreground/25"
                                          : "border-border/60"
                                }`}
                            >
                                {/* Column Header */}
                                <div className="flex items-center justify-between px-3 py-2 border-b border-border/50 shrink-0">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`size-2 rounded-full ${column.accentClass}`}
                                        />
                                        <h2 className="text-xs font-semibold tracking-tight text-foreground">
                                            {column.title}
                                        </h2>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                toggleColumnSort(column.id)
                                            }
                                            title={
                                                columnSort[column.id] === "desc"
                                                    ? "Sorted by modified date: Latest first (click for Earliest first)"
                                                    : "Sorted by modified date: Earliest first (click for Latest first)"
                                            }
                                            aria-label={`Sort ${column.title} by modified date`}
                                            className="inline-flex items-center justify-center rounded p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                                        >
                                            {columnSort[column.id] ===
                                            "desc" ? (
                                                <ArrowDownWideNarrowIcon className="size-3.5" />
                                            ) : (
                                                <ArrowUpNarrowWideIcon className="size-3.5" />
                                            )}
                                        </button>
                                        <span className="text-[11px] font-mono text-muted-foreground">
                                            {columnItems.length}
                                        </span>
                                    </div>
                                </div>

                                {/* Column Cards */}
                                <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                                    {columnItems.length > 0 ? (
                                        columnItems.map((item) => (
                                            <TinyApplicationCard
                                                key={item.match.id}
                                                item={item}
                                                isUpdating={updatingMatchIds.has(
                                                    item.match.id
                                                )}
                                                isDragging={
                                                    draggedMatch?.id ===
                                                    item.match.id
                                                }
                                                onDragStart={setDraggedMatch}
                                                onDragEnd={() => {
                                                    setDraggedMatch(null);
                                                    setDragOverColumn(null);
                                                }}
                                                onSelectStatus={
                                                    commitStatusChange
                                                }
                                            />
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-28 text-center px-2">
                                            <BriefcaseIcon className="size-4 text-muted-foreground/40 mb-1" />
                                            <span className="text-[11px] text-muted-foreground/60">
                                                Empty
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Close Reason Resolution Dialog (when moving from Applied or Interviewing to Closed) */}
            <Dialog
                open={pendingClose !== null}
                onOpenChange={(open) => {
                    if (!open) setPendingClose(null);
                }}
            >
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-sm">
                            Specify closing reason
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            {pendingClose?.jobTitle
                                ? `How did "${pendingClose.jobTitle}" conclude?`
                                : "Select how this application concluded."}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-2 py-1">
                        {pendingClose?.options.map((option) => (
                            <button
                                key={option.status}
                                type="button"
                                onClick={() => {
                                    const current = pendingClose;
                                    setPendingClose(null);
                                    if (current) {
                                        void commitStatusChange(
                                            current.match,
                                            option.status,
                                            current.jobTitle
                                        );
                                    }
                                }}
                                className="flex flex-col items-start gap-0.5 rounded-lg border border-border p-3 text-left hover:bg-muted/50 hover:border-foreground/30 transition-colors"
                            >
                                <span className="text-xs font-semibold text-foreground">
                                    {option.label}
                                </span>
                                <span className="text-[11px] text-muted-foreground">
                                    {option.description}
                                </span>
                            </button>
                        ))}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-xs"
                            onClick={() => setPendingClose(null)}
                        >
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
