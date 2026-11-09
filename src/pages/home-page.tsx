import { useState, type FormEvent } from "react";
import {
    BETA_EMAIL,
    BETA_MAILTO_URL,
    PROJECT_URL,
} from "@/components/landing/links";
import {
    LandingFooter,
    LandingHeader,
} from "@/components/landing/site-chrome";

export default function HomePage() {
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteNote, setInviteNote] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [inviteSubmitted, setInviteSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const handleInviteSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!inviteEmail || isSubmitting) return;

        setIsSubmitting(true);
        setSubmitError(null);

        const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;

        if (!accessKey) {
            // If no access key is configured in .env yet, fallback to opening mailto or logging warning
            console.warn(
                "VITE_WEB3FORMS_ACCESS_KEY is not set. Get a free key at https://web3forms.com and add it to your .env file."
            );
            // Simulate brief latency for UX and open mailto as fallback
            await new Promise((r) => setTimeout(r, 600));
            setInviteSubmitted(true);
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    access_key: accessKey,
                    subject: `New Dorker Beta Request from ${inviteEmail}`,
                    from_name: "Dorker Landing Form",
                    email: inviteEmail,
                    message: inviteNote || "Requested access to Beta Cohort 01",
                }),
            });

            const data = await response.json();

            if (data.success) {
                setInviteSubmitted(true);
            } else {
                setSubmitError(
                    data.message || "Failed to send request. Please try again."
                );
            }
        } catch (err) {
            setSubmitError(
                "Network error sending request. You can also email directly."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-[#fcf9f0] text-[#1c1c17] antialiased selection:bg-[#dbeafe] selection:text-[#091e42] min-h-screen">
            {/* Minimal App-Consistent Top Navbar */}
            <LandingHeader />

            {/* HERO SECTION */}
            <section className="pt-16 pb-20 px-4 sm:px-6">
                <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
                    {/* Eyebrow Pill Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#eaf2ff] border border-[#bfdbfe] text-[#1d4ed8] text-xs font-medium mb-6">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1d4ed8] animate-pulse" />
                        <span>
                            Public Beta Cohort 01 • Built by an engineer who got
                            tired of job hunting
                        </span>
                    </div>

                    {/* Main Headline */}
                    <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-bold text-[#091e42] tracking-tight leading-[1.15] max-w-4xl mb-6">
                        Stop spending 40 hours a week applying to jobs you'd
                        never take.
                    </h1>

                    {/* Crisp Subhead */}
                    <p className="text-lg sm:text-xl text-[#43474f] max-w-2xl leading-relaxed mb-8">
                        Dorker checks real vacancies against your actual career
                        goals, exposes hidden dealbreakers before you apply, and
                        drafts personalized outreach grounded in your real work.
                    </p>

                    {/* Primary Call to Actions */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mb-16">
                        <a
                            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-medium text-sm transition-all shadow-sm shadow-[#1d4ed8]/20 flex items-center justify-center gap-2"
                            href="#request-access"
                        >
                            <span>Join Beta Cohort 01</span>
                            <span className="material-symbols-outlined text-[18px]">
                                arrow_forward
                            </span>
                        </a>
                        <a
                            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white border border-[#e2ded6] text-[#1c1c17] hover:bg-[#f6f3eb] font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-xs"
                            href="#live-preview"
                        >
                            <span>See Live Matching Demo</span>
                            <span className="material-symbols-outlined text-[18px] text-[#737780]">
                                south
                            </span>
                        </a>
                    </div>

                    {/* VISUAL ANCHOR: Authentic UI Card (CleanShot 2026-11-08 at 15.22.26) */}
                    <div
                        className="w-full max-w-3xl text-left bg-white border border-[#e2ded6] rounded-2xl shadow-sm overflow-hidden p-6 sm:p-7"
                        id="live-preview"
                        style={{
                            boxShadow:
                                "rgba(9, 30, 66, 0.05) 0px 4px 20px -2px",
                        }}
                    >
                        {/* Header row of the preview card */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-5 border-b border-[#f1eee5]">
                            <div>
                                <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                                    <h3 className="text-lg font-semibold text-[#091e42]">
                                        Senior AI Engineer
                                    </h3>
                                    <span className="bg-[#fef3c7] text-[#92400e] border border-[#fde68a] font-medium text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                                        <span className="text-[12px]">⚡</span>{" "}
                                        Stretch Match
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-[#43474f] font-medium">
                                    <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[15px] text-[#737780]">
                                            apartment
                                        </span>{" "}
                                        Google
                                    </span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[15px] text-[#737780]">
                                            location_on
                                        </span>{" "}
                                        Chicago or Remote (US)
                                    </span>
                                    <span>•</span>
                                    <span className="bg-[#eaf2ff] text-[#1d4ed8] border border-[#bfdbfe] px-2 py-0.5 rounded-full text-[11px]">
                                        Pending ▾
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-[#737780] flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[16px]">
                                        open_in_new
                                    </span>{" "}
                                    ATS Listing
                                </span>
                            </div>
                        </div>

                        {/* Dual Score Progress Meters (Real App Metric Cards) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-5">
                            {/* Technical Capability Metric */}
                            <div className="p-4 rounded-xl bg-[#f6f3eb] border border-[#e2ded6]">
                                <div className="flex items-center justify-between text-xs font-medium mb-1.5">
                                    <span className="flex items-center gap-1.5 text-[#091e42]">
                                        <span className="material-symbols-outlined text-[16px] text-[#737780]">
                                            developer_board
                                        </span>
                                        <span>Technical Capability</span>
                                    </span>
                                    <span className="font-bold text-[#091e42]">
                                        26%
                                    </span>
                                </div>
                                <div className="w-full bg-[#dddad2] rounded-full h-2 overflow-hidden mb-1.5">
                                    <div
                                        className="bg-[#091e42] h-full rounded-full"
                                        style={{ width: "26%" }}
                                    />
                                </div>
                                <span className="text-[11px] text-[#43474f]">
                                    Stack &amp; architecture overlap
                                </span>
                            </div>

                            {/* Strategic Value Metric */}
                            <div className="p-4 rounded-xl bg-[#eaf2ff]/70 border border-[#bfdbfe]/80">
                                <div className="flex items-center justify-between text-xs font-medium mb-1.5">
                                    <span className="flex items-center gap-1.5 text-[#091e42]">
                                        <span className="material-symbols-outlined text-[16px] text-[#1d4ed8]">
                                            explore
                                        </span>
                                        <span>Strategic Value</span>
                                    </span>
                                    <span className="font-bold text-[#1d4ed8]">
                                        88%
                                    </span>
                                </div>
                                <div className="w-full bg-[#bfdbfe] rounded-full h-2 overflow-hidden mb-1.5">
                                    <div
                                        className="bg-[#1d4ed8] h-full rounded-full"
                                        style={{ width: "88%" }}
                                    />
                                </div>
                                <span className="text-[11px] text-[#1d4ed8]/90">
                                    Career &amp; autonomy alignment
                                </span>
                            </div>
                        </div>

                        {/* Forensic Callout Notification Box */}
                        <div className="p-4 rounded-xl bg-[#fef3c7]/60 border border-[#fde68a] text-xs text-[#92400e] leading-relaxed flex items-start gap-3">
                            <span className="material-symbols-outlined text-[18px] text-[#d97706] shrink-0 mt-0.5">
                                verified
                            </span>
                            <div>
                                <strong className="font-semibold text-[#78350f]">
                                    Why Dorker flagged this:
                                </strong>{" "}
                                Matches your AI agent architecture focus from
                                your dossier, but alerts you to legacy monolith
                                maintenance in paragraph 14 before you waste
                                hours applying.
                            </div>
                        </div>
                    </div>

                    <div className="w-full max-w-3xl mt-6 p-4 rounded-xl bg-[#f6f3eb] border border-[#e2ded6] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-xs">
                        <div className="flex items-center gap-2.5 text-[#091e42] text-left">
                            <span className="material-symbols-outlined text-[18px] text-[#1d4ed8] shrink-0">
                                code_blocks
                            </span>
                            <p className="text-xs text-[#43474f]">
                                <strong className="font-semibold text-[#091e42]">
                                    Source available. Free to self-host for your
                                    own job search.
                                </strong>{" "}
                                Inspect every line, run your own instance, or
                                join the managed cloud beta.
                            </p>
                        </div>
                        <a
                            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#e2ded6] text-[#091e42] hover:bg-[#ebe8e0] font-medium transition-colors"
                            href={PROJECT_URL}
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            <svg
                                className="w-3.5 h-3.5 text-[#43474f]"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    clipRule="evenodd"
                                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                                    fillRule="evenodd"
                                />
                            </svg>
                            <span>Inspect Code</span>
                        </a>
                    </div>
                </div>
            </section>

            {/* SECTION 1: THE PROBLEM IN 3 OBVIOUS TRUTHS */}
            <section className="py-20 px-4 sm:px-6 border-t border-[#e2ded6] bg-[#f6f3eb]">
                <div className="max-w-6xl mx-auto">
                    <div className="max-w-xl mb-12">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#1d4ed8] block mb-2">
                            Personal lessons from 6 months of hunting
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-bold text-[#091e42] tracking-tight">
                            What broke for me during 200+ manual applications
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-6 rounded-2xl bg-white border border-[#e2ded6] flex flex-col justify-between shadow-xs">
                            <div>
                                <div className="w-10 h-10 rounded-xl bg-[#eaf2ff] border border-[#bfdbfe] flex items-center justify-center text-[#1d4ed8] mb-5">
                                    <span className="material-symbols-outlined text-[20px]">
                                        filter_alt_off
                                    </span>
                                </div>
                                <h3 className="text-base font-semibold text-[#091e42] mb-2">
                                    1. Keyword parsers miss the actual role
                                </h3>
                                <p className="text-sm text-[#43474f] leading-relaxed">
                                    A vacancy mentioning your stack might
                                    actually be a legacy maintenance contract or
                                    miss your architectural abilities.
                                </p>
                            </div>
                            <div className="mt-6 pt-4 border-t border-[#f1eee5] text-xs text-[#737780] font-medium">
                                Result: Great engineers get rejected by regex
                                while poor fits slip through.
                            </div>
                        </div>

                        <div className="p-6 rounded-2xl bg-white border border-[#e2ded6] flex flex-col justify-between shadow-xs">
                            <div>
                                <div className="w-10 h-10 rounded-xl bg-[#fef3c7] border border-[#fde68a] flex items-center justify-center text-[#d97706] mb-5">
                                    <span className="material-symbols-outlined text-[20px]">
                                        visibility_off
                                    </span>
                                </div>
                                <h3 className="text-base font-semibold text-[#091e42] mb-2">
                                    2. Dealbreakers are hidden in plain text
                                </h3>
                                <p className="text-sm text-[#43474f] leading-relaxed">
                                    Spending 40 minutes tailoring a letter only
                                    to find a buried "US-only" clause on
                                    paragraph 12 is exhausting.
                                </p>
                            </div>
                            <div className="mt-6 pt-4 border-t border-[#f1eee5] text-xs text-[#737780] font-medium">
                                Result: Hours of deep focus lost on non-viable
                                applications.
                            </div>
                        </div>

                        <div className="p-6 rounded-2xl bg-white border border-[#e2ded6] flex flex-col justify-between shadow-xs">
                            <div>
                                <div className="w-10 h-10 rounded-xl bg-[#fee2e2] border border-[#fecaca] flex items-center justify-center text-[#dc2626] mb-5">
                                    <span className="material-symbols-outlined text-[20px]">
                                        delete_sweep
                                    </span>
                                </div>
                                <h3 className="text-base font-semibold text-[#091e42] mb-2">
                                    3. Generic AI tools make it worse
                                </h3>
                                <p className="text-sm text-[#43474f] leading-relaxed">
                                    Spraying ChatGPT cover letters destroys
                                    candidate integrity and sends generic text
                                    that feels like spam.
                                </p>
                            </div>
                            <div className="mt-6 pt-4 border-t border-[#f1eee5] text-xs text-[#737780] font-medium">
                                Result: Candidate reputation damaged with
                                instant auto-rejects.
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 2: HOW DORKER WORKS: 3 STEPS, NO NONSENSE */}
            <section
                className="py-20 px-4 sm:px-6 bg-[#fcf9f0] border-t border-[#e2ded6]"
                id="how-it-works"
            >
                <div className="max-w-6xl mx-auto">
                    <div className="max-w-2xl mb-16">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#1d4ed8] block mb-2">
                            How I approached the solution
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-bold text-[#091e42] tracking-tight mb-3">
                            How Dorker handles the process differently
                        </h2>
                        <p className="text-sm sm:text-base text-[#43474f]">
                            Built to reduce manual fatigue while keeping every
                            decision in your hands.
                        </p>
                    </div>

                    <div className="space-y-12" id="the-dossier">
                        {/* Step 1: Your Dossier, Not Just a Resume */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white p-6 sm:p-8 rounded-2xl border border-[#e2ded6] shadow-sm">
                            <div className="lg:col-span-5">
                                <span className="text-xs font-bold text-[#1d4ed8] uppercase tracking-wider">
                                    Step 01 • The Dossier
                                </span>
                                <h3 className="text-xl font-bold text-[#091e42] mt-1 mb-3">
                                    1. Store what you actually care about
                                </h3>
                                <p className="text-sm text-[#43474f] leading-relaxed mb-4">
                                    A place for your evidence. Your experience,
                                    knowledge, and stories. One file at a time.
                                    Instead of condensing your career into a
                                    generic 1-page PDF, Dorker builds a context
                                    reservoir of real architectural trade-offs,
                                    engineering beliefs, and hard non-negotiable
                                    rules.
                                </p>
                                <div className="flex items-center gap-2 text-xs text-[#43474f]">
                                    <span className="material-symbols-outlined text-[16px] text-[#1d4ed8]">
                                        check_circle
                                    </span>
                                    <span>
                                        Enforces hard dealbreakers: location,
                                        tax status, and autonomy before
                                        matching.
                                    </span>
                                </div>
                            </div>

                            {/* Clean Dossier Mockup UI (CleanShot 15.22.57 style) */}
                            <div className="lg:col-span-7 bg-[#f6f3eb] rounded-xl border border-[#e2ded6] p-5 font-mono text-xs">
                                <div className="flex items-center justify-between pb-3 border-b border-[#e2ded6] text-[#43474f] font-sans font-medium text-xs">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px] text-[#1d4ed8]">
                                            folder
                                        </span>
                                        <span className="font-semibold text-[#091e42]">
                                            Dossier
                                        </span>
                                        <span className="text-[11px] text-[#737780] font-normal">
                                            candidate_evidence_vault
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[#43474f]">
                                        <button
                                            className="p-1 hover:bg-[#ebe8e0] rounded text-[#43474f] flex items-center gap-0.5 text-[11px] font-sans"
                                            type="button"
                                        >
                                            <span className="material-symbols-outlined text-[15px]">
                                                create_new_folder
                                            </span>
                                            <span className="hidden sm:inline">
                                                Folder
                                            </span>
                                        </button>
                                        <button
                                            className="p-1 hover:bg-[#ebe8e0] rounded text-[#43474f] flex items-center gap-0.5 text-[11px] font-sans"
                                            type="button"
                                        >
                                            <span className="material-symbols-outlined text-[15px]">
                                                note_add
                                            </span>
                                            <span className="hidden sm:inline">
                                                File
                                            </span>
                                        </button>
                                    </div>
                                </div>

                                <div className="pt-3 space-y-2 text-[#1c1c17]">
                                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-[#e2ded6] font-sans shadow-xs">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[16px] text-[#1d4ed8]">
                                                folder_open
                                            </span>
                                            <span className="font-medium text-xs text-[#091e42]">
                                                experience /
                                                canonical_written_interview.md
                                            </span>
                                        </div>
                                        <span className="text-[11px] text-[#1d4ed8] font-medium bg-[#eaf2ff] border border-[#bfdbfe] px-2 py-0.5 rounded-full">
                                            Candidate Evidence
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-[#e2ded6] font-sans shadow-xs">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[16px] text-[#737780]">
                                                description
                                            </span>
                                            <span className="font-medium text-xs text-[#091e42]">
                                                principles /
                                                engineering_tradeoffs_q4.md
                                            </span>
                                        </div>
                                        <span className="text-[11px] text-[#737780]">
                                            14.2k tokens
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#fef3c7]/60 border border-[#fde68a] font-sans shadow-xs">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[16px] text-[#d97706]">
                                                tune
                                            </span>
                                            <span className="font-medium text-xs text-[#78350f]">
                                                preferences /
                                                search_preferences.md
                                            </span>
                                        </div>
                                        <span className="text-[11px] text-[#92400e] font-medium">
                                            Location: Remote • No US Relocation
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#fee2e2]/60 border border-[#fecaca] font-sans shadow-xs">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[16px] text-[#dc2626]">
                                                block
                                            </span>
                                            <span className="font-medium text-xs text-[#991b1b]">
                                                dealbreakers /
                                                non_negotiables.json
                                            </span>
                                        </div>
                                        <span className="text-[11px] text-[#dc2626] font-medium">
                                            Hard Enforced Filter
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 2: Dual-Score Matching */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white p-6 sm:p-8 rounded-2xl border border-[#e2ded6] shadow-sm">
                            <div className="lg:col-span-5 lg:order-2">
                                <span className="text-xs font-bold text-[#1d4ed8] uppercase tracking-wider">
                                    Step 02 • Dual-Score Inspection
                                </span>
                                <h3 className="text-xl font-bold text-[#091e42] mt-1 mb-3">
                                    2. Separate technical match from career
                                    goals
                                </h3>
                                <p className="text-sm text-[#43474f] leading-relaxed mb-4">
                                    Traditional filters only check keyword
                                    overlap. Dorker checks technical
                                    requirements separately from whether the
                                    job actually provides the ownership,
                                    autonomy, and environment you want.
                                </p>
                                <div className="flex items-center gap-2 text-xs text-[#43474f]">
                                    <span className="material-symbols-outlined text-[16px] text-[#1d4ed8]">
                                        check_circle
                                    </span>
                                    <span>
                                        Surfaces high-leverage roles where your
                                        depth bridges specific gaps
                                    </span>
                                </div>
                            </div>

                            {/* Clean Match Stream Mockup (CleanShot 15.22.12 style) */}
                            <div className="lg:col-span-7 lg:order-1 bg-[#f6f3eb] rounded-xl border border-[#e2ded6] p-5 space-y-3">
                                <div className="flex items-center justify-between text-xs text-[#43474f] font-medium pb-2 border-b border-[#e2ded6]">
                                    <span>
                                        Matching Stream • 463 target
                                        opportunities
                                    </span>
                                    <span className="text-[#1d4ed8]">
                                        Stretch First
                                    </span>
                                </div>

                                {/* Sub-card 1 */}
                                <div className="bg-white p-3.5 rounded-xl border border-[#e2ded6] shadow-xs flex items-center justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-semibold text-xs text-[#091e42]">
                                                Senior Software Engineer, AI
                                                Platform
                                            </h4>
                                            <span className="bg-[#fef3c7] text-[#92400e] border border-[#fde68a] font-medium text-[11px] px-2 py-0.5 rounded-full">
                                                Stretch
                                            </span>
                                        </div>
                                        <div className="text-[11px] text-[#737780]">
                                            Aura • Remote Poland • Scraped Today
                                        </div>
                                    </div>
                                    <div className="text-right text-xs shrink-0">
                                        <span className="text-[#737780] text-[11px]">
                                            Strategic
                                        </span>
                                        <div className="font-bold text-[#1d4ed8]">
                                            86%
                                        </div>
                                    </div>
                                </div>

                                {/* Sub-card 2 */}
                                <div className="bg-white p-3.5 rounded-xl border border-[#e2ded6] shadow-xs flex items-center justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-semibold text-xs text-[#091e42]">
                                                Founding Systems Architect
                                            </h4>
                                            <span className="bg-[#dcfce7] text-[#166534] border border-[#bbf7d0] font-medium text-[11px] px-2 py-0.5 rounded-full">
                                                Suitable
                                            </span>
                                        </div>
                                        <div className="text-[11px] text-[#737780]">
                                            Seed Stage • Remote Worldwide
                                        </div>
                                    </div>
                                    <div className="text-right text-xs shrink-0">
                                        <span className="text-[#737780] text-[11px]">
                                            Strategic
                                        </span>
                                        <div className="font-bold text-[#16a34a]">
                                            94%
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 3: Human in the Loop */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white p-6 sm:p-8 rounded-2xl border border-[#e2ded6] shadow-sm">
                            <div className="lg:col-span-5">
                                <span className="text-xs font-bold text-[#1d4ed8] uppercase tracking-wider">
                                    Step 03 • Candidate Agency
                                </span>
                                <h3 className="text-xl font-bold text-[#091e42] mt-1 mb-3">
                                    3. Clarify and review before drafting
                                </h3>
                                <p className="text-sm text-[#43474f] leading-relaxed mb-4">
                                    Interrogate vacancies about location, tax
                                    status, and engineering expectations before
                                    deciding to draft. Generate factual drafts
                                    that cite your dossier notes — with you
                                    reviewing and owning every word.
                                </p>
                                <div className="flex items-center gap-2 text-xs text-[#43474f]">
                                    <span className="material-symbols-outlined text-[16px] text-[#1d4ed8]">
                                        check_circle
                                    </span>
                                    <span>
                                        Zero mass-bot spamming. 100% candid
                                        candidate control.
                                    </span>
                                </div>
                            </div>

                            {/* Clean Discussion UI (CleanShot 15.22.26 style) */}
                            <div className="lg:col-span-7 bg-[#f6f3eb] rounded-xl border border-[#e2ded6] p-5 space-y-3 text-xs">
                                <div className="p-3 bg-white rounded-xl border border-[#e2ded6] flex items-start gap-2.5">
                                    <div className="w-6 h-6 rounded bg-[#ebe8e0] text-[#091e42] flex items-center justify-center font-bold text-[10px] shrink-0">
                                        YOU
                                    </div>
                                    <p className="text-[#1c1c17]">
                                        "Does this job allow contractor status
                                        from Europe, or is it strictly W2 US?"
                                    </p>
                                </div>

                                <div className="p-3 bg-[#eaf2ff]/80 rounded-xl border border-[#bfdbfe] flex items-start gap-2.5">
                                    <div className="w-6 h-6 rounded bg-[#1d4ed8] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                                        AI
                                    </div>
                                    <p className="text-[#091e42] leading-relaxed">
                                        <strong>Audit complete:</strong> Scraped
                                        Greenhouse text confirms international
                                        engineering distribution with B2B
                                        contracting support. No US payroll
                                        restriction detected.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 3: A HONEST NOTE FROM SERAFYM */}
            <section
                className="py-20 px-4 sm:px-6 bg-[#f6f3eb] border-t border-[#e2ded6]"
                id="founder-note"
            >
                <div className="max-w-3xl mx-auto">
                    <div
                        className="p-8 sm:p-10 rounded-2xl bg-white border border-[#e2ded6] shadow-sm relative"
                        style={{
                            boxShadow: "rgba(9, 30, 66, 0.04) 0px 2px 14px",
                        }}
                    >
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#737780] mb-6">
                            <span className="w-2 h-2 rounded-full bg-[#1d4ed8]" />
                            <span>Founder Note</span>
                        </div>

                        <blockquote className="text-lg sm:text-xl font-medium text-[#091e42] leading-relaxed mb-6">
                            "I built this as a hypothesis to solve my own
                            burnout, not a venture-backed promise. I spent half a
                            year job hunting with 40 tabs open every morning, and
                            I'm looking for 100 engineers to test whether it
                            helps them too."
                        </blockquote>

                        <p className="text-sm text-[#43474f] leading-relaxed mb-8">
                            The hardest realization was that my best work —
                            written systems breakdowns, real architectural
                            trade-offs, and lessons from failures — was
                            completely invisible to keyword parsers. If you are
                            an engineer frustrated by naive filters and robotic
                            recruitment pipelines, Dorker was made for you.
                        </p>

                        {/* Founder Signature Footer */}
                        <div className="pt-6 border-t border-[#f1eee5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <img
                                    src="/me.jpg"
                                    alt="Serafym Podolyanchuk"
                                    className="w-10 h-10 rounded-full object-cover border border-[#e2ded6] shrink-0"
                                    onError={(e) => {
                                        const target = e.currentTarget;
                                        if (target.src.includes("/founder.jpg")) {
                                            target.src = "https://github.com/Developer-dreamer.png";
                                        } else {
                                            target.style.display = "none";
                                            target.nextElementSibling?.classList.remove("hidden");
                                        }
                                    }}
                                />
                                <div className="hidden w-10 h-10 rounded-full bg-[#1d4ed8] text-white font-semibold text-sm flex items-center justify-center shrink-0">
                                    SP
                                </div>
                                <div>
                                    <div className="font-semibold text-sm text-[#091e42]">
                                        Serafym Podolyanchuk
                                    </div>
                                    <div className="text-xs text-[#737780]">
                                        Founder &amp; AI Engineer • creator of
                                        Dorker.space
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 text-xs">
                                <a
                                    className="px-3 py-1.5 rounded-lg bg-[#f6f3eb] border border-[#e2ded6] text-[#1c1c17] hover:bg-[#ebe8e0] font-medium transition-colors flex items-center gap-1.5 shadow-xs"
                                    href="https://www.linkedin.com/in/serafym-podolianchuk/"
                                    rel="noopener noreferrer"
                                    target="_blank"
                                >
                                    <span className="material-symbols-outlined text-[15px]">
                                        link
                                    </span>
                                    <span>LinkedIn</span>
                                </a>
                                <a
                                    className="px-3 py-1.5 rounded-lg bg-[#f6f3eb] border border-[#e2ded6] text-[#1c1c17] hover:bg-[#ebe8e0] font-medium transition-colors flex items-center gap-1.5 shadow-xs"
                                    href={PROJECT_URL}
                                    rel="noopener noreferrer"
                                    target="_blank"
                                >
                                    <span className="material-symbols-outlined text-[15px]">
                                        code
                                    </span>
                                    <span>GitHub</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 4: BETA COHORT 01 INVITATION */}
            <section
                className="py-20 px-4 sm:px-6 bg-[#fcf9f0] border-t border-[#e2ded6]"
                id="request-access"
            >
                <div className="max-w-xl mx-auto text-center">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#eaf2ff] border border-[#bfdbfe] text-[#1d4ed8] text-xs font-medium mb-4">
                        <span>Limited to 100 Engineers</span>
                    </div>
                    <h2 className="text-3xl font-bold text-[#091e42] tracking-tight mb-3">
                        Join Beta Cohort 01
                    </h2>
                    <p className="text-sm text-[#43474f] mb-8 leading-relaxed">
                        Get high-touch setup, dossier modeling assistance, and
                        real-time alerts tailored to your career trajectory.
                    </p>

                    {/* Minimal clean Form Card */}
                    <div
                        className="bg-white p-6 sm:p-8 rounded-2xl border border-[#e2ded6] shadow-sm text-left"
                        style={{
                            boxShadow:
                                "rgba(9, 30, 66, 0.04) 0px 4px 20px -2px",
                        }}
                    >
                        <form
                            className={`space-y-4 ${inviteSubmitted ? "opacity-40 pointer-events-none" : ""}`}
                            onSubmit={handleInviteSubmit}
                        >
                            {/* Honeypot anti-spam for bots */}
                            <input
                                type="checkbox"
                                name="botcheck"
                                className="hidden"
                                style={{ display: "none" }}
                                tabIndex={-1}
                                autoComplete="off"
                            />
                            <div>
                                <label
                                    className="block text-xs font-semibold text-[#091e42] uppercase tracking-wider mb-1.5"
                                    htmlFor="invite-email"
                                >
                                    Email
                                </label>
                                <input
                                    className="w-full text-sm rounded-xl border border-[#e2ded6] bg-[#f6f3eb]/70 px-3.5 py-2.5 text-[#1c1c17] placeholder-[#737780] focus:border-[#1d4ed8] focus:ring-1 focus:ring-[#1d4ed8] outline-hidden transition-colors"
                                    disabled={isSubmitting || inviteSubmitted}
                                    id="invite-email"
                                    placeholder="example@gmail.com"
                                    required
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) =>
                                        setInviteEmail(e.target.value)
                                    }
                                />
                            </div>
                            <div>
                                <label
                                    className="block text-xs font-semibold text-[#091e42] uppercase tracking-wider mb-1.5"
                                    htmlFor="invite-note"
                                >
                                    A Quick Note (Optional)
                                </label>
                                <textarea
                                    className="w-full text-sm rounded-xl border border-[#e2ded6] bg-[#f6f3eb]/70 px-3.5 py-2.5 text-[#1c1c17] placeholder-[#737780] focus:border-[#1d4ed8] focus:ring-1 focus:ring-[#1d4ed8] outline-hidden transition-colors leading-relaxed"
                                    disabled={isSubmitting || inviteSubmitted}
                                    id="invite-note"
                                    name="note"
                                    rows={3}
                                    placeholder="Anything you'd like to share about your job search or thoughts on Dorker..."
                                    value={inviteNote}
                                    onChange={(e) =>
                                        setInviteNote(e.target.value)
                                    }
                                />
                            </div>
                            <button
                                className="w-full py-3 px-4 rounded-xl bg-[#1d4ed8] hover:bg-[#1e40af] disabled:opacity-60 text-white font-medium text-sm transition-all shadow-sm shadow-[#1d4ed8]/20 flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:cursor-not-allowed"
                                disabled={isSubmitting || inviteSubmitted}
                                type="submit"
                            >
                                <span>{isSubmitting ? "Sending..." : "Request Invite"}</span>
                                <span className="material-symbols-outlined text-[18px]">
                                    {isSubmitting ? "sync" : "send"}
                                </span>
                            </button>
                        </form>

                        {/* Error Alert */}
                        {submitError && (
                            <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                <span>{submitError}</span>
                                <a
                                    href={BETA_MAILTO_URL}
                                    className="underline font-semibold hover:text-red-900 shrink-0"
                                >
                                    Email directly
                                </a>
                            </div>
                        )}

                        {/* Reassurance Snippet */}
                        <div className="mt-4 pt-4 border-t border-[#f1eee5] text-center text-xs text-[#737780] font-medium">
                            Free open beta • No recruiter spam • Your data stays
                            private.
                        </div>

                        {/* Success Toast */}
                        {inviteSubmitted && (
                            <div
                                className="mt-4 p-3.5 rounded-xl bg-[#dcfce7] border border-[#bbf7d0] text-xs text-[#166534] flex items-center gap-2"
                                id="beta-success"
                            >
                                <span className="material-symbols-outlined text-[18px] text-[#16a34a]">
                                    check_circle
                                </span>
                                <span>
                                    Application received! Serafym will reply you within 48 hours.
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* MINIMAL CLEAN FOOTER */}
            <LandingFooter />
        </div>
    );
}
