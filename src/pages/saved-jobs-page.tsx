import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    ArrowRightIcon,
    BookmarkIcon,
    BuildingIcon,
    ExternalLinkIcon,
    MapPinIcon,
    SparklesIcon,
    TrashIcon,
} from "lucide-react";
import { toast } from "sonner";
import { AddExternalJobDialog } from "@/components/add-external-job-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    createApplicationItem,
    fetchSavedJobsList,
    removeSavedJobItem,
} from "@/lib/api";

export function SavedJobsPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: savedJobs = [], isLoading } = useQuery({
        queryKey: ["saved-jobs"],
        queryFn: fetchSavedJobsList,
    });

    const removeMutation = useMutation({
        mutationFn: removeSavedJobItem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["saved-jobs"] });
            toast.success("Removed from saved jobs");
        },
    });

    const startWorkspaceMutation = useMutation({
        mutationFn: createApplicationItem,
        onSuccess: (app) => {
            queryClient.invalidateQueries({ queryKey: ["applications"] });
            navigate(`/application/${encodeURIComponent(app.jobId)}`);
        },
    });

    if (isLoading) {
        return (
            <div className="flex flex-col gap-4 p-4">
                <Skeleton className="h-12 w-full rounded-lg" />
                <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <Skeleton
                            key={index}
                            className="h-24 w-full rounded-xl"
                        />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 p-4">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
                <div>
                    <h1 className="text-lg font-medium">Saved Jobs</h1>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {savedJobs.length} bookmarked positions ready for
                        evaluation and drafting
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <AddExternalJobDialog />
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate("/jobs")}
                    >
                        Browse More Jobs
                    </Button>
                </div>
            </div>

            {savedJobs.length > 0 ? (
                <div className="space-y-3">
                    {savedJobs.map((saved) => {
                        const job = saved.job;
                        const title = job?.title || "Saved Position";
                        const company = job?.company || "Company";
                        const location = job?.location || "Remote";

                        return (
                            <Card
                                key={saved.id}
                                className="py-4 hover:bg-muted/20 transition-colors"
                            >
                                <CardContent className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="space-y-1.5 min-w-0 flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Link
                                                to={`/application/${encodeURIComponent(saved.jobId)}`}
                                                className="font-semibold text-sm hover:underline truncate"
                                            >
                                                {title}
                                            </Link>
                                            <Badge
                                                variant="secondary"
                                                className="text-xs capitalize"
                                            >
                                                {saved.status}
                                            </Badge>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                            <span className="inline-flex items-center gap-1 font-medium text-foreground/80">
                                                <BuildingIcon className="size-3" />
                                                {company}
                                            </span>
                                            <span className="inline-flex items-center gap-1">
                                                <MapPinIcon className="size-3" />
                                                {location}
                                            </span>
                                        </div>

                                        {saved.notes && (
                                            <p className="text-xs text-muted-foreground pt-0.5">
                                                {saved.notes}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        {job?.link && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                asChild
                                            >
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

                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                startWorkspaceMutation.mutate(
                                                    saved.jobId
                                                )
                                            }
                                        >
                                            <SparklesIcon className="size-3.5 mr-1.5" />
                                            Open Workspace
                                            <ArrowRightIcon className="size-3.5 ml-1" />
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-8 text-muted-foreground hover:text-destructive"
                                            onClick={() =>
                                                removeMutation.mutate(saved.id)
                                            }
                                        >
                                            <TrashIcon className="size-3.5" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-12">
                    <BookmarkIcon className="size-8 text-muted-foreground mx-auto mb-2" />
                    <h3 className="text-base font-medium mb-1">
                        No Saved Jobs
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Bookmark roles on the All Jobs tab to shortlist them for
                        deep evaluation.
                    </p>
                    <Button size="sm" onClick={() => navigate("/jobs")}>
                        Browse All Jobs
                    </Button>
                </div>
            )}
        </div>
    );
}
