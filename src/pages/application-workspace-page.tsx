import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
    AlertCircleIcon,
    ArrowLeftIcon,
    FileEditIcon,
    MessageSquareIcon,
    SparklesIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
    ApiError,
    applicationsApi,
    discussionApi,
    jobsApi,
    mapApiApplicationQuestions,
    matchesApi,
} from "@/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { DiscussionTab } from "@/components/workspace/discussion-tab";
import { DraftTab } from "@/components/workspace/draft-tab";
import { JobDescriptionPanel } from "@/components/workspace/job-description-panel";
import { MatchTab } from "@/components/workspace/match-tab";
import { WorkspaceHeader } from "@/components/workspace/workspace-header";
import {
    DiscussionState,
    formatPipelineStatus,
    Job,
    WorkspaceData,
    WorkspaceMatch,
    WorkspaceMessage,
    WorkspaceStatus,
} from "@/lib/types";

const UUID_PATTERN =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function WorkspaceLoadingSkeleton() {
    return (
        <div className="flex flex-col gap-4 p-4">
            <Skeleton className="h-16 w-full rounded-lg" />
            <div className="grid gap-4 lg:grid-cols-12">
                <div className="lg:col-span-7 space-y-4">
                    <Skeleton className="h-9 w-72 rounded-lg" />
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Skeleton className="h-28 w-full rounded-xl" />
                        <Skeleton className="h-28 w-full rounded-xl" />
                    </div>
                    <Skeleton className="h-36 w-full rounded-xl" />
                    <Skeleton className="h-48 w-full rounded-xl" />
                </div>
                <div className="lg:col-span-5">
                    <Skeleton className="h-[calc(100vh-160px)] w-full rounded-xl" />
                </div>
            </div>
        </div>
    );
}

function WorkspaceErrorView({ message }: { message: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <AlertCircleIcon className="size-10 text-destructive mb-3" />
            <h2 className="text-base font-semibold mb-1">
                Unable to Open Application Workspace
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mb-4">
                {message}
            </p>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                    <Link to="/applications">
                        <ArrowLeftIcon className="size-4 mr-1.5" />
                        Back to Applications
                    </Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                    <Link to="/jobs">All Jobs</Link>
                </Button>
            </div>
        </div>
    );
}

