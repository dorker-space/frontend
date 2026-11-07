import {
    ArrowDownIcon,
    ArrowUpIcon,
    RotateCcwIcon,
    SlidersHorizontalIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
    formatPipelineStatus,
    SuitabilityTier,
    WorkspaceStatus,
} from "@/lib/types";

export type MatchSortField = "latest" | "technical" | "strategic";
export type SortDirection = "desc" | "asc";

export interface MatchFilters {
    tiers: SuitabilityTier[];
    statuses: WorkspaceStatus[];
    sortField: MatchSortField;
    sortDirection: SortDirection;
}

export const DEFAULT_MATCH_FILTERS: MatchFilters = {
    tiers: ["SUITABLE", "RUNWAY", "STRETCH"],
    statuses: ["PENDING"],
    sortField: "latest",
    sortDirection: "desc",
};

const TIER_OPTIONS: { value: SuitabilityTier; label: string }[] = [
    { value: "SUITABLE", label: "Suitable" },
    { value: "RUNWAY", label: "Runway" },
    { value: "STRETCH", label: "Stretch" },
    { value: "REJECTED", label: "Rejected" },
];

export const STATUS_GROUPS: { label: string; statuses: WorkspaceStatus[] }[] = [
    {
        label: "Active",
        statuses: ["PENDING", "APPLIED", "INTERVIEWING", "OFFER"],
    },
    {
        label: "Closed",
        statuses: [
            "GHOSTED",
            "SKIPPED",
            "IGNORED",
            "DECLINED",
            "REJECTED_EARLY",
            "REJECTED_LATE",
        ],
    },
];

const SORT_OPTIONS: { value: MatchSortField; label: string }[] = [
    { value: "latest", label: "Latest" },
    { value: "technical", label: "Technical score" },
    { value: "strategic", label: "Strategic score" },
];

function toggleValue<T>(values: T[], value: T, checked: boolean): T[] {
    if (checked) {
        return values.includes(value) ? values : [...values, value];
    }
    return values.filter((item) => item !== value);
}

function sameMembers<T>(left: T[], right: T[]): boolean {
    return (
        left.length === right.length &&
        left.every((item) => right.includes(item))
    );
}

export function isDefaultMatchFilters(filters: MatchFilters): boolean {
    return (
        sameMembers(filters.tiers, DEFAULT_MATCH_FILTERS.tiers) &&
        sameMembers(filters.statuses, DEFAULT_MATCH_FILTERS.statuses) &&
        filters.sortField === DEFAULT_MATCH_FILTERS.sortField &&
        filters.sortDirection === DEFAULT_MATCH_FILTERS.sortDirection
    );
}

const MATCH_FILTERS_STORAGE_KEY = "dorker.matches.filters.v1";

const VALID_TIERS = new Set<SuitabilityTier>(
    TIER_OPTIONS.map((item) => item.value)
);
const VALID_STATUSES = new Set<WorkspaceStatus>(
    STATUS_GROUPS.flatMap((group) => group.statuses)
);
const VALID_SORT_FIELDS = new Set<MatchSortField>(
    SORT_OPTIONS.map((item) => item.value)
);

export function loadPersistedMatchFilters(): MatchFilters {
    if (typeof window === "undefined") {
        return DEFAULT_MATCH_FILTERS;
    }

    try {
        const raw = window.localStorage.getItem(MATCH_FILTERS_STORAGE_KEY);
        if (!raw) return DEFAULT_MATCH_FILTERS;

        const parsed = JSON.parse(raw) as Partial<MatchFilters>;
        const tiers = Array.isArray(parsed.tiers)
            ? parsed.tiers.filter((tier): tier is SuitabilityTier =>
                  VALID_TIERS.has(tier as SuitabilityTier)
              )
            : DEFAULT_MATCH_FILTERS.tiers;
        const statuses = Array.isArray(parsed.statuses)
            ? parsed.statuses.filter((status): status is WorkspaceStatus =>
                  VALID_STATUSES.has(status as WorkspaceStatus)
              )
            : DEFAULT_MATCH_FILTERS.statuses;
        const sortField =
            parsed.sortField && VALID_SORT_FIELDS.has(parsed.sortField)
                ? parsed.sortField
                : DEFAULT_MATCH_FILTERS.sortField;
        const sortDirection: SortDirection =
            parsed.sortDirection === "asc" || parsed.sortDirection === "desc"
                ? parsed.sortDirection
                : DEFAULT_MATCH_FILTERS.sortDirection;

        return {
            tiers,
            statuses,
            sortField,
            sortDirection,
        };
    } catch {
        return DEFAULT_MATCH_FILTERS;
    }
}

