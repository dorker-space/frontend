# Dorker Landing Page & Synthetic Example Architecture

The public introduction (`dorker.space`), the interactive synthetic sandbox (`example.dorker.space`), and the restricted beta application (`app.dorker.space`) share a single React + TypeScript + Vite build inside `dorker-frontend`.

## Accepted Decisions

| Decision | Reason | Affected Components | Status |
| --- | --- | --- | --- |
| Intercept `/api/*` at `BaseApiClient` for Example mode with a `sessionStorage`-backed synthetic store and automatic fallback synthesizer | Run the exact real application pages (`MatchesPage`, `ApplicationWorkspacePage`, `ApplicationsPage`, `DossierPage`, `ProfilePage`, `JobsPage`, `SavedJobsPage`) untouched, while ensuring future features and endpoints added to the real app automatically work with synthetic data in the example sandbox | `src/api/client.ts`, `src/lib/api.ts`, `src/api/synthetic-adapter.ts`, `src/api/synthetic-data.ts` | Accepted & Implemented |
| Subdomain routing (`dorker.space` = landing, `example.dorker.space` = synthetic app, `app.dorker.space` = real app) with `?mode=landing\|example\|app` query support on `localhost` | Match production subdomain topology while allowing local testing of all three experiences on `localhost` without `/etc/hosts` changes | `src/lib/app-mode.ts`, `src/App.tsx`, `src/components/landing/example-mode-banner.tsx` | Accepted & Implemented |
| Ground synthetic dataset in `profile.xml`, `AGENTS.md`, and the real UI screenshots (`EvolutionIQ`, `Aura`, `Cribl`, `Coinbase`, `Boon Technologies`) | Present authentic engineering evidence (WebRTC WHIP/TURN at Pixelview, Go analytics at Headway, KSE Algorithms TA, AI-Orchestrator, Dorker.space `pgvector` + `nomic` 6-class classifier + `Jev` 5h-to-<1m speedup) instead of disconnected generic placeholders | `src/api/synthetic-data.ts`, `src/components/landing/workspace-preview.tsx`, `src/pages/home-page.tsx` | Accepted & Implemented |
| Direct Beta Test Access flow (`BetaAccessDialog`) | Allow visitors to request approved beta access to `app.dorker.space` via LinkedIn, email (`podolancukserafim@gmail.com`), or GitHub without requiring a new backend waitlist service | `src/components/landing/beta-access-dialog.tsx`, `src/components/landing/links.ts` | Accepted & Implemented |

## Experience Modes (`src/lib/app-mode.ts`)

1. **Landing (`dorker.space` or `localhost` `/`)**:
   - Renders `HomePage` using the real frontend's Tailwind/shadcn design system.
   - Embeds `WorkspacePreview`, which renders the actual `MatchTab` and `JobDescriptionPanel` components alongside the Matches view from Screenshots 1 & 2.
   - Tells the engineering story behind Dorker (`profile.xml`, `AGENTS.md`, and the LinkedIn post) and offers CTAs to launch the full interactive sandbox or request beta access.
2. **Example Sandbox (`example.dorker.space` or `localhost` `?mode=example`)**:
   - Renders `ExampleModeBanner` + the untouched `DashboardRoutes` (`MatchesPage`, `ApplicationWorkspacePage`, `ApplicationsPage`, `SavedJobsPage`, `DossierPage`, `ProfilePage`, `JobsPage`).
   - `shouldUseSyntheticApi()` activates `handleSyntheticRequest` and `handleSyntheticNdjsonStream` in `BaseApiClient`.
   - All mutations (status changes, Kanban drag-and-drop, NDJSON discussion streaming, evidence selection, cover letter & screening answer generation, Dossier folder/file CRUD, Profile editing, external job scraping) persist in `sessionStorage` (`dorker.example.store.v1`) and can be reset anytime via **Reset Sandbox**.
   - Any unmapped future `/api/*` endpoint is handled by `synthesizeUnmappedEndpoint` so new real-app features degrade gracefully with synthetic responses.
3. **Real App (`app.dorker.space` or `localhost` `?mode=app`)**:
   - Renders `DashboardRoutes` directly against the live `/api/*` backend without synthetic interception.
