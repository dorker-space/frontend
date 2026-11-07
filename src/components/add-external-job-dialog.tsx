import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LinkIcon, Loader2Icon, PlusIcon, SparklesIcon } from "lucide-react";
import { toast } from "sonner";
import { jobsApi, matchesApi } from "@/api";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Job, WorkspaceMatch } from "@/lib/types";

interface AddExternalJobDialogProps {
    trigger?: React.ReactNode;
    onSuccess?: (result: { job: Job; match: WorkspaceMatch }) => void;
}

export function AddExternalJobDialog({
    trigger,
    onSuccess,
}: AddExternalJobDialogProps) {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [jobUrl, setJobUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showLoginHint, setShowLoginHint] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isLoading) {
            setShowLoginHint(false);
            return;
        }
        const timer = window.setTimeout(() => {
            setShowLoginHint(true);
        }, 4000);
        return () => window.clearTimeout(timer);
    }, [isLoading]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        const trimmedUrl = jobUrl.trim();
        if (!trimmedUrl) {
            setError("Please enter a job link.");
            return;
        }

        try {
            const parsed = new URL(trimmedUrl);
            if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
                setError("URL must start with http:// or https://");
                return;
            }
        } catch {
            setError("Please enter a valid URL (e.g. https://...).");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const result = await jobsApi.scrapeExternal(trimmedUrl);
            matchesApi.cache(result.match);
            toast.success(
                `Scraped "${result.job.title}" (${result.match.suitabilityTier})`
            );
            setJobUrl("");
            setOpen(false);
            onSuccess?.(result);
            navigate(`/application/${encodeURIComponent(result.match.id)}`);
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Failed to scrape and classify the job link.";
            setError(message);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
                if (!isLoading) {
                    setOpen(nextOpen);
                    if (!nextOpen) {
                        setError(null);
                    }
                }
            }}
        >
            <DialogTrigger asChild>
                {trigger ?? (
                    <Button size="sm" variant="default">
                        <PlusIcon className="size-3.5 mr-1.5" />
                        Add External Job
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <SparklesIcon className="size-4 text-primary" />
                            Add External Job
                        </DialogTitle>
                        <DialogDescription>
                            Paste any job posting link. Dorker will scrape the
                            page, extract the job details, run Jev suitability
                            classification, and open the Application Workspace.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="external-job-url">Job Link</Label>
                            <div className="relative">
                                <LinkIcon className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <Input
                                    id="external-job-url"
                                    type="url"
                                    placeholder="https://jobs.ashbyhq.com/... or any career page URL"
                                    value={jobUrl}
                                    onChange={(event) => {
                                        setJobUrl(event.target.value);
                                        if (error) setError(null);
                                    }}
                                    disabled={isLoading}
                                    className="pl-9"
                                    autoFocus
                                    required
                                />
                            </div>
                            {error && (
                                <p className="text-xs text-destructive">
                                    {error}
                                </p>
                            )}
                            {isLoading && (
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                        <Loader2Icon className="size-3.5 animate-spin shrink-0" />
                                        Scraping job page and running Jev
                                        classification…
                                    </p>
                                    {showLoginHint && (
                                        <p className="text-xs text-amber-600 dark:text-amber-400">
                                            If a login tab opened in Brave, sign
                                            in there — Dorker will continue
                                            automatically once the job page
                                            loads.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading || !jobUrl.trim()}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2Icon className="size-4 mr-1.5 animate-spin" />
                                    Scraping…
                                </>
                            ) : (
                                <>
                                    <SparklesIcon className="size-4 mr-1.5" />
                                    Scrape & Analyse
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
