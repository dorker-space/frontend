import type { EvidenceFile, EvidenceFolder } from "@/api/evidence";
import type { UserProfile } from "@/api/profile";
import type {
    ApiApplicationResponse,
    ApiDiscussionResponse,
    ApiJobResponse,
    ApiMatchResponse,
} from "@/lib/types";

export interface SyntheticStoreState {
    jobs: ApiJobResponse[];
    matches: ApiMatchResponse[];
    debugByMatchId: Record<string, string>;
    discussionsByMatchId: Record<string, ApiDiscussionResponse>;
    applicationsByMatchId: Record<string, ApiApplicationResponse[]>;
    folders: EvidenceFolder[];
    evidence: EvidenceFile[];
    profile: UserProfile;
    nextApplicationId: number;
}

export const SYNTHETIC_EVIDENCE_IDS = {
    pixelview: "ev-pixelview-webrtc-whip",
    headway: "ev-headway-go-analytics",
    kse: "ev-kse-teaching-algorithms",
    dorker: "ev-project-dorker-engine",
    aiOrchestrator: "ev-project-ai-orchestrator",
    canonicalResilience: "ev-canonical-resilient-outbox",
    canonicalStochastic: "ev-canonical-stochastic-debugging",
    canonicalTransferable: "ev-canonical-transferable-stack",
    letterGoInfra: "ev-letter-go-infra",
    letterAppliedAi: "ev-letter-applied-ai",
    constraints: "ev-search-constraints",
} as const;

export const INITIAL_SYNTHETIC_FOLDERS: EvidenceFolder[] = [
    { path: "/experience", created_at: "2026-10-01T10:00:00Z" },
    { path: "/projects", created_at: "2026-10-01T10:01:00Z" },
    { path: "/canonical_interview", created_at: "2026-10-01T10:02:00Z" },
    { path: "/cover_letters", created_at: "2026-10-01T10:03:00Z" },
    { path: "/search_parameters", created_at: "2026-10-01T10:04:00Z" },
];

export const INITIAL_SYNTHETIC_EVIDENCE: EvidenceFile[] = [
    {
        id: SYNTHETIC_EVIDENCE_IDS.pixelview,
        folder_path: "/experience",
        title: "Pixelview.io — Go WebRTC WHIP Migration & Standalone TURN Server",
        use_for_matching: true,
        created_at: "2026-10-02T12:00:00Z",
        updated_at: "2026-10-28T15:30:00Z",
        text: `Role: Go WebRTC Engineer | Pixelview.io (Project-based contract, Jan – Mar 2026)

Owned end-to-end architecture, protocol migration, and production deployment across a distributed video streaming engine (Go / Pion WebRTC, Python FastAPI proxy, and web viewer clients) operating with full autonomy directly alongside the founder:

• Protocol Migration (SRT to WHIP): Researched, designed, and implemented a new real-time ingestion pipeline migrating from SRT (Secure Reliable Transport) to WHIP (WebRTC-HTTP Ingestion Protocol) with Trickle ICE. Because WHIP operates over raw UDP without SRT's retransmission delay overhead, end-to-end stream latency dropped 2x (from 14 frames down to 5–7 frames).
• NAT Traversal & Infrastructure: Built and deployed a standalone TURN server from scratch via Nomad, HCL, and Buildkite to resolve UDP firewall and symmetric NAT traversal failures, backed by isolated integration tests.
• Decoupling & CGO FFmpeg Upgrade: Refactored a tightly coupled Go monolith to eliminate circular dependencies via clean interface boundaries, and upgraded the CGO FFmpeg transcoding bindings from v7 to v8 without regressions.`,
    },
    {
        id: SYNTHETIC_EVIDENCE_IDS.headway,
        folder_path: "/experience",
        title: "Headway Inc. — High-Throughput Go Analytics Microservice & Multi-DB Storage",
        use_for_matching: true,
        created_at: "2026-10-02T12:10:00Z",
        updated_at: "2026-10-25T11:20:00Z",
        text: `Role: Go Backend Engineer | Headway Inc. (Jun 2025)

Engineered a concurrent, production-ready event analytics microservice in Go 1.24:

• Polyglot Persistence: Combined PostgreSQL (via sqlx + Pressly Goose migrations) for relational entity integrity with Google Cloud Firestore for high-volume raw event ingestion and aggregation.
• Hot-Path Redis Caching: Added a go-redis/v9 caching layer with granular TTL invalidation policies, cutting primary database read load on hot analytics endpoints.
• Verification & IaC: Built ephemeral PostgreSQL repository integration tests using Testcontainers Go, automated unit mocks with Mockery, a CLI high-throughput traffic generator, and declarative Terraform manifests for GCP (Cloud Run, Cloud SQL, Firestore, private VPC) deployed via GitLab CI/CD.`,
    },
    {
        id: SYNTHETIC_EVIDENCE_IDS.kse,
        folder_path: "/experience",
        title: "Kyiv School of Economics (KSE) — Teaching Assistant (Algorithms & Python, 200+ Students)",
        use_for_matching: true,
        created_at: "2026-10-02T12:20:00Z",
        updated_at: "2026-10-20T09:00:00Z",
        text: `Role: Teaching Assistant — Algorithms & Data Structures / Intro to Programming with Python | Kyiv School of Economics (Jan 2025 – Apr 2026)

Instructed over 220 undergraduate students across 6 course groups:
• Designed weekly algorithmic problem sets and automated grading suites reinforcing graph theory, dynamic programming, complexity analysis, and data structure invariants.
• Led bi-weekly live-coding recitations and conducted 1-on-1 code reviews, translating abstract algorithmic trade-offs into clear, production-grade code.`,
    },
    {
        id: SYNTHETIC_EVIDENCE_IDS.dorker,
        folder_path: "/projects",
        title: "Dorker.space — Open-Source Multi-ATS Ingestion & Two-Axis Semantic Matching Engine",
        use_for_matching: true,
        created_at: "2026-10-03T14:00:00Z",
        updated_at: "2026-11-04T18:00:00Z",
        text: `Project: Dorker.space | Creator & Systems Architect

Built an open-source job ingestion, normalization, and two-axis semantic evaluation engine to solve the "overqualified by systems depth, filtered out by a single YoE integer" problem:

• Multi-ATS Scraping & Vector Recall: Extended kalil0321/ats-scrapers into an async Python + PostgreSQL pipeline across 40+ ATS platforms. Used pgvector indexes to narrow millions of raw job records down to ~2,500–3,000 candidate leads with minimal false negatives.
• Custom Block Classifier & Golden Set Evaluation: Standard BERT/cosine similarity fails on contextual trade-offs (e.g., mapping C#/.NET & GCP experience to nice-to-have Java & AWS requirements). Trained a 6-class nomic embedding classifier (Responsibilities, Requirements, About Company, Legal, etc.) to strip boilerplate and increase context density, validated against a hand-labeled 100-job Golden Set sampled via farthest-point method.
• Constrained Reasoning & Jev Migration: Prototyped structured reasoning with Microsoft Guidance on local SLMs to prevent hallucinations, then migrated to TypeSafe AI's Jev model—cutting 100-job evaluation latency from 5 hours to under 60 seconds.
• Context Compression for Grounded Drafting: Uses Jev to score blocks of a 35k+ token candidate Dossier and compress it to the 5–7k most relevant tokens before drafting—eliminating "lost in the middle" degradation and generic AI slop.`,
    },
    {
        id: SYNTHETIC_EVIDENCE_IDS.aiOrchestrator,
        folder_path: "/projects",
        title: "AI-Orchestrator — Distributed Prompt Processing with Transactional Outbox & Redis Streams",
        use_for_matching: true,
        created_at: "2026-10-03T15:00:00Z",
        updated_at: "2026-10-29T16:45:00Z",
        text: `Project: AI-Orchestrator | Distributed Event-Driven LLM Pipeline

Designed and deployed a fault-tolerant, asynchronous AI prompt orchestration platform across decoupled microservices:

• Transactional Outbox Pattern: Solved the dual-write consistency problem between PostgreSQL and Redis Streams by persisting the prompt entity and outbox event in a single ACID transaction, returning 202 Accepted immediately while a background relay flushes events with query-optimized polling (avoiding full table scans).
• Resilient Consumer Fleet: Worker pool consumes from Redis Streams with exponential backoff and idempotent delivery guarantees, streaming completed completions back to clients over WebSockets.
• Observability: Instrumented end-to-end distributed tracing and metrics with OpenTelemetry and Grafana dashboards, packaged with Docker and Terraform for GCP.`,
    },
    {
        id: SYNTHETIC_EVIDENCE_IDS.canonicalResilience,
        folder_path: "/canonical_interview",
        title: "Canonical Deep-Dive — Architecting Resilient Distributed Systems ('What If' Mindset)",
        use_for_matching: true,
        created_at: "2026-10-04T11:00:00Z",
        updated_at: "2026-10-30T10:15:00Z",
        text: `Excerpt from Canonical Written Technical Interview (20-page engineering deep-dive):

"I shift the focus of development from 'making it work' to 'what if.' In event-driven systems under load or network partition, a dual-write between PostgreSQL and a message broker will eventually fail. Implementing the Transactional Outbox pattern guarantees at-least-once delivery—but in distributed systems every solution introduces a new trade-off: downstream consumers must now enforce strict idempotency keys so replayed messages never corrupt state, and outbox polling queries must be indexed to avoid memory spikes under high-frequency ticks."`,
    },
    {
        id: SYNTHETIC_EVIDENCE_IDS.canonicalStochastic,
        folder_path: "/canonical_interview",
        title: "Canonical Deep-Dive — Debugging Stochastic Real-Time Systems & Legacy Monoliths",
        use_for_matching: true,
        created_at: "2026-10-04T11:30:00Z",
        updated_at: "2026-10-30T10:20:00Z",
        text: `Excerpt from Canonical Written Technical Interview:

"Debugging real-time video streaming meant reasoning about a stochastic system handling hundreds of concurrent UDP packets per second—from ICE/DTLS handshakes to partial frame slices passing through CGO FFmpeg bindings—inside a codebase with zero unit tests and circular module dependencies. Formulating falsifiable hypotheses, isolating interfaces, and instrumenting packet-level telemetry taught me to deconstruct opaque systems methodically without waiting for hand-holding."`,
    },
    {
        id: SYNTHETIC_EVIDENCE_IDS.canonicalTransferable,
        folder_path: "/canonical_interview",
        title: "Transferable Engineering Foundations — C#/.NET to Java/Go & GCP to AWS",
        use_for_matching: true,
        created_at: "2026-10-04T12:00:00Z",
        updated_at: "2026-10-30T10:30:00Z",
        text: `Engineering Transferability Note:

• Strong proficiency in C#/.NET (0.8) and enterprise layered APIs (EF Core, NUnit, Redis) provides a deep grasp of typed OOP, DI containers, and transactional safety that maps directly to Java/Kotlin backend stacks when listed as secondary or nice-to-have skills.
• Production Infrastructure-as-Code experience with Terraform on GCP (Cloud Run, Cloud SQL, VPCs, Firestore) and Linux/Docker CLI administration translates directly to AWS primitives (ECS/Fargate, RDS, IAM, VPC).`,
    },
    {
        id: SYNTHETIC_EVIDENCE_IDS.letterGoInfra,
        folder_path: "/cover_letters",
        title: "Reference Cover Letter — Go, Distributed Systems & Low-Latency Infrastructure",
        use_for_matching: false,
        created_at: "2026-10-05T09:00:00Z",
        updated_at: "2026-10-15T09:00:00Z",
        text: `I’m a Backend Software Engineer focused on distributed systems, cloud infrastructure, and applied AI pipelines. In my recent production contract at Pixelview.io, I worked autonomously to replace an SRT streaming pipeline with WebRTC WHIP in Go/Pion—cutting latency 2x (from 14 frames to 5–7)—and deployed a standalone TURN server via Nomad and Terraform. Combined with my AI-Orchestrator project (Transactional Outbox over PostgreSQL and Redis Streams) and teaching Algorithms & Data Structures to 200+ students at KSE, I bring strong ownership, clear communication, and resilient systems thinking.`,
    },
    {
        id: SYNTHETIC_EVIDENCE_IDS.letterAppliedAi,
        folder_path: "/cover_letters",
        title: "Reference Cover Letter — Applied AI, Evaluation Pipelines & Backend Systems",
        use_for_matching: false,
        created_at: "2026-10-05T09:30:00Z",
        updated_at: "2026-10-15T09:30:00Z",
        text: `I’m a Backend & AI Systems Engineer combining production Go and Python microservice engineering with grounded LLM/SLM evaluation architectures. While building Dorker.space—an open-source job intelligence engine over PostgreSQL and pgvector—I trained a custom nomic block classifier on a hand-labeled golden dataset and used constrained reasoning (Microsoft Guidance and TypeSafe AI's Jev) to compress 35k+ token candidate dossiers into high-signal context without hallucinations.`,
    },
    {
        id: SYNTHETIC_EVIDENCE_IDS.constraints,
        folder_path: "/search_parameters",
        title: "Target Role Preferences & Hard Rejection Constraints",
        use_for_matching: true,
        created_at: "2026-10-01T10:05:00Z",
        updated_at: "2026-11-01T10:05:00Z",
        text: `Preferences:
• Target roles: Backend Engineer (Go / Python), AI Infrastructure Engineer, Applied AI Engineer (RAG, evaluation harnesses, agentic orchestration).
• Work policy: Remote-first (or Kyiv hybrid), flexible async-friendly schedule, no invasive time trackers.
• Compensation floor: $40,000+/yr ($3,250+/mo gross) for international remote roles.

Hard Constraints:
• Categorically reject localized Ukrainian market .NET/C# CRUD vacancies due to structural wage dumping.
• Reject positions centered on "vibecoding" ("use Cursor/Claude to write 100% of code"). I build and use AI systems, but engineering requires owning the mental model of the code.
• Reject pure Frontend-only positions.`,
    },
];

