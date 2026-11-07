import { BaseApiClient } from "@/api/client";
import { mapApiJobToJob, mapApiMatchToWorkspaceMatch } from "@/api/mappers";
import {
    ApiJobResponse,
    ApiJobsResponse,
    ApiScrapeJobResponse,
    Job,
    WorkspaceMatch,
} from "@/lib/types";

export interface ListJobsParams {
    limit?: number;
    offset?: number;
}

export interface JobsPageResult {
    jobs: Job[];
    total: number;
    limit: number;
    offset: number;
}

export class JobsApi extends BaseApiClient {
    private readonly jobCache = new Map<string, Job>();

    public async list(params: ListJobsParams = {}): Promise<JobsPageResult> {
        const limit = params.limit ?? 50;
        const offset = params.offset ?? 0;

        const response = await this.request<ApiJobsResponse>("/api/jobs", {
            method: "GET",
            params: { limit, offset },
        });

        const jobs = response.jobs.map((dto) => {
            const mapped = mapApiJobToJob(dto);
            this.jobCache.set(mapped.id, mapped);
            return mapped;
        });

        return {
            jobs,
            total: response.total,
            limit: response.limit,
            offset: response.offset,
        };
    }

    public async getById(
        id: string,
        options: { forceRefresh?: boolean } = {}
    ): Promise<Job> {
        if (!options.forceRefresh && this.jobCache.has(id)) {
            return this.jobCache.get(id)!;
        }

        const dto = await this.request<ApiJobResponse>(
            `/api/jobs/${encodeURIComponent(id)}`,
            { method: "GET" }
        );
        const mapped = mapApiJobToJob(dto);
        this.jobCache.set(mapped.id, mapped);
        return mapped;
    }

    public getCached(id: string): Job | undefined {
        return this.jobCache.get(id);
    }

    public async scrapeExternal(url: string): Promise<{
        job: Job;
        match: WorkspaceMatch;
    }> {
        const response = await this.request<ApiScrapeJobResponse>(
            "/api/jobs/scrape",
            {
                method: "POST",
                body: { url },
            }
        );
        const job = mapApiJobToJob(response.job);
        const match = mapApiMatchToWorkspaceMatch(response.match);
        this.jobCache.set(job.id, job);
        return { job, match };
    }
}
