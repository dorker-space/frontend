# Dorker frontend

React + TypeScript + Vite client for the local Dorker API.

The same frontend build powers three experiences via hostname (or `?mode=landing|example|app` on `localhost`):
- `dorker.space` (`/` on `localhost`): Public landing page with an interactive preview of the real Dorker UI and the engineering story behind the pipeline.
- `example.dorker.space` (`?mode=example` on `localhost`): The complete real Dorker application fed by an in-memory/`sessionStorage` synthetic API adapter at `BaseApiClient`—no backend or registration required.
- `app.dorker.space` (`?mode=app` on `localhost`): The live Dorker workspace connected to the `/api` backend for approved beta users.

See [docs/landing-page.md](docs/landing-page.md) for architecture decisions, synthetic data design, and hosting notes.

## Development

Start the backend from the Python repository in its project environment:

```sh
python -m orchestration.analyst
```

This starts classification and summary workers too; it can make provider calls.
Then, from this directory:

```sh
npm install
npm run dev
```

Vite proxies `/api` to `http://127.0.0.1:8000`. If the backend uses another port,
update the proxy target in `vite.config.ts`. Production hosting must proxy `/api`
to the local backend as well. API docs are at http://127.0.0.1:8000/docs.

## Structure

- `src/api/types.ts`: HTTP response shapes (snake_case matches Python).
- `src/api/client.ts`: fetch wrapper, validation/error responses, endpoint calls.
- `src/features/workspace/useWorkspace.ts`: loading, navigation, mutations and session results.
- `src/features/workspace/ApplicationWorkspace.tsx`: panels, forms, selected tabs and input text.

The workspace opens the next pending match, or an explicit `?match=<UUID>` URL.
Previous revisits matches opened in this session; Next browses the live pending queue.
Skip/Ignore/Mark applied/Decline update a status; they do not submit to employers.
The chat starts a discussion automatically on the first message. Jev selects evidence
once when the application is created. The right-hand **Evidence** tab displays the
shared selection as folders with readable titles, checkboxes, text previews, search,
and a selected-only filter. Evidence lists no longer appear in Discussion or Draft.
Checkbox changes are saved immediately and are reused by later chat replies and generation.
Use **New folder** to create a root folder or choose a parent. Use **New evidence**
to write a title and text, then choose its folder (or leave it unfiled). Saving adds
it to the profile without changing the application's selection; check the new item
to attach it. Empty folders remain visible. Failed saves preserve the entered text,
and switching workspace tabs preserves an open evidence form within the current match.

Mark a message **Use this message as evidence** to explicitly attach its contents.
It appears under **From this discussion** and can be unchecked or checked again.
Unconfirmed chat text and assistant replies are not automatically evidence. Finished
discussions stay read-only, while evidence can still be adjusted before generation.
The chat remains mounted while switching tabs; interrupted replies remain marked
incomplete and uncertain delivery requires a history reload.

Opening **Application Draft** without a discussion first creates/loads the draft,
then opens Evidence for review. **Confirm evidence** returns to Application Draft
without generating anything. Choose the outputs (letter, answers, or both) and click
**Generate** in Application Draft to start generation. Generation controls appear only
in the Draft tab.
After a discussion, Draft uses its saved evidence directly. An empty selection is valid
to save but cannot generate an application. Archived attached items remain visible and
removable, but cannot be newly checked until restored through the profile API.

Saved drafts reload through the application endpoint. Match changes reset the active
session so late responses cannot overwrite another application's evidence. Selection
conflicts reload the latest server state and ask the user to review/retry instead of
silently overwriting it. No automatic mutation retries, draft editing, or employer submission.

The profile/draft/evidence API and PostgreSQL profile migration must be available on
the backend. The frontend does not invoke database migration or XML import commands.

```sh
npm run build
npm run lint
npm run test:api
```

API-client and evidence-model checks use synthetic fetch responses and make no network/model calls.