export function savePersistedMatchFilters(filters: MatchFilters): void {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.setItem(
            MATCH_FILTERS_STORAGE_KEY,
            JSON.stringify(filters)
        );
    } catch {
        // Ignore storage write errors
    }
}

interface FilterCheckboxProps {
    id: string;
    label: string;
    checked: boolean;
    count?: number;
    onCheckedChange: (checked: boolean) => void;
}

function FilterCheckbox({
    id,
    label,
    checked,
    count,
    onCheckedChange,
}: FilterCheckboxProps) {
    return (
        <div className="flex items-center justify-between gap-2 py-0.5">
            <div className="flex items-center gap-2">
                <Checkbox
                    id={id}
                    checked={checked}
                    onCheckedChange={(value) => onCheckedChange(value === true)}
                />
                <Label
                    htmlFor={id}
                    className="text-xs font-normal cursor-pointer"
                >
                    {label}
                </Label>
            </div>
            {count !== undefined && (
                <span className="text-[11px] font-mono text-muted-foreground">
                    {count}
                </span>
            )}
        </div>
    );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
            {children}
        </h4>
    );
}

interface ApplicationsFilterSidebarProps {
    filters: MatchFilters;
    tierCounts: Record<SuitabilityTier, number>;
    onChange: (next: MatchFilters) => void;
}

export function ApplicationsFilterSidebar({
    filters,
    tierCounts,
    onChange,
}: ApplicationsFilterSidebarProps) {
    const isLatest = filters.sortField === "latest";
    const descLabel = isLatest ? "Newest" : "High → Low";
    const ascLabel = isLatest ? "Oldest" : "Low → High";

    return (
        <Card className="py-4">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <SlidersHorizontalIcon className="size-4 text-muted-foreground" />
                        <CardTitle className="text-sm font-medium">
                            Filters
                        </CardTitle>
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        disabled={isDefaultMatchFilters(filters)}
                        onClick={() => onChange(DEFAULT_MATCH_FILTERS)}
                    >
                        <RotateCcwIcon className="size-3.5 mr-1" />
                        Reset
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="space-y-5">
                {/* Sorting */}
                <div>
                    <SectionTitle>Order by</SectionTitle>
                    <select
                        value={filters.sortField}
                        onChange={(event) =>
                            onChange({
                                ...filters,
                                sortField: event.target
                                    .value as MatchSortField,
                            })
                        }
                        className="w-full h-8 rounded-md border border-border bg-background px-2 text-xs"
                    >
                        {SORT_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>

                    <div className="grid grid-cols-2 gap-1 mt-2">
                        <Button
                            type="button"
                            size="sm"
                            variant={
                                filters.sortDirection === "desc"
                                    ? "default"
                                    : "outline"
                            }
                            className="h-7 text-xs"
                            onClick={() =>
                                onChange({ ...filters, sortDirection: "desc" })
                            }
                        >
                            <ArrowDownIcon className="size-3.5 mr-1" />
                            {descLabel}
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant={
                                filters.sortDirection === "asc"
                                    ? "default"
                                    : "outline"
                            }
                            className="h-7 text-xs"
                            onClick={() =>
                                onChange({ ...filters, sortDirection: "asc" })
                            }
                        >
                            <ArrowUpIcon className="size-3.5 mr-1" />
                            {ascLabel}
                        </Button>
                    </div>
                </div>

                {/* Tiers */}
                <div>
                    <SectionTitle>Tiers</SectionTitle>
                    {TIER_OPTIONS.map((tier) => (
                        <FilterCheckbox
                            key={tier.value}
                            id={`tier-${tier.value}`}
                            label={tier.label}
                            count={tierCounts[tier.value] ?? 0}
                            checked={filters.tiers.includes(tier.value)}
                            onCheckedChange={(checked) =>
                                onChange({
                                    ...filters,
                                    tiers: toggleValue(
                                        filters.tiers,
                                        tier.value,
                                        checked
                                    ),
                                })
                            }
                        />
                    ))}
                </div>

                {/* Pipeline statuses */}
                <div>
                    <SectionTitle>Pipeline status</SectionTitle>
                    <div className="space-y-3">
                        {STATUS_GROUPS.map((group) => (
                            <div key={group.label}>
                                <p className="text-[11px] text-muted-foreground mb-0.5">
                                    {group.label}
                                </p>
                                {group.statuses.map((status) => (
                                    <FilterCheckbox
                                        key={status}
                                        id={`status-${status}`}
                                        label={formatPipelineStatus(status)}
                                        checked={filters.statuses.includes(
                                            status
                                        )}
                                        onCheckedChange={(checked) =>
                                            onChange({
                                                ...filters,
                                                statuses: toggleValue(
                                                    filters.statuses,
                                                    status,
                                                    checked
                                                ),
                                            })
                                        }
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