export const INITIAL_SYNTHETIC_PROFILE: UserProfile = {
    id: 1,
    name: "Serafym Podolianchuk",
    preferred_name: "Serafym",
    first_name: "Serafym",
    last_name: "Podolianchuk",
    email: "serafym@example.dorker.space",
    phone: "+380 00 000 0000 (Demo Sandbox)",
    residence_country: "UA",
    residence_region: "Kyiv City",
    residence_city: "Kyiv",
    timezone: "Europe/Kyiv",
    linkedin_url:
        "https://www.linkedin.com/pulse/i-got-tired-job-hunting-so-started-building-dorker-podolianchuk-olqpf/",
    github_url: "https://github.com/Developer-dreamer/dorker",
    portfolio_url: "https://dorker.space",
    profile_links: [
        "https://www.linkedin.com/pulse/i-got-tired-job-hunting-so-started-building-dorker-podolianchuk-olqpf/",
    ],
    desired_role_titles: [
        "Backend Engineer (Go / Python)",
        "AI Infrastructure Engineer",
        "Applied AI / LLM Systems Engineer",
        "Distributed Systems Engineer",
    ],
    employment_types: ["full_time", "contract"],
    work_arrangements: ["remote", "hybrid"],
    preferred_work_locations: [
        "Remote (Europe / Global)",
        "Kyiv, Ukraine (Hybrid)",
    ],
    willing_to_relocate: false,
    relocation_destinations: [],
    willing_to_travel: true,
    notice_period_days: 14,
    availability: "immediately",
    earliest_start_date: null,
    professional_headline: "Backend Engineer | AI & Cloud Infrastructure (Go / Python)",
    professional_summary:
        "Backend Software Engineer specializing in distributed systems, cloud infrastructure, and real-time streaming architectures. Proven track record engineering event-driven microservices in Go and Python, migrating real-time WebRTC WHIP/TURN protocols, optimizing PostgreSQL + pgvector workloads, and building evaluation-driven LLM/SLM pipelines. Teaching Assistant for Algorithms & Data Structures (200+ students) at Kyiv School of Economics (KSE).",
    skills: [
        "Go (Golang)",
        "Python",
        "PostgreSQL & pgvector",
        "Redis Streams",
        "Distributed Systems",
        "Docker & Terraform (GCP)",
        "WebRTC (Pion / WHIP / TURN)",
        "LLM Evaluation & Structured Generation (Jev / Guidance)",
        "OpenTelemetry",
        "C# / .NET Architecture",
    ],
    employment_history: [
        {
            id: "emp-dorker",
            title: "Creator & Lead Systems Engineer",
            company: "Dorker.space (Open-Source)",
            employment_type: "full_time",
            work_arrangement: "remote",
            location: "Remote",
            start_date: "2025-09",
            end_date: null,
            is_current: true,
            description:
                "Architected an open-source multi-ATS job scraping and two-axis semantic matching engine over 40+ ATS sources using async Python, PostgreSQL + pgvector, a custom 6-class nomic embedding classifier, and TypeSafe AI's Jev model.",
            evidence_ids: [
                SYNTHETIC_EVIDENCE_IDS.dorker,
                SYNTHETIC_EVIDENCE_IDS.aiOrchestrator,
            ],
        },
        {
            id: "emp-pixelview",
            title: "Go WebRTC Engineer",
            company: "Pixelview.io",
            employment_type: "contract",
            work_arrangement: "remote",
            location: "Remote",
            start_date: "2026-01",
            end_date: "2026-03",
            is_current: false,
            description:
                "Migrated video streaming engine from SRT to WebRTC WHIP with Trickle ICE in Go/Pion (cutting latency 2x from 14 to 5–7 frames), deployed a standalone TURN server via Nomad/HCL, eliminated circular module dependencies, and upgraded CGO FFmpeg v7 to v8.",
            evidence_ids: [
                SYNTHETIC_EVIDENCE_IDS.pixelview,
                SYNTHETIC_EVIDENCE_IDS.canonicalStochastic,
            ],
        },
        {
            id: "emp-kse",
            title: "Teaching Assistant — Algorithms & Data Structures / Python",
            company: "Kyiv School of Economics (KSE)",
            employment_type: "part_time",
            work_arrangement: "hybrid",
            location: "Kyiv, Ukraine",
            start_date: "2025-01",
            end_date: "2026-04",
            is_current: false,
            description:
                "Instructed 220+ undergraduate students across 6 groups in Algorithms & Data Structures and Python. Designed weekly algorithmic assignments, led bi-weekly recitations, and conducted live-coding reviews.",
            evidence_ids: [SYNTHETIC_EVIDENCE_IDS.kse],
        },
        {
            id: "emp-headway",
            title: "Go Backend Engineer (Intern)",
            company: "Headway Inc.",
            employment_type: "internship",
            work_arrangement: "hybrid",
            location: "Kyiv, Ukraine",
            start_date: "2025-06",
            end_date: "2025-07",
            is_current: false,
            description:
                "Engineered a concurrent analytics microservice in Go 1.24 using PostgreSQL (sqlx + Goose), Firestore, and Redis caching, verified with Testcontainers Go and provisioned on GCP via Terraform and GitLab CI/CD.",
            evidence_ids: [SYNTHETIC_EVIDENCE_IDS.headway],
        },
    ],
    education: [
        {
            id: "edu-kse",
            institution: "Kyiv School of Economics (KSE)",
            degree: "Bachelor of Science",
            field_of_study: "Artificial Intelligence & Software Engineering",
            location: "Kyiv, Ukraine",
            start_date: "2023-09",
            end_date: "2027-06",
            is_current: true,
            description:
                "Top marks in Algorithms & Data Structures, Advanced Algorithms, Discrete Mathematics, Distributed Systems, Microservices, Parallel Programming, and Machine Learning.",
            evidence_ids: [
                SYNTHETIC_EVIDENCE_IDS.kse,
                SYNTHETIC_EVIDENCE_IDS.canonicalResilience,
            ],
        },
    ],
    languages: [
        { id: "lang-en", language: "English", proficiency: "fluent" },
        { id: "lang-uk", language: "Ukrainian", proficiency: "native" },
    ],
    work_authorizations: [
        {
            id: "auth-ua",
            country: "UA",
            authorized_as_employee: true,
            available_as_contractor: true,
            sponsorship_needed_now: false,
            sponsorship_needed_later: false,
        },
        {
            id: "auth-eu",
            country: "PL",
            authorized_as_employee: false,
            available_as_contractor: true,
            sponsorship_needed_now: false,
            sponsorship_needed_later: false,
        },
        {
            id: "auth-us",
            country: "US",
            authorized_as_employee: false,
            available_as_contractor: true,
            sponsorship_needed_now: false,
            sponsorship_needed_later: true,
        },
    ],
    compensation_expectations: [
        {
            id: "comp-remote",
            role_scope: "International Remote (B2B / Contractor)",
            currency: "USD",
            period: "year",
            minimum: 45000,
            target: 65000,
            maximum: 95000,
        },
    ],
    resumes: [
        {
            id: "res-backend-ai",
            label: "Serafym_Podolianchuk_Backend_AI_Infra_CV.pdf",
            url: "https://dorker.space",
        },
    ],
    default_resume_id: "res-backend-ai",
    created_at: "2026-10-01T10:00:00Z",
    updated_at: "2026-11-05T12:00:00Z",
};

