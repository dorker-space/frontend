import { ApiError, type QueryParamsRecord, type RequestOptions } from "@/api/client";
import type { EvidenceContent, EvidenceFile, EvidenceFolder } from "@/api/evidence";
import type { CareerCollection, ProfilePatch } from "@/api/profile";
import {
    createInitialSyntheticStore,
    type SyntheticStoreState,
} from "@/api/synthetic-data";
import type {
    ApiApplicationPatchInput,
    ApiApplicationResponse,
    ApiApplicationsResponse,
    ApiDiscussionMessageResponse,
    ApiDiscussionReplyResponse,
    ApiDiscussionStreamEvent,
    ApiGenerationInput,
    ApiJobResponse,
    ApiJobsResponse,
    ApiMatchDebugResponse,
    ApiMatchesResponse,
    ApiMatchResponse,
    ApiScrapeJobResponse,
    SuitabilityTier,
    WorkspaceStatus,
} from "@/lib/types";

const SYNTHETIC_STORAGE_KEY = "dorker.example.store.v1";

let memoryStore: SyntheticStoreState | null = null;

export function getSyntheticStore(): SyntheticStoreState {
    if (memoryStore) {
        return memoryStore;
    }
    if (typeof window !== "undefined") {
        try {
            const raw = window.sessionStorage.getItem(SYNTHETIC_STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw) as SyntheticStoreState;
                if (
                    Array.isArray(parsed.jobs) &&
                    Array.isArray(parsed.matches) &&
                    Array.isArray(parsed.evidence)
                ) {
                    memoryStore = parsed;
                    return memoryStore;
                }
            }
        } catch {
            // Fall through to seed
        }
    }
    memoryStore = createInitialSyntheticStore();
    saveSyntheticStore(memoryStore);
    return memoryStore;
}

export function saveSyntheticStore(store: SyntheticStoreState): void {
    memoryStore = store;
    if (typeof window !== "undefined") {
        try {
            window.sessionStorage.setItem(
                SYNTHETIC_STORAGE_KEY,
                JSON.stringify(store)
            );
        } catch {
            // Ignore quota errors
        }
    }
}

