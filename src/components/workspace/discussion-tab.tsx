import { useState } from "react";
import {
    BotIcon,
    CheckCircle2Icon,
    FolderCheckIcon,
    SendIcon,
    SparklesIcon,
    UserIcon,
} from "lucide-react";
import { toast } from "sonner";
import { discussionApi } from "@/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    DiscussionState,
    WorkspaceMaterial,
    WorkspaceMessage,
} from "@/lib/types";

interface DiscussionTabProps {
    matchId: string;
    discussionState: DiscussionState;
    messages: WorkspaceMessage[];
    materials?: WorkspaceMaterial[];
    onUpdateDiscussion: (
        nextState: DiscussionState,
        updater: (prev: WorkspaceMessage[]) => WorkspaceMessage[]
    ) => void;
    onReloadDiscussion?: () => Promise<void>;
}

function MessageBubble({ message }: { message: WorkspaceMessage }) {
    const isUser = message.role === "user";
    const containerAlignment = isUser ? "justify-end" : "justify-start";
    const bubbleStyles = isUser
        ? "bg-primary text-primary-foreground"
        : "bg-muted/60 text-foreground border border-border";

    return (
        <div className={`flex gap-2.5 ${containerAlignment}`}>
            {!isUser && (
                <div className="size-7 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5 border border-border">
                    <BotIcon className="size-3.5 text-foreground" />
                </div>
            )}

            <div className="max-w-[82%] space-y-1">
                <div
                    className={`rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${bubbleStyles}`}
                >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                </div>

                <div className="flex items-center gap-2 px-1 text-[11px] text-muted-foreground">
                    <span>{message.createdAt}</span>
                    {message.isEvidence && (
                        <Badge
                            variant="outline"
                            className="h-4 px-1.5 text-[10px]"
                        >
                            <SparklesIcon className="size-2.5 mr-1" />
                            Added as Evidence
                        </Badge>
                    )}
                </div>
            </div>

            {isUser && (
                <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <UserIcon className="size-3.5 text-primary" />
                </div>
            )}
        </div>
    );
}

