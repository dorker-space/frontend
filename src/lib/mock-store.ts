import {
    Application,
    Job,
    ProfileData,
    SavedJob,
} from "@/lib/types";

const STORAGE_KEYS = {
    JOBS: "dorker.jobs.v1",
    SAVED_JOBS: "dorker.savedJobs.v1",
    APPLICATIONS: "dorker.applications.v1",
    PROFILE: "dorker.profile.v1",
};

export const INITIAL_MOCK_JOBS: Job[] = [
    {
        id: "ashby:09d97355-39fc-4a1e-b1c2-9f88e120ab01",
        atsType: "ashby",
        atsId: "09d97355-39fc-4a1e-b1c2-9f88e120ab01",
        title: "Senior Backend & AI Systems Engineer",
        company: "Linear",
        location: "Remote (Europe / US)",
        employmentType: "Full-Time",
        salaryMin: 185000,
        salaryMax: 230000,
        salaryCurrency: "USD",
        link: "https://jobs.ashbyhq.com/linear/09d97355-39fc-4a1e-b1c2-9f88e120ab01",
        postedAt: "2026-10-18T10:00:00Z",
        questions: [
            "Why do you want to work on developer & product infrastructure at Linear?",
            "Describe a distributed sync or high-throughput backend system you built end-to-end.",
            "How do you evaluate latency vs. accuracy trade-offs in production LLM workflows?",
        ],
        description: `Linear is building the standard for modern software development. We are looking for a Senior Backend & AI Systems Engineer to architect high-throughput synchronization pipelines, semantic indexing infrastructure, and low-latency agentic workflows.

What You Will Do:
• Design and scale backend services in TypeScript and Python handling millions of real-time issue and project state transitions.
• Build hybrid vector + relational retrieval pipelines over PostgreSQL to power intelligent triage, duplicate detection, and automated specification synthesis.
• Own reliability, observability, and sub-100ms p95 API latency SLAs across distributed worker fleets.
• Collaborate directly with product designers and engineers in small, autonomous project teams.

Requirements:
• 4+ years building production distributed systems, data pipelines, or high-concurrency backend APIs.
• Deep familiarity with PostgreSQL (indexing, query planning, full-text search, partitioning) and modern async Python or TypeScript.
• Practical experience shipping LLM-assisted features with deterministic evaluation harnesses rather than fragile prompt chains.
• Strong product sense and care for developer ergonomics.`,
    },
    {
        id: "greenhouse:stripe-infra-88412",
        atsType: "greenhouse",
        atsId: "stripe-infra-88412",
        title: "Distributed Data Platform Engineer",
        company: "Stripe",
        location: "Dublin / Remote",
        employmentType: "Full-Time",
        salaryMin: 175000,
        salaryMax: 225000,
        salaryCurrency: "USD",
        link: "https://stripe.com/jobs/listing/distributed-data-platform-engineer/88412",
        postedAt: "2026-10-19T14:30:00Z",
        questions: [
            "Tell us about a time you debugged a subtle data consistency or performance regression in PostgreSQL or Kafka.",
            "What is your experience with idempotent ingestion pipelines at scale?",
        ],
        description: `Stripe's Data Platform team builds the foundational ingestion, storage, and real-time analytics engines that power financial reporting and risk intelligence for millions of businesses worldwide.

Responsibilities:
• Architect fault-tolerant ingestion and transformation pipelines processing billions of ledger events daily.
• Optimize high-volume relational and columnar storage systems for low-latency merchant queries.
• Build self-serve schema evolution and data quality validation frameworks used by 1,000+ engineers.

Minimum Qualifications:
• Strong production experience in Python, Go, or Java/Scala on Linux.
• Proven track record operating mission-critical relational databases (PostgreSQL) and streaming systems.
• Ability to reason clearly about distributed consensus, backpressure, and exactly-once semantics.`,
    },
    {
        id: "ashby:anthropic-applied-ai-4410",
        atsType: "ashby",
        atsId: "anthropic-applied-ai-4410",
        title: "Applied AI Product Engineer",
        company: "Anthropic",
        location: "London / Hybrid",
        employmentType: "Full-Time",
        salaryMin: 210000,
        salaryMax: 280000,
        salaryCurrency: "USD",
        link: "https://jobs.ashbyhq.com/anthropic/applied-ai-4410",
        postedAt: "2026-10-20T09:15:00Z",
        questions: [
            "Describe an agentic or tool-use workflow you built and how you measured its reliability.",
            "How do you design human-in-the-loop interfaces for complex reasoning tasks?",
        ],
        description: `Anthropic's Applied AI Engineering team partners with frontier research to turn Claude's capabilities into reliable, high-leverage software workflows.

In This Role You Will:
• Build full-stack and backend systems in Python and TypeScript/React that orchestrate multi-step tool execution, code analysis, and structured document synthesis.
• Design evaluation pipelines that measure factual grounding, latency, and failure modes across real-world workloads.
• Work closely with alignment and research teams to refine model behavior on long-horizon coding and research tasks.

What We Look For:
• Strong software engineering fundamentals across Python async services, PostgreSQL, and modern React/TypeScript interfaces.
• Demonstrated ability to ship clean, maintainable systems rapidly from zero to one.
• Passion for safe, steerable, and verifiable AI systems.`,
    },
    {
        id: "lever:mistral-platform-2091",
        atsType: "lever",
        atsId: "mistral-platform-2091",
        title: "Inference & Evaluation Infrastructure Engineer",
        company: "Mistral AI",
        location: "Paris / Remote Europe",
        employmentType: "Full-Time",
        salaryMin: 150000,
        salaryMax: 195000,
        salaryCurrency: "EUR",
        link: "https://jobs.lever.co/mistral/platform-2091",
        postedAt: "2026-10-17T11:20:00Z",
        description: `Mistral AI builds open and frontier generative models with a relentless focus on efficiency and developer control.

Role Overview:
• Build automated evaluation, benchmarking, and data curation pipelines in Python and Rust/Go.
• Maintain high-concurrency API gateways, batch processing queues, and telemetry stores backed by PostgreSQL and ClickHouse.
• Partner with enterprise customers and research scientists to optimize quantization and structured output performance.

Profile:
• Strong proficiency in Python, SQL, and containerized Linux environments (Docker, Kubernetes).
• Experience with SLM/LLM inference engines (vLLM, TensorRT-LLM, or custom batch workers).
• Pragmatic engineering mindset focused on simplicity and measurable throughput.`,
    },
    {
        id: "ashby:supabase-postgres-7721",
        atsType: "ashby",
        atsId: "supabase-postgres-7721",
        title: "Backend Engineer — Postgres & Vector Tooling",
        company: "Supabase",
        location: "Remote",
        employmentType: "Full-Time",
        salaryMin: 165000,
        salaryMax: 205000,
        salaryCurrency: "USD",
        link: "https://jobs.ashbyhq.com/supabase/postgres-7721",
        postedAt: "2026-10-16T08:45:00Z",
        description: `Supabase is the open-source Postgres development platform. We are hiring a Backend Engineer to work on our Postgres extensions ecosystem, pgvector indexing, and developer workflows.

What You Will Work On:
• Build and maintain control-plane APIs and automated migration tooling for hundreds of thousands of PostgreSQL databases.
• Optimize hybrid full-text search (tsvector / pg_trgm) and vector similarity search workloads.
• Contribute to open-source TypeScript and Python SDKs and developer dashboard tooling.`,
    },
    {
        id: "greenhouse:cloudflare-workers-5519",
        atsType: "greenhouse",
        atsId: "cloudflare-workers-5519",
        title: "Systems Engineer — Developer Platform & AI Gateway",
        company: "Cloudflare",
        location: "Lisbon / London / Remote",
        employmentType: "Full-Time",
        salaryMin: 155000,
        salaryMax: 190000,
        salaryCurrency: "USD",
        link: "https://boards.greenhouse.io/cloudflare/jobs/5519",
        postedAt: "2026-10-15T16:00:00Z",
        description: `Cloudflare Workers and AI Gateway process millions of requests per second at the edge. We are seeking a Systems & Backend Engineer to build caching, rate-limiting, evaluation, and observability primitives for AI applications.

Requirements:
• Strong background in backend systems using Python, TypeScript, Go, or Rust.
• Experience designing resilient HTTP APIs, streaming SSE pipelines, and relational/analytical data stores.
• Familiarity with distributed tracing, Prometheus metrics, and high-availability deployment practices.`,
    },
    {
        id: "ashby:perplexity-search-3310",
        atsType: "ashby",
        atsId: "perplexity-search-3310",
        title: "Search & Ingestion Pipeline Engineer",
        company: "Perplexity",
        location: "San Francisco / Remote",
        employmentType: "Full-Time",
        salaryMin: 190000,
        salaryMax: 245000,
        salaryCurrency: "USD",
        link: "https://jobs.ashbyhq.com/perplexity/search-3310",
        postedAt: "2026-10-14T12:00:00Z",
        description: `Perplexity is reimagining how humanity discovers and verifies knowledge. Our Search & Ingestion team crawls, normalizes, deduplicates, and indexes billions of web documents in real time.

Responsibilities:
• Build high-throughput web extraction, entity resolution, and structured normalization pipelines in Python.
• Maintain low-latency hybrid lexical and semantic retrieval indices.
• Design automated quality gates that detect stale content, schema drift, and extraction anomalies.`,
    },
    {
        id: "workday:datadog-ai-ops-9912",
        atsType: "workday",
        atsId: "datadog-ai-ops-9912",
        title: "Software Engineer — Intelligent Telemetry & Alerting",
        company: "Datadog",
        location: "Paris / New York / Madrid",
        employmentType: "Full-Time",
        salaryMin: 160000,
        salaryMax: 210000,
        salaryCurrency: "USD",
        link: "https://careers.datadoghq.com/detail/9912",
        postedAt: "2026-10-13T09:30:00Z",
        description: `Join Datadog's Intelligent Telemetry group to build automated root-cause analysis and anomaly classification services operating over petabytes of logs, traces, and metrics.

You Will:
• Develop high-throughput Python and Go microservices that classify incident patterns in real time.
• Partner with product teams to surface actionable, evidence-backed diagnostics inside the Datadog UI.`,
    },
];

