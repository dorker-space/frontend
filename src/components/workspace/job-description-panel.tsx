"use client";

import { useMemo } from "react";
import {
    BriefcaseIcon,
    CalendarIcon,
    FileTextIcon,
    GlobeIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Job } from "@/lib/types";

interface JobDescriptionPanelProps {
    job: Job;
}

/**
 * Converts HTML or raw text job descriptions from `dorker_db` into clean,
 * readable paragraphs without raw HTML tags.
 */
function formatDescriptionParagraphs(rawDescription: string | undefined): string[] {
    if (!rawDescription || !rawDescription.trim()) {
        return ["No description available for this position in the database."];
    }

    const withLineBreaks = rawDescription
        .replace(/<\/(p|div|h[1-6]|li|tr|section|article)>/gi, "\n")
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<li[^>]*>/gi, "• ")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/&lt;/gi, "<")
        .replace(/&gt;/gi, ">")
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'");

    return withLineBreaks
        .split(/\n+/)
        .map((line) => line.replace(/\s+/g, " ").trim())
        .filter((line) => line.length > 0);
}

export function JobDescriptionPanel({ job }: JobDescriptionPanelProps) {
    const paragraphs = useMemo(
        () => formatDescriptionParagraphs(job.description),
        [job.description]
    );

    const postedDateLabel = job.postedAt
        ? new Date(job.postedAt).toLocaleDateString()
        : null;

    return (
        <Card className="h-full flex flex-col py-4">
            <CardHeader className="pb-3 border-b border-border">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                        <FileTextIcon className="size-4 text-muted-foreground" />
                        <CardTitle className="text-sm font-medium">
                            Job Description
                        </CardTitle>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                        {job.atsType && (
                            <Badge variant="secondary" className="text-[11px] uppercase">
                                <GlobeIcon className="size-3 mr-1" />
                                {job.atsType}
                            </Badge>
                        )}
                        {job.employmentType && (
                            <Badge variant="outline" className="text-[11px]">
                                <BriefcaseIcon className="size-3 mr-1" />
                                {job.employmentType}
                            </Badge>
                        )}
                        {postedDateLabel && (
                            <Badge variant="outline" className="text-[11px]">
                                <CalendarIcon className="size-3 mr-1" />
                                {postedDateLabel}
                            </Badge>
                        )}
                    </div>
                </div>
                <CardDescription className="text-xs">
                    Loaded directly from dorker_db ({job.id})
                </CardDescription>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto pt-4 max-h-[calc(100vh-230px)]">
                <div className="space-y-3 text-sm text-foreground/90 leading-relaxed">
                    {paragraphs.map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
