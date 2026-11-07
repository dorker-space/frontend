import { useState } from "react";
import {
    AlertTriangleIcon,
    BugIcon,
    CheckCircle2Icon,
    CompassIcon,
    CpuIcon,
    FileTextIcon,
    FlagIcon,
} from "lucide-react";
import { toast } from "sonner";
import { matchesApi } from "@/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { WorkspaceMatch } from "@/lib/types";

interface MatchTabProps {
    match: WorkspaceMatch;
}

interface ScoreCardProps {
    title: string;
    subtitle: string;
    score: number;
    icon: React.ComponentType<{ className?: string }>;
}

function ScoreCard({ title, subtitle, score, icon: Icon }: ScoreCardProps) {
    const percentage = Math.round(score * 100);

    return (
        <Card className="py-4">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-md bg-muted">
                            <Icon className="size-4 text-foreground" />
                        </div>
                        <CardTitle className="text-sm font-medium">
                            {title}
                        </CardTitle>
                    </div>
                    <Badge variant="secondary" className="text-xs font-semibold">
                        {percentage}%
                    </Badge>
                </div>
                <CardDescription className="text-xs">{subtitle}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </CardContent>
        </Card>
    );
}

export function MatchTab({ match }: MatchTabProps) {
    const [showReportForm, setShowReportForm] = useState(false);
    const [reportText, setReportText] = useState("");
    const [isSubmittingReport, setIsSubmittingReport] = useState(false);

    const [showDebug, setShowDebug] = useState(false);
    const [debugContent, setDebugContent] = useState<string | null>(null);
    const [isLoadingDebug, setIsLoadingDebug] = useState(false);

    const handleSubmitReport = async () => {
        const trimmed = reportText.trim();
        if (!trimmed) {
            toast.error("Enter a report description before submitting");
            return;
        }
        setIsSubmittingReport(true);
        try {
            await matchesApi.report(match.id, trimmed);
            setReportText("");
            setShowReportForm(false);
            toast.success("Match report submitted");
        } catch (err) {
            toast.error(
                err instanceof Error ? err.message : "Failed to submit report"
            );
        } finally {
            setIsSubmittingReport(false);
        }
    };

    const handleToggleDebug = async () => {
        if (showDebug) {
            setShowDebug(false);
            return;
        }
        setShowDebug(true);
        if (debugContent !== null) {
            return;
        }
        setIsLoadingDebug(true);
        try {
            const raw = await matchesApi.getDebug(match.id);
            setDebugContent(raw ?? "No debug output recorded for this match.");
        } catch (err) {
            toast.error(
                err instanceof Error ? err.message : "Failed to load debug data"
            );
            setShowDebug(false);
        } finally {
            setIsLoadingDebug(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Two-Axis Capability & Strategic Scores */}
            <div className="grid gap-4 sm:grid-cols-2">
                <ScoreCard
                    title="Technical Capability"
                    subtitle="Stack & architecture alignment"
                    score={match.technicalCapabilityScore}
                    icon={CpuIcon}
                />
                <ScoreCard
                    title="Strategic Value"
                    subtitle="Career & preference alignment"
                    score={match.strategicValueScore}
                    icon={CompassIcon}
                />
            </div>

            {/* Rejection Reason (if present) */}
            {match.rejectionReason && (
                <Card className="py-4 border-rose-500/30">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                            <AlertTriangleIcon className="size-4 text-rose-600" />
                            <CardTitle className="text-sm font-medium">
                                Rejection Reason
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {match.rejectionReason}
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Executive Summary */}
            <Card className="py-4">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <FileTextIcon className="size-4 text-muted-foreground" />
                            <CardTitle className="text-sm font-medium">
                                Position Fit Overview
                            </CardTitle>
                        </div>

                        <div className="flex items-center gap-1.5">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs text-muted-foreground"
                                onClick={handleToggleDebug}
                            >
                                <BugIcon className="size-3.5 mr-1" />
                                {showDebug ? "Hide Debug" : "Debug"}
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs text-muted-foreground"
                                onClick={() =>
                                    setShowReportForm((prev) => !prev)
                                }
                            >
                                <FlagIcon className="size-3.5 mr-1" />
                                Report
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {match.summary ||
                            "Summary analytics are not yet generated for this match."}
                    </p>
                </CardContent>
            </Card>

            {/* Report Match Issue Form */}
            {showReportForm && (
                <Card className="py-4">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                            Report Match Issue
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Flag inaccurate classification, broken job parsing,
                            or scoring anomalies
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Textarea
                            value={reportText}
                            onChange={(e) => setReportText(e.target.value)}
                            placeholder="Describe what is inaccurate about this match..."
                            className="min-h-[80px] text-sm"
                        />
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowReportForm(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                disabled={
                                    isSubmittingReport || !reportText.trim()
                                }
                                onClick={handleSubmitReport}
                            >
                                {isSubmittingReport
                                    ? "Submitting..."
                                    : "Submit Report"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Collapsible Debug Trace */}
            {showDebug && (
                <Card className="py-4">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                            Model Debug Output
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <pre className="text-xs font-mono bg-muted/50 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap max-h-64 overflow-y-auto">
                            {isLoadingDebug
                                ? "Loading debug trace..."
                                : debugContent}
                        </pre>
                    </CardContent>
                </Card>
            )}

            {/* Strengths / Pros */}
            {match.pros.length > 0 && (
                <Card className="py-4">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                            <CheckCircle2Icon className="size-4 text-emerald-600" />
                            <CardTitle className="text-sm font-medium">
                                Alignment & Strengths
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {match.pros.map((item, idx) => (
                                <li
                                    key={idx}
                                    className="flex items-start gap-2.5 text-sm text-muted-foreground"
                                >
                                    <span className="mt-1.5 size-1.5 rounded-full bg-emerald-600 shrink-0" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

            {/* Gaps / Watchouts */}
            {match.cons.length > 0 && (
                <Card className="py-4">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                            <AlertTriangleIcon className="size-4 text-amber-600" />
                            <CardTitle className="text-sm font-medium">
                                Risks & Framing Notes
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {match.cons.map((item, idx) => (
                                <li
                                    key={idx}
                                    className="flex items-start gap-2.5 text-sm text-muted-foreground"
                                >
                                    <span className="mt-1.5 size-1.5 rounded-full bg-amber-600 shrink-0" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