const INITIAL_PROFILE: ProfileData = {
    id: "profile-default",
    firstName: "Serafym",
    lastName: "Engineer",
    email: "serafym@dorker.space",
    phone: "+380 00 000 0000",
    location: "Remote / Europe",
    nationality: "Ukraine",
    gender: "male",
    summary:
        "Backend & AI Systems Engineer specializing in high-throughput Python services, PostgreSQL data architecture, multi-stage SLM/LLM classification pipelines, and full-stack TypeScript tooling.",
    skills: [
        "Python",
        "TypeScript",
        "PostgreSQL",
        "FastAPI",
        "React",
        "Distributed Systems",
        "LLM / SLM Pipelines",
        "Docker",
        "SQL Optimization",
    ],
    experience: [
        {
            title: "Creator & Lead Systems Engineer",
            company: "Dorker Intelligence Platform",
            location: "Remote",
            startDate: "2025-01",
            current: true,
            description:
                "Architected a multi-ATS ingestion and two-axis candidate matching platform processing 100k+ job postings across 60+ company ATS sources using async Python, PostgreSQL trigram/FTS indexing, and grounded LLM/SLM evaluation pipelines.",
        },
        {
            title: "Backend Software Engineer",
            company: "Cloud Data Systems",
            location: "Remote",
            startDate: "2023-03",
            endDate: "2024-12",
            current: false,
            description:
                "Designed and operated event-driven backend APIs, automated ETL workers, and PostgreSQL analytical stores with strict latency and reliability SLAs.",
        },
    ],
    education: [
        {
            degree: "B.Sc. in Computer Science",
            field: "Software Engineering & Distributed Systems",
            institution: "Technical University",
            location: "Europe",
            startDate: "2020-09",
            endDate: "2024-06",
            gpa: "3.9 / 4.0",
        },
    ],
    languages: [
        { language: "English", proficiency: "fluent" },
        { language: "Ukrainian", proficiency: "native" },
    ],
    githubUrl: "https://github.com/serafym",
    linkedinUrl: "https://linkedin.com/in/serafym",
    portfolioUrl: "https://dorker.space",
    willingToRelocate: true,
    requiresEuVisa: false,
    requiresUsVisa: true,
    requiresUkVisa: false,
    requiresChVisa: false,
    requiresCaVisa: false,
    requiresOtherVisa: false,
    resumeUploaded: true,
    resumeUrl: "/resume-serafym.pdf",
};

