import {
    useCallback,
    useDeferredValue,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { Link } from "react-router-dom";
import {
    AlertCircleIcon,
    BookmarkCheckIcon,
    BookmarkIcon,
    BriefcaseIcon,
    ExternalLinkIcon,
    RefreshCwIcon,
} from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { toast } from "sonner";
import { AddExternalJobDialog } from "@/components/add-external-job-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { jobsApi } from "@/api";
import { fetchSavedJobsList, saveJobItem } from "@/lib/api";
import { Job } from "@/lib/types";

function formatSalaryLabel(job: Job): string {
    const currency = job.salaryCurrency || "USD";
    const symbol = currency === "USD" ? "$" : `${currency} `;

    if (job.salaryMin && job.salaryMax) {
        return `${symbol}${Math.round(job.salaryMin).toLocaleString()} - ${symbol}${Math.round(job.salaryMax).toLocaleString()}`;
    }
    if (job.salaryMin) {
        return `${symbol}${Math.round(job.salaryMin).toLocaleString()}+`;
    }
    if (job.salaryMax) {
        return `Up to ${symbol}${Math.round(job.salaryMax).toLocaleString()}`;
    }
    return "Not specified";
}

interface PersistedJobsPageState {
    jobs: Job[];
    offset: number;
    total: number;
    lastFetched: string | null;
    query: string;
    location: string;
    company: string;
}

let cachedJobsPageState: PersistedJobsPageState = {
    jobs: [],
    offset: 0,
    total: 0,
    lastFetched: null,
    query: "",
    location: "",
    company: "",
};

export function JobsPage() {
    const [jobs, setJobs] = useState<Job[]>(() => cachedJobsPageState.jobs);
    const [isLoading, setIsLoading] = useState(
        () => cachedJobsPageState.jobs.length === 0
    );
    const [error, setError] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastFetched, setLastFetched] = useState<string | null>(
        () => cachedJobsPageState.lastFetched
    );
    const [offset, setOffset] = useState(() => cachedJobsPageState.offset);
    const [total, setTotal] = useState(() => cachedJobsPageState.total);
    const pageSize = 250;

    const [query, setQuery] = useState(() => cachedJobsPageState.query);
    const [location, setLocation] = useState(
        () => cachedJobsPageState.location
    );
    const [company, setCompany] = useState(() => cachedJobsPageState.company);
    const deferredQuery = useDeferredValue(query);
    const deferredLocation = useDeferredValue(location);
    const deferredCompany = useDeferredValue(company);

    const listRef = useRef<HTMLDivElement | null>(null);
    const canLoadMore = jobs.length < total;

    const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
    const [savingJobIds, setSavingJobIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        cachedJobsPageState = {
            jobs,
            offset,
            total,
            lastFetched,
            query,
            location,
            company,
        };
    }, [jobs, offset, total, lastFetched, query, location, company]);

    const loadSavedJobIds = useCallback(async () => {
        const saved = await fetchSavedJobsList();
        setSavedJobIds(new Set(saved.map((item) => item.jobId)));
    }, []);

    const loadJobs = useCallback(
        async (nextOffset = 0, showRefreshing = false) => {
            try {
                if (showRefreshing) {
                    setIsRefreshing(true);
                } else {
                    setIsLoading(true);
                }
                setError(null);

                const data = await jobsApi.list({
                    limit: pageSize,
                    offset: nextOffset,
                });

                setJobs((prev) =>
                    nextOffset === 0 ? data.jobs : [...prev, ...data.jobs]
                );
                setOffset(data.offset);
                setTotal(data.total);
                setLastFetched(new Date().toLocaleTimeString());
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "Failed to load jobs"
                );
            } finally {
                setIsLoading(false);
                setIsRefreshing(false);
            }
        },
        [pageSize]
    );

    const handleSaveJob = async (job: Job) => {
        if (savingJobIds.has(job.id)) return;
        setSavingJobIds((prev) => new Set(prev).add(job.id));

        try {
            await saveJobItem(job);
            setSavedJobIds((prev) => new Set(prev).add(job.id));
            toast.success(`Saved ${job.title} at ${job.company}`);
        } catch (err) {
            toast.error(
                err instanceof Error ? err.message : "Failed to save job"
            );
        } finally {
            setSavingJobIds((prev) => {
                const next = new Set(prev);
                next.delete(job.id);
                return next;
            });
        }
    };

    useEffect(() => {
        loadSavedJobIds();
    }, [loadSavedJobIds]);

    useEffect(() => {
        if (cachedJobsPageState.jobs.length === 0) {
            loadJobs(0, false);
        }
    }, [loadJobs]);

    const filteredJobs = useMemo(() => {
        const q = deferredQuery.trim().toLowerCase();
        const loc = deferredLocation.trim().toLowerCase();
        const comp = deferredCompany.trim().toLowerCase();

        if (!q && !loc && !comp) {
            return jobs;
        }

        return jobs.filter((job) => {
            const matchesQuery =
                !q ||
                job.title.toLowerCase().includes(q) ||
                job.company.toLowerCase().includes(q) ||
                (job.location ?? "").toLowerCase().includes(q);
            const matchesLoc =
                !loc || (job.location ?? "").toLowerCase().includes(loc);
            const matchesComp =
                !comp || job.company.toLowerCase().includes(comp);
            return matchesQuery && matchesLoc && matchesComp;
        });
    }, [jobs, deferredQuery, deferredLocation, deferredCompany]);

    const rowVirtualizer = useVirtualizer({
        count: filteredJobs.length,
        getScrollElement: () => listRef.current,
        estimateSize: () => 40,
        overscan: 10,
    });

    const virtualItems = rowVirtualizer.getVirtualItems();
    const totalSize = rowVirtualizer.getTotalSize();

    useEffect(() => {
        const [lastItem] = [...virtualItems].reverse();
        if (!lastItem) return;

        if (
            lastItem.index >= filteredJobs.length - 1 &&
            canLoadMore &&
            !isRefreshing
        ) {
            loadJobs(offset + pageSize, true);
        }
    }, [
        canLoadMore,
        isRefreshing,
        offset,
        pageSize,
        loadJobs,
        filteredJobs.length,
        virtualItems,
    ]);

    if (isLoading) {
        return (
            <div className="flex flex-col gap-2 p-4">
                <div className="flex items-center justify-between border-b border-border pb-2">
                    <div>
                        <h1 className="text-lg font-medium">All Jobs</h1>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Loading jobs...
                        </p>
                    </div>
                    <Button variant="outline" size="sm" disabled>
                        <RefreshCwIcon className="size-3.5" />
                        Refresh
                    </Button>
                </div>

                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <Skeleton
                            key={index}
                            className="h-24 w-full rounded-lg"
                        />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col gap-2 p-4">
                <div className="flex items-center justify-between border-b border-border pb-2">
                    <div>
                        <h1 className="text-lg font-medium">All Jobs</h1>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Error loading jobs
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => loadJobs(0, true)}
                        disabled={isRefreshing}
                    >
                        <RefreshCwIcon
                            className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`}
                        />
                        {isRefreshing ? "Refreshing..." : "Try Again"}
                    </Button>
                </div>

                <div className="text-center py-8">
                    <AlertCircleIcon className="size-8 text-red-500 mx-auto mb-2" />
                    <h3 className="text-base font-medium mb-1">
                        Error Loading Jobs
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                        {error}
                    </p>
                    <Button size="sm" onClick={() => loadJobs(0, true)}>
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    const jobsCountLabel =
        deferredQuery || deferredLocation || deferredCompany
            ? `${filteredJobs.length} of ${total || jobs.length}`
            : `${total || jobs.length}`;

    return (
        <div className="flex flex-col gap-2 p-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-2">
                <div>
                    <h1 className="text-lg font-medium">All Jobs</h1>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {jobsCountLabel} jobs ({jobs.length} loaded)
                        {lastFetched && (
                            <span className="ml-2 text-xs text-muted-foreground/70">
                                Updated: {lastFetched}
                            </span>
                        )}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <AddExternalJobDialog
                        onSuccess={({ job }) => {
                            setJobs((prev) =>
                                prev.some((item) => item.id === job.id)
                                    ? prev
                                    : [job, ...prev]
                            );
                            setTotal((prev) => prev + 1);
                        }}
                    />
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => loadJobs(0, true)}
                        disabled={isRefreshing}
                    >
                        <RefreshCwIcon
                            className={`size-4 ${isRefreshing ? "animate-spin" : ""}`}
                        />
                        {isRefreshing ? "Refreshing..." : "Refresh"}
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                        <a
                            href="https://map.stapply.ai"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2"
                        >
                            <ExternalLinkIcon className="size-4" />
                            View Map
                        </a>
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="grid gap-2 md:grid-cols-3">
                <Input
                    placeholder="Search title, company, location"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className="h-9 text-sm"
                />
                <Input
                    placeholder="Filter by location"
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    className="h-9 text-sm"
                />
                <div className="flex gap-2">
                    <Input
                        placeholder="Filter by company"
                        value={company}
                        onChange={(event) => setCompany(event.target.value)}
                        className="h-9 text-sm"
                    />
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            setQuery("");
                            setLocation("");
                            setCompany("");
                        }}
                    >
                        Clear
                    </Button>
                </div>
            </div>

            {/* Virtualized Jobs List */}
            {filteredJobs.length > 0 ? (
                <>
                    <div
                        ref={listRef}
                        className="h-[calc(100vh-280px)] overflow-auto"
                    >
                        <div
                            style={{
                                height: `${totalSize}px`,
                                width: "100%",
                                position: "relative",
                            }}
                        >
                            {virtualItems.map((virtualRow) => {
                                const job = filteredJobs[virtualRow.index];
                                const isSaved = savedJobIds.has(job.id);
                                const isSaving = savingJobIds.has(job.id);
                                const salary = formatSalaryLabel(job);

                                return (
                                    <div
                                        key={job.id}
                                        data-index={virtualRow.index}
                                        ref={rowVirtualizer.measureElement}
                                        className="absolute left-0 right-0 border-b border-border hover:bg-muted/30 transition-colors"
                                        style={{
                                            transform: `translateY(${virtualRow.start}px)`,
                                            height: `${virtualRow.size}px`,
                                        }}
                                    >
                                        <div className="flex items-center justify-between gap-3 px-4 py-1.5">
                                            <Link
                                                to={`/application/${encodeURIComponent(job.id)}`}
                                                className="flex-1 min-w-0 group"
                                            >
                                                <div className="flex items-center gap-2.5 overflow-hidden">
                                                    <span className="font-medium text-foreground group-hover:underline truncate leading-tight flex-shrink-0">
                                                        {job.title}
                                                    </span>
                                                    <span className="text-muted-foreground hidden sm:inline flex-shrink-0">
                                                        •
                                                    </span>
                                                    <span className="text-muted-foreground hidden sm:inline truncate min-w-0">
                                                        {job.company}
                                                    </span>
                                                    <span className="text-muted-foreground hidden md:inline flex-shrink-0">
                                                        •
                                                    </span>
                                                    <span className="text-muted-foreground hidden md:inline truncate min-w-0">
                                                        {job.location || "Remote"}
                                                    </span>
                                                    <span className="text-muted-foreground hidden lg:inline flex-shrink-0">
                                                        •
                                                    </span>
                                                    <span className="text-muted-foreground text-sm hidden lg:inline truncate min-w-0">
                                                        {salary}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 sm:hidden leading-tight mt-0.5">
                                                    <span className="text-sm text-muted-foreground truncate">
                                                        {job.company}
                                                    </span>
                                                    <span className="text-muted-foreground">
                                                        •
                                                    </span>
                                                    <span className="text-sm text-muted-foreground truncate">
                                                        {job.location || "Remote"}
                                                    </span>
                                                </div>
                                            </Link>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="shrink-0 h-7 w-7 -mr-1"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    if (!isSaved) {
                                                        handleSaveJob(job);
                                                    }
                                                }}
                                                disabled={isSaved || isSaving}
                                            >
                                                {isSaved ? (
                                                    <BookmarkCheckIcon className="size-3.5 text-primary fill-primary" />
                                                ) : (
                                                    <BookmarkIcon className="size-3.5" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    {isRefreshing && canLoadMore && (
                        <div className="flex justify-center py-2">
                            <RefreshCwIcon className="size-4 animate-spin text-muted-foreground" />
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-8">
                    <BriefcaseIcon className="size-8 text-muted-foreground mx-auto mb-2" />
                    <h3 className="text-base font-medium mb-1">
                        No Jobs Found
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                        No jobs matched your active filters.
                    </p>
                    <Button
                        size="sm"
                        onClick={() => loadJobs(0, true)}
                        disabled={isRefreshing}
                    >
                        <RefreshCwIcon
                            className={`size-3.5 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
                        />
                        Refresh Jobs
                    </Button>
                </div>
            )}
        </div>
    );
}
