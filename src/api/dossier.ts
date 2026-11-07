import {
    DossierFolder,
    DossierLibraryState,
    DossierMaterial,
    DossierMaterialKind,
} from "@/lib/types";

const DOSSIER_STORAGE_KEY = "dorker.dossier.v1";

function makeUuid(): string {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return crypto.randomUUID();
    }
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

const SEED_FOLDER_IDS = {
    profile: "019675a0-0001-7000-8000-000000000001",
    cv: "019675a0-0002-7000-8000-000000000002",
    experience: "019675a0-0003-7000-8000-000000000003",
    job: "019675a0-0004-7000-8000-000000000004",
    projects: "019675a0-0005-7000-8000-000000000005",
    dossier: "019675a0-0006-7000-8000-000000000006",
    coverLetters: "019675a0-0007-7000-8000-000000000007",
    coursework: "019675a0-0008-7000-8000-000000000008",
    preferences: "019675a0-0009-7000-8000-000000000009",
};

function createSeedLibrary(): DossierLibraryState {
    const now = new Date().toISOString();

    const folders: DossierFolder[] = [
        {
            id: SEED_FOLDER_IDS.profile,
            parentId: null,
            name: "profile",
            position: 0,
        },
        {
            id: SEED_FOLDER_IDS.cv,
            parentId: SEED_FOLDER_IDS.profile,
            name: "cv",
            position: 0,
        },
        {
            id: SEED_FOLDER_IDS.experience,
            parentId: SEED_FOLDER_IDS.cv,
            name: "experience",
            position: 0,
        },
        {
            id: SEED_FOLDER_IDS.job,
            parentId: SEED_FOLDER_IDS.experience,
            name: "job",
            position: 0,
        },
        {
            id: SEED_FOLDER_IDS.projects,
            parentId: SEED_FOLDER_IDS.profile,
            name: "projects",
            position: 1,
        },
        {
            id: SEED_FOLDER_IDS.dossier,
            parentId: SEED_FOLDER_IDS.profile,
            name: "dossier",
            position: 2,
        },
        {
            id: SEED_FOLDER_IDS.coverLetters,
            parentId: SEED_FOLDER_IDS.profile,
            name: "cover_letters",
            position: 3,
        },
        {
            id: SEED_FOLDER_IDS.coursework,
            parentId: SEED_FOLDER_IDS.profile,
            name: "coursework",
            position: 4,
        },
        {
            id: SEED_FOLDER_IDS.preferences,
            parentId: SEED_FOLDER_IDS.profile,
            name: "search_parameters",
            position: 5,
        },
    ];

    const materials: DossierMaterial[] = [
        {
            id: "019675b0-1001-7000-8000-000000000101",
            folderId: SEED_FOLDER_IDS.job,
            title: "Pixelview",
            kind: "experience",
            legacyKey: "profile.cv.experience.job.pixelview",
            text: "Built and scaled backend services in Python and TypeScript, designing low-latency APIs, PostgreSQL data models, and automated ingestion pipelines.",
            revision: 1,
            updatedAt: now,
            archivedAt: null,
        },
        {
            id: "019675b0-1002-7000-8000-000000000102",
            folderId: SEED_FOLDER_IDS.projects,
            title: "Dorker — Job Intelligence Engine",
            kind: "project",
            legacyKey: "profile.projects.project.dorker",
            text: "Architected an async Python + PostgreSQL scraping, normalization, and two-axis ML/LLM matching engine indexing 4.1M+ jobs across 60+ ATS integrations with Litestar APIs.",
            revision: 2,
            updatedAt: now,
            archivedAt: null,
        },
        {
            id: "019675b0-1003-7000-8000-000000000103",
            folderId: SEED_FOLDER_IDS.dossier,
            title: "High-Throughput Ingestion & Deduplication Story",
            kind: "interview_answer",
            legacyKey: "profile.dossier.section.1",
            text: "When scaling multi-source job ingestion, naive row-by-row upserts bottlenecked PostgreSQL I/O. Replaced per-row queries with batched asyncpg staging tables, trigram/FTS indexing, and deterministic version gates—cutting batch processing time by over 80%.",
            revision: 1,
            updatedAt: now,
            archivedAt: null,
        },
        {
            id: "019675b0-1004-7000-8000-000000000104",
            folderId: SEED_FOLDER_IDS.coverLetters,
            title: "Backend & Applied AI Cover Letter Example",
            kind: "writing_example",
            legacyKey: "profile.cover_letters.letter.backend",
            text: "I build reliable backend systems and grounded AI workflows where deterministic data engineering meets LLM orchestration. Rather than treating model calls as black boxes, I pair strict schema contracts and PostgreSQL state machines with evaluation-driven prompts.",
            revision: 1,
            updatedAt: now,
            archivedAt: null,
        },
        {
            id: "019675b0-1005-7000-8000-000000000105",
            folderId: SEED_FOLDER_IDS.coursework,
            title: "SYSTEMS — Distributed Systems & Databases",
            kind: "coursework",
            legacyKey: "profile.coursework.academic_course.SYSTEMS",
            text: "Consensus protocols, concurrency control, write-ahead logging, query planning, and distributed fault tolerance.",
            revision: 1,
            updatedAt: now,
            archivedAt: null,
        },
        {
            id: "019675b0-1006-7000-8000-000000000106",
            folderId: SEED_FOLDER_IDS.preferences,
            title: "Remote & Product Engineering Preferences",
            kind: "preferences",
            legacyKey: "profile.search_preferences",
            text: "Remote-first backend, infrastructure, or applied AI engineering roles with strong technical ownership in Python, TypeScript, or Go.",
            revision: 1,
            updatedAt: now,
            archivedAt: null,
        },
    ];

    return { folders, materials };
}