export const INITIAL_SYNTHETIC_JOBS: ApiJobResponse[] = [
    {
        id: "greenhouse:6242812004",
        title: "Senior AI Engineer (CCC Casualty / Claims Intelligence)",
        company: "EvolutionIQ",
        location: "Chicago, IL or Remote",
        ats_type: "greenhouse",
        employment_type: "FULL_TIME",
        url: "https://boards.greenhouse.io/evolutioniq/jobs/6242812004",
        apply_url: "https://boards.greenhouse.io/evolutioniq/jobs/6242812004",
        salary_min: null,
        salary_max: null,
        salary_currency: "USD",
        posted_at: "2026-11-04T10:00:00Z",
        fetched_at: "2026-11-04T14:00:00Z",
        questions: [
            "Describe an agentic or LLM evaluation pipeline you owned from prototype to production.",
            "How do you handle observability, latency, and cost trade-offs in non-deterministic AI services?",
        ],
        description: `CCC Intelligent Solutions Inc. (CCC) is a leading cloud platform for the multi-trillion-dollar insurance economy, creating intelligent experiences for insurers, repairers, automakers, part suppliers, and more. At CCC, we're making life just work by empowering more than 35,000 businesses with industry-leading technology to get drivers back on the road and to health quickly and seamlessly. We're pushing boundaries with innovative AI solutions that simplify and enhance the claims and repair journey. Through purposeful innovation and the strength of its connections, CCC technologies empower the people and industry relied upon to keep lives moving forward when it matters most. Learn more about CCC at (http://www.cccis.com/).

**The Role**

As a Senior AI Engineer, you'll own agents end to end within a problem area, from the first prototype to measured performance in production. You'll join a new engineering group at CCC building AI-native products for our auto casualty business, the injury side of auto claims. The group is small and senior, and it's growing fast. Our teams work on:

• Medical-bill extraction, synthesis, and claims decision-support agents operating over complex unstructured clinical documents.
• Shared agentic orchestration, tool use, hybrid retrieval (RAG + vector search), structured extraction, and human-in-the-loop review workflows.
• Deterministic evaluation harnesses, golden datasets, and production guardrails monitoring latency, cost, and hallucination rates.

**Qualifications**

• Strong backend software engineering foundation in Python API services and TypeScript.
• Hands-on experience building production LLM/SLM pipelines, structured output extraction, embeddings, and vector search (pgvector or similar).
• Experience with document understanding, OCR, fine-tuning, and multimodal pipelines is a strong plus.`,
    },
    {
        id: "ashby:aura-ai-platform-1019",
        title: "Senior Software Engineer, AI Intelligence Platform",
        company: "Aura",
        location: "Remote Poland",
        ats_type: "ashby",
        employment_type: "FULL_TIME",
        url: "https://jobs.ashbyhq.com/aura/ai-intelligence-platform",
        apply_url: "https://jobs.ashbyhq.com/aura/ai-intelligence-platform",
        salary_min: null,
        salary_max: null,
        salary_currency: "USD",
        posted_at: "2026-10-19T09:00:00Z",
        fetched_at: "2026-10-20T09:00:00Z",
        questions: [
            "What is the most complex data ingestion and semantic indexing pipeline you have built?",
            "How do you approach schema evolution and backpressure in event-driven backend architectures?",
        ],
        description: `Aura is building a workforce and market intelligence platform powered by large-scale entity resolution and semantic search.

**What You'll Do**
• Architect high-throughput ingestion pipelines in Python and Go that normalize millions of company and workforce records across heterogeneous sources.
• Maintain hybrid PostgreSQL + vector search clusters and evaluation benchmarks for classification models.
• Collaborate in a remote European engineering team with high autonomy and async-first communication.

**Requirements**
• Strong production experience in Python and/or Go, PostgreSQL performance tuning, and distributed queues (Redis Streams / Kafka).
• Experience deploying containerized microservices on GCP or AWS using Terraform.`,
    },
    {
        id: "greenhouse:cribl-stream-912",
        title: "Sr Software Engineer, Stream Integrations",
        company: "Cribl",
        location: "Remote - United States",
        ats_type: "greenhouse",
        employment_type: "FULL_TIME",
        url: "https://boards.greenhouse.io/cribl/jobs/stream-912",
        apply_url: "https://boards.greenhouse.io/cribl/jobs/stream-912",
        salary_min: null,
        salary_max: null,
        salary_currency: "USD",
        posted_at: "2026-09-12T12:00:00Z",
        fetched_at: "2026-09-15T12:00:00Z",
        questions: [
            "Describe your experience debugging low-level network protocols or high-throughput streaming pipelines.",
        ],
        description: `Cribl makes open observability a reality for modern engineering organizations. Our Stream Integrations team builds high-performance telemetry collectors, protocol adapters, and streaming transformation engines.

**Responsibilities**
• Design and optimize high-throughput data ingestion connectors processing gigabits per second of logs, metrics, and traces.
• Diagnose protocol-level bottlenecks across TCP/UDP, HTTP/2, gRPC, and cloud storage sinks.
• Write deterministic integration tests using containerized harnesses.`,
    },
    {
        id: "greenhouse:coinbase-blockchain-909",
        title: "Senior Software Engineer- Blockchain Network",
        company: "Coinbase",
        location: "Remote - USA",
        ats_type: "greenhouse",
        employment_type: "FULL_TIME",
        url: "https://www.coinbase.com/careers/positions/blockchain-network",
        apply_url: "https://www.coinbase.com/careers/positions/blockchain-network",
        salary_min: null,
        salary_max: null,
        salary_currency: "USD",
        posted_at: "2026-09-09T15:00:00Z",
        fetched_at: "2026-09-10T15:00:00Z",
        questions: [
            "Tell us about a distributed system you designed where idempotency and state consistency were critical.",
        ],
        description: `Coinbase's Blockchain Network Infrastructure team builds the resilient Go microservices that index, broadcast, and reconcile on-chain transactions at global scale.

**What We Look For**
• Deep proficiency in Go (Golang), concurrency primitives, and distributed fault tolerance (Transactional Outbox, idempotent consumers, consensus state machines).
• Experience with PostgreSQL, Redis, Docker, and Terraform.`,
    },
    {
        id: "ashby:boon-tech-1028",
        title: "Senior Software Engineer",
        company: "Boon Technologies, Inc.",
        location: "United States (Remote)",
        ats_type: "ashby",
        employment_type: "FULL_TIME",
        url: "https://jobs.ashbyhq.com/boon/senior-software-engineer",
        apply_url: "https://jobs.ashbyhq.com/boon/senior-software-engineer",
        salary_min: 140000,
        salary_max: 190000,
        salary_currency: "USD",
        posted_at: "2026-10-28T11:00:00Z",
        fetched_at: "2026-10-29T11:00:00Z",
        questions: [
            "Why are you interested in building AI-native workflow automation at Boon?",
            "Share an example of taking a complex feature from ambiguous requirements to production autonomously.",
        ],
        description: `Boon is building AI-powered operational agents for logistics and supply-chain fleets. We are looking for an autonomous backend/AI engineer who cares deeply about reliability, low-latency inference, and clean system architecture.

**What You'll Own**
• End-to-end backend services in Python and Go orchestrating structured LLM workflows, webhook ingestion, and real-time status streams.
• Evaluation suites that prevent regressions across prompt and model updates.`,
    },
    {
        id: "ashby:modal-distributed-systems-01",
        title: "Backend & Distributed Systems Engineer (Go / Python)",
        company: "Modal",
        location: "Remote (Europe / US)",
        ats_type: "ashby",
        employment_type: "FULL_TIME",
        url: "https://jobs.ashbyhq.com/modal/distributed-systems-go-python",
        apply_url: "https://jobs.ashbyhq.com/modal/distributed-systems-go-python",
        salary_min: 160000,
        salary_max: 210000,
        salary_currency: "USD",
        posted_at: "2026-11-05T09:30:00Z",
        fetched_at: "2026-11-05T10:00:00Z",
        questions: [
            "Describe the most challenging distributed systems or networking problem you have debugged in production.",
            "We care more about how you think and build than your exact years of experience. Point us to a system you designed from scratch.",
        ],
        description: `Modal lets data and AI teams run generative models, large-scale batch jobs, and serverless containers in seconds without managing infrastructure.

**About the Role**
We are hiring a Backend & Distributed Systems Engineer to work on our container runtime scheduler, high-throughput event streams, and control-plane APIs in Go and Python. Note: While this role carries a Senior band, we evaluate candidates on systems fundamentals, autonomous ownership, and engineering clarity rather than a rigid years-of-experience threshold.

**What You Will Do**
• Build low-latency scheduling, streaming, and state-synchronization services in Go and async Python backed by PostgreSQL and Redis.
• Design resilient networking and NAT/proxy traversal layers for ephemeral worker containers.
• Instrument services with OpenTelemetry tracing and deterministic integration test suites.

**Nice to Have**
• Experience with AWS or GCP (Terraform), WebRTC/UDP streaming protocols, or LLM inference workloads.`,
    },
    {
        id: "ashby:livekit-webrtc-go-02",
        title: "Realtime Media & WebRTC Systems Engineer (Go)",
        company: "LiveKit",
        location: "Remote (Global)",
        ats_type: "ashby",
        employment_type: "FULL_TIME",
        url: "https://jobs.ashbyhq.com/livekit/realtime-webrtc-go",
        apply_url: "https://jobs.ashbyhq.com/livekit/realtime-webrtc-go",
        salary_min: 155000,
        salary_max: 195000,
        salary_currency: "USD",
        posted_at: "2026-11-02T14:00:00Z",
        fetched_at: "2026-11-02T16:00:00Z",
        questions: [
            "Describe your hands-on experience with Pion WebRTC, WHIP/WHEP, ICE/TURN, or low-latency media routing in Go.",
        ],
        description: `LiveKit builds open-source real-time media infrastructure powering voice, video, and multimodal AI agents at global scale.

**What You'll Work On**
• Core Go (Pion WebRTC) media server routing, WHIP/WHEP ingestion endpoints, and Trickle ICE / TURN relay reliability across restrictive firewalls.
• Optimizing frame-level latency and transcoding pipelines (FFmpeg / CGO) for real-time voice and video AI agents.
• Writing reproducible network simulation and integration tests.`,
    },
    {
        id: "greenhouse:together-ai-eval-03",
        title: "AI Infrastructure & Evaluation Engineer",
        company: "Together AI",
        location: "Remote (Europe / US)",
        ats_type: "greenhouse",
        employment_type: "FULL_TIME",
        url: "https://boards.greenhouse.io/togetherai/jobs/ai-infra-eval",
        apply_url: "https://boards.greenhouse.io/togetherai/jobs/ai-infra-eval",
        salary_min: 170000,
        salary_max: 220000,
        salary_currency: "USD",
        posted_at: "2026-11-01T11:00:00Z",
        fetched_at: "2026-11-01T12:00:00Z",
        questions: [
            "How have you used structured generation (e.g., Guidance, grammar constraints, or specialized SLMs) to improve reliability and latency?",
            "Describe how you curate golden datasets and measure precision/recall on custom classification pipelines.",
        ],
        description: `Together AI builds the open cloud platform for training, fine-tuning, and running inference on frontier and specialized open-source models.

**Role Overview**
• Architect high-throughput evaluation harnesses, structured output routers, and async batch orchestration services in Python and Go.
• Benchmark SLM vs. LLM trade-offs across latency, token density, and schema compliance.
• Maintain PostgreSQL + pgvector telemetry stores and OpenTelemetry observability pipelines.`,
    },
    {
        id: "ashby:supabase-pgvector-04",
        title: "Backend Engineer — Postgres & Vector Tooling",
        company: "Supabase",
        location: "Remote (Europe)",
        ats_type: "ashby",
        employment_type: "FULL_TIME",
        url: "https://jobs.ashbyhq.com/supabase/postgres-vector-tooling",
        apply_url: "https://jobs.ashbyhq.com/supabase/postgres-vector-tooling",
        salary_min: 150000,
        salary_max: 190000,
        salary_currency: "USD",
        posted_at: "2026-10-27T08:30:00Z",
        fetched_at: "2026-10-27T10:00:00Z",
        questions: [
            "Tell us about how you have scaled PostgreSQL and pgvector over millions of rows in production.",
        ],
        description: `Supabase is the open-source Postgres development platform. We are hiring a Backend Engineer to work on our Postgres extensions ecosystem, pgvector indexing, and developer tooling in Go and Python.`,
    },
    {
        id: "greenhouse:redpanda-streaming-05",
        title: "Distributed Cloud & Streaming Backend Engineer (Go)",
        company: "Redpanda Data",
        location: "Remote Europe",
        ats_type: "greenhouse",
        employment_type: "FULL_TIME",
        url: "https://boards.greenhouse.io/redpanda/jobs/cloud-go-05",
        apply_url: "https://boards.greenhouse.io/redpanda/jobs/cloud-go-05",
        salary_min: 145000,
        salary_max: 180000,
        salary_currency: "USD",
        posted_at: "2026-10-15T10:00:00Z",
        fetched_at: "2026-10-15T12:00:00Z",
        questions: [
            "Describe your experience provisioning cloud control planes with Go and Terraform.",
        ],
        description: `Redpanda is the streaming data platform built for developers. Our Cloud Control Plane team builds the Go microservices and Terraform operators that provision, monitor, and heal streaming clusters across GCP and AWS.`,
    },
    {
        id: "lever:mistral-inference-06",
        title: "Inference Platform Engineer (SLM / Structured Generation)",
        company: "Mistral AI",
        location: "Paris / Remote Europe",
        ats_type: "lever",
        employment_type: "FULL_TIME",
        url: "https://jobs.lever.co/mistral/inference-platform-06",
        apply_url: "https://jobs.lever.co/mistral/inference-platform-06",
        salary_min: 130000,
        salary_max: 170000,
        salary_currency: "EUR",
        posted_at: "2026-10-24T10:00:00Z",
        fetched_at: "2026-10-24T12:00:00Z",
        questions: [
            "What is your experience optimizing SLM inference pipelines and custom token-steering constraints?",
        ],
        description: `Mistral AI is looking for an Inference Platform Engineer to build low-latency batching, grammar-constrained decoding, and evaluation APIs in Python, Go, and C++/CUDA.`,
    },
    {
        id: "ashby:planetscale-storage-07",
        title: "Staff Distributed Storage Engine Engineer",
        company: "PlanetScale",
        location: "Remote",
        ats_type: "ashby",
        employment_type: "FULL_TIME",
        url: "https://jobs.ashbyhq.com/planetscale/storage-engine-07",
        apply_url: "https://jobs.ashbyhq.com/planetscale/storage-engine-07",
        salary_min: 190000,
        salary_max: 240000,
        salary_currency: "USD",
        posted_at: "2026-10-10T10:00:00Z",
        fetched_at: "2026-10-10T12:00:00Z",
        questions: [],
        description: `Build Vitess and PostgreSQL kernel-level query planners and NVMe storage engines in Go and C. Requires 8+ years of database internals and Linux kernel storage optimization.`,
    },
    {
        id: "djinni:local-dotnet-crud-08",
        title: "Middle/Senior .NET Enterprise CRUD Developer",
        company: "Local FinTech Outsource",
        location: "Kyiv / Hybrid (9:00–18:00 Time Tracker)",
        ats_type: "djinni",
        employment_type: "FULL_TIME",
        url: "https://djinni.co/jobs/local-dotnet-crud-08",
        apply_url: "https://djinni.co/jobs/local-dotnet-crud-08",
        salary_min: 18000,
        salary_max: 24000,
        salary_currency: "USD",
        posted_at: "2026-10-22T09:00:00Z",
        fetched_at: "2026-10-22T10:00:00Z",
        questions: [],
        description: `Maintaining legacy ASP.NET Core / C# enterprise CRUD forms for regional banking back-office. Strict 9:00 to 18:00 desk availability with Hubstaff screenshot tracker required. Compensation $1,500/month.`,
    },
    {
        id: "ashby:vibecode-agency-09",
        title: "AI Full-Stack '10x Vibecoder' (Cursor / Claude Code Only)",
        company: "Velocity AI Studio",
        location: "Remote",
        ats_type: "ashby",
        employment_type: "CONTRACT",
        url: "https://jobs.ashbyhq.com/velocity/vibecoder-09",
        apply_url: "https://jobs.ashbyhq.com/velocity/vibecoder-09",
        salary_min: 48000,
        salary_max: 72000,
        salary_currency: "USD",
        posted_at: "2026-10-26T09:00:00Z",
        fetched_at: "2026-10-26T10:00:00Z",
        questions: [],
        description: `We ship 5 MVP web apps a week! Do NOT write code by hand—you must prompt Cursor and Claude Code to generate 100% of frontend and backend code without spending time on manual architecture or unit tests.`,
    },
];

