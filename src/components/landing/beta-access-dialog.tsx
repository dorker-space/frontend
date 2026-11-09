import { useState, type ReactNode } from "react";
import {
    ArrowUpRightIcon,
    CheckIcon,
    CopyIcon,
    GithubIcon,
    KeyRoundIcon,
    MailIcon,
    MessageSquareTextIcon,
    SparklesIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    BETA_EMAIL,
    BETA_MAILTO_URL,
    PROJECT_URL,
    STORY_URL,
} from "@/components/landing/links";
import { getRealAppUrl } from "@/lib/app-mode";

interface BetaAccessDialogProps {
    trigger: ReactNode;
    onOpenRealApp?: () => void;
}

export function BetaAccessDialog({
    trigger,
    onOpenRealApp,
}: BetaAccessDialogProps) {
    const [copied, setCopied] = useState(false);

    const handleCopyEmail = async () => {
        try {
            await navigator.clipboard.writeText(BETA_EMAIL);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        } catch {
            // Ignore clipboard errors
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-1">
                        <Badge
                            variant="outline"
                            className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 text-[11px]"
                        >
                            <SparklesIcon className="size-3 mr-1" />
                            Private Beta · app.dorker.space
                        </Badge>
                    </div>
                    <DialogTitle className="text-lg">
                        Request Beta Test Access
                    </DialogTitle>
                    <DialogDescription className="text-xs leading-relaxed">
                        Dorker is under active development. Because the live
                        instance runs multi-ATS scrapers,{" "}
                        <code className="font-mono text-foreground">
                            pgvector
                        </code>{" "}
                        indexing, and{" "}
                        <code className="font-mono text-foreground">Jev</code>{" "}
                        model inference per candidate dossier, access to{" "}
                        <span className="font-medium text-foreground">
                            app.dorker.space
                        </span>{" "}
                        is currently provisioned for approved beta testers.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 pt-1">
                    {/* Option 1: LinkedIn */}
                    <a
                        href={STORY_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/20 p-3.5 hover:bg-muted/50 transition-colors group"
                    >
                        <div className="flex items-start gap-3">
                            <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-2 text-blue-600 dark:text-blue-400 mt-0.5">
                                <MessageSquareTextIcon className="size-4" />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-foreground flex items-center gap-1.5">
                                    Reach out via LinkedIn
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Comment on the building story or DM Serafym
                                    with your stack and target roles.
                                </p>
                            </div>
                        </div>
                        <ArrowUpRightIcon className="size-4 text-muted-foreground group-hover:text-foreground shrink-0" />
                    </a>

                    {/* Option 2: Direct Email */}
                    <div className="rounded-xl border border-border bg-muted/20 p-3.5 space-y-2.5">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                                <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2 text-emerald-600 dark:text-emerald-400 mt-0.5">
                                    <MailIcon className="size-4" />
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-foreground">
                                        Email for Beta Onboarding
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                                        {BETA_EMAIL}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-7 px-2.5 text-xs"
                                    onClick={handleCopyEmail}
                                >
                                    {copied ? (
                                        <CheckIcon className="size-3.5 mr-1 text-emerald-500" />
                                    ) : (
                                        <CopyIcon className="size-3.5 mr-1" />
                                    )}
                                    {copied ? "Copied" : "Copy"}
                                </Button>
                                <Button size="sm" className="h-7 px-2.5 text-xs" asChild>
                                    <a href={BETA_MAILTO_URL}>
                                        Send Request
                                        <ArrowUpRightIcon className="size-3.5 ml-1" />
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Option 3: Self-Host / GitHub */}
                    <a
                        href={PROJECT_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/20 p-3.5 hover:bg-muted/50 transition-colors group"
                    >
                        <div className="flex items-start gap-3">
                            <div className="rounded-lg bg-muted border border-border p-2 text-foreground mt-0.5">
                                <GithubIcon className="size-4" />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-foreground">
                                    Self-Host Open Source or Open an Issue
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Clone the repository to run the Python +
                                    PostgreSQL pipeline locally or follow
                                    development.
                                </p>
                            </div>
                        </div>
                        <ArrowUpRightIcon className="size-4 text-muted-foreground group-hover:text-foreground shrink-0" />
                    </a>

                    {/* Footer: Already approved beta tester */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 mt-1">
                        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <KeyRoundIcon className="size-3.5" />
                            Already have approved beta access?
                        </span>
                        {onOpenRealApp ? (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={onOpenRealApp}
                            >
                                Open app.dorker.space
                                <ArrowUpRightIcon className="size-3.5 ml-1" />
                            </Button>
                        ) : (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
                                asChild
                            >
                                <a href={getRealAppUrl("/matches")}>
                                    Open app.dorker.space
                                    <ArrowUpRightIcon className="size-3.5 ml-1" />
                                </a>
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