export function getFolderPathSegments(
    folderId: string,
    folders: DossierFolder[]
): string[] {
    const byId = new Map(folders.map((f) => [f.id, f]));
    const segments: string[] = [];
    const visited = new Set<string>();

    let current = byId.get(folderId);
    while (current && !visited.has(current.id)) {
        visited.add(current.id);
        segments.unshift(current.name);
        current = current.parentId ? byId.get(current.parentId) : undefined;
    }

    return segments;
}

export function getFolderPath(
    folderId: string,
    folders: DossierFolder[],
    separator = " / "
): string {
    const segments = getFolderPathSegments(folderId, folders);
    return segments.length > 0 ? segments.join(separator) : "root";
}

export function getDescendantFolderIds(
    rootFolderId: string,
    folders: DossierFolder[]
): Set<string> {
    const result = new Set<string>([rootFolderId]);
    let added = true;

    while (added) {
        added = false;
        for (const folder of folders) {
            if (
                folder.parentId &&
                result.has(folder.parentId) &&
                !result.has(folder.id)
            ) {
                result.add(folder.id);
                added = true;
            }
        }
    }

    return result;
}

export class DossierApi {
    public getLibrary(): DossierLibraryState {
        if (typeof window === "undefined") {
            return createSeedLibrary();
        }
        try {
            const raw = window.localStorage.getItem(DOSSIER_STORAGE_KEY);
            if (!raw) {
                const seeded = createSeedLibrary();
                this.saveLibrary(seeded);
                return seeded;
            }
            const parsed = JSON.parse(raw) as Partial<DossierLibraryState>;
            if (
                !Array.isArray(parsed.folders) ||
                !Array.isArray(parsed.materials)
            ) {
                const seeded = createSeedLibrary();
                this.saveLibrary(seeded);
                return seeded;
            }
            return {
                folders: parsed.folders,
                materials: parsed.materials,
            };
        } catch {
            return createSeedLibrary();
        }
    }

    public saveLibrary(state: DossierLibraryState): DossierLibraryState {
        if (typeof window !== "undefined") {
            try {
                window.localStorage.setItem(
                    DOSSIER_STORAGE_KEY,
                    JSON.stringify(state)
                );
            } catch {
                // Ignore storage quota errors
            }
        }
        return state;
    }

    public createFolder(
        name: string,
        parentId: string | null
    ): DossierLibraryState {
        const trimmed = name.trim();
        if (!trimmed) {
            throw new Error("Folder name cannot be empty.");
        }

        const state = this.getLibrary();
        const siblings = state.folders.filter((f) => f.parentId === parentId);
        const newFolder: DossierFolder = {
            id: makeUuid(),
            parentId,
            name: trimmed,
            position: siblings.length,
        };

        return this.saveLibrary({
            ...state,
            folders: [...state.folders, newFolder],
        });
    }