export const INITIAL_SYNTHETIC_MATCHES: ApiMatchResponse[] = [
    {
        id: "019675c0-0001-7000-8000-000000000001",
        job_id: "greenhouse:6242812004",
        suitability_tier: "STRETCH",
        pipeline_status: "PENDING",
        technical_capability_score: 0.26,
        strategic_value_score: 0.88,
        rejection_reason: null,
        created_at: "2026-11-04T14:10:00Z",
        updated_at: "2026-11-04T14:10:00Z",
        analytics: {
            summary:
                "This is a senior applied AI/ML engineering role building LLM-powered products for auto casualty claims, including medical-bill workflows, claims decision support, and shared agentic rules and evaluation infrastructure. The engineer owns agents from prototype through customer-facing production, working with complex documents and claims data on orchestration, tool use, retrieval, structured extraction, human review, evaluations, and guardrails. The stated stack centers on Python API services and TypeScript, with RAG, embeddings, and vector search; document understanding, OCR, fine-tuning, and multimodal experience are listed as useful but optional.",
            pros: [
                "The role offers end-to-end ownership and technically varied work across agent orchestration, retrieval, evaluation of non-deterministic systems, and production concerns such as observability, cost, and latency. It also involves close evaluation work with data labelers and subject-matter experts, with a concrete development loop: measured golden-dataset benchmarks directly parallel the Dorker.space evaluation pipeline (nomic classifier + 100-job hand-labeled golden set + Jev structured inference).",
                "Core backend stack (async Python API services, PostgreSQL + pgvector retrieval, structured extraction, and OpenTelemetry observability from AI-Orchestrator) aligns directly with the platform foundation.",
                "High strategic career value (88%): directly advances target transition toward deep Applied AI & Evaluation Infrastructure in an autonomous, high-ownership engineering group.",
            ],
            cons: [
                "Title carries a Senior US insurance-tech benchmark and expects deep production track record in commercial clinical/claims document extraction, making raw years-of-experience screening a Stretch hurdle.",
                "Location lists 'Chicago, IL or Remote'—requires confirming whether international remote contractor engagement from Europe/Ukraine is supported or if US work authorization is strictly enforced.",
            ],
        },
    },
    {
        id: "019675c0-0002-7000-8000-000000000002",
        job_id: "ashby:aura-ai-platform-1019",
        suitability_tier: "STRETCH",
        pipeline_status: "PENDING",
        technical_capability_score: 0.26,
        strategic_value_score: 0.86,
        rejection_reason: null,
        created_at: "2026-10-19T15:00:00Z",
        updated_at: "2026-10-19T15:00:00Z",
        analytics: {
            summary:
                "Senior Software Engineer role on Aura's AI Intelligence Platform focusing on large-scale workforce/company ingestion, entity normalization, and hybrid PostgreSQL + vector search in a Remote Poland / European time-zone team.",
            pros: [
                "Direct architectural overlap with Dorker.space: Aura ingests and normalizes millions of workforce/job records into PostgreSQL + vector indexes and runs classification benchmarks—the exact domain you built from scratch.",
                "Go + Python + PostgreSQL + Redis + Terraform on GCP stack matches your production experience at Headway and Pixelview.",
                "Remote Poland / European time zone aligns seamlessly with Kyiv (UTC+2) and contractor authorization.",
            ],
            cons: [
                "Senior title band typically screens for 4–5+ commercial years on paper; framing Dorker.space and autonomous Pixelview delivery upfront in the cover letter is essential to bypass YoE heuristics.",
            ],
        },
    },
    {
        id: "019675c0-0003-7000-8000-000000000003",
        job_id: "greenhouse:cribl-stream-912",
        suitability_tier: "STRETCH",
        pipeline_status: "PENDING",
        technical_capability_score: 0.26,
        strategic_value_score: 0.86,
        rejection_reason: null,
        created_at: "2026-09-12T16:00:00Z",
        updated_at: "2026-09-12T16:00:00Z",
        analytics: {
            summary:
                "Senior streaming integrations role at Cribl building high-throughput telemetry connectors, UDP/TCP protocol adapters, and observability pipelines.",
            pros: [
                "Hands-on protocol migration (SRT to WebRTC WHIP over raw UDP) and standalone TURN server engineering at Pixelview demonstrate rare low-level network and streaming diagnostic capability.",
                "Experience with OpenTelemetry, containerized integration harnesses (Testcontainers), and high-throughput event ingestion at Headway fits the observability domain.",
            ],
            cons: [
                "Posting specifies 'Remote - United States', which likely restricts payroll to US residents unless global B2B contracting is open for this team.",
            ],
        },
    },
    {
        id: "019675c0-0004-7000-8000-000000000004",
        job_id: "greenhouse:coinbase-blockchain-909",
        suitability_tier: "STRETCH",
        pipeline_status: "PENDING",
        technical_capability_score: 0.26,
        strategic_value_score: 0.85,
        rejection_reason: null,
        created_at: "2026-09-09T18:00:00Z",
        updated_at: "2026-09-09T18:00:00Z",
        analytics: {
            summary:
                "Go-focused distributed systems role on Coinbase's Blockchain Network team building fault-tolerant indexing and transaction broadcast services.",
            pros: [
                "Strong alignment on Go concurrency, PostgreSQL transactional safety, Redis Streams, and the Transactional Outbox + idempotent consumer patterns implemented in AI-Orchestrator.",
                "High bar for distributed systems rigor and clean interface decoupling.",
            ],
            cons: [
                "No prior commercial Web3/blockchain protocol experience (though core distributed state machine primitives transfer directly).",
                "US Remote geographic constraint requires verification.",
            ],
        },
    },
    {
        id: "019675c0-0005-7000-8000-000000000005",
        job_id: "ashby:boon-tech-1028",
        suitability_tier: "STRETCH",
        pipeline_status: "PENDING",
        technical_capability_score: 0.27,
        strategic_value_score: 0.93,
        rejection_reason: null,
        created_at: "2026-10-28T14:00:00Z",
        updated_at: "2026-10-28T14:00:00Z",
        analytics: {
            summary:
                "Senior Backend & AI Engineer role at Boon Technologies ($140k–$190k) building production AI workflow automation in Python and Go with deterministic evaluation suites.",
            pros: [
                "Very high strategic value (93%): small, fast-moving engineering team where autonomous end-to-end ownership (like your single-engineer delivery at Pixelview) is prized over corporate hierarchy.",
                "Exact technical match on Python + Go backend services, structured LLM orchestration, and regression evaluation harnesses.",
            ],
            cons: [
                "Senior title requires highlighting production autonomy and the 5h -> <1m Jev evaluation pipeline to stand out against candidates with longer tenure.",
            ],
        },
    },
    {
        id: "019675c0-0006-7000-8000-000000000006",
        job_id: "ashby:modal-distributed-systems-01",
        suitability_tier: "SUITABLE",
        pipeline_status: "PENDING",
        technical_capability_score: 0.86,
        strategic_value_score: 0.94,
        rejection_reason: null,
        created_at: "2026-11-05T10:30:00Z",
        updated_at: "2026-11-05T10:30:00Z",
        analytics: {
            summary:
                "High-signal Suitable match for Backend & Distributed Systems Engineer (Go / Python) at Modal. The posting explicitly welcomes European remote engineers and states that systems thinking and autonomous ownership outweigh a rigid years-of-experience number.",
            pros: [
                "Explicitly values how you think over raw YoE—directly matching your profile philosophy and giving your Dorker.space + Pixelview + AI-Orchestrator portfolio maximum leverage.",
                "Core stack (Go, async Python, PostgreSQL, Redis Streams, OpenTelemetry, container networking/NAT traversal) hits your highest-confidence skills (0.8 in Go, Python, PostgreSQL, Docker, Linux).",
                "Cloud requirement lists AWS or GCP (Terraform) as interchangeable—your Terraform GCP modules at Headway satisfy this cleanly.",
            ],
            cons: [
                "Expects deep fluency in Linux container isolation primitives; emphasize your Linux CLI administration and low-level CGO/UDP debugging at Pixelview.",
            ],
        },
    },
    {
        id: "019675c0-0007-7000-8000-000000000007",
        job_id: "ashby:livekit-webrtc-go-02",
        suitability_tier: "SUITABLE",
        pipeline_status: "APPLIED",
        technical_capability_score: 0.91,
        strategic_value_score: 0.92,
        rejection_reason: null,
        created_at: "2026-11-02T17:00:00Z",
        updated_at: "2026-11-03T11:00:00Z",
        analytics: {
            summary:
                "Direct domain and stack match (91% Technical, 92% Strategic) for Realtime Media & WebRTC Systems Engineer (Go) at LiveKit. Your hands-on production migration from SRT to WebRTC WHIP in Go/Pion and standalone TURN deployment at Pixelview directly mirror LiveKit's core media server architecture.",
            pros: [
                "Rare 1-to-1 production evidence: Pion WebRTC in Go, WHIP ingestion, Trickle ICE, standalone TURN server for UDP/NAT traversal, and CGO FFmpeg v7->v8 upgrade.",
                "Demonstrated ability to cut real-time streaming latency by 2x (14 FPS to 5–7 FPS) and untangle circular Go module dependencies autonomously.",
                "Global remote culture with strong open-source engineering ethos.",
            ],
            cons: [
                "In profile.xml you noted WebRTC was explored primarily for production delivery; frame it as a proven ability to master complex RFC protocols rapidly under real production constraints.",
            ],
        },
    },
    {
        id: "019675c0-0008-7000-8000-000000000008",
        job_id: "greenhouse:together-ai-eval-03",
        suitability_tier: "SUITABLE",
        pipeline_status: "INTERVIEWING",
        technical_capability_score: 0.82,
        strategic_value_score: 0.95,
        rejection_reason: null,
        created_at: "2026-11-01T13:00:00Z",
        updated_at: "2026-11-04T09:00:00Z",
        analytics: {
            summary:
                "Top strategic match (95%) for AI Infrastructure & Evaluation Engineer at Together AI. Focuses on structured generation, SLM vs. LLM benchmarking, golden dataset curation, and high-throughput async Python/Go backends.",
            pros: [
                "Your Dorker.space R&D story (training a 6-class nomic block classifier, curating a 100-job Golden Set via farthest-point sampling, steering SLMs with Microsoft Guidance, and migrating to TypeSafe AI's Jev for a 300x speedup) is a textbook case study for this exact role.",
                "AI-Orchestrator proves distributed systems rigor (Transactional Outbox, Redis Streams, exponential backoff, OpenTelemetry) for async inference fleets.",
            ],
            cons: [
                "Deep PyTorch / CUDA kernel profiling is still an active university & R&D growth track (0.1–0.3); position yourself firmly on the distributed inference orchestration, structured evaluation, and data-pipeline side.",
            ],
        },
    },
    {
        id: "019675c0-0009-7000-8000-000000000009",
        job_id: "ashby:supabase-pgvector-04",
        suitability_tier: "SUITABLE",
        pipeline_status: "PENDING",
        technical_capability_score: 0.84,
        strategic_value_score: 0.91,
        rejection_reason: null,
        created_at: "2026-10-27T11:00:00Z",
        updated_at: "2026-10-27T11:00:00Z",
        analytics: {
            summary:
                "Strong open-source Backend Engineer match at Supabase working on PostgreSQL extensions, pgvector indexing, and Go/Python control-plane services.",
            pros: [
                "Hands-on experience scaling PostgreSQL + pgvector over millions of multi-ATS job rows in Dorker.space to achieve fast semantic recall with low false negatives.",
                "Production Go + PostgreSQL (sqlx, Pressly Goose migrations, Testcontainers Go) experience from Headway.",
            ],
            cons: [
                "C extension internals for Postgres are a secondary skill; highlight strong C/C++ algorithmic foundations from KSE and practical query/index optimization.",
            ],
        },
    },
    {
        id: "019675c0-0010-7000-8000-000000000010",
        job_id: "greenhouse:redpanda-streaming-05",
        suitability_tier: "SUITABLE",
        pipeline_status: "OFFER",
        technical_capability_score: 0.79,
        strategic_value_score: 0.89,
        rejection_reason: null,
        created_at: "2026-10-15T13:00:00Z",
        updated_at: "2026-11-05T16:00:00Z",
        analytics: {
            summary:
                "Distributed Cloud & Streaming Backend Engineer (Go) at Redpanda Data. Combines Go control-plane microservices, Terraform cloud provisioning, and event-streaming architecture.",
            pros: [
                "Strong match with Go 1.24 microservice engineering, Terraform GCP IaC provisioning, and event-driven streaming architectures.",
                "Remote Europe work policy and async engineering culture.",
            ],
            cons: [
                "AWS-specific Terraform modules will be learned on the job, building directly on existing GCP Terraform & Nomad HCL production experience.",
            ],
        },
    },
    {
        id: "019675c0-0011-7000-8000-000000000011",
        job_id: "lever:mistral-inference-06",
        suitability_tier: "RUNWAY",
        pipeline_status: "PENDING",
        technical_capability_score: 0.58,
        strategic_value_score: 0.94,
        rejection_reason: null,
        created_at: "2026-10-24T14:00:00Z",
        updated_at: "2026-10-24T14:00:00Z",
        analytics: {
            summary:
                "Runway match (58% Technical, 94% Strategic) for Inference Platform Engineer at Mistral AI. While Python/Go API gateways and grammar-constrained SLM evaluation match strongly, the role also expects low-level C++/CUDA kernel optimization.",
            pros: [
                "Practical experience with constrained decoding (Microsoft Guidance) and SLM evaluation pipelines in Dorker.space.",
                "High alignment with long-term AI Infrastructure & R&D career trajectory.",
            ],
            cons: [
                "Requires deeper C++/CUDA and PyTorch internals than current 0.1–0.4 self-score; classified as RUNWAY as upcoming KSE Deep Learning & NLP modules clear this academic delta.",
            ],
        },
    },
    {
        id: "019675c0-0012-7000-8000-000000000012",
        job_id: "ashby:planetscale-storage-07",
        suitability_tier: "RUNWAY",
        pipeline_status: "GHOSTED",
        technical_capability_score: 0.49,
        strategic_value_score: 0.84,
        rejection_reason: null,
        created_at: "2026-10-10T15:00:00Z",
        updated_at: "2026-10-28T10:00:00Z",
        analytics: {
            summary:
                "Staff-level database storage kernel role at PlanetScale. High distributed systems interest, but requires 8+ years of Linux kernel NVMe and Vitess internals.",
            pros: [
                "Strong Go and PostgreSQL query optimization foundation.",
            ],
            cons: [
                "Staff tenure requirement (8+ years) and kernel storage specialization make this a long-term Runway benchmark rather than an immediate target.",
            ],
        },
    },
    {
        id: "019675c0-0013-7000-8000-000000000013",
        job_id: "djinni:local-dotnet-crud-08",
        suitability_tier: "REJECTED",
        pipeline_status: "REJECTED_EARLY",
        technical_capability_score: 0.78,
        strategic_value_score: 0.12,
        rejection_reason:
            "Hard Constraint Violation: Categorically reject localized Ukrainian market .NET/C# CRUD positions with structural wage dumping ($1,500/mo) and mandatory 9:00–18:00 Hubstaff time-tracker surveillance. High .NET proficiency (0.8) in profile is reserved to validate distributed systems architecture, not enterprise CRUD maintenance.",
        created_at: "2026-10-22T11:00:00Z",
        updated_at: "2026-10-22T11:05:00Z",
        analytics: {
            summary:
                "Although technical capability score is high (78%) due to 0.8 proficiency in C#/.NET and EF Core, Dorker's two-axis evaluator automatically rejected this role (Strategic Value: 12%) based on three explicit profile constraints.",
            pros: [
                "Familiar stack (C#, .NET, EF Core, PostgreSQL, Redis) from prior EPAM internship.",
            ],
            cons: [
                "Violates Constraint #1: Localized .NET CRUD wage dumping ($1,500/mo vs $3,250+/mo target).",
                "Violates Work Policy: Enforces rigid 9-to-18 schedule with invasive screenshot time tracker.",
                "Zero strategic growth toward AI Infrastructure or high-load Go/Python distributed systems.",
            ],
        },
    },
    {
        id: "019675c0-0014-7000-8000-000000000014",
        job_id: "ashby:vibecode-agency-09",
        suitability_tier: "REJECTED",
        pipeline_status: "SKIPPED",
        technical_capability_score: 0.65,
        strategic_value_score: 0.05,
        rejection_reason:
            "Hard Constraint Violation: Posting explicitly mandates 'vibecoding' ('do NOT write code by hand—prompt Cursor/Claude Code to generate 100% of code without manual architecture or unit tests'). Directly contradicts core engineering principles in profile.xml.",
        created_at: "2026-10-26T11:00:00Z",
        updated_at: "2026-10-26T11:05:00Z",
        analytics: {
            summary:
                "Automatically rejected by Dorker's constraint gate. While the agency uses Python and LLMs, the role forbids manual architecture, testing, and mental-model building.",
            pros: [
                "Remote schedule.",
            ],
            cons: [
                "Violates Constraint #3: Explicit 'vibecoding' mandate that replaces software engineering and architectural accountability with unverified prompt generation.",
            ],
        },
    },
];

