import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Briefcase,
    Building2,
    Calendar,
    CheckCircle2,
    ChevronDown,
    Clock,
    Compass,
    DollarSign,
    ExternalLink,
    FilePlus2,
    FileText,
    Globe,
    GraduationCap,
    Languages,
    Link2,
    Mail,
    MapPin,
    Pencil,
    Phone,
    Plane,
    Plus,
    ShieldCheck,
    Sparkles,
    Trash2,
    User,
} from "lucide-react";
import { toast } from "sonner";
import {
    profileApi,
    type CareerCollection,
    type ProfilePatch,
    type ProfileRecord,
    type UserProfile,
} from "@/api/profile";
import { evidenceApi } from "@/api/evidence";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
    profileSections,
    type FieldSpec,
    type SectionSpec,
} from "./profile-fields";

const key = ["profile"];
const humanize = (value: string) => value.replaceAll("_", " ");
const capitalize = (value: string) => {
    const clean = humanize(value);
    return clean.charAt(0).toUpperCase() + clean.slice(1);
};
const message = (error: unknown) =>
    error instanceof Error
        ? error.message
        : "Unable to save. Please try again.";
const countries = new Intl.DisplayNames(["en"], { type: "region" });
const selectClass =
    "h-9 w-full appearance-none rounded-md border border-input bg-background pl-3 pr-9 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";

type Values = Record<string, unknown>;
type Options = { countries: string[]; timezones: string[] };

function formatCountry(code: unknown): string | null {
    if (!code || typeof code !== "string") return null;
    try {
        return countries.of(code) ?? code;
    } catch {
        return code;
    }
}

function formatMonthRange(
    start: unknown,
    end: unknown,
    isCurrent?: unknown
): string | null {
    const startStr = start ? String(start) : "";
    const endStr = isCurrent ? "Present" : end ? String(end) : "";
    if (!startStr && !endStr) return null;
    if (startStr && endStr) return `${startStr} – ${endStr}`;
    return startStr || endStr;
}

function formatNumber(val: unknown): string | null {
    if (val === null || val === undefined || val === "") return null;
    const num = Number(val);
    return Number.isNaN(num) ? String(val) : num.toLocaleString();
}

function getInitials(profile: UserProfile): string {
    const source =
        profile.preferred_name ||
        profile.name ||
        [profile.first_name, profile.last_name].filter(Boolean).join(" ");
    if (!source) return "U";
    const parts = source.trim().split(/\s+/);
    if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return source.slice(0, 2).toUpperCase();
}

const SECTION_ICONS: Record<string, typeof User> = {
    contact: User,
    work: Compass,
    career: Briefcase,
    documents: FileText,
};

function EmptyHint({ text = "Not specified" }: { text?: string }) {
    return (
        <span className="text-xs italic text-muted-foreground/60">{text}</span>
    );
}