    public renameFolder(
        folderId: string,
        newName: string
    ): DossierLibraryState {
        const trimmed = newName.trim();
        if (!trimmed) {
            throw new Error("Folder name cannot be empty.");
        }

        const state = this.getLibrary();
        return this.saveLibrary({
            ...state,
            folders: state.folders.map((folder) =>
                folder.id === folderId ? { ...folder, name: trimmed } : folder
            ),
        });
    }

    public moveFolder(
        folderId: string,
        newParentId: string | null
    ): DossierLibraryState {
        const state = this.getLibrary();
        if (folderId === newParentId) {
            throw new Error("Cannot move a folder into itself.");
        }

        if (newParentId !== null) {
            const descendants = getDescendantFolderIds(folderId, state.folders);
            if (descendants.has(newParentId)) {
                throw new Error(
                    "Cannot move a folder into one of its own subfolders."
                );
            }
        }

        return this.saveLibrary({
            ...state,
            folders: state.folders.map((folder) =>
                folder.id === folderId
                    ? { ...folder, parentId: newParentId }
                    : folder
            ),
        });
    }

    public deleteFolder(folderId: string): DossierLibraryState {
        const state = this.getLibrary();
        const target = state.folders.find((f) => f.id === folderId);
        if (!target) {
            return state;
        }

        const fallbackFolderId =
            target.parentId ??
            state.folders.find((f) => f.id !== folderId)?.id ??
            null;

        if (!fallbackFolderId) {
            throw new Error("Cannot delete the last remaining root folder.");
        }

        // Re-parent direct child folders and materials to the parent folder so no UUID materials are lost
        const nextFolders = state.folders
            .filter((f) => f.id !== folderId)
            .map((f) =>
                f.parentId === folderId
                    ? { ...f, parentId: target.parentId }
                    : f
            );

        const nextMaterials = state.materials.map((m) =>
            m.folderId === folderId ? { ...m, folderId: fallbackFolderId } : m
        );

        return this.saveLibrary({
            folders: nextFolders,
            materials: nextMaterials,
        });
    }

    public createMaterial(input: {
        folderId: string;
        title: string;
        kind: DossierMaterialKind;
        text: string;
        legacyKey?: string;
    }): { state: DossierLibraryState; created: DossierMaterial } {
        const state = this.getLibrary();
        const now = new Date().toISOString();

        const created: DossierMaterial = {
            id: makeUuid(),
            folderId: input.folderId,
            title: input.title.trim() || "Untitled Evidence",
            kind: input.kind,
            text: input.text,
            legacyKey: input.legacyKey?.trim() || undefined,
            revision: 1,
            updatedAt: now,
            archivedAt: null,
        };

        const nextState = this.saveLibrary({
            ...state,
            materials: [created, ...state.materials],
        });

        return { state: nextState, created };
    }

    public updateMaterial(
        materialId: string,
        patch: Partial<
            Pick<DossierMaterial, "title" | "kind" | "folderId" | "text">
        >
    ): DossierLibraryState {
        const state = this.getLibrary();
        const now = new Date().toISOString();

        const nextMaterials = state.materials.map((item) => {
            if (item.id !== materialId) {
                return item;
            }
            const textChanged =
                patch.text !== undefined && patch.text !== item.text;
            return {
                ...item,
                ...patch,
                title:
                    patch.title !== undefined
                        ? patch.title.trim() || item.title
                        : item.title,
                revision: textChanged ? item.revision + 1 : item.revision,
                updatedAt: now,
            };
        });

        return this.saveLibrary({
            ...state,
            materials: nextMaterials,
        });
    }

    public toggleArchiveMaterial(materialId: string): DossierLibraryState {
        const state = this.getLibrary();
        const now = new Date().toISOString();

        return this.saveLibrary({
            ...state,
            materials: state.materials.map((item) =>
                item.id === materialId
                    ? {
                          ...item,
                          archivedAt: item.archivedAt ? null : now,
                          updatedAt: now,
                      }
                    : item
            ),
        });
    }

    public deleteMaterial(materialId: string): DossierLibraryState {
        const state = this.getLibrary();
        return this.saveLibrary({
            ...state,
            materials: state.materials.filter((item) => item.id !== materialId),
        });
    }