export const INITIAL_SYNTHETIC_DEBUG: Record<string, string> = {
    "019675c0-0001-7000-8000-000000000001": `[dorker.pipeline.trace] match_id="019675c0-0001-7000-8000-000000000001" job_id="greenhouse:6242812004"
[stage:1:pgvector_recall] cosine_candidate_rank=14/2840 (threshold=0.71, score=0.834)
[stage:2:nomic_block_classifier] model="nomic-embed-text-v1.5-6class"
  ├─ block[0] (782 chars)  -> ABOUT_COMPANY (confidence=0.96) [STRIPPED_FOR_INFERENCE]
  ├─ block[1] (614 chars)  -> RESPONSIBILITIES (confidence=0.94) [KEPT]
  └─ block[2] (490 chars)  -> REQUIREMENTS (confidence=0.97) [KEPT]
  token_compression: 1886 chars -> 1104 chars (-41.5% boilerplate)
[stage:3:jev_two_axis_evaluator] provider="typesafe-ai/jev-v1" latency_ms=412
  ├─ hard_constraints_check: PASS (no .NET local CRUD, no vibecoding, not frontend-only)
  ├─ axis_1_technical_capability: 0.26
  │   ├─ core_match: Python API services (0.8), PostgreSQL + pgvector RAG (0.8), OpenTelemetry (0.3)
  │   └─ penalty_factors: Senior US casualty insurance domain tenure benchmark; OCR/clinical document fine-tuning (0.1-0.3)
  ├─ axis_2_strategic_value: 0.88
  │   ├─ alignment: End-to-end agent ownership, golden-set evaluation harnesses, small senior R&D group
  │   └─ logistics_note: "Chicago, IL or Remote" -> verify B2B Europe remote eligibility
  └─ assigned_tier: STRETCH`,
    "019675c0-0006-7000-8000-000000000006": `[dorker.pipeline.trace] match_id="019675c0-0006-7000-8000-000000000006" job_id="ashby:modal-distributed-systems-01"
[stage:1:pgvector_recall] cosine_candidate_rank=2/2840 (score=0.912)
[stage:2:nomic_block_classifier] kept=[RESPONSIBILITIES, REQUIREMENTS, COMPENSATION] (-38.2% tokens)
[stage:3:jev_two_axis_evaluator] provider="typesafe-ai/jev-v1" latency_ms=389
  ├─ hard_constraints_check: PASS
  ├─ yoe_override_detected: true ("evaluate candidates on systems fundamentals... rather than a rigid years-of-experience threshold")
  ├─ transferable_skills_mapped:
  │   └─ AWS/GCP Terraform -> matched via Headway GCP Terraform + Pixelview Nomad/HCL (0.6)
  ├─ axis_1_technical_capability: 0.86
  ├─ axis_2_strategic_value: 0.94
  └─ assigned_tier: SUITABLE`,
};

