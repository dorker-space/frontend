export type Status = 'PENDING' | 'SKIPPED' | 'IGNORED' | 'APPLIED' | 'DECLINED'
export type Material = { id: string; text: string }
export type Question = { question: string; answer: string | null }
export type Generation = { cover_letter: string | null; questions: Question[] | null; debug: string | null }
export type Packet = Generation & { id: number; job_id: string; match_id: string; evidence_revision: number; materials: Material[] }

export type Summary = {
    summary: string;
    pros: string;
    cons: string;
}

export type Match = {
  id: string;
  job_id: string;
  suitability_tier: string;
  pipeline_status: Status
  technical_capability_score: number; strategic_value_score: number
  job_summary: string | null; debug: string | null; rejection_reason: string | null
}
export type Job = {
  id: string;
  title: string;
  company: string | null;
  location: string | null
  url: string | null;
  description: string;
  questions: string[]
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null
  match: Match | null;
  application: Packet | null
}
export type DiscussionMessage = {
  id: string; role: 'user' | 'assistant'; content: string; created_at: string
  metadata: { kind?: string; action?: string; material?: Material }
}
export type Discussion = {
  messages: DiscussionMessage[]; selected_packet: Packet | null; confirmed_materials: Material[]
}

export type ProfileMaterial = {
  id: string; user_id: number; folder_id: string | null; title: string; body: string
  metadata: Record<string, unknown>; position: number; archived_at: string | null
}
export type ProfileFolder = {
  id: string; user_id: number; parent_id: string | null; name: string; position: number; path: string
}
export type MaterialPage = { items: ProfileMaterial[]; total: number; offset: number; limit: number }
export type Evidence = {
  application_id: number; match_id: string; revision: number
  material_ids: string[]; materials: ProfileMaterial[]
}
