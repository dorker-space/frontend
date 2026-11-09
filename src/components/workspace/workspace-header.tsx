import { Link } from "react-router-dom";
import {
    ArrowLeftIcon,
    Building2Icon,
    ExternalLinkIcon,
    MapPinIcon,
    SparklesIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    ALL_PIPELINE_STATUSES,
    formatPipelineStatus,
    Job,
    SuitabilityTier,
    WorkspaceStatus,
} from "@/lib/types";

interface WorkspaceHeaderProps {
    job: Job;
    tier: SuitabilityTier;
    status: WorkspaceStatus;
    isUpdatingStatus?: boolean;
    onStatusChange: (status: WorkspaceStatus) => void;
}

const TIER_BADGE_STYLES: Record<
    SuitabilityTier,
    { label: string; className: string }
> = {
    SUITABLE: {
        label: "Suitable Match",
        className:
            "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    },
    STRETCH: {
        label: "Stretch Match",
        className:
            "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    },
    RUNWAY: {
        label: "Runway Match",
        className:
            "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    },
    REJECTED: {
        label: "Rejected Match",
        className:
            "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
    },
};

const QUICK_STATUSES: WorkspaceStatus[] = [
    "PENDING",
    "APPLIED",
    "SKIPPED",
    "DECLINED",
];

const EXTRA_STATUSES: WorkspaceStatus[] = ALL_PIPELINE_STATUSES.filter(
    (s) => !QUICK_STATUSES.includes(s)
);

export function formatJobSalary(job: Job): string | null {
    const currency = job.salaryCurrency || "USD";
    const prefix = currency === "USD" ? "$" : `${currency} `;

    if (job.salaryMin && job.salaryMax) {
        return `${prefix}${Math.round(job.salaryMin).toLocaleString()} – ${prefix}${Math.round(job.salaryMax).toLocaleString()}`;
    }
    if (job.salaryMin) {
        return `${prefix}${Math.round(job.salaryMin).toLocaleString()}+`;
    }
    if (job.salaryMax) {
        return `Up to ${prefix}${Math.round(job.salaryMax).toLocaleString()}`;
    }
    return null;
}

export function WorkspaceHeader({
    job,
    tier,
    status,
    isUpdatingStatus = false,
    onStatusChange,
}: WorkspaceHeaderProps) {
    const tierInfo = TIER_BADGE_STYLES[tier];
    const salaryLabel = formatJobSalary(job);
    const isExtraStatusActive = EXTRA_STATUSES.includes(status);

    return (
        <header className="border-b border-border bg-background px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Left: Back Navigation & Job Identity */}
                <div className="flex items-center gap-3 min-w-0">
                    <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="shrink-0"
                    >
                        <Link to="/matches">
                            <ArrowLeftIcon className="size-4 mr-1.5" />
                            Back
                        </Link>
                    </Button>

                    <Separator orientation="vertical" className="h-5" />

                    <div className="min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <h1 className="text-base font-semibold tracking-tight truncate">
                                {job.title}
                            </h1>
                            <Badge
                                variant="outline"
                                className={tierInfo.className}
                            >
                                <SparklesIcon className="size-3 mr-1" />
                                {tierInfo.label}
                            </Badge>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5 flex-wrap">
                            <span className="inline-flex items-center gap-1 font-medium text-foreground/80">
                                <Building2Icon className="size-3" />
                                {job.company}
                            </span>

                            {job.location && (
                                <span className="inline-flex items-center gap-1">
                                    <MapPinIcon className="size-3" />
                                    {job.location}
                                </span>
                            )}

                            {salaryLabel && (
                                <span className="font-medium text-foreground/80">
                                    {salaryLabel}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Capitalized Status Selector & External Link */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <div className="inline-flex items-center rounded-lg border border-border bg-muted/40 p-0.5 gap-0.5">
                        {QUICK_STATUSES.map((option) => {
                            const isActive = status === option;
                            return (
                                <Button
                                    key={option}
                                    variant={isActive ? "default" : "ghost"}
                                    size="sm"
                                    disabled={isUpdatingStatus}
                                    className="h-7 px-2.5 text-xs"
                                    onClick={() => onStatusChange(option)}
                                >
                                    {formatPipelineStatus(option)}
                                </Button>
                            );
                        })}

                        <select
                            aria-label="More pipeline statuses"
                            disabled={isUpdatingStatus}
                            value={isExtraStatusActive ? status : ""}
                            onChange={(e) => {
                                const next = e.target.value as WorkspaceStatus;
                                if (next) {
                                    onStatusChange(next);
                                }
                            }}
                            className={`h-7 rounded-md px-2 text-xs font-medium bg-transparent border-0 focus:outline-none cursor-pointer ${
                                isExtraStatusActive
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            <option value="" disabled>
                                More...
                            </option>
                            {EXTRA_STATUSES.map((extra) => (
                                <option
                                    key={extra}
                                    value={extra}
                                    className="bg-background text-foreground"
                                >
                                    {formatPipelineStatus(extra)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {job.link && (
                        <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="h-8"
                        >
                            <a
                                href={job.link}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <ExternalLinkIcon className="size-3.5 mr-1.5" />
                                ATS Listing
                            </a>
                        </Button>
                    )}
                </div>
            </div>
        </header>
    );
}
