export type FieldKind = "text" | "email" | "tel" | "url" | "country" | "timezone" | "date" | "month" | "number" | "boolean" | "list" | "textarea" | "choices" | "select" | "resume";
export interface FieldSpec {
    key: string;
    label: string;
    kind?: FieldKind;
    options?: string[];
    optionLabels?: Record<string, string>;
    required?: boolean;
}
export interface RepeaterSpec { key: string; title: string; singular: string; fields: FieldSpec[] }
export interface SectionSpec { id: string; title: string; description: string; fields: FieldSpec[]; repeaters?: RepeaterSpec[] }
const employmentTypes = ["full_time", "part_time", "contract", "freelance", "internship", "temporary"];
export const profileSections: SectionSpec[] = [
    { id: "contact", title: "Contact & links", description: "Your contact details and where you live.", fields: [
        { key: "name", label: "Display name" },
        { key: "first_name", label: "First name" }, { key: "last_name", label: "Last name" },
        { key: "preferred_name", label: "Preferred name" },
        { key: "email", label: "Email", kind: "email" }, { key: "phone", label: "Phone with country code", kind: "tel" },
        { key: "residence_country", label: "Residence country", kind: "country" },
        { key: "residence_region", label: "Region / state" }, { key: "residence_city", label: "City" },
        { key: "timezone", label: "Timezone", kind: "timezone" },
        { key: "linkedin_url", label: "LinkedIn", kind: "url" }, { key: "github_url", label: "GitHub", kind: "url" },
        { key: "portfolio_url", label: "Portfolio", kind: "url" }, { key: "profile_links", label: "Additional links", kind: "list" },
    ] },
    { id: "work", title: "Work preferences", description: "Where, how, and when you would like to work.", fields: [
        { key: "desired_role_titles", label: "Desired roles", kind: "list" },
        { key: "employment_types", label: "Employment types", kind: "choices", options: employmentTypes },
        { key: "work_arrangements", label: "Work arrangements", kind: "choices", options: ["remote", "hybrid", "on_site"] },
        { key: "preferred_work_locations", label: "Preferred work locations", kind: "list" },
        { key: "willing_to_relocate", label: "Willing to relocate", kind: "boolean" },
        { key: "relocation_destinations", label: "Relocation destinations", kind: "list" },
        { key: "willing_to_travel", label: "Willing to travel", kind: "boolean" },
        { key: "notice_period_days", label: "Notice period (days)", kind: "number" },
        { key: "availability", label: "When can you start?", kind: "select", options: ["immediately", "from_date"], optionLabels: { immediately: "Available now", from_date: "From a specific date" } },
        { key: "earliest_start_date", label: "Earliest start date", kind: "date", required: true },
    ], repeaters: [
        { key: "work_authorizations", title: "Country-specific work answers", singular: "country", fields: [
            { key: "country", label: "Country", kind: "country", required: true },
            { key: "authorized_as_employee", label: "Authorized as an employee", kind: "boolean" },
            { key: "sponsorship_needed_now", label: "Sponsorship needed now", kind: "boolean" },
            { key: "sponsorship_needed_later", label: "Sponsorship needed in future", kind: "boolean" },
            { key: "available_as_contractor", label: "Available as a contractor", kind: "boolean" },
        ] },
        { key: "compensation_expectations", title: "Compensation expectations", singular: "compensation", fields: [
            { key: "employment_type", label: "Employment type", kind: "select", options: employmentTypes },
            { key: "currency", label: "Currency (3-letter code)", required: true },
            { key: "minimum", label: "Minimum", kind: "number" }, { key: "maximum", label: "Maximum", kind: "number" },
            { key: "period", label: "Period", kind: "select", options: ["hourly", "monthly", "annual"], required: true },
            { key: "basis", label: "Gross / net", kind: "select", options: ["gross", "net"], required: true },
        ] },
    ] },
    { id: "career", title: "Career", description: "Structured facts for application forms. Keep detailed stories in Dossier.", fields: [
        { key: "professional_headline", label: "Professional headline" },
        { key: "professional_summary", label: "Short professional summary", kind: "textarea" },
        { key: "skills", label: "Skills", kind: "list" },
    ], repeaters: [
        { key: "employment_history", title: "Employment history", singular: "employment", fields: [
            { key: "company", label: "Company" }, { key: "title", label: "Job title" }, { key: "location", label: "Location" },
            { key: "employment_type", label: "Employment type", kind: "select", options: employmentTypes },
            { key: "start_month", label: "Start month", kind: "month" }, { key: "end_month", label: "End month", kind: "month" },
            { key: "is_current", label: "Current role", kind: "boolean" },
        ] },
        { key: "education", title: "Education", singular: "education", fields: [
            { key: "institution", label: "Institution" }, { key: "qualification", label: "Qualification" },
            { key: "field_of_study", label: "Field of study" }, { key: "start_month", label: "Start month", kind: "month" },
            { key: "end_month", label: "End month", kind: "month" },
        ] },
        { key: "languages", title: "Languages", singular: "language", fields: [
            { key: "language", label: "Language" },
            { key: "proficiency", label: "Proficiency", kind: "select", options: ["basic", "intermediate", "advanced", "fluent", "native"] },
        ] },
    ] },
    { id: "documents", title: "Documents", description: "Save labeled resume links. Files are not uploaded here.", fields: [
        { key: "default_resume_id", label: "Default resume", kind: "resume" },
    ], repeaters: [
        { key: "resumes", title: "Resume links", singular: "resume", fields: [
            { key: "label", label: "Label", required: true }, { key: "url", label: "Resume URL", kind: "url", required: true },
        ] },
    ] },
];