export const INITIAL_SYNTHETIC_DISCUSSIONS: Record<string, ApiDiscussionResponse> = {
    "019675c0-0001-7000-8000-000000000001": {
        state: "open",
        messages: [
            {
                id: "msg-evo-1",
                role: "user",
                content:
                    "Technical Capability is 26% because of the Senior title and clinical OCR/document extraction, while Strategic Value is 88%. How should we frame my Dorker.space evaluation pipeline so the cover letter addresses their agentic claims workflow credibly?",
                created_at: "2026-11-04T14:25:00Z",
            },
            {
                id: "msg-evo-2",
                role: "assistant",
                content:
                    "The strongest bridge is your **evaluation-first engineering loop** in `Dorker.space` paired with your **Transactional Outbox** reliability work in `AI-Orchestrator`:\n\n1. **Direct parallel to their claims document pipeline**: CCC needs engineers who don't just chain prompts, but strip noisy unstructured text into high-density blocks and validate outputs against a hand-labeled Golden Set. Your `nomic` 6-class block classifier + 100-job farthest-point Golden Set + `Jev` constrained reasoning pipeline (cutting 100-record evaluation from 5 hours to <1 minute) proves you already build measured, non-deterministic evaluation infrastructure.\n2. **End-to-end autonomous ownership**: Emphasize `Pixelview.io`, where you owned the entire protocol migration (SRT to WebRTC WHIP) from research to production without hand-holding.\n3. **Honest framing on clinical OCR**: Acknowledge that while healthcare claims OCR is a new domain vertical, your core architecture—hybrid `pgvector` retrieval, structured extraction, and OpenTelemetry latency/cost guardrails—transfers directly.",
                created_at: "2026-11-04T14:25:08Z",
            },
        ],
    },
    "019675c0-0008-7000-8000-000000000008": {
        state: "open",
        messages: [
            {
                id: "msg-tog-1",
                role: "user",
                content:
                    "Include my benchmark numbers from migrating Microsoft Guidance on local SLMs to TypeSafe AI's Jev model, and mention how I compressed my 35k+ token profile down to 5–7k tokens.",
                created_at: "2026-11-01T15:10:00Z",
            },
            {
                id: "msg-tog-2",
                role: "assistant",
                content:
                    "Locked in as confirmed generation evidence. When generating your packet for **Together AI**, the draft will highlight:\n\n• **Failure mode diagnosis on local SLMs**: How unsteered local models confused candidate profile blocks with job requirements (even rating a pure Marketing role as `SUITABLE`).\n• **Constrained reasoning & 300x speedup**: Using Microsoft `Guidance` to steer reasoning trajectories, validated on a 100-job farthest-point Golden Set, and migrating to TypeSafe AI's `Jev` to cut 100-job batch inference from **5 hours to under 1 minute**.\n• **Context density optimization**: Scoring blocks across a **35k+ token Dossier** (including your 20-page Canonical written interview) to select the top **5–7k tokens** per role, avoiding lost-in-the-middle degradation.",
                created_at: "2026-11-01T15:10:06Z",
            },
        ],
    },
};

