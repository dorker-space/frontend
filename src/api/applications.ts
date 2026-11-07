import { BaseApiClient } from "@/api/client";
import {
    ApiApplicationPatchInput,
    ApiApplicationResponse,
    ApiApplicationsResponse,
    ApiGenerationInput,
} from "@/lib/types";

export interface ListMatchApplicationsParams {
    limit?: number;
    offset?: number;
}

export class ApplicationsApi extends BaseApiClient {
    public async create(
        matchId: string,
        input: ApiGenerationInput
    ): Promise<ApiApplicationResponse> {
        return await this.request<ApiApplicationResponse>(
            `/api/matches/${encodeURIComponent(matchId)}/applications`,
            {
                method: "POST",
                body: input,
            }
        );
    }

    public async listByMatch(
        matchId: string,
        params: ListMatchApplicationsParams = {}
    ): Promise<ApiApplicationsResponse> {
        const limit = params.limit ?? 50;
        const offset = params.offset ?? 0;

        return await this.request<ApiApplicationsResponse>(
            `/api/matches/${encodeURIComponent(matchId)}/applications`,
            {
                method: "GET",
                params: { limit, offset },
            }
        );
    }

    public async getById(
        applicationId: number
    ): Promise<ApiApplicationResponse> {
        return await this.request<ApiApplicationResponse>(
            `/api/applications/${applicationId}`,
            { method: "GET" }
        );
    }

    public async update(
        applicationId: number,
        patch: ApiApplicationPatchInput
    ): Promise<ApiApplicationResponse> {
        return await this.request<ApiApplicationResponse>(
            `/api/applications/${applicationId}`,
            {
                method: "PATCH",
                body: patch,
            }
        );
    }

    public async regenerate(
        applicationId: number,
        input: ApiGenerationInput
    ): Promise<ApiApplicationResponse> {
        return await this.request<ApiApplicationResponse>(
            `/api/applications/${applicationId}/generation`,
            {
                method: "POST",
                body: input,
            }
        );
    }
}