function readStorage<T>(key: string, fallback: T): T {
    if (typeof window === "undefined") return fallback;
    try {
        const raw = window.localStorage.getItem(key);
        if (!raw) return fallback;
        return JSON.parse(raw) as T;
    } catch {
        return fallback;
    }
}

function writeStorage<T>(key: string, value: T): void {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // Ignore storage quota errors
    }
}

export function getStoredJobs(): Job[] {
    return readStorage<Job[]>(STORAGE_KEYS.JOBS, INITIAL_MOCK_JOBS);
}

export function saveStoredJob(job: Job): void {
    const jobs = getStoredJobs();
    const exists = jobs.some((item) => item.id === job.id);
    if (!exists) {
        writeStorage(STORAGE_KEYS.JOBS, [job, ...jobs]);
    }
}

export function getStoredSavedJobs(): SavedJob[] {
    const jobs = getStoredJobs();
    const defaultSaved: SavedJob[] = [
        {
            id: "saved-1",
            userId: "local-user",
            jobId: jobs[0].id,
            status: "interested",
            notes: "High technical capability match (89%) and strong async architecture fit.",
            createdAt: new Date(Date.now() - 86400000 * 2),
            updatedAt: new Date(Date.now() - 86400000 * 2),
            job: jobs[0],
        },
        {
            id: "saved-2",
            userId: "local-user",
            jobId: jobs[2].id,
            status: "interested",
            notes: "Great applied AI product engineering scope.",
            createdAt: new Date(Date.now() - 86400000),
            updatedAt: new Date(Date.now() - 86400000),
            job: jobs[2],
        },
    ];
    return readStorage<SavedJob[]>(STORAGE_KEYS.SAVED_JOBS, defaultSaved);
}