export const INITIAL_SYNTHETIC_APPLICATIONS: Record<string, ApiApplicationResponse[]> = {
    "019675c0-0001-7000-8000-000000000001": [
        {
            id: 101,
            match_id: "019675c0-0001-7000-8000-000000000001",
            job_id: "greenhouse:6242812004",
            created_at: "2026-11-04T14:30:00Z",
            updated_at: "2026-11-04T14:35:00Z",
            cover_letter: `I’m a Backend and Applied AI Engineer with a focus on distributed systems, structured extraction pipelines, and deterministic evaluation harnesses. While my resume reflects condensed commercial sprints rather than a traditional multi-year corporate tenure, I have repeatedly owned complex, high-uncertainty systems from first prototype to measured production performance.

While building Dorker.space—an open-source job ingestion and semantic matching engine over PostgreSQL and pgvector—I tackled the exact evaluation and context-density challenges central to CCC’s casualty claims agents. Standard embedding similarity failed on nuanced requirement trade-offs, and unsteered SLMs hallucinated across noisy documents. To solve this, I trained a 6-class nomic embedding classifier to strip boilerplate blocks, curated a 100-job Golden Set using farthest-point sampling, and implemented constrained reasoning (first with Microsoft Guidance, then migrating to TypeSafe AI’s Jev—cutting 100-document evaluation latency from 5 hours to under a minute). For generation, I built a two-stage context selector that compresses a 35k+ token candidate dossier down to the 5–7k most relevant tokens per target, preventing lost-in-the-middle degradation.

On the backend infrastructure side, I designed AI-Orchestrator—an asynchronous prompt processing system using PostgreSQL, Redis Streams, the Transactional Outbox pattern for at-least-once delivery, exponential backoff, and OpenTelemetry tracing. Previously, as the sole engineer on a streaming contract at Pixelview.io, I researched, implemented, and deployed a protocol migration from SRT to WebRTC WHIP in Go/Pion, cutting frame latency by 2x (from 14 frames to 5–7) and shipping a standalone TURN server in complete autonomy.

Communication and clear reasoning are central to how I work: as a Teaching Assistant at the Kyiv School of Economics, I have taught Algorithms & Data Structures and Python to over 200 students. I would welcome the chance to bring this evaluation-driven engineering mindset to EvolutionIQ / CCC’s casualty intelligence team.

Best regards,
Serafym Podolianchuk`,
            questions: [
                {
                    question:
                        "Describe an agentic or LLM evaluation pipeline you owned from prototype to production.",
                    answer:
                        "In Dorker.space, I built an end-to-end evaluation and matching pipeline processing job postings across 40+ ATS sources in PostgreSQL + pgvector. When initial SLM prompts hallucinated (e.g., classifying a marketing role as SUITABLE), I built a 100-job hand-labeled Golden Set via farthest-point sampling across diverse domains, trained a 6-class nomic block classifier to strip low-signal boilerplate before inference, and used Microsoft Guidance and TypeSafe AI's Jev to enforce structured two-axis reasoning—reducing batch evaluation of 100 jobs from 5 hours to under 60 seconds while significantly improving precision and recall.",
                },
                {
                    question:
                        "How do you handle observability, latency, and cost trade-offs in non-deterministic AI services?",
                    answer:
                        "I treat token density and failure isolation as systems engineering problems: (1) Pre-filtering with pgvector and a lightweight nomic block classifier strips 35k+ token contexts down to 5–7k high-density tokens before invoking heavier models; (2) In AI-Orchestrator, I decoupled LLM execution via PostgreSQL Transactional Outbox + Redis Streams with idempotent consumers and exponential backoff so upstream API rate limits or timeouts never drop requests; and (3) I instrument pipelines with OpenTelemetry and Grafana to track p95 latency and token cost per stage.",
                },
            ],
        },
    ],
    "019675c0-0008-7000-8000-000000000008": [
        {
            id: 102,
            match_id: "019675c0-0008-7000-8000-000000000008",
            job_id: "greenhouse:together-ai-eval-03",
            created_at: "2026-11-01T15:20:00Z",
            updated_at: "2026-11-01T15:20:00Z",
            cover_letter: `I’m a Backend & AI Infrastructure Engineer specializing in high-throughput Go and Python services, PostgreSQL/pgvector data pipelines, and constrained SLM/LLM evaluation harnesses.

Building Dorker.space gave me first-hand experience with the exact latency vs. reasoning-quality trade-offs Together AI solves for developers. Running frontier APIs across thousands of scraped ATS postings was cost-prohibitive, while raw local SLMs suffered from severe context confusion. I solved this in three stages: training a nomic embedding classifier to segment descriptions into 6 structural block types, curating a 100-job Golden Set via farthest-point sampling by hand, and steering inference with Microsoft Guidance before migrating to TypeSafe AI's Jev—which compressed a 5-hour 100-job benchmark into under 60 seconds. I then applied the same classifier approach to compress my 35k+ token engineering dossier (including a 20-page Canonical written interview) into a dense 5–7k token context window per application.

Complemented by my distributed systems work on AI-Orchestrator (Transactional Outbox over PostgreSQL and Redis Streams with OpenTelemetry observability) and my production Go WebRTC WHIP migration at Pixelview.io (cutting latency 2x), I am excited to contribute to Together AI's evaluation and inference platform.

Best regards,
Serafym Podolianchuk`,
            questions: [
                {
                    question:
                        "How have you used structured generation (e.g., Guidance, grammar constraints, or specialized SLMs) to improve reliability and latency?",
                    answer:
                        "When evaluating local SLMs on multi-axis job matching, standard JSON prompting caused models to confuse candidate skills with job requirements. Using Microsoft Guidance allowed me to constrain the model's reasoning trajectory step-by-step before emitting scores. Later, migrating that constrained pipeline to TypeSafe AI's Jev model reduced 100-job benchmark execution time from 5 hours to less than 1 minute while preserving strict schema adherence.",
                },
                {
                    question:
                        "Describe how you curate golden datasets and measure precision/recall on custom classification pipelines.",
                    answer:
                        "To evaluate my matching and block-classification pipeline without circular AI bias, I used farthest-point sampling in embedding space to select ~100 maximally diverse technical postings (spanning bio-science, data analysis, GTM, and systems engineering) plus synthetic ideal anchors, and labeled them manually. Hand-labeling revealed exactly which boilerplate blocks confused the model, leading me to train a 6-class nomic block classifier that stripped noise prior to inference.",
                },
            ],
        },
    ],
};

export function createInitialSyntheticStore(): SyntheticStoreState {
    return JSON.parse(
        JSON.stringify({
            jobs: INITIAL_SYNTHETIC_JOBS,
            matches: INITIAL_SYNTHETIC_MATCHES,
            debugByMatchId: INITIAL_SYNTHETIC_DEBUG,
            discussionsByMatchId: INITIAL_SYNTHETIC_DISCUSSIONS,
            applicationsByMatchId: INITIAL_SYNTHETIC_APPLICATIONS,
            folders: INITIAL_SYNTHETIC_FOLDERS,
            evidence: INITIAL_SYNTHETIC_EVIDENCE,
            profile: INITIAL_SYNTHETIC_PROFILE,
            nextApplicationId: 200,
        } satisfies SyntheticStoreState)
    ) as SyntheticStoreState;
}
