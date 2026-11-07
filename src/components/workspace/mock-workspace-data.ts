import { Job, WorkspaceData, WorkspaceQuestion } from "@/lib/types";

export function createMockWorkspaceData(job: Job): WorkspaceData {
    const company = job.company || "the company";
    const title = job.title || "Software Engineer";
    const location = job.location || "Remote";

    const dbQuestions: WorkspaceQuestion[] = (job.questions || [])
        .filter((q) => q.trim().length > 0)
        .map((q, index) => ({
            id: `db-q-${index + 1}`,
            question: q,
            answer: `In my recent engineering work, I directly addressed challenges similar to "${q}" by designing modular Python and TypeScript services backed by PostgreSQL, reducing latency while maintaining strict reliability guarantees.`,
        }));

    return {
        match: {
            id: `match-${job.id}`,
            jobId: job.id,
            suitabilityTier: "SUITABLE",
            pipelineStatus: "PENDING",
            technicalCapabilityScore: 0.89,
            strategicValueScore: 0.92,
            summary: `Strong technical and strategic fit for ${title} at ${company}. The role emphasizes backend systems architecture, data-intensive pipelines, and pragmatic product delivery—areas directly supported by your primary engineering evidence.`,
            pros: [
                `Direct core stack alignment with ${title} requirements (Python, TypeScript, PostgreSQL, distributed systems).`,
                `High strategic value: ${company} operates in a high-growth technical domain with strong engineering ownership.`,
                `Location & work arrangement (${location}) matches target preferences.`,
                "Clear impact scope where end-to-end ownership of data and AI tooling is valued.",
            ],
            cons: [
                "Posting includes broad cross-functional responsibilities that may require clarifying team boundaries during the initial screen.",
                "Specific domain tooling mentioned as a nice-to-have should be framed via transferable architecture experience.",
            ],
            hasAnalytics: true,
            rejectionReason: null,
            createdAt: new Date().toISOString(),
        },
        discussionState: "not_started",
        messages: [],
        latestApplication: null,
        draft: {
            selectedMaterials: [],
            coverLetter: "",
            questions: dbQuestions,
        },
    };
}
