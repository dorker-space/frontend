export interface Company {
    id: number;
    ats: string;
    slug: string;
    name?: string | null;
    url?: string | null;
    tier?: number | null;
    isActive?: boolean;
    lastAttemptAt?: Date | string | null;
    lastSuccessAt?: Date | string | null;
    lastScrapeDurationMs?: number | null;
    consecutiveErrors?: number;
    lastErrorMessage?: string | null;
    lastJobCount?: number;
    consecutiveZeroJobs?: number;
}

export interface Job {
    id: string;
    atsType?: string;
    atsId?: string;
    url?: string;
    applyUrl?: string | null;
    link: string;
    title: string;
    companyId?: number;
    company: string;
    location?: string;
    countryIso?: string | null;
    region?: string | null;
    description?: string;
    questions?: string[];
    employmentType?: string;
    employment_type?: string;
    industry?: string;
    salaryMin?: number | null;
    salaryMax?: number | null;
    salaryCurrency?: string;
    isNormalized?: boolean;
    postedAt?: Date | string | null;
    fetchedAt?: Date | string | null;
    deletedAt?: Date | string | null;
    createdAt?: Date | string;
    source?: string;
}

export interface SavedJob {
    id: string;
    userId: string;
    jobId: string;
    notes?: string;
    status: "interested" | "applied" | "interview" | "rejected" | "offer";
    createdAt: Date;
    updatedAt: Date;
    job?: Job;
}

export interface Application {
    id: string;
    userId: string;
    jobId: string;
    taskId: string;
    createdAt: Date;
    updatedAt: Date;
    job?: Job;
}

// --- Application Workspace & Litestar API Domain Types ----------------------

export type SuitabilityTier = "SUITABLE" | "STRETCH" | "RUNWAY" | "REJECTED";

export type WorkspaceStatus =
    | "PENDING"
    | "APPLIED"
    | "GHOSTED"
    | "INTERVIEWING"
    | "REJECTED_EARLY"
    | "REJECTED_LATE"
    | "DECLINED"
    | "OFFER"
    | "IGNORED"
    | "SKIPPED";

export const ALL_PIPELINE_STATUSES: WorkspaceStatus[] = [
    "PENDING",
    "APPLIED",
    "INTERVIEWING",
    "OFFER",
    "GHOSTED",
    "SKIPPED",
    "DECLINED",
    "IGNORED",
    "REJECTED_EARLY",
    "REJECTED_LATE",
];

export const NON_PENDING_STATUSES: WorkspaceStatus[] =
    ALL_PIPELINE_STATUSES.filter((status) => status !== "PENDING");

const PIPELINE_STATUS_LABELS: Record<WorkspaceStatus, string> = {
    PENDING: "Pending",
    APPLIED: "Applied",
    GHOSTED: "Ghosted",
    INTERVIEWING: "Interviewing",
    REJECTED_EARLY: "Rejected Early",
    REJECTED_LATE: "Rejected Late",
    DECLINED: "Declined",
    OFFER: "Offer",
    IGNORED: "Ignored",
    SKIPPED: "Skipped",
};