    public async importFiles(
        files: File[],
        targetFolderId: string
    ): Promise<{ state: DossierLibraryState; importedCount: number }> {
        let state = this.getLibrary();
        let importedCount = 0;

        for (const file of files) {
            const rawText = await file.text();
            const lowerName = file.name.toLowerCase();

            if (lowerName.endsWith(".xml")) {
                const xmlResult = this.importXmlDocument(rawText, state);
                state = xmlResult.state;
                importedCount += xmlResult.count;
            } else {
                const baseTitle = file.name.replace(/\.[^.]+$/, "");
                const now = new Date().toISOString();
                const newMaterial: DossierMaterial = {
                    id: makeUuid(),
                    folderId: targetFolderId,
                    title: baseTitle || file.name,
                    kind: "experience",
                    text: rawText.trim(),
                    revision: 1,
                    updatedAt: now,
                    archivedAt: null,
                };
                state = {
                    ...state,
                    materials: [newMaterial, ...state.materials],
                };
                importedCount += 1;
            }
        }

        this.saveLibrary(state);
        return { state, importedCount };
    }

    private ensureFolderPath(
        segments: string[],
        folders: DossierFolder[]
    ): { folderId: string; folders: DossierFolder[] } {
        let nextFolders = [...folders];
        let parentId: string | null = null;

        for (const segment of segments) {
            const existing = nextFolders.find(
                (f) =>
                    f.parentId === parentId &&
                    f.name.toLowerCase() === segment.toLowerCase()
            );
            if (existing) {
                parentId = existing.id;
            } else {
                const siblings = nextFolders.filter(
                    (f) => f.parentId === parentId
                );
                const created: DossierFolder = {
                    id: makeUuid(),
                    parentId,
                    name: segment,
                    position: siblings.length,
                };
                nextFolders = [...nextFolders, created];
                parentId = created.id;
            }
        }

        return {
            folderId: parentId ?? nextFolders[0].id,
            folders: nextFolders,
        };
    }

    private importXmlDocument(
        xmlContent: string,
        currentState: DossierLibraryState
    ): { state: DossierLibraryState; count: number } {
        const parser = new DOMParser();
        const doc = parser.parseFromString(xmlContent, "application/xml");
        const tagSpecs: {
            tagName: string;
            attrKey: string;
            kind: DossierMaterialKind;
        }[] = [
            { tagName: "job", attrKey: "company", kind: "experience" },
            { tagName: "project", attrKey: "name", kind: "project" },
            {
                tagName: "section",
                attrKey: "question_id",
                kind: "interview_answer",
            },
            { tagName: "letter", attrKey: "id", kind: "writing_example" },
            {
                tagName: "academic_course",
                attrKey: "code",
                kind: "coursework",
            },
        ];

        let folders = [...currentState.folders];
        let materials = [...currentState.materials];
        let count = 0;
        const now = new Date().toISOString();

        for (const spec of tagSpecs) {
            const elements = Array.from(doc.getElementsByTagName(spec.tagName));
            for (const el of elements) {
                const attrValue = (
                    el.getAttribute(spec.attrKey) ||
                    el.getAttribute("id") ||
                    ""
                ).trim();
                if (!attrValue) continue;

                const hierarchy: string[] = [];
                let parent = el.parentElement;
                while (parent) {
                    hierarchy.unshift(parent.tagName);
                    parent = parent.parentElement;
                }

                const folderSegments = [...hierarchy, spec.tagName];
                const legacyKey = [...folderSegments, attrValue].join(".");
                const text = (el.textContent || "").trim();
                if (!text) continue;

                const ensured = this.ensureFolderPath(folderSegments, folders);
                folders = ensured.folders;

                const existingIdx = materials.findIndex(
                    (m) => m.legacyKey === legacyKey
                );
                if (existingIdx >= 0) {
                    const existing = materials[existingIdx];
                    const textChanged = existing.text !== text;
                    materials[existingIdx] = {
                        ...existing,
                        folderId: ensured.folderId,
                        text,
                        revision: textChanged
                            ? existing.revision + 1
                            : existing.revision,
                        updatedAt: now,
                    };
                } else {
                    materials = [
                        {
                            id: makeUuid(),
                            folderId: ensured.folderId,
                            title: attrValue,
                            kind: spec.kind,
                            legacyKey,
                            text,
                            revision: 1,
                            updatedAt: now,
                            archivedAt: null,
                        },
                        ...materials,
                    ];
                }
                count += 1;
            }
        }

        return {
            state: { folders, materials },
            count,
        };
    }
}
