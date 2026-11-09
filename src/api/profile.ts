import { BaseApiClient } from "@/api/client";
import type { EvidenceContent } from "@/api/evidence";

export interface ProfileRecord {
    id: string;
    [key: string]: unknown;
}
export interface CareerRecord extends ProfileRecord { evidence_ids: string[] }
export interface ResumeRecord extends ProfileRecord { label: string; url: string }
export interface UserProfile {
    id: number;
    name: string | null;
    profile_links: string[];
    first_name: string | null;
    last_name: string | null;
    preferred_name: string | null;
    email: string | null;
    phone: string | null;
    residence_country: string | null;
    residence_region: string | null;
    residence_city: string | null;
    timezone: string | null;
    linkedin_url: string | null;
    github_url: string | null;
    portfolio_url: string | null;
    desired_role_titles: string[];
    employment_types: string[];
    work_arrangements: string[];
    preferred_work_locations: string[];
    willing_to_relocate: boolean | null;
    relocation_destinations: string[];
    willing_to_travel: boolean | null;
    notice_period_days: number | null;
    availability: "immediately" | "from_date" | null;
    earliest_start_date: string | null;
    professional_headline: string | null;
    professional_summary: string | null;
    skills: string[];
    employment_history: CareerRecord[];
    education: CareerRecord[];
    languages: ProfileRecord[];
    work_authorizations: ProfileRecord[];
    compensation_expectations: ProfileRecord[];
    resumes: ResumeRecord[];
    default_resume_id: string | null;
    created_at: string;
    updated_at: string;
}
export type ProfilePatch = Partial<Omit<UserProfile, "id" | "created_at" | "updated_at">>;
export type CareerCollection = "employment_history" | "education";
export class ProfileApi extends BaseApiClient {
    get() { return this.request<UserProfile>("/api/profile"); }
    options() { return this.request<{ countries: string[]; timezones: string[] }>("/api/profile/options"); }
    patch(body: ProfilePatch) { return this.request<UserProfile>("/api/profile", { method: "PATCH", body }); }
    setEvidence(collection: CareerCollection, id: string, evidence_ids: string[]) {
        return this.request<UserProfile>(`/api/profile/${collection}/${encodeURIComponent(id)}/evidence-links`, { method: "PATCH", body: { evidence_ids } });
    }
    createEvidence(collection: CareerCollection, id: string, folder_path: string, content: EvidenceContent) {
        return this.request<UserProfile>(`/api/profile/${collection}/${encodeURIComponent(id)}/evidence`, { method: "POST", body: { folder_path, ...content } });
    }
}
export const profileApi = new ProfileApi();
