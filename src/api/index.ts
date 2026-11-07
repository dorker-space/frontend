import { ApplicationsApi } from "@/api/applications";
import { DiscussionApi } from "@/api/discussion";
import { DossierApi } from "@/api/dossier";
import { JobsApi } from "@/api/jobs";
import { MatchesApi } from "@/api/matches";

export { ApiError, BaseApiClient } from "@/api/client";
export type { QueryParamValue, QueryParamsRecord, RequestOptions } from "@/api/client";
export { JobsApi } from "@/api/jobs";
export type { JobsPageResult, ListJobsParams } from "@/api/jobs";
export { MatchesApi } from "@/api/matches";
export type { ListMatchesParams, MatchesPageResult } from "@/api/matches";
export { DiscussionApi } from "@/api/discussion";
export type {
    DiscussionReplyResult,
    DiscussionSnapshot,
    DiscussionStreamHandlers,
} from "@/api/discussion";
export { ApplicationsApi } from "@/api/applications";
export type { ListMatchApplicationsParams } from "@/api/applications";
export {
    DossierApi,
    getDescendantFolderIds,
    getFolderPath,
    getFolderPathSegments,
} from "@/api/dossier";
export * from "@/api/mappers";

export const jobsApi = new JobsApi();
export const matchesApi = new MatchesApi();
export const discussionApi = new DiscussionApi();
export const applicationsApi = new ApplicationsApi();
export const dossierApi = new DossierApi();