function Field({
    spec,
    value,
    change,
    id,
    options,
    resumes = [],
}: {
    spec: FieldSpec;
    value: unknown;
    change: (value: unknown) => void;
    id: string;
    options: Options;
    resumes?: ProfileRecord[];
}) {
    const common = { id, required: spec.required };
    const str = value == null ? "" : String(value);
    let control: ReactNode;

    if (["select", "boolean", "country", "resume"].includes(spec.kind ?? "")) {
        let entries: { value: string; label: string }[];
        if (spec.kind === "boolean") {
            entries = [
                { value: "true", label: "Yes" },
                { value: "false", label: "No" },
            ];
        } else if (spec.kind === "country") {
            entries = options.countries.map((code) => ({
                value: code,
                label: countries.of(code) ?? code,
            }));
        } else if (spec.kind === "resume") {
            entries = resumes.map((row) => ({
                value: row.id,
                label: String(row.label || "Untitled resume"),
            }));
        } else {
            entries = (spec.options ?? []).map((option) => ({
                value: option,
                label: spec.optionLabels?.[option] ?? capitalize(option),
            }));
        }

        control = (
            <div className="relative">
                <select
                    {...common}
                    className={selectClass}
                    value={str}
                    onChange={(event) =>
                        change(
                            event.target.value === ""
                                ? null
                                : spec.kind === "boolean"
                                  ? event.target.value === "true"
                                  : event.target.value
                        )
                    }
                >
                    <option value="">Not provided</option>
                    {entries.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            </div>
        );
    } else if (spec.kind === "choices") {
        const selected = (value ?? []) as string[];
        control = (
            <div id={id} className="flex flex-wrap gap-2 pt-1">
                {spec.options?.map((option) => {
                    const isChecked = selected.includes(option);
                    return (
                        <label
                            key={option}
                            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors ${
                                isChecked
                                    ? "border-primary bg-primary/10 text-foreground"
                                    : "border-border bg-background text-muted-foreground hover:bg-muted/40"
                            }`}
                        >
                            <input
                                type="checkbox"
                                className="accent-primary"
                                checked={isChecked}
                                onChange={(event) =>
                                    change(
                                        event.target.checked
                                            ? [...selected, option]
                                            : selected.filter(
                                                  (item) => item !== option
                                              )
                                    )
                                }
                            />
                            {capitalize(option)}
                        </label>
                    );
                })}
            </div>
        );
    } else if (spec.kind === "list") {
        control = (
            <Textarea
                {...common}
                rows={3}
                placeholder="One item per line"
                value={((value ?? []) as string[]).join("\n")}
                onChange={(event) => change(event.target.value.split("\n"))}
            />
        );
    } else if (spec.kind === "textarea") {
        control = (
            <Textarea
                {...common}
                rows={3}
                value={str}
                onChange={(event) => change(event.target.value || null)}
            />
        );
    } else {
        control = (
            <Input
                {...common}
                type={spec.kind === "timezone" ? "text" : (spec.kind ?? "text")}
                list={
                    spec.kind === "timezone" ? "profile-timezones" : undefined
                }
                min={spec.kind === "number" ? 0 : undefined}
                step={
                    spec.kind === "number"
                        ? spec.key === "notice_period_days"
                            ? 1
                            : "any"
                        : undefined
                }
                placeholder={spec.kind === "tel" ? "+380123456789" : undefined}
                value={str}
                onChange={(event) =>
                    change(
                        event.target.value === ""
                            ? null
                            : spec.kind === "number"
                              ? Number(event.target.value)
                              : event.target.value
                    )
                }
            />
        );
    }

    return (
        <div
            className={
                spec.kind === "textarea" ||
                spec.kind === "list" ||
                spec.kind === "choices"
                    ? "space-y-1.5 sm:col-span-2"
                    : "space-y-1.5"
            }
        >
            <label htmlFor={id} className="text-xs font-medium text-foreground">
                {spec.label}
                {spec.required ? " *" : ""}
            </label>
            {control}
        </div>
    );
}

function LinkedEvidenceFooter({
    collection,
    row,
    files,
    onLinks,
}: {
    collection: CareerCollection;
    row: ProfileRecord;
    files: { id: string; title: string }[];
    onLinks: (
        collection: CareerCollection,
        entry: ProfileRecord,
        mode: "attach" | "create"
    ) => void;
}) {
    const evidenceIds = (row.evidence_ids ?? []) as string[];

    return (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-2.5 mt-3">
            <div className="flex flex-wrap items-center gap-1.5">
                {evidenceIds.length > 0 ? (
                    evidenceIds.map((id) => (
                        <Link
                            key={id}
                            to={`/dossier?evidence=${encodeURIComponent(id)}`}
                            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2 py-0.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                        >
                            <Link2 className="size-3 text-muted-foreground" />
                            {files.find((item) => item.id === id)?.title ??
                                "Open linked evidence"}
                        </Link>
                    ))
                ) : (
                    <span className="text-[11px] text-muted-foreground">
                        No Dossier evidence linked
                    </span>
                )}
            </div>

            <div className="flex items-center gap-1.5">
                <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2.5 text-xs"
                    onClick={() => onLinks(collection, row, "attach")}
                >
                    <Link2 className="mr-1.5 size-3" />
                    Manage evidence
                </Button>
                <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2.5 text-xs"
                    onClick={() => onLinks(collection, row, "create")}
                >
                    <FilePlus2 className="mr-1.5 size-3" />
                    Create evidence
                </Button>
            </div>
        </div>
    );
}

function ContactSectionDisplay({ profile }: { profile: UserProfile }) {
    const fullName =
        profile.name ||
        [profile.first_name, profile.last_name].filter(Boolean).join(" ") ||
        null;
    const legalName = [profile.first_name, profile.last_name]
        .filter(Boolean)
        .join(" ");
    const locationParts = [
        profile.residence_city,
        profile.residence_region,
        formatCountry(profile.residence_country),
    ].filter(Boolean);
    const locationLabel =
        locationParts.length > 0 ? locationParts.join(", ") : null;

    const primaryLinks = [
        { label: "LinkedIn", url: profile.linkedin_url },
        { label: "GitHub", url: profile.github_url },
        { label: "Portfolio", url: profile.portfolio_url },
    ].filter((item): item is { label: string; url: string } =>
        Boolean(item.url)
    );

    const extraLinks = (profile.profile_links ?? []).filter(Boolean);

    return (
        <div className="space-y-5">
            {/* Identity Header */}
            <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border/60 bg-muted/20 p-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm border border-primary/20">
                    {getInitials(profile)}
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold tracking-tight text-foreground">
                            {fullName ?? "Unnamed Candidate"}
                        </h3>
                        {profile.preferred_name && (
                            <Badge
                                variant="secondary"
                                className="text-[11px] font-normal"
                            >
                                Preferred: {profile.preferred_name}
                            </Badge>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        {legalName && legalName !== fullName && (
                            <span>Legal name: {legalName}</span>
                        )}
                        {profile.professional_headline && (
                            <span className="text-foreground/80">
                                {profile.professional_headline}
                            </span>
                        )}
                        {!fullName &&
                            !legalName &&
                            !profile.professional_headline && (
                                <span>
                                    Add your name and contact details so
                                    applications can be personalized.
                                </span>
                            )}
                    </div>
                </div>
            </div>

            {/* Contact & Residence Tiles */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-border/60 bg-background p-3 space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                        <Mail className="size-3.5" />
                        Email
                    </div>
                    <div className="text-xs font-medium truncate">
                        {profile.email ? (
                            <a
                                href={`mailto:${profile.email}`}
                                className="hover:underline"
                            >
                                {profile.email}
                            </a>
                        ) : (
                            <EmptyHint />
                        )}
                    </div>
                </div>

                <div className="rounded-lg border border-border/60 bg-background p-3 space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                        <Phone className="size-3.5" />
                        Phone
                    </div>
                    <div className="text-xs font-medium truncate">
                        {profile.phone || <EmptyHint />}
                    </div>
                </div>

                <div className="rounded-lg border border-border/60 bg-background p-3 space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                        <MapPin className="size-3.5" />
                        Location
                    </div>
                    <div
                        className="text-xs font-medium truncate"
                        title={locationLabel ?? undefined}
                    >
                        {locationLabel || <EmptyHint />}
                    </div>
                </div>

                <div className="rounded-lg border border-border/60 bg-background p-3 space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                        <Clock className="size-3.5" />
                        Timezone
                    </div>
                    <div className="text-xs font-medium truncate">
                        {profile.timezone || <EmptyHint />}
                    </div>
                </div>
            </div>

            {/* External Profile Links */}
            <div className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground">
                    Profiles & Links
                </h4>
                {primaryLinks.length > 0 || extraLinks.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {primaryLinks.map((item) => (
                            <a
                                key={item.label}
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/30 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                            >
                                <Globe className="size-3.5 text-muted-foreground" />
                                {item.label}
                                <ExternalLink className="size-3 text-muted-foreground" />
                            </a>
                        ))}
                        {extraLinks.map((url) => (
                            <a
                                key={url}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors max-w-xs truncate"
                            >
                                <Link2 className="size-3.5 shrink-0" />
                                <span className="truncate">{url}</span>
                                <ExternalLink className="size-3 shrink-0" />
                            </a>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-muted-foreground/70">
                        No external links configured.
                    </p>
                )}
            </div>
        </div>
    );
}

function BooleanStatusBadge({
    label,
    value,
    inverted = false,
}: {
    label: string;
    value: unknown;
    inverted?: boolean;
}) {
    if (value === null || value === undefined || value === "") {
        return (
            <Badge
                variant="outline"
                className="text-[11px] font-normal text-muted-foreground border-border/60"
            >
                {label}: Unspecified
            </Badge>
        );
    }
    const boolVal = Boolean(value);
    const isPositive = inverted ? !boolVal : boolVal;
    return (
        <Badge
            variant="outline"
            className={`text-[11px] font-normal ${
                isPositive
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                    : "bg-muted/50 text-muted-foreground border-border"
            }`}
        >
            {label}: {boolVal ? "Yes" : "No"}
        </Badge>
    );
}

function WorkSectionDisplay({ profile }: { profile: UserProfile }) {
    const roles = (profile.desired_role_titles ?? []).filter(Boolean);
    const arrangements = (profile.work_arrangements ?? []).filter(Boolean);
    const empTypes = (profile.employment_types ?? []).filter(Boolean);
    const locations = (profile.preferred_work_locations ?? []).filter(Boolean);
    const relocDestinations = (profile.relocation_destinations ?? []).filter(
        Boolean
    );
    const authorizations = (profile.work_authorizations ??
        []) as ProfileRecord[];
    const compensations = (profile.compensation_expectations ??
        []) as ProfileRecord[];

    return (
        <div className="space-y-6">
            {/* Roles & Work Arrangement Pills */}
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-border/60 bg-muted/15 p-3.5 space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">
                        Desired Role Titles
                    </div>
                    {roles.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                            {roles.map((role) => (
                                <Badge
                                    key={role}
                                    variant="secondary"
                                    className="text-xs font-normal"
                                >
                                    {role}
                                </Badge>
                            ))}
                        </div>
                    ) : (
                        <EmptyHint text="No target roles specified" />
                    )}
                </div>

                <div className="rounded-lg border border-border/60 bg-muted/15 p-3.5 space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">
                        Arrangements & Employment Types
                    </div>
                    {arrangements.length > 0 || empTypes.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                            {arrangements.map((arr) => (
                                <Badge
                                    key={arr}
                                    variant="outline"
                                    className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20 text-xs font-normal"
                                >
                                    {capitalize(arr)}
                                </Badge>
                            ))}
                            {empTypes.map((type) => (
                                <Badge
                                    key={type}
                                    variant="outline"
                                    className="text-xs font-normal"
                                >
                                    {capitalize(type)}
                                </Badge>
                            ))}
                        </div>
                    ) : (
                        <EmptyHint text="No arrangements or employment types selected" />
                    )}
                </div>
            </div>

            {/* Mobility & Availability Grid */}
            <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-border/60 bg-background p-3.5 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <MapPin className="size-3.5" />
                        Preferred Locations
                    </div>
                    {locations.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                            {locations.map((loc) => (
                                <Badge
                                    key={loc}
                                    variant="outline"
                                    className="text-[11px] font-normal"
                                >
                                    {loc}
                                </Badge>
                            ))}
                        </div>
                    ) : (
                        <EmptyHint />
                    )}
                </div>

                <div className="rounded-lg border border-border/60 bg-background p-3.5 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <Plane className="size-3.5" />
                        Relocation & Travel
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        <BooleanStatusBadge
                            label="Relocate"
                            value={profile.willing_to_relocate}
                        />
                        <BooleanStatusBadge
                            label="Travel"
                            value={profile.willing_to_travel}
                        />
                    </div>
                    {relocDestinations.length > 0 && (
                        <p className="text-[11px] text-muted-foreground pt-0.5">
                            Destinations: {relocDestinations.join(", ")}
                        </p>
                    )}
                </div>

                <div className="rounded-lg border border-border/60 bg-background p-3.5 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <Calendar className="size-3.5" />
                        Availability
                    </div>
                    <div className="space-y-0.5 text-xs">
                        <div>
                            <span className="text-muted-foreground">
                                Notice period:{" "}
                            </span>
                            <span className="font-medium">
                                {profile.notice_period_days != null
                                    ? `${profile.notice_period_days} days`
                                    : "Not specified"}
                            </span>
                        </div>
                        <div>
                            <span className="text-muted-foreground">
                                Start:{" "}
                            </span>
                            <span className="font-medium">
                                {profile.availability === "immediately"
                                    ? "Available now"
                                    : profile.availability === "from_date" && profile.earliest_start_date
                                      ? `Available from ${profile.earliest_start_date}`
                                      : "Not provided"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Work Authorizations */}
            <div className="space-y-2.5 border-t border-border/60 pt-4">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="size-4 text-muted-foreground" />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Country-Specific Work Authorizations
                    </h3>
                </div>

                {authorizations.length > 0 ? (
                    <div className="grid gap-2.5 sm:grid-cols-2">
                        {authorizations.map((row) => {
                            const countryName =
                                formatCountry(row.country) ?? "Unknown Country";
                            return (
                                <div
                                    key={row.id}
                                    className="rounded-lg border border-border/70 bg-muted/10 p-3 space-y-2"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-xs font-semibold text-foreground">
                                            {countryName}
                                        </span>
                                        {Boolean(row.country) && (
                                            <Badge
                                                variant="secondary"
                                                className="font-mono text-[10px] h-4 px-1.5"
                                            >
                                                {String(row.country)}
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        <BooleanStatusBadge
                                            label="Employee Auth"
                                            value={row.authorized_as_employee}
                                        />
                                        <BooleanStatusBadge
                                            label="Contractor"
                                            value={row.available_as_contractor}
                                        />
                                        <BooleanStatusBadge
                                            label="Sponsorship Now"
                                            value={row.sponsorship_needed_now}
                                            inverted
                                        />
                                        <BooleanStatusBadge
                                            label="Sponsorship Later"
                                            value={row.sponsorship_needed_later}
                                            inverted
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-xs text-muted-foreground/70">
                        No country-specific work authorizations added.
                    </p>
                )}
            </div>

            {/* Compensation Expectations */}
            <div className="space-y-2.5 border-t border-border/60 pt-4">
                <div className="flex items-center gap-2">
                    <DollarSign className="size-4 text-muted-foreground" />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Compensation Expectations
                    </h3>
                </div>

                {compensations.length > 0 ? (
                    <div className="grid gap-2.5 sm:grid-cols-2">
                        {compensations.map((row) => {
                            const currency = row.currency
                                ? String(row.currency).toUpperCase()
                                : "";
                            const min = formatNumber(row.minimum);
                            const max = formatNumber(row.maximum);
                            const range =
                                min && max
                                    ? `${currency} ${min} – ${max}`
                                    : min
                                      ? `From ${currency} ${min}`
                                      : max
                                        ? `Up to ${currency} ${max}`
                                        : currency || "Unspecified range";
                            const period = row.period
                                ? humanize(String(row.period))
                                : null;
                            const basis = row.basis
                                ? humanize(String(row.basis))
                                : null;

                            return (
                                <div
                                    key={row.id}
                                    className="flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-muted/10 p-3"
                                >
                                    <div className="space-y-0.5">
                                        <div className="text-sm font-semibold font-mono text-foreground">
                                            {range}
                                        </div>
                                        <div className="text-[11px] text-muted-foreground">
                                            {[period, basis]
                                                .filter(Boolean)
                                                .join(" · ") || "Standard"}
                                        </div>
                                    </div>

                                    {Boolean(row.employment_type) && (
                                        <Badge
                                            variant="outline"
                                            className="text-xs font-normal shrink-0"
                                        >
                                            {capitalize(
                                                String(row.employment_type)
                                            )}
                                        </Badge>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-xs text-muted-foreground/70">
                        No compensation expectations configured.
                    </p>
                )}
            </div>
        </div>
    );
}

function CareerSectionDisplay({
    profile,
    files,
    onLinks,
}: {
    profile: UserProfile;
    files: { id: string; title: string }[];
    onLinks: (
        collection: CareerCollection,
        entry: ProfileRecord,
        mode: "attach" | "create"
    ) => void;
}) {
    const skills = (profile.skills ?? []).filter(Boolean);
    const employment = (profile.employment_history ?? []) as ProfileRecord[];
    const education = (profile.education ?? []) as ProfileRecord[];
    const languages = (profile.languages ?? []) as ProfileRecord[];

    return (
        <div className="space-y-6">
            {/* Headline & Summary */}
            <div className="rounded-xl border border-border/60 bg-muted/15 p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Professional Overview
                    </span>
                </div>
                {profile.professional_headline && (
                    <p className="text-sm font-semibold text-foreground">
                        {profile.professional_headline}
                    </p>
                )}
                {profile.professional_summary ? (
                    <p className="text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap">
                        {profile.professional_summary}
                    </p>
                ) : (
                    !profile.professional_headline && (
                        <EmptyHint text="No headline or summary provided yet." />
                    )
                )}
            </div>

            {/* Skills */}
            <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Sparkles className="size-3.5" />
                    Core Skills ({skills.length})
                </div>
                {skills.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                        {skills.map((skill) => (
                            <Badge
                                key={skill}
                                variant="secondary"
                                className="text-xs font-normal"
                            >
                                {skill}
                            </Badge>
                        ))}
                    </div>
                ) : (
                    <EmptyHint text="No skills listed" />
                )}
            </div>

            {/* Employment History */}
            <div className="space-y-3 border-t border-border/60 pt-4">
                <div className="flex items-center gap-2">
                    <Building2 className="size-4 text-muted-foreground" />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Employment History
                    </h3>
                </div>

                {employment.length > 0 ? (
                    <div className="space-y-3">
                        {employment.map((row) => {
                            const dateRange = formatMonthRange(
                                row.start_month,
                                row.end_month,
                                row.is_current
                            );
                            return (
                                <div
                                    key={row.id}
                                    className="rounded-lg border border-border/70 bg-background p-4"
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-2">
                                        <div className="space-y-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="text-sm font-semibold text-foreground">
                                                    {String(
                                                        row.title ||
                                                            "Untitled Role"
                                                    )}
                                                </span>
                                                {Boolean(
                                                    row.employment_type
                                                ) && (
                                                    <Badge
                                                        variant="outline"
                                                        className="text-[10px] font-normal h-4 px-1.5"
                                                    >
                                                        {capitalize(
                                                            String(
                                                                row.employment_type
                                                            )
                                                        )}
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                                <span className="font-medium text-foreground/80">
                                                    {String(
                                                        row.company ||
                                                            "Unknown Company"
                                                    )}
                                                </span>
                                                {Boolean(row.location) && (
                                                    <span>
                                                        · {String(row.location)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {dateRange && (
                                            <Badge
                                                variant="outline"
                                                className={`text-xs font-normal ${
                                                    row.is_current
                                                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                                                        : ""
                                                }`}
                                            >
                                                {dateRange}
                                            </Badge>
                                        )}
                                    </div>

                                    <LinkedEvidenceFooter
                                        collection="employment_history"
                                        row={row}
                                        files={files}
                                        onLinks={onLinks}
                                    />
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-xs text-muted-foreground/70">
                        No employment history records added.
                    </p>
                )}
            </div>

            {/* Education */}
            <div className="space-y-3 border-t border-border/60 pt-4">
                <div className="flex items-center gap-2">
                    <GraduationCap className="size-4 text-muted-foreground" />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Education
                    </h3>
                </div>

                {education.length > 0 ? (
                    <div className="space-y-3">
                        {education.map((row) => {
                            const dateRange = formatMonthRange(
                                row.start_month,
                                row.end_month
                            );
                            const degreeLine = [
                                row.qualification,
                                row.field_of_study,
                            ]
                                .filter(Boolean)
                                .map(String)
                                .join(" — ");

                            return (
                                <div
                                    key={row.id}
                                    className="rounded-lg border border-border/70 bg-background p-4"
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-2">
                                        <div className="space-y-0.5">
                                            <div className="text-sm font-semibold text-foreground">
                                                {degreeLine ||
                                                    "Academic Program"}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {String(
                                                    row.institution ||
                                                        "Institution not specified"
                                                )}
                                            </div>
                                        </div>

                                        {dateRange && (
                                            <Badge
                                                variant="outline"
                                                className="text-xs font-normal"
                                            >
                                                {dateRange}
                                            </Badge>
                                        )}
                                    </div>

                                    <LinkedEvidenceFooter
                                        collection="education"
                                        row={row}
                                        files={files}
                                        onLinks={onLinks}
                                    />
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-xs text-muted-foreground/70">
                        No education records added.
                    </p>
                )}
            </div>

            {/* Languages */}
            <div className="space-y-2.5 border-t border-border/60 pt-4">
                <div className="flex items-center gap-2">
                    <Languages className="size-4 text-muted-foreground" />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Languages
                    </h3>
                </div>

                {languages.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {languages.map((row) => (
                            <div
                                key={row.id}
                                className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted/20 px-3 py-1.5 text-xs"
                            >
                                <span className="font-medium text-foreground">
                                    {String(row.language || "Language")}
                                </span>
                                {Boolean(row.proficiency) && (
                                    <Badge
                                        variant="secondary"
                                        className="text-[10px] font-normal h-4 px-1.5"
                                    >
                                        {capitalize(String(row.proficiency))}
                                    </Badge>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-muted-foreground/70">
                        No languages specified.
                    </p>
                )}
            </div>
        </div>
    );
}

function DocumentsSectionDisplay({ profile }: { profile: UserProfile }) {
    const resumes = profile.resumes ?? [];

    return (
        <div className="space-y-3">
            {resumes.length > 0 ? (
                <div className="grid gap-2.5 sm:grid-cols-2">
                    {resumes.map((row) => {
                        const isDefault =
                            profile.default_resume_id != null &&
                            row.id === profile.default_resume_id;
                        return (
                            <div
                                key={row.id}
                                className={`flex items-center justify-between gap-3 rounded-lg border p-3.5 transition-colors ${
                                    isDefault
                                        ? "border-emerald-500/30 bg-emerald-500/5"
                                        : "border-border/70 bg-background"
                                }`}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                                        <FileText className="size-4" />
                                    </div>
                                    <div className="min-w-0 space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-semibold text-foreground truncate">
                                                {row.label || "Untitled Resume"}
                                            </span>
                                            {isDefault && (
                                                <Badge
                                                    variant="outline"
                                                    className="h-4 px-1.5 text-[10px] font-normal bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                                                >
                                                    <CheckCircle2 className="size-2.5 mr-1" />
                                                    Default
                                                </Badge>
                                            )}
                                        </div>
                                        {row.url && (
                                            <p className="text-[11px] text-muted-foreground truncate">
                                                {row.url}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {row.url && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 px-2 text-xs shrink-0"
                                        asChild
                                    >
                                        <a
                                            href={row.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Open
                                            <ExternalLink className="ml-1 size-3" />
                                        </a>
                                    </Button>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="rounded-lg border border-dashed border-border p-6 text-center">
                    <FileText className="mx-auto size-6 text-muted-foreground/50 mb-1.5" />
                    <p className="text-xs font-medium text-foreground">
                        No resume links saved
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                        Click Edit to add labeled links to your hosted CV or
                        resume files.
                    </p>
                </div>
            )}
        </div>
    );
}

function Section({
    spec,
    profile,
    options,
    files,
    onLinks,
}: {
    spec: SectionSpec;
    profile: UserProfile;
    options: Options;
    files: { id: string; title: string }[];
    onLinks: (
        collection: CareerCollection,
        entry: ProfileRecord,
        mode: "attach" | "create"
    ) => void;
}) {
    const cache = useQueryClient();
    const [draft, setDraft] = useState<Values | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!draft) return;
        const warn = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            event.returnValue = "";
        };
        window.addEventListener("beforeunload", warn);
        return () => window.removeEventListener("beforeunload", warn);
    }, [draft]);

    const startEdit = () => {
        const source = profile as unknown as Values;
        const values: Values = {};
        for (const field of spec.fields) values[field.key] = source[field.key];
        for (const repeater of spec.repeaters ?? [])
            values[repeater.key] = source[repeater.key];
        setDraft(structuredClone(values));
        setError("");
    };

    const change = (name: string, value: unknown) =>
        setDraft((previous) =>
            previous
                ? {
                      ...previous,
                      [name]: value,
                      ...(name === "availability" && value !== "from_date"
                          ? { earliest_start_date: null }
                          : {}),
                  }
                : previous
        );

    const save = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!draft) return;
        setBusy(true);
        setError("");
        const clean: Values = { ...draft };
        for (const field of spec.fields) {
            if (field.kind === "list") {
                clean[field.key] = ((clean[field.key] ?? []) as string[])
                    .map((value) => value.trim())
                    .filter(Boolean);
            }
        }
        try {
            const saved = await profileApi.patch(clean as ProfilePatch);
            cache.setQueryData(key, saved);
            setDraft(null);
            toast.success(`${spec.title} saved`);
        } catch (failure) {
            setError(message(failure));
        } finally {
            setBusy(false);
        }
    };

    const current = draft ?? (profile as unknown as Values);
    const IconComponent = SECTION_ICONS[spec.id] ?? User;

    return (
        <section
            aria-label={spec.title}
            className="rounded-xl border border-border bg-card shadow-2xs overflow-hidden"
        >
            {/* Section Header */}
            <div className="flex items-center justify-between gap-4 border-b border-border/60 bg-muted/10 px-4 py-3">
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border/70 bg-background text-muted-foreground">
                        <IconComponent className="size-3.5" />
                    </div>
                    <div className="min-w-0">
                        <h2 className="text-sm font-medium text-foreground">
                            {spec.title}
                        </h2>
                        <p className="text-xs text-muted-foreground truncate">
                            {spec.description}
                        </p>
                    </div>
                </div>

                {!draft && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs shrink-0"
                        onClick={startEdit}
                        aria-label={`Edit ${spec.title}`}
                    >
                        <Pencil className="mr-1.5 size-3" />
                        Edit
                    </Button>
                )}
            </div>

            {/* Section Body */}
            <div className="p-4">
                {draft ? (
                    <form onSubmit={(event) => void save(event)}>
                        <fieldset disabled={busy} className="space-y-6">
                            <div className="grid gap-4 sm:grid-cols-2">
                                {spec.fields.filter((field) =>
                                    field.key !== "earliest_start_date" || current.availability === "from_date"
                                ).map((field) => (
                                    <Field
                                        key={field.key}
                                        id={`profile-${field.key}`}
                                        spec={field}
                                        value={current[field.key]}
                                        change={(value) =>
                                            change(field.key, value)
                                        }
                                        options={options}
                                        resumes={
                                            (current.resumes ??
                                                []) as ProfileRecord[]
                                        }
                                    />
                                ))}
                            </div>

                            {spec.repeaters?.map((repeater) => {
                                const records = (current[repeater.key] ??
                                    []) as ProfileRecord[];
                                return (
                                    <div
                                        key={repeater.key}
                                        className="space-y-3 border-t border-border/60 pt-5"
                                    >
                                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            {repeater.title}
                                        </h3>
                                        {records.map((row, index) => (
                                            <fieldset
                                                key={row.id}
                                                aria-label={`${repeater.singular} ${index + 1}`}
                                                className="rounded-lg border border-border/80 bg-muted/10 p-4"
                                            >
                                                <div className="mb-3 flex items-center justify-between">
                                                    <legend className="text-xs font-medium text-muted-foreground">
                                                        {repeater.title} ·{" "}
                                                        {index + 1}
                                                    </legend>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 px-2 text-muted-foreground hover:text-destructive"
                                                        aria-label={`Remove ${repeater.singular} ${index + 1}`}
                                                        onClick={() => {
                                                            const next = {
                                                                ...current,
                                                                [repeater.key]:
                                                                    records.filter(
                                                                        (
                                                                            item
                                                                        ) =>
                                                                            item.id !==
                                                                            row.id
                                                                    ),
                                                            };
                                                            if (
                                                                repeater.key ===
                                                                    "resumes" &&
                                                                current.default_resume_id ===
                                                                    row.id
                                                            ) {
                                                                next.default_resume_id =
                                                                    null;
                                                            }
                                                            setDraft(next);
                                                        }}
                                                    >
                                                        <Trash2 className="size-3.5" />
                                                    </Button>
                                                </div>
                                                <div className="grid gap-4 sm:grid-cols-2">
                                                    {repeater.fields.map(
                                                        (field) => (
                                                            <Field
                                                                key={field.key}
                                                                id={`${row.id}-${field.key}`}
                                                                spec={field}
                                                                value={
                                                                    row[
                                                                        field
                                                                            .key
                                                                    ]
                                                                }
                                                                options={
                                                                    options
                                                                }
                                                                change={(
                                                                    value
                                                                ) =>
                                                                    change(
                                                                        repeater.key,
                                                                        records.map(
                                                                            (
                                                                                item
                                                                            ) =>
                                                                                item.id ===
                                                                                row.id
                                                                                    ? {
                                                                                          ...item,
                                                                                          [field.key]:
                                                                                              value,
                                                                                      }
                                                                                    : item
                                                                        )
                                                                    )
                                                                }
                                                            />
                                                        )
                                                    )}
                                                </div>
                                                {(repeater.key ===
                                                    "employment_history" ||
                                                    repeater.key ===
                                                        "education") && (
                                                    <p className="mt-3 text-xs text-muted-foreground">
                                                        Save Career before
                                                        creating or managing
                                                        linked Dossier evidence.
                                                    </p>
                                                )}
                                            </fieldset>
                                        ))}
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="h-8 text-xs"
                                            onClick={() =>
                                                change(repeater.key, [
                                                    ...records,
                                                    {
                                                        id: crypto.randomUUID(),
                                                        ...(repeater.key ===
                                                            "employment_history" ||
                                                        repeater.key ===
                                                            "education"
                                                            ? {
                                                                  evidence_ids:
                                                                      [],
                                                              }
                                                            : {}),
                                                    },
                                                ])
                                            }
                                        >
                                            <Plus className="mr-1.5 size-3.5" />
                                            Add {repeater.singular}
                                        </Button>
                                    </div>
                                );
                            })}

                            {error && (
                                <p
                                    role="alert"
                                    className="text-xs text-destructive"
                                >
                                    {error}
                                </p>
                            )}

                            <div className="flex justify-end gap-2 border-t border-border/60 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setDraft(null);
                                        setError("");
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" size="sm">
                                    {busy ? "Saving…" : `Save ${spec.title}`}
                                </Button>
                            </div>
                        </fieldset>
                    </form>
                ) : (
                    <>
                        {spec.id === "contact" && (
                            <ContactSectionDisplay profile={profile} />
                        )}
                        {spec.id === "work" && (
                            <WorkSectionDisplay profile={profile} />
                        )}
                        {spec.id === "career" && (
                            <CareerSectionDisplay
                                profile={profile}
                                files={files}
                                onLinks={onLinks}
                            />
                        )}
                        {spec.id === "documents" && (
                            <DocumentsSectionDisplay profile={profile} />
                        )}
                    </>
                )}
            </div>
        </section>
    );
}

export function Profile() {
    const cache = useQueryClient();
    const profile = useQuery({
        queryKey: key,
        queryFn: () => profileApi.get(),
        retry: false,
        refetchOnWindowFocus: false,
    });
    const options = useQuery({
        queryKey: ["profile-options"],
        queryFn: () => profileApi.options(),
        retry: false,
    });
    const library = useQuery({
        queryKey: ["evidence-library"],
        queryFn: async () => {
            const [folders, files] = await Promise.all([
                evidenceApi.listFolders(),
                evidenceApi.listEvidence(),
            ]);
            return { folders, files };
        },
        retry: false,
        refetchOnWindowFocus: false,
    });

    const [linking, setLinking] = useState<{
        collection: CareerCollection;
        entry: ProfileRecord;
        mode: "attach" | "create";
    } | null>(null);
    const [ids, setIds] = useState<string[]>([]);
    const [folder, setFolder] = useState("");
    const [title, setTitle] = useState("");
    const [text, setText] = useState("");
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    const openLinks = (
        collection: CareerCollection,
        entry: ProfileRecord,
        mode: "attach" | "create"
    ) => {
        setLinking({ collection, entry, mode });
        setIds([...((entry.evidence_ids ?? []) as string[])]);
        setFolder("");
        setTitle("");
        setText("");
        setError("");
    };

    const saveLinks = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!linking) return;
        setBusy(true);
        setError("");
        try {
            const saved =
                linking.mode === "attach"
                    ? await profileApi.setEvidence(
                          linking.collection,
                          linking.entry.id,
                          ids
                      )
                    : await profileApi.createEvidence(
                          linking.collection,
                          linking.entry.id,
                          folder,
                          { title, text, use_for_matching: false }
                      );
            cache.setQueryData(key, saved);
            await cache.invalidateQueries({ queryKey: ["evidence-library"] });
            setLinking(null);
            toast.success("Evidence links saved");
        } catch (failure) {
            setError(message(failure));
        } finally {
            setBusy(false);
        }
    };

    if (profile.isPending) {
        return (
            <div role="status" className="space-y-4 py-2">
                <span className="sr-only">Loading profile…</span>
                {Array.from({ length: 3 }).map((_, idx) => (
                    <Skeleton
                        key={idx}
                        className="h-44 w-full rounded-xl"
                    />
                ))}
            </div>
        );
    }

    if (profile.isError) {
        return (
            <div
                role="alert"
                className="rounded-xl border border-border bg-card p-6 text-center"
            >
                <p className="text-sm text-destructive mb-3">
                    {message(profile.error)}
                </p>
                <Button size="sm" onClick={() => void profile.refetch()}>
                    Retry
                </Button>
            </div>
        );
    }

    const choices = options.data ?? { countries: [], timezones: [] };

    return (
        <div className="space-y-4 pb-6">
            {options.isError && (
                <div role="alert" className="text-xs text-destructive">
                    Could not load country/timezone options.{" "}
                    <button
                        className="underline"
                        onClick={() => void options.refetch()}
                    >
                        Retry options
                    </button>
                </div>
            )}

            <datalist id="profile-timezones">
                {choices.timezones.map((zone) => (
                    <option key={zone} value={zone} />
                ))}
            </datalist>

            {profileSections.map((spec) => (
                <Section
                    key={spec.id}
                    spec={spec}
                    profile={profile.data}
                    options={choices}
                    files={library.data?.files ?? []}
                    onLinks={openLinks}
                />
            ))}

            <Dialog
                open={!!linking}
                onOpenChange={(open) => {
                    if (!busy && !open) setLinking(null);
                }}
            >
                <DialogContent className="max-h-[85vh] overflow-auto">
                    <form onSubmit={(event) => void saveLinks(event)}>
                        <DialogHeader>
                            <DialogTitle className="text-base">
                                {linking?.mode === "create"
                                    ? "Create linked evidence"
                                    : "Manage linked evidence"}
                            </DialogTitle>
                        </DialogHeader>
                        <fieldset disabled={busy} className="mt-4 space-y-4">
                            {library.isPending ? (
                                <p className="text-xs text-muted-foreground">
                                    Loading evidence…
                                </p>
                            ) : library.isError ? (
                                <p role="alert" className="text-xs">
                                    {message(library.error)}{" "}
                                    <button
                                        type="button"
                                        className="underline"
                                        onClick={() => void library.refetch()}
                                    >
                                        Retry evidence
                                    </button>
                                </p>
                            ) : linking?.mode === "attach" ? (
                                <>
                                    <p className="text-xs text-muted-foreground">
                                        Select files to attach. Uncheck a file
                                        to detach it without deleting it.
                                    </p>
                                    {!library.data?.files.length && (
                                        <p className="text-xs">
                                            No evidence yet.{" "}
                                            <Link
                                                className="underline"
                                                to="/dossier"
                                            >
                                                Open Dossier
                                            </Link>
                                        </p>
                                    )}
                                    <div className="space-y-2">
                                        {library.data?.files.map((file) => (
                                            <label
                                                key={file.id}
                                                className="flex items-center gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/40 transition-colors"
                                            >
                                                <input
                                                    type="checkbox"
                                                    className="accent-primary"
                                                    checked={ids.includes(
                                                        file.id
                                                    )}
                                                    onChange={(event) =>
                                                        setIds(
                                                            event.target.checked
                                                                ? [
                                                                      ...ids,
                                                                      file.id,
                                                                  ]
                                                                : ids.filter(
                                                                      (id) =>
                                                                          id !==
                                                                          file.id
                                                                  )
                                                        )
                                                    }
                                                />
                                                <span className="min-w-0">
                                                    <span className="block text-xs font-medium truncate">
                                                        {file.title}
                                                    </span>
                                                    <span className="text-[11px] text-muted-foreground">
                                                        {file.folder_path}
                                                    </span>
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="space-y-1.5">
                                        <label
                                            htmlFor="linked-folder"
                                            className="text-xs font-medium"
                                        >
                                            Folder
                                        </label>
                                        <div className="relative">
                                            <select
                                                id="linked-folder"
                                                className={selectClass}
                                                value={folder}
                                                required
                                                onChange={(event) =>
                                                    setFolder(
                                                        event.target.value
                                                    )
                                                }
                                            >
                                                <option value="">
                                                    Select a folder
                                                </option>
                                                {library.data?.folders.map(
                                                    (item) => (
                                                        <option
                                                            key={item.path}
                                                            value={item.path}
                                                        >
                                                            {item.path}
                                                        </option>
                                                    )
                                                )}
                                            </select>
                                            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                        </div>
                                    </div>
                                    {!library.data?.folders.length && (
                                        <p className="text-xs">
                                            Create a folder in{" "}
                                            <Link
                                                className="underline"
                                                to="/dossier"
                                            >
                                                Dossier
                                            </Link>{" "}
                                            first. Your career record is already
                                            saved.
                                        </p>
                                    )}
                                    <label className="block space-y-1.5 text-xs font-medium">
                                        Evidence title
                                        <Input
                                            value={title}
                                            required
                                            onChange={(event) =>
                                                setTitle(event.target.value)
                                            }
                                        />
                                    </label>
                                    <label className="block space-y-1.5 text-xs font-medium">
                                        Evidence text
                                        <Textarea
                                            rows={6}
                                            value={text}
                                            required
                                            onChange={(event) =>
                                                setText(event.target.value)
                                            }
                                        />
                                    </label>
                                </>
                            )}
                            {error && (
                                <p
                                    role="alert"
                                    className="text-xs text-destructive"
                                >
                                    {error}
                                </p>
                            )}
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setLinking(null)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={
                                        library.isPending || library.isError
                                    }
                                >
                                    {busy
                                        ? "Saving…"
                                        : linking?.mode === "create"
                                          ? "Create & attach"
                                          : "Save links"}
                                </Button>
                            </DialogFooter>
                        </fieldset>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