export function setStoredSavedJobs(saved: SavedJob[]): void {
    writeStorage(STORAGE_KEYS.SAVED_JOBS, saved);
}

export function getStoredApplications(): Application[] {
    const jobs = getStoredJobs();
    const defaultApps: Application[] = [
        {
            id: "app-1",
            userId: "local-user",
            jobId: jobs[0].id,
            taskId: "workspace-ashby-linear",
            createdAt: new Date(Date.now() - 86400000 * 1),
            updatedAt: new Date(Date.now() - 86400000 * 1),
            job: jobs[0],
        },
        {
            id: "app-2",
            userId: "local-user",
            jobId: jobs[1].id,
            taskId: "workspace-greenhouse-stripe",
            createdAt: new Date(Date.now() - 86400000 * 4),
            updatedAt: new Date(Date.now() - 86400000 * 3),
            job: jobs[1],
        },
    ];
    return readStorage<Application[]>(STORAGE_KEYS.APPLICATIONS, defaultApps);
}

export function setStoredApplications(apps: Application[]): void {
    writeStorage(STORAGE_KEYS.APPLICATIONS, apps);
}

export function getStoredProfile(): ProfileData {
    return readStorage<ProfileData>(STORAGE_KEYS.PROFILE, INITIAL_PROFILE);
}

export function setStoredProfile(profile: ProfileData): ProfileData {
    writeStorage(STORAGE_KEYS.PROFILE, profile);
    return profile;
}
