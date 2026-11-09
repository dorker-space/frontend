import { BaseApiClient } from "@/api/client";

export interface EvidenceFolder { path: string; created_at: string }
export interface EvidenceFile {
    id: string;
    folder_path: string;
    title: string;
    text: string;
    use_for_matching: boolean;
    created_at: string;
    updated_at: string;
}
export type EvidenceContent = Pick<EvidenceFile, "title" | "text" | "use_for_matching">;

export class EvidenceApi extends BaseApiClient {
    listFolders() { return this.request<EvidenceFolder[]>("/api/folders"); }
    createFolder(path: string) {
        return this.request<EvidenceFolder>("/api/folders", { method: "POST", body: { path } });
    }
    deleteFolder(path: string) {
        return this.request<void>("/api/folders", { method: "DELETE", params: { path } });
    }
    listEvidence() { return this.request<EvidenceFile[]>("/api/evidence"); }
    createEvidence(folder_path: string, content: EvidenceContent) {
        return this.request<EvidenceFile>("/api/evidence", { method: "POST", body: { folder_path, ...content } });
    }
    updateEvidence(id: string, content: EvidenceContent) {
        return this.request<EvidenceFile>(`/api/evidence/${encodeURIComponent(id)}`, { method: "PATCH", body: content });
    }
    deleteEvidence(id: string) {
        return this.request<void>(`/api/evidence/${encodeURIComponent(id)}`, { method: "DELETE" });
    }
}
export const evidenceApi = new EvidenceApi();
