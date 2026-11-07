import {
    Application,
    Job,
    ProfileData,
    SavedJob,
} from "@/lib/types";
import {
    getStoredApplications,
    getStoredJobs,
    getStoredProfile,
    getStoredSavedJobs,
    saveStoredJob,
    setStoredApplications,
    setStoredProfile,
    setStoredSavedJobs,
} from "@/lib/mock-store";

export interface JobsQueryParams {
    page?: number;
    limit?: number;
    q?: string;
    location?: string;
    company?: string;
}

export interface JobsResponse {
    jobs: Job[];
    total: number;
    page: number;
    pageSize: number;
    cached: boolean;
}

export async function fetchJobsList(
    params: JobsQueryParams
): Promise<JobsResponse> {
    const page = params.page ?? 0;
    const pageSize = params.limit ?? 250;
    const query = (params.q ?? "").trim().toLowerCase();
    const locationFilter = (params.location ?? "").trim().toLowerCase();
    const companyFilter = (params.company ?? "").trim().toLowerCase();

    try {
        const search = new URLSearchParams({
            page: String(page),
            limit: String(pageSize),
        });
        if (query) search.set("q", query);
        if (locationFilter) search.set("location", locationFilter);
        if (companyFilter) search.set("company", companyFilter);

        const response = await fetch(`/api/jobs/external?${search.toString()}`);
        if (response.ok) {
            return (await response.json()) as JobsResponse;
        }
    } catch {
        // Python backend not running or endpoint not yet mounted; use local store
    }

    const allJobs = getStoredJobs();
    const filtered = allJobs.filter((job) => {
        const matchesQuery =
            !query ||
            job.title.toLowerCase().includes(query) ||
            job.company.toLowerCase().includes(query) ||
            (job.location ?? "").toLowerCase().includes(query);

        const matchesLocation =
            !locationFilter ||
            (job.location ?? "").toLowerCase().includes(locationFilter);

        const matchesCompany =
            !companyFilter ||
            job.company.toLowerCase().includes(companyFilter);

        return matchesQuery && matchesLocation && matchesCompany;
    });

    const start = page * pageSize;
    const paged = filtered.slice(start, start + pageSize);

    return {
        jobs: paged,
        total: filtered.length,
        page,
        pageSize,
        cached: true,
    };
}

export async function fetchJobById(jobId: string): Promise<Job> {
    try {
        const response = await fetch(
            `/api/jobs/${encodeURIComponent(jobId)}`
        );
        if (response.ok) {
            const data = (await response.json()) as { job?: Job } & Job;
            return data.job ?? data;
        }
    } catch {
        // Fallback to local store
    }

    const allJobs = getStoredJobs();
    const matched = allJobs.find((job) => job.id === jobId);
    if (matched) {
        return matched;
    }

    // If an arbitrary ID was passed in URL, synthesize a readable job entry
    return {
        id: jobId,
        atsType: jobId.includes(":") ? jobId.split(":")[0] : "custom",
        title: "Senior Software Engineer",
        company: "Dorker Target Company",
        location: "Remote",
        employmentType: "Full-Time",
        salaryMin: 160000,
        salaryMax: 210000,
        salaryCurrency: "USD",
        link: "https://dorker.space",
        postedAt: new Date().toISOString(),
        description:
            "This role was opened directly via URL identifier. Connect the Python FastAPI jobs endpoint to load live job records from dorker_db.",
    };
}

export async function fetchSavedJobsList(): Promise<SavedJob[]> {
    try {
        const response = await fetch("/api/saved-jobs");
        if (response.ok) {
            const data = (await response.json()) as { savedJobs?: SavedJob[] };
            if (Array.isArray(data.savedJobs)) {
                return data.savedJobs;
            }
        }
    } catch {
        // Fallback to local store
    }
    return getStoredSavedJobs();
}

export async function saveJobItem(job: Job, notes?: string): Promise<SavedJob> {
    saveStoredJob(job);
    const current = getStoredSavedJobs();
    const existing = current.find(
        (item) => item.jobId === job.id || item.job?.link === job.link
    );
    if (existing) {
        return existing;
    }

    const created: SavedJob = {
        id: `saved-${Date.now()}`,
        userId: "local-user",
        jobId: job.id,
        notes: notes || "",
        status: "interested",
        createdAt: new Date(),
        updatedAt: new Date(),
        job,
    };

    setStoredSavedJobs([created, ...current]);
    return created;
}

export async function removeSavedJobItem(savedJobId: string): Promise<void> {
    const current = getStoredSavedJobs();
    setStoredSavedJobs(current.filter((item) => item.id !== savedJobId));
}

export async function fetchApplicationsList(): Promise<Application[]> {
    try {
        const response = await fetch("/api/applications");
        if (response.ok) {
            const data = (await response.json()) as {
                applications?: Application[];
            };
            if (Array.isArray(data.applications)) {
                return data.applications;
            }
        }
    } catch {
        // Fallback to local store
    }
    return getStoredApplications();
}

export async function createApplicationItem(jobId: string): Promise<Application> {
    const job = await fetchJobById(jobId);
    const current = getStoredApplications();
    const newApp: Application = {
        id: `app-${Date.now()}`,
        userId: "local-user",
        jobId: job.id,
        taskId: `workspace-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        job,
    };
    setStoredApplications([newApp, ...current]);
    return newApp;
}

export async function deleteApplicationItem(applicationId: string): Promise<void> {
    const current = getStoredApplications();
    setStoredApplications(current.filter((app) => app.id !== applicationId));
}

export async function fetchCandidateProfile(): Promise<ProfileData> {
    try {
        const response = await fetch("/api/profile");
        if (response.ok) {
            const data = (await response.json()) as { profile?: ProfileData };
            if (data.profile) {
                return data.profile;
            }
        }
    } catch {
        // Fallback to local store
    }
    return getStoredProfile();
}

export async function saveCandidateProfile(
    profile: ProfileData
): Promise<ProfileData> {
    try {
        const response = await fetch("/api/profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(profile),
        });
        if (response.ok) {
            const data = (await response.json()) as { profile?: ProfileData };
            if (data.profile) {
                setStoredProfile(data.profile);
                return data.profile;
            }
        }
    } catch {
        // Persist in local store
    }
    return setStoredProfile(profile);
}