export function resetSyntheticStore(): void {
    memoryStore = createInitialSyntheticStore();
    saveSyntheticStore(memoryStore);
    if (typeof window !== "undefined") {
        try {
            // Also clear per-job draft localStorage keys from demo experiments
            const keysToRemove: string[] = [];
            for (let i = 0; i < window.localStorage.length; i++) {
                const key = window.localStorage.key(i);
                if (key && key.startsWith("dorker.draft.v1.")) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach((k) => window.localStorage.removeItem(k));
        } catch {
            // Ignore storage errors
        }
    }
}

function makeId(prefix = "syn"): string {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return crypto.randomUUID();
    }
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function toStringArray(value: unknown): string[] {
    if (Array.isArray(value)) {
        return value.map((item) => String(item));
    }
    if (typeof value === "string" && value.trim().length > 0) {
        return value.split(",").map((item) => item.trim());
    }
    return [];
}

function buildDynamicDebugTrace(
    match: ApiMatchResponse,
    job?: ApiJobResponse
): string {
    const store = getSyntheticStore();
    const existing = store.debugByMatchId[match.id];
    if (existing) {
        return existing;
    }

    const activeEvidenceCount = store.evidence.filter(
        (e) => e.use_for_matching
    ).length;

    return `[dorker.pipeline.trace] match_id="${match.id}" job_id="${match.job_id}"
[stage:1:pgvector_recall] title="${job?.title ?? "Position"}" company="${job?.company ?? "Company"}"
  └─ vector_index="jobs_embedding_hnsw_idx" candidate_pool=2840 status=MATCHED
[stage:2:nomic_block_classifier] model="nomic-embed-text-v1.5-6class"
  ├─ segmented_blocks: [ABOUT_COMPANY: stripped, RESPONSIBILITIES: kept, REQUIREMENTS: kept, LEGAL: stripped]
  └─ active_dossier_blocks: ${activeEvidenceCount} evidence files compressed (35.4k -> 5.8k tokens)
[stage:3:jev_two_axis_evaluator] provider="typesafe-ai/jev-v1" latency_ms=405
  ├─ axis_1_technical_capability: ${match.technical_capability_score.toFixed(2)}
  ├─ axis_2_strategic_value: ${match.strategic_value_score.toFixed(2)}
  ├─ suitability_tier: ${match.suitability_tier}
  └─ rejection_reason: ${match.rejection_reason ? JSON.stringify(match.rejection_reason) : "null"}`;
}

function synthesizeCoverLetterForJob(
    job: ApiJobResponse,
    match: ApiMatchResponse,
    store: SyntheticStoreState
): string {
    const company = job.company || "your engineering team";
    const title = job.title || "Software Engineer";
    const discussion = store.discussionsByMatchId[match.id];
    const userDiscussionNotes = (discussion?.messages ?? [])
        .filter((m) => m.role === "user")
        .map((m) => m.content.trim())
        .filter(Boolean);

    const activeEvidence = store.evidence.filter((e) => e.use_for_matching);
    const hasWebRtc = activeEvidence.some((e) =>
        e.title.toLowerCase().includes("pixelview")
    );
    const hasDorker = activeEvidence.some((e) =>
        e.title.toLowerCase().includes("dorker")
    );
    const hasOrchestrator = activeEvidence.some((e) =>
        e.title.toLowerCase().includes("orchestrator")
    );

    const paragraphs: string[] = [
        `I’m a Backend and AI Infrastructure Engineer specializing in high-load distributed systems, event-driven microservices in Go and Python, and grounded LLM/SLM evaluation pipelines. Looking at ${company}’s scope for the ${title} role, the technical challenges around reliability, throughput, and end-to-end ownership align directly with the systems I build.`,
    ];

    if (hasDorker) {
        paragraphs.push(
            `While architecting Dorker.space—an open-source job ingestion and semantic matching engine over PostgreSQL and pgvector—I solved the problem of evaluating thousands of unstructured postings without burning frontier API budgets or suffering from local SLM hallucinations. I trained a 6-class nomic embedding classifier on a hand-labeled 100-job Golden Set (curated via farthest-point sampling) to strip boilerplate, and migrated structured reasoning from Microsoft Guidance to TypeSafe AI’s Jev—reducing 100-job evaluation latency from 5 hours to under 60 seconds while compressing a 35k+ token candidate dossier down to 5–7k high-density tokens.`
        );
    }

    if (hasWebRtc || hasOrchestrator) {
        paragraphs.push(
            `In production at Pixelview.io, I worked with complete autonomy as the sole engineer on the streaming pipeline to migrate from SRT to WebRTC WHIP in Go/Pion—cutting end-to-end latency by 2x (from 14 frames to 5–7)—and deployed a standalone TURN server via Nomad and HCL while decoupling circular Go modules. Alongside that, I built AI-Orchestrator using PostgreSQL, Redis Streams, the Transactional Outbox pattern for at-least-once delivery, exponential backoff, and OpenTelemetry observability.`
        );
    }

    if (userDiscussionNotes.length > 0) {
        paragraphs.push(
            `Additional context highlighted for ${company}: ${userDiscussionNotes[userDiscussionNotes.length - 1]}`
        );
    }

    paragraphs.push(
        `Beyond technical delivery, I served as a Teaching Assistant at the Kyiv School of Economics, instructing over 200 students in Algorithms & Data Structures and Python—making clear technical communication and code review second nature. I would welcome the opportunity to discuss how my systems and applied AI background can contribute to ${company}.\n\nBest regards,\n${store.profile.name || "Serafym Podolianchuk"}`
    );

    return paragraphs.join("\n\n");
}

function synthesizeQuestionAnswerForJob(
    question: string,
    job: ApiJobResponse,
    store: SyntheticStoreState
): string {
    const qLower = question.toLowerCase();
    const company = job.company || "the team";

    if (
        qLower.includes("webrtc") ||
        qLower.includes("network") ||
        qLower.includes("protocol") ||
        qLower.includes("stream") ||
        qLower.includes("latency")
    ) {
        return `At Pixelview.io, I owned the end-to-end migration of a live video streaming engine from SRT to WebRTC WHIP with Trickle ICE in Go (Pion). Because SRT relied on retransmission delays over Reliable UDP, switching to WHIP over raw UDP reduced end-to-end latency by 2x (from 14 frames down to 5–7 frames). I also built and deployed a standalone TURN server via Nomad, HCL, and Buildkite to resolve symmetric NAT traversal issues and upgraded the CGO FFmpeg transcoding pipeline from v7 to v8.`;
    }

    if (
        qLower.includes("distributed") ||
        qLower.includes("consistency") ||
        qLower.includes("idempoten") ||
        qLower.includes("postgres") ||
        qLower.includes("outbox") ||
        qLower.includes("queue")
    ) {
        return `In my AI-Orchestrator system, I addressed the dual-write consistency problem between PostgreSQL and Redis Streams by implementing the Transactional Outbox pattern: the REST API persists both the prompt entity and outbox event in a single ACID transaction, returning 202 Accepted, while an indexed background relay flushes events to Redis Streams without full table scans. Downstream worker pools consume messages idempotently with exponential backoff and OpenTelemetry tracing.`;
    }

    if (
        qLower.includes("llm") ||
        qLower.includes("ai") ||
        qLower.includes("eval") ||
        qLower.includes("golden") ||
        qLower.includes("slm") ||
        qLower.includes("agent")
    ) {
        return `While building Dorker.space, I needed fast, accurate two-axis evaluation across thousands of scraped ATS jobs. Standard BERT/cosine similarity failed on transferable skills, and unsteered local SLMs hallucinated. I curated a 100-job Golden Set via farthest-point sampling, trained a 6-class nomic block classifier to strip boilerplate, and used Microsoft Guidance and TypeSafe AI's Jev to enforce structured reasoning—cutting 100-job batch evaluation from 5 hours to under 1 minute.`;
    }

    const activeCount = store.evidence.filter((e) => e.use_for_matching).length;
    return `Drawing from my production work in Go and Python microservices (${activeCount} active Dossier evidence blocks)—including building Dorker.space over PostgreSQL + pgvector, implementing the Transactional Outbox pattern in AI-Orchestrator, and autonomously migrating a Go/Pion WebRTC WHIP pipeline at Pixelview.io—I focus on measurable latency, deterministic evaluation, and clean architectural boundaries that directly support ${company}'s goals for ${job.title}.`;
}

function synthesizeDiscussionReply(
    userText: string,
    match: ApiMatchResponse,
    job: ApiJobResponse | undefined,
    store: SyntheticStoreState
): string {
    const company = job?.company ?? "this company";
    const title = job?.title ?? "this role";
    const techPct = Math.round(match.technical_capability_score * 100);
    const stratPct = Math.round(match.strategic_value_score * 100);
    const activeFiles = store.evidence.filter((e) => e.use_for_matching);

    const lower = userText.toLowerCase();
    if (lower.includes("gap") || lower.includes("risk") || lower.includes("stretch") || lower.includes("score")) {
        return `For **${title}** at **${company}** (Technical **${techPct}%**, Strategic **${stratPct}%**, Tier **${match.suitability_tier}**):\n\n• **Why the score is shaped this way**: ${match.analytics?.cons?.[0] ?? "The posting lists senior domain benchmarks, while your strongest proof is high-autonomy project & contract delivery."}\n• **How to counter it using your Dossier**: Anchor the opening paragraph on **Dorker.space** (40+ ATS scrapers, \`pgvector\`, \`nomic\` classifier, 5h -> <1m \`Jev\` evaluation) and **Pixelview.io** (sole engineer cutting WebRTC latency 2x). That shifts the conversation from raw tenure to proven systems ownership.`;
    }

    if (lower.includes("aws") || lower.includes("java") || lower.includes("cloud") || lower.includes("transfer")) {
        return `Your Dossier file **Transferable Engineering Foundations** handles this cleanly:\n\n• **Cloud (GCP -> AWS)**: You provisioned Cloud Run, Cloud SQL, Firestore, and VPCs with **Terraform** at Headway Inc. and deployed TURN infrastructure with **Nomad/HCL** at Pixelview. Frame AWS as a direct IaC provider mapping rather than an unfamiliar paradigm.\n• **Language & Runtime**: Your \`0.8\` proficiency in **Go**, **Python**, and **C#/.NET** demonstrates polyglot backend fluency across compiled and async runtimes.`;
    }

    return `Got it—I've incorporated that into the strategy context for **${title}** at **${company}** alongside your **${activeFiles.length} active Dossier evidence files** (\`Pixelview WebRTC\`, \`Dorker.space Jev Pipeline\`, \`AI-Orchestrator Outbox\`, \`KSE Teaching\`).\n\nSwitch to the **Draft** tab and click **Generate** (or **Regenerate**) to see this reflected in the tailored cover letter and screening answers.`;
}

function synthesizeScrapedJob(url: string): {
    job: ApiJobResponse;
    match: ApiMatchResponse;
} {
    let hostname = "custom-ats.io";
    let pathParts: string[] = [];
    try {
        const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
        hostname = parsed.hostname.replace(/^www\./, "");
        pathParts = parsed.pathname.split("/").filter(Boolean);
    } catch {
        // Fallback for non-URL strings
    }

    const atsType = hostname.includes("greenhouse")
        ? "greenhouse"
        : hostname.includes("ashby")
          ? "ashby"
          : hostname.includes("lever")
            ? "lever"
            : "custom";

    const rawCompany =
        pathParts[0] && !["jobs", "careers", "positions"].includes(pathParts[0].toLowerCase())
            ? pathParts[0]
            : hostname.split(".")[0] || "Acme Systems";
    const company =
        rawCompany.charAt(0).toUpperCase() +
        rawCompany.slice(1).replace(/[-_]/g, " ");

    const rawSlug = pathParts[pathParts.length - 1] || "backend-ai-engineer";
    const inferredTitle =
        rawSlug.length > 4 && !/^\d+$/.test(rawSlug)
            ? rawSlug
                  .replace(/[-_]/g, " ")
                  .replace(/\b\w/g, (c) => c.toUpperCase())
            : "Backend & Distributed AI Engineer (Go / Python)";

    const now = new Date().toISOString();
    const jobId = `${atsType}:${makeId("job").slice(0, 8)}`;
    const matchId = makeId("match");

    const job: ApiJobResponse = {
        id: jobId,
        title: inferredTitle,
        company,
        location: "Remote (Europe / Global)",
        ats_type: atsType,
        employment_type: "FULL_TIME",
        url,
        apply_url: url,
        salary_min: 145000,
        salary_max: 185000,
        salary_currency: "USD",
        posted_at: now,
        fetched_at: now,
        questions: [
            `Why do you want to join ${company} as ${inferredTitle}?`,
            "Describe a production backend or AI system you architected and how you verified its reliability.",
        ],
        description: `${company} is hiring a ${inferredTitle} (imported via Dorker external scraper from ${url}).\n\nResponsibilities:\n• Design and scale distributed backend microservices in Go and Python backed by PostgreSQL and Redis.\n• Build deterministic evaluation pipelines and structured LLM/SLM orchestration workflows.\n• Own features end-to-end from RFC design through production telemetry with OpenTelemetry.`,
    };

    const match: ApiMatchResponse = {
        id: matchId,
        job_id: jobId,
        suitability_tier: "SUITABLE",
        pipeline_status: "PENDING",
        technical_capability_score: 0.84,
        strategic_value_score: 0.91,
        rejection_reason: null,
        created_at: now,
        updated_at: now,
        analytics: {
            summary: `Evaluated in Example Mode via Dorker's synthetic two-axis pipeline for ${inferredTitle} at ${company}. Strong alignment with Go/Python distributed microservices, PostgreSQL + pgvector, and grounded AI evaluation infrastructure.`,
            pros: [
                `Direct core stack alignment with ${company}'s backend and AI infrastructure requirements (Go, Python, PostgreSQL, Redis Streams).`,
                "End-to-end ownership evidenced by Dorker.space, AI-Orchestrator, and Pixelview WebRTC WHIP delivery.",
            ],
            cons: [
                "Imported via synthetic sandbox scraper—verify exact timezone and B2B contractor terms on the live ATS listing.",
            ],
        },
    };

    return { job, match };
}

/**
 * Handles all `/api/*` requests when running in Example mode (`example.dorker.space` or `?mode=example`).
 * Keeps all state in sessionStorage so the entire real frontend works interactively without a backend.
 */
export async function handleSyntheticRequest<T>(
    rawPath: string,
    options: RequestOptions = {}
): Promise<T> {
    const method = (options.method ?? "GET").toUpperCase();
    const path = rawPath.split("?")[0].replace(/\/$/, "") || "/";
    const params: QueryParamsRecord = options.params ?? {};
    const body = options.body as Record<string, unknown> | undefined;
    const store = getSyntheticStore();

    // --- 1. JOBS API ---------------------------------------------------------
    if (path === "/api/jobs" && method === "GET") {
        const limit = Number(params.limit ?? 50);
        const offset = Number(params.offset ?? 0);
        const sliced = store.jobs.slice(offset, offset + limit);
        const res: ApiJobsResponse = {
            jobs: sliced,
            total: store.jobs.length,
            limit,
            offset,
        };
        return res as unknown as T;
    }

    if (path === "/api/jobs/scrape" && method === "POST") {
        const url = String(body?.url ?? "https://jobs.ashbyhq.com/example/backend-engineer");
        const { job, match } = synthesizeScrapedJob(url);
        store.jobs = [job, ...store.jobs];
        store.matches = [match, ...store.matches];
        saveSyntheticStore(store);
        const res: ApiScrapeJobResponse = { job, match };
        return res as unknown as T;
    }

    const jobMatch = path.match(/^\/api\/jobs\/([^/]+)$/);
    if (jobMatch && method === "GET") {
        const jobId = decodeURIComponent(jobMatch[1]);
        const found = store.jobs.find((j) => j.id === jobId);
        if (found) {
            return found as unknown as T;
        }
        // Synthesize fallback job if navigated to an arbitrary ID
        const fallbackJob: ApiJobResponse = {
            id: jobId,
            title: "Senior Backend & AI Infrastructure Engineer",
            company: "Synthetic Target Co.",
            location: "Remote (Europe)",
            ats_type: jobId.includes(":") ? jobId.split(":")[0] : "ashby",
            employment_type: "FULL_TIME",
            url: "https://dorker.space",
            apply_url: "https://dorker.space",
            salary_min: 150000,
            salary_max: 195000,
            salary_currency: "USD",
            posted_at: new Date().toISOString(),
            fetched_at: new Date().toISOString(),
            questions: [
                "Describe a distributed backend or evaluation pipeline you built from scratch.",
            ],
            description:
                "Synthetic job record generated automatically by Dorker Example Mode.",
        };
        return fallbackJob as unknown as T;
    }

    // --- 2. MATCHES API ------------------------------------------------------
    if (
        (path === "/api/matches" || path === "/api/matches/applications") &&
        method === "GET"
    ) {
        const limit = Number(params.limit ?? 50);
        const offset = Number(params.offset ?? 0);
        const tiersFilter = toStringArray(params.tiers) as SuitabilityTier[];
        const statusFilter = toStringArray(
            params.pipeline_status
        ) as WorkspaceStatus[];

        const filtered = store.matches.filter((m) => {
            const tierOk =
                tiersFilter.length === 0 ||
                tiersFilter.includes(m.suitability_tier);
            const statusOk =
                statusFilter.length === 0 ||
                statusFilter.includes(m.pipeline_status);
            return tierOk && statusOk;
        });

        const res: ApiMatchesResponse = {
            matches: filtered.slice(offset, offset + limit),
            total: filtered.length,
            limit,
            offset,
        };
        return res as unknown as T;
    }

    if (path === "/api/matches/counts" && method === "GET") {
        const statusFilter = toStringArray(
            params.pipeline_status
        ) as WorkspaceStatus[];
        const counts: Record<SuitabilityTier, number> = {
            SUITABLE: 0,
            STRETCH: 0,
            RUNWAY: 0,
            REJECTED: 0,
        };
        for (const m of store.matches) {
            if (
                statusFilter.length === 0 ||
                statusFilter.includes(m.pipeline_status)
            ) {
                counts[m.suitability_tier] =
                    (counts[m.suitability_tier] ?? 0) + 1;
            }
        }
        return counts as unknown as T;
    }

    const matchByJob = path.match(/^\/api\/matches\/by-job\/([^/]+)$/);
    if (matchByJob && method === "GET") {
        const jobId = decodeURIComponent(matchByJob[1]);
        let found = store.matches.find((m) => m.job_id === jobId);
        if (!found) {
            const job = store.jobs.find((j) => j.id === jobId);
            const now = new Date().toISOString();
            found = {
                id: makeId("match"),
                job_id: jobId,
                suitability_tier: "SUITABLE",
                pipeline_status: "PENDING",
                technical_capability_score: 0.81,
                strategic_value_score: 0.9,
                rejection_reason: null,
                created_at: now,
                updated_at: now,
                analytics: {
                    summary: `Synthesized match evaluation for ${job?.title ?? jobId}. Strong backend and distributed systems alignment.`,
                    pros: [
                        "Direct overlap with Go, Python, PostgreSQL, and distributed architecture evidence.",
                    ],
                    cons: [
                        "Confirm specific team timezone and contractor preferences during initial screen.",
                    ],
                },
            };
            store.matches.unshift(found);
            saveSyntheticStore(store);
        }
        return found as unknown as T;
    }

    const matchDebug = path.match(/^\/api\/matches\/([^/]+)\/debug$/);
    if (matchDebug && method === "GET") {
        const matchId = decodeURIComponent(matchDebug[1]);
        const match = store.matches.find((m) => m.id === matchId);
        const job = match
            ? store.jobs.find((j) => j.id === match.job_id)
            : undefined;
        const debug = match
            ? buildDynamicDebugTrace(match, job)
            : "No debug output recorded for this match.";
        const res: ApiMatchDebugResponse = { debug };
        return res as unknown as T;
    }

    const matchReports = path.match(/^\/api\/matches\/([^/]+)\/reports$/);
    if (matchReports && method === "POST") {
        return undefined as unknown as T;
    }

    const matchStatus = path.match(/^\/api\/matches\/([^/]+)\/status$/);
    if (matchStatus && method === "PATCH") {
        const matchId = decodeURIComponent(matchStatus[1]);
        const nextStatus = String(body?.status ?? "PENDING") as WorkspaceStatus;
        const now = new Date().toISOString();
        store.matches = store.matches.map((m) =>
            m.id === matchId
                ? { ...m, pipeline_status: nextStatus, updated_at: now }
                : m
        );
        saveSyntheticStore(store);
        return { status: nextStatus } as unknown as T;
    }

    // --- 3. DISCUSSION API ---------------------------------------------------
    const discGet = path.match(/^\/api\/matches\/([^/]+)\/discussion$/);
    if (discGet && method === "GET") {
        const matchId = decodeURIComponent(discGet[1]);
        const disc = store.discussionsByMatchId[matchId] ?? {
            state: "not_started",
            messages: [],
        };
        return disc as unknown as T;
    }

    const discStart = path.match(/^\/api\/matches\/([^/]+)\/discussion\/start$/);
    if (discStart && method === "POST") {
        const matchId = decodeURIComponent(discStart[1]);
        const current = store.discussionsByMatchId[matchId] ?? {
            state: "not_started",
            messages: [],
        };
        store.discussionsByMatchId[matchId] = {
            ...current,
            state: "open",
        };
        saveSyntheticStore(store);
        return undefined as unknown as T;
    }

    const discFinish = path.match(
        /^\/api\/matches\/([^/]+)\/discussion\/finish$/
    );
    if (discFinish && method === "POST") {
        const matchId = decodeURIComponent(discFinish[1]);
        const current = store.discussionsByMatchId[matchId] ?? {
            state: "open",
            messages: [],
        };
        store.discussionsByMatchId[matchId] = {
            ...current,
            state: "finished",
        };
        saveSyntheticStore(store);
        return undefined as unknown as T;
    }

    const discMsg = path.match(
        /^\/api\/matches\/([^/]+)\/discussion\/messages$/
    );
    if (discMsg && method === "POST") {
        const matchId = decodeURIComponent(discMsg[1]);
        const text = String(body?.text ?? "").trim();
        const match =
            store.matches.find((m) => m.id === matchId) ?? store.matches[0];
        const job = store.jobs.find((j) => j.id === match?.job_id);
        const now = new Date().toISOString();

        const userMessage: ApiDiscussionMessageResponse = {
            id: makeId("msg-u"),
            role: "user",
            content: text,
            created_at: now,
        };
        const assistantMessage: ApiDiscussionMessageResponse = {
            id: makeId("msg-a"),
            role: "assistant",
            content: synthesizeDiscussionReply(text, match, job, store),
            created_at: new Date(Date.now() + 500).toISOString(),
        };

        const current = store.discussionsByMatchId[matchId] ?? {
            state: "open",
            messages: [],
        };
        store.discussionsByMatchId[matchId] = {
            state: "open",
            messages: [...current.messages, userMessage, assistantMessage],
        };
        saveSyntheticStore(store);

        const res: ApiDiscussionReplyResponse = {
            user_message: userMessage,
            assistant_message: assistantMessage,
        };
        return res as unknown as T;
    }

    // --- 4. APPLICATIONS & GENERATION API ------------------------------------
    const matchApps = path.match(/^\/api\/matches\/([^/]+)\/applications$/);
    if (matchApps) {
        const matchId = decodeURIComponent(matchApps[1]);
        if (method === "GET") {
            const apps = store.applicationsByMatchId[matchId] ?? [];
            const res: ApiApplicationsResponse = {
                applications: apps,
                total: apps.length,
                limit: Number(params.limit ?? 50),
                offset: Number(params.offset ?? 0),
            };
            return res as unknown as T;
        }
        if (method === "POST") {
            const input = (body ?? {}) as unknown as ApiGenerationInput;
            const match =
                store.matches.find((m) => m.id === matchId) ?? store.matches[0];
            const job =
                store.jobs.find((j) => j.id === match.job_id) ?? store.jobs[0];
            const now = new Date().toISOString();
            const appId = store.nextApplicationId++;

            const created: ApiApplicationResponse = {
                id: appId,
                match_id: matchId,
                job_id: job.id,
                cover_letter: input.generate_cover_letter
                    ? synthesizeCoverLetterForJob(job, match, store)
                    : null,
                questions: input.generate_answers
                    ? (input.questions ?? []).map((q) => ({
                          question: q,
                          answer: synthesizeQuestionAnswerForJob(q, job, store),
                      }))
                    : [],
                created_at: now,
                updated_at: now,
            };

            const existing = store.applicationsByMatchId[matchId] ?? [];
            store.applicationsByMatchId[matchId] = [created, ...existing];
            saveSyntheticStore(store);
            return created as unknown as T;
        }
    }

    const appById = path.match(/^\/api\/applications\/(\d+)$/);
    if (appById) {
        const appId = Number(appById[1]);
        for (const [mId, list] of Object.entries(store.applicationsByMatchId)) {
            const idx = list.findIndex((a) => a.id === appId);
            if (idx >= 0) {
                if (method === "GET") {
                    return list[idx] as unknown as T;
                }
                if (method === "PATCH") {
                    const patch = (body ?? {}) as ApiApplicationPatchInput;
                    const updated: ApiApplicationResponse = {
                        ...list[idx],
                        cover_letter:
                            patch.cover_letter !== undefined
                                ? patch.cover_letter
                                : list[idx].cover_letter,
                        questions:
                            patch.questions !== undefined
                                ? patch.questions
                                : list[idx].questions,
                        updated_at: new Date().toISOString(),
                    };
                    store.applicationsByMatchId[mId][idx] = updated;
                    saveSyntheticStore(store);
                    return updated as unknown as T;
                }
            }
        }
    }

    const appRegen = path.match(/^\/api\/applications\/(\d+)\/generation$/);
    if (appRegen && method === "POST") {
        const appId = Number(appRegen[1]);
        const input = (body ?? {}) as unknown as ApiGenerationInput;

        for (const [mId, list] of Object.entries(store.applicationsByMatchId)) {
            const idx = list.findIndex((a) => a.id === appId);
            if (idx >= 0) {
                const existing = list[idx];
                const match =
                    store.matches.find((m) => m.id === mId) ?? store.matches[0];
                const job =
                    store.jobs.find((j) => j.id === existing.job_id) ??
                    store.jobs[0];

                const updated: ApiApplicationResponse = {
                    ...existing,
                    cover_letter: input.generate_cover_letter
                        ? synthesizeCoverLetterForJob(job, match, store)
                        : existing.cover_letter,
                    questions: input.generate_answers
                        ? (input.questions ?? []).map((q) => ({
                              question: q,
                              answer: synthesizeQuestionAnswerForJob(
                                  q,
                                  job,
                                  store
                              ),
                          }))
                        : existing.questions,
                    updated_at: new Date().toISOString(),
                };
                store.applicationsByMatchId[mId][idx] = updated;
                saveSyntheticStore(store);
                return updated as unknown as T;
            }
        }
    }

    const matchById = path.match(/^\/api\/matches\/([^/]+)$/);
    if (matchById && method === "GET") {
        const matchId = decodeURIComponent(matchById[1]);
        const found = store.matches.find((m) => m.id === matchId);
        if (found) {
            return found as unknown as T;
        }
        throw new ApiError(`Match "${matchId}" not found`, 404);
    }

    // --- 5. DOSSIER / EVIDENCE API -------------------------------------------
    if (path === "/api/folders") {
        if (method === "GET") {
            return store.folders as unknown as T;
        }
        if (method === "POST") {
            const folderPath = String(body?.path ?? "").trim();
            if (!folderPath.startsWith("/")) {
                throw new ApiError("Folder path must start with '/'", 400);
            }
            if (store.folders.some((f) => f.path === folderPath)) {
                throw new ApiError("Folder already exists", 409);
            }
            const created: EvidenceFolder = {
                path: folderPath,
                created_at: new Date().toISOString(),
            };
            store.folders.push(created);
            saveSyntheticStore(store);
            return created as unknown as T;
        }
        if (method === "DELETE") {
            const targetPath = String(params.path ?? "");
            const hasChildren =
                store.folders.some((f) => f.path.startsWith(`${targetPath}/`)) ||
                store.evidence.some((e) => e.folder_path === targetPath);
            if (hasChildren) {
                throw new ApiError(
                    "Folder must be empty before deleting.",
                    400
                );
            }
            store.folders = store.folders.filter((f) => f.path !== targetPath);
            saveSyntheticStore(store);
            return undefined as unknown as T;
        }
    }

    if (path === "/api/evidence") {
        if (method === "GET") {
            return store.evidence as unknown as T;
        }
        if (method === "POST") {
            const now = new Date().toISOString();
            const created: EvidenceFile = {
                id: makeId("ev"),
                folder_path: String(body?.folder_path ?? "/experience"),
                title: String(body?.title ?? "Untitled Evidence"),
                text: String(body?.text ?? ""),
                use_for_matching: Boolean(body?.use_for_matching),
                created_at: now,
                updated_at: now,
            };
            store.evidence.unshift(created);
            saveSyntheticStore(store);
            return created as unknown as T;
        }
    }

    const evidenceById = path.match(/^\/api\/evidence\/([^/]+)$/);
    if (evidenceById) {
        const evId = decodeURIComponent(evidenceById[1]);
        if (method === "PATCH") {
            const content = (body ?? {}) as Partial<EvidenceContent>;
            const now = new Date().toISOString();
            let updatedFile: EvidenceFile | null = null;
            store.evidence = store.evidence.map((item) => {
                if (item.id !== evId) return item;
                updatedFile = {
                    ...item,
                    title:
                        content.title !== undefined
                            ? content.title
                            : item.title,
                    text: content.text !== undefined ? content.text : item.text,
                    use_for_matching:
                        content.use_for_matching !== undefined
                            ? content.use_for_matching
                            : item.use_for_matching,
                    updated_at: now,
                };
                return updatedFile;
            });
            saveSyntheticStore(store);
            if (!updatedFile) {
                throw new ApiError("Evidence file not found", 404);
            }
            return updatedFile as unknown as T;
        }
        if (method === "DELETE") {
            store.evidence = store.evidence.filter((item) => item.id !== evId);
            saveSyntheticStore(store);
            return undefined as unknown as T;
        }
    }

    // --- 6. PROFILE API ------------------------------------------------------
    if (path === "/api/profile" && method === "GET") {
        return store.profile as unknown as T;
    }

    if (path === "/api/profile" && method === "PATCH") {
        const patch = (body ?? {}) as ProfilePatch;
        store.profile = {
            ...store.profile,
            ...patch,
            updated_at: new Date().toISOString(),
        };
        saveSyntheticStore(store);
        return store.profile as unknown as T;
    }

    if (path === "/api/profile/options" && method === "GET") {
        return {
            countries: ["UA", "PL", "DE", "GB", "NL", "US", "CA", "CH", "FR", "ES", "PT", "EE"],
            timezones: [
                "Europe/Kyiv",
                "Europe/Warsaw",
                "Europe/Berlin",
                "Europe/London",
                "UTC",
                "America/New_York",
                "America/Los_Angeles",
            ],
        } as unknown as T;
    }

    const profileEvidenceLinks = path.match(
        /^\/api\/profile\/(employment_history|education)\/([^/]+)\/evidence-links$/
    );
    if (profileEvidenceLinks && method === "PATCH") {
        const collection = profileEvidenceLinks[1] as CareerCollection;
        const recordId = decodeURIComponent(profileEvidenceLinks[2]);
        const evidenceIds = Array.isArray(body?.evidence_ids)
            ? body.evidence_ids.map(String)
            : [];

        store.profile[collection] = store.profile[collection].map((row) =>
            row.id === recordId ? { ...row, evidence_ids: evidenceIds } : row
        );
        store.profile.updated_at = new Date().toISOString();
        saveSyntheticStore(store);
        return store.profile as unknown as T;
    }

    const profileCreateEvidence = path.match(
        /^\/api\/profile\/(employment_history|education)\/([^/]+)\/evidence$/
    );
    if (profileCreateEvidence && method === "POST") {
        const collection = profileCreateEvidence[1] as CareerCollection;
        const recordId = decodeURIComponent(profileCreateEvidence[2]);
        const folderPath = String(body?.folder_path ?? "/experience");
        const now = new Date().toISOString();

        if (!store.folders.some((f) => f.path === folderPath)) {
            store.folders.push({ path: folderPath, created_at: now });
        }

        const newEv: EvidenceFile = {
            id: makeId("ev"),
            folder_path: folderPath,
            title: String(body?.title ?? "Linked Career Evidence"),
            text: String(body?.text ?? ""),
            use_for_matching: Boolean(body?.use_for_matching ?? true),
            created_at: now,
            updated_at: now,
        };
        store.evidence.unshift(newEv);

        store.profile[collection] = store.profile[collection].map((row) =>
            row.id === recordId
                ? {
                      ...row,
                      evidence_ids: [...(row.evidence_ids ?? []), newEv.id],
                  }
                : row
        );
        store.profile.updated_at = now;
        saveSyntheticStore(store);
        return store.profile as unknown as T;
    }

    // --- 7. AUTOMATIC FALLBACK SYNTHESIZER FOR FUTURE ENDPOINTS --------------
    return synthesizeUnmappedEndpoint<T>(method, path, params, body);
}

/**
 * Simulates NDJSON streaming in Example Mode (e.g. `/api/matches/:id/discussion/stream`).
 */
export async function handleSyntheticNdjsonStream<TEvent>(
    rawPath: string,
    options: RequestOptions,
    onEvent: (event: TEvent) => void
): Promise<void> {
    const path = rawPath.split("?")[0].replace(/\/$/, "");
    const body = options.body as Record<string, unknown> | undefined;
    const store = getSyntheticStore();

    const streamMatch = path.match(
        /^\/api\/matches\/([^/]+)\/discussion\/stream$/
    );
    if (streamMatch) {
        const matchId = decodeURIComponent(streamMatch[1]);
        const text = String(body?.text ?? "").trim();
        const match =
            store.matches.find((m) => m.id === matchId) ?? store.matches[0];
        const job = store.jobs.find((j) => j.id === match?.job_id);
        const now = new Date().toISOString();

        const userMessage: ApiDiscussionMessageResponse = {
            id: makeId("msg-u"),
            role: "user",
            content: text,
            created_at: now,
        };

        const acceptedEvent: ApiDiscussionStreamEvent = {
            type: "accepted",
            message: userMessage,
        };
        onEvent(acceptedEvent as unknown as TEvent);

        const fullReply = synthesizeDiscussionReply(text, match, job, store);
        const chunks = fullReply.match(/.{1,18}(\s|$)|.{1,18}/gs) ?? [fullReply];

        for (const chunk of chunks) {
            await new Promise((resolve) => setTimeout(resolve, 18));
            const deltaEvent: ApiDiscussionStreamEvent = {
                type: "delta",
                text: chunk,
            };
            onEvent(deltaEvent as unknown as TEvent);
        }

        const assistantMessage: ApiDiscussionMessageResponse = {
            id: makeId("msg-a"),
            role: "assistant",
            content: fullReply,
            created_at: new Date().toISOString(),
        };

        const current = store.discussionsByMatchId[matchId] ?? {
            state: "open",
            messages: [],
        };
        store.discussionsByMatchId[matchId] = {
            state: "open",
            messages: [...current.messages, userMessage, assistantMessage],
        };
        saveSyntheticStore(store);

        const doneEvent: ApiDiscussionStreamEvent = {
            type: "done",
            message: assistantMessage,
        };
        onEvent(doneEvent as unknown as TEvent);
    }
}

/**
 * Future-proof heuristic fallback: if a new feature is added to the real app that calls
 * a new `/api/...` endpoint not yet explicitly mapped above, synthesize a safe response
 * so the Example workspace never crashes.
 */
function synthesizeUnmappedEndpoint<T>(
    method: string,
    path: string,
    params: QueryParamsRecord,
    body?: Record<string, unknown>
): T {
    if (typeof console !== "undefined") {
        console.info(
            `[Dorker Example Mode] Auto-synthesizing fallback for ${method} ${path}`,
            { params, body }
        );
    }

    if (method === "DELETE") {
        return undefined as unknown as T;
    }

    if (method === "POST" || method === "PATCH" || method === "PUT") {
        return {
            id: makeId("syn"),
            ...(body ?? {}),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            status: "ok",
        } as unknown as T;
    }

    const lastSegment = path.split("/").filter(Boolean).pop() ?? "items";
    return {
        [lastSegment]: [],
        total: 0,
        limit: Number(params.limit ?? 50),
        offset: Number(params.offset ?? 0),
    } as unknown as T;
}
