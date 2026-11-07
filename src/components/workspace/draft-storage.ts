import {
    extractQuestionInputsFromApplication,
    mapApiApplicationQuestions,
} from "@/api";
import {
    ApiApplicationResponse,
    Job,
    PersistedDraftState,
    WorkspaceMaterial,
} from "@/lib/types";

const DRAFT_STORAGE_PREFIX = "dorker.draft.v1.";

export function createInitialDraftState(
    jobQuestions?: string[],
    latestApp: ApiApplicationResponse | null = null
): PersistedDraftState {
    const inputs = extractQuestionInputsFromApplication(
        latestApp,
        jobQuestions
    );
    const hasQuestions = Boolean(latestApp && latestApp.questions.length > 0);
    const hasCoverLetter = Boolean(
        latestApp && latestApp.cover_letter !== null
    );

    return {
        applicationId: latestApp?.id ?? null,
        updatedAt: latestApp?.updated_at ?? latestApp?.created_at ?? null,
        coverLetterRequired: hasCoverLetter,
        questionsRequired: hasQuestions,
        questionInputs: inputs,
        generatedCoverLetter: latestApp?.cover_letter ?? null,
        generatedQuestions: latestApp
            ? mapApiApplicationQuestions(latestApp.questions, latestApp.id)
            : [],
    };
}

export function loadPersistedDraftState(
    jobId: string,
    jobQuestions?: string[],
    latestApp: ApiApplicationResponse | null = null
): PersistedDraftState {
    const fallback = createInitialDraftState(jobQuestions, latestApp);
    if (typeof window === "undefined") {
        return fallback;
    }

    try {
        const raw = window.localStorage.getItem(
            `${DRAFT_STORAGE_PREFIX}${jobId}`
        );
        if (!raw) {
            return fallback;
        }
        const parsed = JSON.parse(raw) as Partial<PersistedDraftState>;
        const storedInputs =
            Array.isArray(parsed.questionInputs) &&
            parsed.questionInputs.some((q) => q.trim().length > 0)
                ? parsed.questionInputs
                : fallback.questionInputs;

        // If backend has a saved application draft, prefer its authoritative cover_letter & questions
        if (latestApp) {
            return {
                applicationId: latestApp.id,
                updatedAt: latestApp.updated_at ?? latestApp.created_at,
                coverLetterRequired:
                    parsed.coverLetterRequired ??
                    latestApp.cover_letter !== null,
                questionsRequired:
                    parsed.questionsRequired ?? latestApp.questions.length > 0,
                questionInputs: storedInputs,
                generatedCoverLetter: latestApp.cover_letter,
                generatedQuestions: mapApiApplicationQuestions(
                    latestApp.questions,
                    latestApp.id
                ),
            };
        }

        return {
            applicationId:
                typeof parsed.applicationId === "number"
                    ? parsed.applicationId
                    : null,
            updatedAt:
                typeof parsed.updatedAt === "string" ? parsed.updatedAt : null,
            coverLetterRequired: Boolean(parsed.coverLetterRequired),
            questionsRequired: Boolean(parsed.questionsRequired),
            questionInputs:
                Array.isArray(parsed.questionInputs) &&
                parsed.questionInputs.length > 0
                    ? parsed.questionInputs
                    : fallback.questionInputs,
            generatedCoverLetter:
                typeof parsed.generatedCoverLetter === "string"
                    ? parsed.generatedCoverLetter
                    : null,
            generatedQuestions: Array.isArray(parsed.generatedQuestions)
                ? parsed.generatedQuestions
                : [],
        };
    } catch {
        return fallback;
    }
}

export function savePersistedDraftState(
    jobId: string,
    state: PersistedDraftState
): void {
    if (typeof window === "undefined") {
        return;
    }

    try {
        window.localStorage.setItem(
            `${DRAFT_STORAGE_PREFIX}${jobId}`,
            JSON.stringify(state)
        );
    } catch {
        // Ignore storage quota errors
    }
}

export function synthesizeCoverLetter(
    job: Job,
    materials: WorkspaceMaterial[]
): string {
    const company = job.company || "your engineering organization";
    const title = job.title || "Software Engineer";
    const location = job.location || "Remote";
    const evidenceTitles = materials.map((m) => m.title).join(", ");

    return `Dear Hiring Team at ${company},

I am writing to apply for the ${title} position (${location}). Having built and scaled high-throughput backend services, PostgreSQL data pipelines, and grounded LLM/SLM automation workflows, I was immediately drawn to ${company}'s engineering scope.

In my recent work (${evidenceTitles || "Core Systems & AI Architecture"}), I architected async Python and TypeScript services processing millions of structured records across 60+ integrations—combining deterministic SQL/FTS indexing with multi-stage evaluation pipelines to keep latency low and reliability high.

I would welcome the opportunity to discuss how my background in distributed backend architecture and pragmatic AI tooling can contribute to ${company}'s roadmap.

Best regards,
Serafym`;
}

export function synthesizeQuestionAnswer(
    job: Job,
    questionText: string
): string {
    const company = job.company || "the team";
    const title = job.title || "this role";

    return `Regarding "${questionText}": In my production engineering work, I address this by combining modular Python and TypeScript service boundaries with strict PostgreSQL data guarantees and automated evaluation checks—directly supporting ${company}'s goals for the ${title} position.`;
}