export function DiscussionTab({
    matchId,
    discussionState,
    messages,
    materials = [],
    onUpdateDiscussion,
    onReloadDiscussion,
}: DiscussionTabProps) {
    const [draftText, setDraftText] = useState("");
    const [useAsEvidence, setUseAsEvidence] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isFinishing, setIsFinishing] = useState(false);

    const isFinished = discussionState === "finished";

    const handleSend = async () => {
        const trimmed = draftText.trim();
        if (!trimmed || isSending || isFinished) return;

        const markedAsEvidence = useAsEvidence;
        setDraftText("");
        setUseAsEvidence(false);
        setIsSending(true);

        const provisionalAssistantId = `stream-assistant-${Date.now()}`;
        let currentState: DiscussionState = discussionState;

        try {
            // If discussion has not started yet, sending the first message automatically starts it
            if (currentState === "not_started") {
                await discussionApi.start(matchId);
                currentState = "open";
                onUpdateDiscussion("open", (prev) => prev);
            }

            let streamError: string | null = null;

            await discussionApi.streamMessage(matchId, trimmed, {
                onAccepted: (acceptedUserMsg) => {
                    const msgWithEvidence: WorkspaceMessage = {
                        ...acceptedUserMsg,
                        isEvidence: markedAsEvidence,
                    };
                    const placeholderAssistant: WorkspaceMessage = {
                        id: provisionalAssistantId,
                        role: "assistant",
                        content: "...",
                        createdAt: "Streaming...",
                        isStreaming: true,
                    };
                    onUpdateDiscussion(currentState, (prev) => [
                        ...prev,
                        msgWithEvidence,
                        placeholderAssistant,
                    ]);
                },
                onDelta: (deltaText) => {
                    onUpdateDiscussion(currentState, (prev) =>
                        prev.map((msg) => {
                            if (msg.id !== provisionalAssistantId) {
                                return msg;
                            }
                            const nextContent =
                                msg.content === "..."
                                    ? deltaText
                                    : msg.content + deltaText;
                            return {
                                ...msg,
                                content: nextContent,
                            };
                        })
                    );
                },
                onDone: (finalAssistantMsg) => {
                    onUpdateDiscussion(currentState, (prev) =>
                        prev.map((msg) =>
                            msg.id === provisionalAssistantId
                                ? finalAssistantMsg
                                : msg
                        )
                    );
                },
                onError: (detail) => {
                    streamError = detail;
                    onUpdateDiscussion(currentState, (prev) =>
                        prev.filter((msg) => msg.id !== provisionalAssistantId)
                    );
                },
            });

            if (streamError) {
                toast.error(streamError);
                if (onReloadDiscussion) {
                    await onReloadDiscussion();
                }
            }
        } catch (err) {
            onUpdateDiscussion(currentState, (prev) =>
                prev.filter((msg) => msg.id !== provisionalAssistantId)
            );
            toast.error(
                err instanceof Error
                    ? err.message
                    : "Failed to send discussion message"
            );
        } finally {
            setIsSending(false);
        }
    };

    const handleFinishDiscussion = async () => {
        if (discussionState !== "open" || isFinishing || isSending) return;
        setIsFinishing(true);
        try {
            await discussionApi.finish(matchId);
            onUpdateDiscussion("finished", (prev) => prev);
            toast.success("Discussion finished");
        } catch (err) {
            toast.error(
                err instanceof Error
                    ? err.message
                    : "Failed to finish discussion"
            );
        } finally {
            setIsFinishing(false);
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col gap-4 h-full">
            {/* Chat Transcript & Composer */}
            <Card className="flex-1 flex flex-col py-4 min-h-[420px]">
                <CardHeader className="pb-3 border-b border-border">
                    <div className="flex items-center justify-between gap-2">
                        <div>
                            <CardTitle className="text-sm font-medium">
                                Application Strategy Discussion
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Refine how your experience is framed or attach
                                extra context before generating your packet.
                            </CardDescription>
                        </div>

                        {discussionState === "open" && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-7 px-2.5 text-xs shrink-0"
                                disabled={isFinishing || isSending}
                                onClick={handleFinishDiscussion}
                            >
                                <CheckCircle2Icon className="size-3.5 mr-1" />
                                {isFinishing ? "Finishing..." : "Finish"}
                            </Button>
                        )}

                        {isFinished && (
                            <Badge variant="secondary" className="text-xs">
                                Finished
                            </Badge>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col justify-between gap-4 pt-4">
                    <div className="space-y-4 overflow-y-auto max-h-[340px] pr-1">
                        {messages.length > 0 ? (
                            messages.map((message) => (
                                <MessageBubble
                                    key={message.id}
                                    message={message}
                                />
                            ))
                        ) : (
                            <div className="py-12 text-center text-xs text-muted-foreground">
                                Send a message below to start discussing
                                strategy and evidence for this role.
                            </div>
                        )}
                    </div>

                    <div className="space-y-2.5 pt-2 border-t border-border">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="evidence-toggle"
                                    disabled={isFinished || isSending}
                                    checked={useAsEvidence}
                                    onCheckedChange={(checked) =>
                                        setUseAsEvidence(checked === true)
                                    }
                                />
                                <Label
                                    htmlFor="evidence-toggle"
                                    className="text-xs text-muted-foreground cursor-pointer"
                                >
                                    Use this message as confirmed evidence for
                                    generation
                                </Label>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Textarea
                                value={draftText}
                                disabled={isFinished || isSending}
                                onChange={(e) => setDraftText(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={
                                    isFinished
                                        ? "This discussion has been finished."
                                        : "Ask about role fit or add specific achievements to include..."
                                }
                                className="min-h-[68px] text-sm resize-none"
                            />
                            <Button
                                type="button"
                                size="icon"
                                className="h-[68px] w-10 shrink-0"
                                disabled={
                                    isFinished ||
                                    isSending ||
                                    !draftText.trim()
                                }
                                onClick={handleSend}
                            >
                                <SendIcon className="size-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Confirmed Profile Materials Strip (kept extensible for future evidence control) */}
            {materials.length > 0 && (
                <Card className="py-3">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FolderCheckIcon className="size-4 text-muted-foreground" />
                                <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    Grounded Profile Evidence (
                                    {materials.length})
                                </CardTitle>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-1.5">
                        {materials.map((mat) => (
                            <Badge
                                key={mat.id}
                                variant="secondary"
                                className="text-xs font-normal"
                                title={mat.excerpt}
                            >
                                {mat.title}
                            </Badge>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
