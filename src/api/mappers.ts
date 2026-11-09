import {
    ApiApplicationQuestionResponse,
    ApiApplicationResponse,
    ApiDiscussionMessageResponse,
    ApiJobResponse,
    ApiMatchResponse,
    Job,
    WorkspaceMatch,
    WorkspaceMessage,
    WorkspaceQuestion,
} from "@/lib/types";

export function mapApiJobToJob(dto: ApiJobResponse): Job {
    return {
        id: dto.id,
        title: dto.title,
        company: dto.company ?? "Unknown Company",
        location: dto.location ?? undefined,
        description: dto.description,
        url: dto.url,
        applyUrl: dto.apply_url,
        link: dto.url || dto.apply_url || "",
        atsType: dto.ats_type,
        employmentType: dto.employment_type ?? undefined,
        employment_type: dto.employment_type ?? undefined,
        questions: dto.questions ?? [],
        salaryMin: dto.salary_min,
        salaryMax: dto.salary_max,
        salaryCurrency: dto.salary_currency ?? undefined,
        postedAt: dto.posted_at,
        fetchedAt: dto.fetched_at,
    };
}

export function mapApiMatchToWorkspaceMatch(
    dto: ApiMatchResponse
): WorkspaceMatch {
    return {
        id: dto.id,
        jobId: dto.job_id,
        suitabilityTier: dto.suitability_tier,
        pipelineStatus: dto.pipeline_status,
        technicalCapabilityScore: dto.technical_capability_score,
        strategicValueScore: dto.strategic_value_score,
        summary: dto.analytics?.summary ?? "",
        pros: dto.analytics?.pros ?? [],
        cons: dto.analytics?.cons ?? [],
        hasAnalytics: dto.analytics !== null,
        rejectionReason: dto.rejection_reason,
        createdAt: dto.created_at,
        updatedAt: dto.updated_at ?? dto.created_at,
    };
}

export function formatMessageTimestamp(isoDate: string): string {
    const parsed = new Date(isoDate);
    if (Number.isNaN(parsed.getTime())) {
        return isoDate;
    }
    return parsed.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function mapApiDiscussionMessage(
    dto: ApiDiscussionMessageResponse
): WorkspaceMessage {
    return {
        id: dto.id,
        role: dto.role,
        content: dto.content,
        createdAt: formatMessageTimestamp(dto.created_at),
    };
}

export function mapApiApplicationQuestions(
    items: ApiApplicationQuestionResponse[],
    applicationId?: number
): WorkspaceQuestion[] {
    return items.map((item, idx) => ({
        id: `app-${applicationId ?? "draft"}-q-${idx}`,
        question: item.question,
        answer: item.answer ?? "",
    }));
}

export function mapWorkspaceQuestionsToApi(
    questions: WorkspaceQuestion[]
): ApiApplicationQuestionResponse[] {
    return questions.map((item) => ({
        question: item.question,
        answer: item.answer,
    }));
}

export function extractQuestionInputsFromApplication(
    app: ApiApplicationResponse | null,
    jobQuestions?: string[]
): string[] {
    if (app && app.questions.length > 0) {
        return app.questions.map((q) => q.question);
    }
    const fromJob = (jobQuestions ?? [])
        .map((q) => q.trim())
        .filter((q) => q.length > 0);
    if (fromJob.length > 0) {
        return fromJob;
    }
    return [""];
}
