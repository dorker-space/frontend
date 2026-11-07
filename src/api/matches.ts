import { BaseApiClient } from "@/api/client";
import { mapApiMatchToWorkspaceMatch } from "@/api/mappers";
import {
    ApiMatchDebugResponse,
    ApiMatchesResponse,
    ApiMatchResponse,
    SuitabilityTier,
    WorkspaceMatch,
    WorkspaceStatus,
} from "@/lib/types";

export interface ListMatchesParams {
    limit?: number;
    offset?: number;
    tiers?: SuitabilityTier[];
    pipelineStatus?: WorkspaceStatus[];
}

export interface MatchesPageResult {
    matches: WorkspaceMatch[];
    total: number;
    limit: number;
    offset: number;
}

export class MatchesApi extends BaseApiClient {
    private readonly matchCache = new Map<string, WorkspaceMatch>();
    private readonly matchIdByJobId = new Map<string, string>();

    private cacheMatch(match: WorkspaceMatch): WorkspaceMatch {
        this.matchCache.set(match.id, match);
        this.matchIdByJobId.set(match.jobId, match.id);
        return match;
    }

    public async list(
        params: ListMatchesParams = {}
    ): Promise<MatchesPageResult> {
        const limit = params.limit ?? 50;
        const offset = params.offset ?? 0;

        const response = await this.request<ApiMatchesResponse>(
            "/api/matches",
            {
                method: "GET",
                params: {
                    limit,
                    offset,
                    tiers:
                        params.tiers && params.tiers.length > 0
                            ? params.tiers
                            : undefined,
                    pipeline_status:
                        params.pipelineStatus &&
                        params.pipelineStatus.length > 0
                            ? params.pipelineStatus
                            : undefined,
                },
            }
        );

        const matches = response.matches.map((dto) =>
            this.cacheMatch(mapApiMatchToWorkspaceMatch(dto))
        );

        return {
            matches,
            total: response.total,
            limit: response.limit,
            offset: response.offset,
        };
    }

    public async getCounts(
        pipelineStatus?: WorkspaceStatus[]
    ): Promise<Record<SuitabilityTier, number>> {
        return await this.request<Record<SuitabilityTier, number>>(
            "/api/matches/counts",
            {
                method: "GET",
                params: {
                    pipeline_status:
                        pipelineStatus && pipelineStatus.length > 0
                            ? pipelineStatus
                            : undefined,
                },
            }
        );
    }

    public async getById(
        id: string,
        options: { forceRefresh?: boolean } = {}
    ): Promise<WorkspaceMatch> {
        if (!options.forceRefresh && this.matchCache.has(id)) {
            return this.matchCache.get(id)!;
        }

        const dto = await this.request<ApiMatchResponse>(
            `/api/matches/${encodeURIComponent(id)}`,
            { method: "GET" }
        );
        return this.cacheMatch(mapApiMatchToWorkspaceMatch(dto));
    }

    public getCached(id: string): WorkspaceMatch | undefined {
        return this.matchCache.get(id);
    }

    public cache(match: WorkspaceMatch): WorkspaceMatch {
        return this.cacheMatch(match);
    }

    public getCachedByJobId(jobId: string): WorkspaceMatch | undefined {
        const matchId = this.matchIdByJobId.get(jobId);
        return matchId ? this.matchCache.get(matchId) : undefined;
    }

    public async getByJobId(
        jobId: string,
        options: { forceRefresh?: boolean } = {}
    ): Promise<WorkspaceMatch> {
        if (!options.forceRefresh) {
            const cached = this.getCachedByJobId(jobId);
            if (cached) {
                return cached;
            }
        }

        const dto = await this.request<ApiMatchResponse>(
            `/api/matches/by-job/${encodeURIComponent(jobId)}`,
            { method: "GET" }
        );
        return this.cacheMatch(mapApiMatchToWorkspaceMatch(dto));
    }

    public async getDebug(id: string): Promise<string | null> {
        const response = await this.request<ApiMatchDebugResponse>(
            `/api/matches/${encodeURIComponent(id)}/debug`,
            { method: "GET" }
        );
        return response.debug;
    }

    public async report(id: string, text: string): Promise<void> {
        await this.request<void>(
            `/api/matches/${encodeURIComponent(id)}/reports`,
            {
                method: "POST",
                body: { text },
            }
        );
    }

    public async updateStatus(
        id: string,
        status: WorkspaceStatus
    ): Promise<WorkspaceStatus> {
        const response = await this.request<{ status: WorkspaceStatus }>(
            `/api/matches/${encodeURIComponent(id)}/status`,
            {
                method: "PATCH",
                body: { status },
            }
        );
        const existing = this.matchCache.get(id);
        if (existing) {
            this.matchCache.set(id, {
                ...existing,
                pipelineStatus: response.status,
            });
        }
        return response.status;
    }
}