export function formatPipelineStatus(status: WorkspaceStatus | string): string {
    if (status in PIPELINE_STATUS_LABELS) {
        return PIPELINE_STATUS_LABELS[status as WorkspaceStatus];
    }
    return status
        .toLowerCase()
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

export type DiscussionState = "not_started" | "open" | "finished";

export type GenerationKind = "both" | "letter" | "questions";

// --- Raw Litestar Wire Contracts (dorker/src/api/models.py) -----------------

export interface ApiJobResponse {
    id: string;
    title: string;
    company: string | null;
    location: string | null;
    description: string;
    url: string;
    apply_url: string | null;
    ats_type: string;
    employment_type: string | null;
    questions: string[];
    salary_min: number | null;
    salary_max: number | null;
    salary_currency: string | null;
    posted_at: string | null;
    fetched_at: string | null;
}

export interface ApiJobsResponse {
    jobs: ApiJobResponse[];
    total: number;
    limit: number;
    offset: number;
}

export interface ApiMatchAnalytics {
    summary: string;
    pros: string[];
    cons: string[];
}

export interface ApiMatchResponse {
    id: string;
    job_id: string;
    suitability_tier: SuitabilityTier;
    pipeline_status: WorkspaceStatus;
    technical_capability_score: number;
    strategic_value_score: number;
    analytics: ApiMatchAnalytics | null;
    rejection_reason: string | null;
    created_at: string;
    updated_at?: string | null;
}

export interface ApiMatchesResponse {
    matches: ApiMatchResponse[];
    total: number;
    limit: number;
    offset: number;
}

export interface ApiMatchDebugResponse {
    debug: string | null;
}

export interface ApiScrapeJobResponse {
    job: ApiJobResponse;
    match: ApiMatchResponse;
}

export interface ApiDiscussionMessageResponse {
    id: string;
    role: "user" | "assistant";
    content: string;
    created_at: string;
}

export interface ApiDiscussionResponse {
    state: DiscussionState;
    messages: ApiDiscussionMessageResponse[];
}

export interface ApiDiscussionReplyResponse {
    user_message: ApiDiscussionMessageResponse;
    assistant_message: ApiDiscussionMessageResponse;
}

export interface ApiDiscussionAcceptedEvent {
    type: "accepted";
    message: ApiDiscussionMessageResponse;
}

export interface ApiDiscussionDeltaEvent {
    type: "delta";
    text: string;
}

export interface ApiDiscussionDoneEvent {
    type: "done";
    message: ApiDiscussionMessageResponse;
}

export interface ApiDiscussionErrorEvent {
    type: "error";
    detail: string;
    saved: boolean;
}

export type ApiDiscussionStreamEvent =
    | ApiDiscussionAcceptedEvent
    | ApiDiscussionDeltaEvent
    | ApiDiscussionDoneEvent
    | ApiDiscussionErrorEvent;

export interface ApiGenerationInput {
    generate_cover_letter: boolean;
    generate_answers: boolean;
    questions: string[];
}

export interface ApiApplicationQuestionResponse {
    question: string;
    answer: string | null;
}

export interface ApiApplicationResponse {
    id: number;
    match_id: string;
    job_id: string;
    cover_letter: string | null;
    questions: ApiApplicationQuestionResponse[];
    created_at: string;
    updated_at: string | null;
}

export interface ApiApplicationsResponse {
    applications: ApiApplicationResponse[];
    total: number;
    limit: number;
    offset: number;
}

export interface ApiApplicationPatchInput {
    cover_letter?: string | null;
    questions?: ApiApplicationQuestionResponse[];
}

// --- Frontend Workspace Models ----------------------------------------------

export interface WorkspaceMatch {
    id: string;
    jobId: string;
    suitabilityTier: SuitabilityTier;
    pipelineStatus: WorkspaceStatus;
    technicalCapabilityScore: number;
    strategicValueScore: number;
    summary: string;
    pros: string[];
    cons: string[];
    hasAnalytics: boolean;
    rejectionReason: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface MatchWithJob {
    match: WorkspaceMatch;
    job: Job | null;
}

export interface WorkspaceMaterial {
    id: string;
    title: string;
    category: string;
    excerpt: string;
}

export interface WorkspaceMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    createdAt: string;
    isEvidence?: boolean;
    isStreaming?: boolean;
}

export interface WorkspaceQuestion {
    id: string;
    question: string;
    answer: string;
}

export interface WorkspaceDraft {
    coverLetter: string;
    questions: WorkspaceQuestion[];
    selectedMaterials: WorkspaceMaterial[];
}

export interface WorkspaceData {
    match: WorkspaceMatch;
    discussionState: DiscussionState;
    messages: WorkspaceMessage[];
    draft: WorkspaceDraft;
    latestApplication: ApiApplicationResponse | null;
}

export interface GenerationRequestPayload {
    matchId: string;
    coverLetterRequired: boolean;
    questionsRequired: boolean;
    questions: string[];
}

export interface PersistedDraftState {
    applicationId: number | null;
    updatedAt: string | null;
    coverLetterRequired: boolean;
    questionsRequired: boolean;
    questionInputs: string[];
    generatedCoverLetter: string | null;
    generatedQuestions: WorkspaceQuestion[];
}

// --- Candidate Profile Types ------------------------------------------------

export interface ProfileExperience {
    title: string;
    company: string;
    location?: string;
    startDate: string;
    endDate?: string;
    current?: boolean;
    description?: string;
}

export interface ProfileEducation {
    degree: string;
    field?: string;
    institution: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    gpa?: string;
}

export interface ProfileLanguage {
    language: string;
    proficiency: string;
}

export interface ProfileData {
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    location?: string;
    nationality?: string;
    gender?: string;
    summary?: string;
    skills: string[];
    experience: ProfileExperience[];
    education: ProfileEducation[];
    languages: ProfileLanguage[];
    linkedinUrl?: string;
    portfolioUrl?: string;
    githubUrl?: string;
    otherUrl?: string;
    willingToRelocate?: boolean;
    requiresEuVisa?: boolean;
    requiresUsVisa?: boolean;
    requiresUkVisa?: boolean;
    requiresChVisa?: boolean;
    requiresCaVisa?: boolean;
    requiresOtherVisa?: boolean;
    otherVisaDetails?: string;
    resumeUrl?: string;
    resumeUploaded?: boolean;
}

// --- Dossier Evidence Library Types -----------------------------------------

export type DossierMaterialKind =
    | "experience"
    | "project"
    | "interview_answer"
    | "writing_example"
    | "coursework"
    | "preferences";

export const DOSSIER_KIND_LABELS: Record<DossierMaterialKind, string> = {
    experience: "Experience",
    project: "Project",
    interview_answer: "Interview Answer",
    writing_example: "Writing Example",
    coursework: "Coursework",
    preferences: "Preferences",
};

export interface DossierFolder {
    id: string;
    parentId: string | null;
    name: string;
    position: number;
}

export interface DossierMaterial {
    id: string;
    folderId: string;
    title: string;
    kind: DossierMaterialKind;
    text: string;
    legacyKey?: string;
    revision: number;
    updatedAt: string;
    archivedAt: string | null;
}

export interface DossierLibraryState {
    folders: DossierFolder[];
    materials: DossierMaterial[];
}