export function ApplicationWorkspacePage() {
    const { id: rawId } = useParams<{ id: string }>();
    const queryClient = useQueryClient();

    const [job, setJob] = useState<Job | null>(null);
    const [workspace, setWorkspace] = useState<WorkspaceData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!rawId) {
            setError("Missing workspace identifier in URL.");
            setIsLoading(false);
            return;
        }

        let isCancelled = false;

        async function loadWorkspace(paramId: string) {
            setIsLoading(true);
            setError(null);

            try {
                const decodedId = decodeURIComponent(paramId);
                let resolvedMatch: WorkspaceMatch;
                let resolvedJob: Job;

                async function resolveByJobId(
                    jobId: string
                ): Promise<{ match: WorkspaceMatch; job: Job }> {
                    const jobRecord = await jobsApi.getById(jobId);
                    try {
                        const matchRecord = await matchesApi.getByJobId(
                            jobRecord.id
                        );
                        return { match: matchRecord, job: jobRecord };
                    } catch {
                        const matchesPage = await matchesApi.list({
                            limit: 250,
                            offset: 0,
                        });
                        const found = matchesPage.matches.find(
                            (m) => m.jobId === jobRecord.id
                        );
                        if (!found) {
                            throw new Error(
                                `No evaluated match record found for job "${jobRecord.title}".`
                            );
                        }
                        return { match: found, job: jobRecord };
                    }
                }

                if (UUID_PATTERN.test(decodedId)) {
                    try {
                        resolvedMatch = await matchesApi.getById(decodedId);
                        resolvedJob = await jobsApi.getById(
                            resolvedMatch.jobId
                        );
                    } catch (err) {
                        if (err instanceof ApiError && err.status === 404) {
                            const fallback = await resolveByJobId(decodedId);
                            resolvedMatch = fallback.match;
                            resolvedJob = fallback.job;
                        } else {
                            throw err;
                        }
                    }
                } else {
                    const resolved = await resolveByJobId(decodedId);
                    resolvedMatch = resolved.match;
                    resolvedJob = resolved.job;
                }

                const [discussionResult, applicationsResult] =
                    await Promise.all([
                        discussionApi.get(resolvedMatch.id),
                        applicationsApi.listByMatch(resolvedMatch.id, {
                            limit: 10,
                            offset: 0,
                        }),
                    ]);

                if (isCancelled) return;

                const latestApp =
                    applicationsResult.applications.length > 0
                        ? applicationsResult.applications[0]
                        : null;

                setJob(resolvedJob);
                setWorkspace({
                    match: resolvedMatch,
                    discussionState: discussionResult.state,
                    messages: discussionResult.messages,
                    latestApplication: latestApp,
                    draft: {
                        coverLetter: latestApp?.cover_letter ?? "",
                        questions: latestApp
                            ? mapApiApplicationQuestions(
                                  latestApp.questions,
                                  latestApp.id
                              )
                            : [],
                        selectedMaterials: [],
                    },
                });
            } catch (err) {
                if (isCancelled) return;
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load application workspace"
                );
            } finally {
                if (!isCancelled) {
                    setIsLoading(false);
                }
            }
        }

        loadWorkspace(rawId);

        return () => {
            isCancelled = true;
        };
    }, [rawId]);

    const handleStatusChange = async (nextStatus: WorkspaceStatus) => {
        if (!workspace || isUpdatingStatus) return;

        const previousStatus = workspace.match.pipelineStatus;
        if (previousStatus === nextStatus) return;

        setIsUpdatingStatus(true);
        setWorkspace((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                match: {
                    ...prev.match,
                    pipelineStatus: nextStatus,
                },
            };
        });

        try {
            const confirmed = await matchesApi.updateStatus(
                workspace.match.id,
                nextStatus
            );
            setWorkspace((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    match: {
                        ...prev.match,
                        pipelineStatus: confirmed,
                    },
                };
            });
            void queryClient.invalidateQueries({ queryKey: ["matches"] });
            toast.success(
                `Application status updated to ${formatPipelineStatus(confirmed)}`
            );
        } catch (err) {
            setWorkspace((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    match: {
                        ...prev.match,
                        pipelineStatus: previousStatus,
                    },
                };
            });
            toast.error(
                err instanceof Error
                    ? err.message
                    : "Failed to update pipeline status"
            );
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const handleUpdateDiscussion = useCallback(
        (
            nextState: DiscussionState,
            updater: (prev: WorkspaceMessage[]) => WorkspaceMessage[]
        ) => {
            setWorkspace((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    discussionState: nextState,
                    messages: updater(prev.messages),
                };
            });
        },
        []
    );

    const handleReloadDiscussion = useCallback(async () => {
        if (!workspace) return;
        try {
            const snapshot = await discussionApi.get(workspace.match.id);
            setWorkspace((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    discussionState: snapshot.state,
                    messages: snapshot.messages,
                };
            });
        } catch {
            // Ignore reload errors
        }
    }, [workspace]);

    if (isLoading) {
        return <WorkspaceLoadingSkeleton />;
    }

    if (error || !job || !workspace) {
        return (
            <WorkspaceErrorView
                message={
                    error || "Could not load workspace data for this match."
                }
            />
        );
    }

    return (
        <div className="flex flex-col min-h-[calc(100vh-48px)]">
            <WorkspaceHeader
                job={job}
                tier={workspace.match.suitabilityTier}
                status={workspace.match.pipelineStatus}
                isUpdatingStatus={isUpdatingStatus}
                onStatusChange={handleStatusChange}
            />

            <div className="flex-1 p-4">
                <div className="grid gap-4 lg:grid-cols-12 items-start">
                    {/* Left Panel: Match, Discussion, Draft Tabs */}
                    <div className="lg:col-span-7 min-w-0">
                        <Tabs defaultValue="match" className="w-full">
                            <TabsList className="mb-3">
                                <TabsTrigger value="match" className="gap-1.5">
                                    <SparklesIcon className="size-3.5" />
                                    Match
                                </TabsTrigger>
                                <TabsTrigger
                                    value="discussion"
                                    className="gap-1.5"
                                >
                                    <MessageSquareIcon className="size-3.5" />
                                    Discussion
                                </TabsTrigger>
                                <TabsTrigger value="draft" className="gap-1.5">
                                    <FileEditIcon className="size-3.5" />
                                    Draft
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="match">
                                <MatchTab match={workspace.match} />
                            </TabsContent>

                            <TabsContent value="discussion">
                                <DiscussionTab
                                    matchId={workspace.match.id}
                                    discussionState={workspace.discussionState}
                                    messages={workspace.messages}
                                    materials={
                                        workspace.draft.selectedMaterials
                                    }
                                    onUpdateDiscussion={handleUpdateDiscussion}
                                    onReloadDiscussion={handleReloadDiscussion}
                                />
                            </TabsContent>

                            <TabsContent value="draft">
                                <DraftTab
                                    job={job}
                                    matchId={workspace.match.id}
                                    materials={
                                        workspace.draft.selectedMaterials
                                    }
                                    latestApplication={
                                        workspace.latestApplication
                                    }
                                />
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Right Panel: Real Job Description */}
                    <div className="lg:col-span-5 min-w-0 lg:sticky lg:top-4">
                        <JobDescriptionPanel job={job} />
                    </div>
                </div>
            </div>
        </div>
    );
}
