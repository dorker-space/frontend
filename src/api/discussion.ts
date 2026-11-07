import { BaseApiClient } from "@/api/client";
import { mapApiDiscussionMessage } from "@/api/mappers";
import {
    ApiDiscussionReplyResponse,
    ApiDiscussionResponse,
    ApiDiscussionStreamEvent,
    DiscussionState,
    WorkspaceMessage,
} from "@/lib/types";

export interface DiscussionSnapshot {
    state: DiscussionState;
    messages: WorkspaceMessage[];
}

export interface DiscussionReplyResult {
    userMessage: WorkspaceMessage;
    assistantMessage: WorkspaceMessage;
}

export interface DiscussionStreamHandlers {
    onAccepted?: (userMessage: WorkspaceMessage) => void;
    onDelta?: (deltaText: string) => void;
    onDone?: (assistantMessage: WorkspaceMessage) => void;
    onError?: (detail: string, saved: boolean) => void;
}

export class DiscussionApi extends BaseApiClient {
    public async get(matchId: string): Promise<DiscussionSnapshot> {
        const dto = await this.request<ApiDiscussionResponse>(
            `/api/matches/${encodeURIComponent(matchId)}/discussion`,
            { method: "GET" }
        );
        return {
            state: dto.state,
            messages: dto.messages.map(mapApiDiscussionMessage),
        };
    }

    public async start(matchId: string): Promise<void> {
        await this.request<void>(
            `/api/matches/${encodeURIComponent(matchId)}/discussion/start`,
            { method: "POST" }
        );
    }

    public async sendMessage(
        matchId: string,
        text: string
    ): Promise<DiscussionReplyResult> {
        const dto = await this.request<ApiDiscussionReplyResponse>(
            `/api/matches/${encodeURIComponent(matchId)}/discussion/messages`,
            {
                method: "POST",
                body: { text },
            }
        );
        return {
            userMessage: mapApiDiscussionMessage(dto.user_message),
            assistantMessage: mapApiDiscussionMessage(dto.assistant_message),
        };
    }

    public async streamMessage(
        matchId: string,
        text: string,
        handlers: DiscussionStreamHandlers
    ): Promise<void> {
        await this.requestNdjsonStream<ApiDiscussionStreamEvent>(
            `/api/matches/${encodeURIComponent(matchId)}/discussion/stream`,
            {
                method: "POST",
                body: { text },
            },
            (event) => {
                if (event.type === "accepted") {
                    handlers.onAccepted?.(
                        mapApiDiscussionMessage(event.message)
                    );
                } else if (event.type === "delta") {
                    handlers.onDelta?.(event.text);
                } else if (event.type === "done") {
                    handlers.onDone?.(mapApiDiscussionMessage(event.message));
                } else if (event.type === "error") {
                    handlers.onError?.(event.detail, event.saved);
                }
            }
        );
    }

    public async finish(matchId: string): Promise<void> {
        await this.request<void>(
            `/api/matches/${encodeURIComponent(matchId)}/discussion/finish`,
            { method: "POST" }
        );
    }
}
