import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronRight, FilePlus2, FileText, Folder, FolderOpen, FolderPlus, Loader2, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { evidenceApi, type EvidenceFile } from "@/api/evidence";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const libraryKey = ["evidence-library"];
const errorMessage = (error: unknown) => error instanceof Error ? error.message : "Request failed. Please try again.";

export function DossierPage() {
    const cache = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();
    const requestedEvidence = searchParams.get("evidence");
    const openedEvidence = useRef<string | null>(null);
    const [linkError, setLinkError] = useState("");
    const library = useQuery({
        queryKey: libraryKey,
        queryFn: async () => {
            const [folders, files] = await Promise.all([evidenceApi.listFolders(), evidenceApi.listEvidence()]);
            return { folders, files };
        },
        refetchOnWindowFocus: false,
    });
    const [expanded, setExpanded] = useState<Set<string>>(new Set());
    const [folder, setFolder] = useState<string | null>(null);
    const [file, setFile] = useState<EvidenceFile | null>(null);
    const [creating, setCreating] = useState(false);
    const [title, setTitle] = useState("");
    const [text, setText] = useState("");
    const [matching, setMatching] = useState(false);
    const [busy, setBusy] = useState(false);
    const [folderDialog, setFolderDialog] = useState(false);
    const [folderName, setFolderName] = useState("");
    const [folderError, setFolderError] = useState("");
    const dirty = (creating && (title !== "" || text !== "" || matching)) || (!!file && (title !== file.title || text !== file.text || matching !== file.use_for_matching));

    useEffect(() => {
        if (!library.data || !requestedEvidence || openedEvidence.current === requestedEvidence) return;
        openedEvidence.current = requestedEvidence;
        const item = library.data.files.find(entry => entry.id === requestedEvidence);
        if (!item) { setLinkError("This evidence is unavailable or has been deleted."); return; }
        setLinkError(""); setFile(item); setCreating(false); setFolder(item.folder_path);
        setTitle(item.title); setText(item.text); setMatching(item.use_for_matching);
        setExpanded(previous => {
            const next = new Set(previous);
            const parts = item.folder_path.split("/").filter(Boolean);
            parts.forEach((_, index) => next.add("/" + parts.slice(0, index + 1).join("/")));
            return next;
        });
    }, [library.data, requestedEvidence]);

    useEffect(() => {
        const warn = (event: BeforeUnloadEvent) => { if (dirty) { event.preventDefault(); event.returnValue = ""; } };
        window.addEventListener("beforeunload", warn);
        return () => window.removeEventListener("beforeunload", warn);
    }, [dirty]);

    const canLeave = () => !dirty || window.confirm("Discard unsaved changes?");
    const clearEditor = () => { setFile(null); setCreating(false); setTitle(""); setText(""); setMatching(false); };
    const selectFolder = (path: string | null) => {
        if (busy || !canLeave()) return;
        clearEditor(); setFolder(path);
    };
    const selectFile = (item: EvidenceFile) => {
        if (busy || item.id === file?.id || !canLeave()) return;
        openedEvidence.current = item.id; setSearchParams({ evidence: item.id }, { replace: true });
        setFile(item); setCreating(false); setFolder(item.folder_path);
        setTitle(item.title); setText(item.text); setMatching(item.use_for_matching);
    };
    const expandPath = (path: string) => setExpanded(previous => {
        const next = new Set(previous);
        const parts = path.split("/").filter(Boolean);
        parts.forEach((_, index) => next.add("/" + parts.slice(0, index + 1).join("/")));
        return next;
    });
    const newFile = () => {
        if (!folder || busy || !canLeave()) return;
        clearEditor(); setCreating(true); expandPath(folder);
    };
    const refresh = () => cache.invalidateQueries({ queryKey: libraryKey });
    const save = async () => {
        if (!folder || busy || !title.trim() || !text.trim()) return;
        setBusy(true);
        try {
            const content = { title: title.trim(), text, use_for_matching: matching };
            const saved = file ? await evidenceApi.updateEvidence(file.id, content) : await evidenceApi.createEvidence(folder, content);
            setFile(saved); setCreating(false); setTitle(saved.title); setText(saved.text); setMatching(saved.use_for_matching);
            expandPath(saved.folder_path); await refresh(); toast.success("Evidence saved");
        } catch (error) { toast.error(errorMessage(error)); }
        finally { setBusy(false); }
    };
    const deleteFile = async () => {
        if (!file || busy || !window.confirm(`Delete “${file.title}”? This also removes its application selections.`)) return;
        setBusy(true);
        try { await evidenceApi.deleteEvidence(file.id); setSearchParams({}, { replace: true }); clearEditor(); await refresh(); toast.success("Evidence deleted"); }
        catch (error) { toast.error(errorMessage(error)); }
        finally { setBusy(false); }
    };
    const deleteFolder = async () => {
        if (!folder || busy || !canLeave() || !window.confirm(`Delete folder “${folder}”? It must be empty.`)) return;
        setBusy(true);
        try { await evidenceApi.deleteFolder(folder); clearEditor(); setFolder(null); await refresh(); toast.success("Folder deleted"); }
        catch (error) { toast.error(errorMessage(error)); }
        finally { setBusy(false); }
    };
    const addFolder = async (event: React.FormEvent) => {
        event.preventDefault();
        const name = folderName.trim();
        if (!name || name.includes("/") || name === "." || name === "..") { setFolderError("Enter a folder name without slashes or dot segments."); return; }
        setBusy(true); setFolderError("");
        try {
            const saved = await evidenceApi.createFolder(`${folder ?? ""}/${name}`);
            clearEditor(); setFolder(saved.path); expandPath(saved.path);
            await refresh(); setFolderDialog(false); setFolderName(""); toast.success("Folder created");
        } catch (error) { setFolderError(errorMessage(error)); }
        finally { setBusy(false); }
    };
    const tree = (parent: string, depth = 0): React.ReactNode => {
        const folders = library.data?.folders.filter(item => item.path.slice(0, item.path.lastIndexOf("/")) === parent) ?? [];
        return folders.map(item => {
            const open = expanded.has(item.path);
            const files = library.data?.files.filter(entry => entry.folder_path === item.path) ?? [];
            return <div key={item.path}>
                <div className={`flex items-center rounded-md ${folder === item.path && !file && !creating ? "bg-accent" : "hover:bg-muted/60"}`} style={{ paddingLeft: depth * 14 }}>
                    <button type="button" aria-label={`${open ? "Collapse" : "Expand"} ${item.path}`} aria-expanded={open} className="shrink-0 p-1.5 rounded focus-visible:ring-2 focus-visible:ring-ring" onClick={() => setExpanded(previous => { const next = new Set(previous); if (next.has(item.path)) next.delete(item.path); else next.add(item.path); return next; })}>
                        {open ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
                    </button>
                    <button type="button" onClick={() => { selectFolder(item.path); }} className="flex min-w-0 flex-1 items-center gap-2 py-2 pr-2 text-left text-sm" title={item.path}>
                        {open ? <FolderOpen className="size-4 shrink-0 text-muted-foreground" /> : <Folder className="size-4 shrink-0 text-muted-foreground" />}
                        <span className="truncate">{item.path.split("/").pop()}</span>
                    </button>
                </div>
                {open && <div>
                    {tree(item.path, depth + 1)}
                    {files.map(entry => <button key={entry.id} type="button" aria-current={entry.id === file?.id ? "true" : undefined} onClick={() => selectFile(entry)} className={`flex w-full min-w-0 items-center gap-2 rounded-md py-2 pr-2 text-left text-sm ${entry.id === file?.id ? "bg-accent font-medium" : "text-muted-foreground hover:bg-muted/60"}`} style={{ paddingLeft: (depth + 1) * 14 + 27 }} title={entry.title}>
                        <FileText className="size-3.5 shrink-0" /><span className="truncate">{entry.title}</span>
                    </button>)}
                    {!files.length && !library.data?.folders.some(entry => entry.path.startsWith(item.path + "/")) && <p className="py-1 text-xs text-muted-foreground" style={{ paddingLeft: (depth + 1) * 14 + 27 }}>Empty folder</p>}
                </div>}
            </div>;
        });
    };

    return <div className="flex flex-1 flex-col gap-5 p-4">
        <header className="border-b pb-4"><h1 className="text-xl font-semibold tracking-tight">Dossier</h1><p className="mt-1 text-sm text-muted-foreground">Your experience, knowledge, and stories. One file at a time.</p></header>
        {linkError && <p role="alert" className="rounded border p-3 text-sm text-destructive">{linkError}</p>}
        {library.isPending ? <div role="status" className="flex items-center gap-2 p-8 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" />Loading dossier…</div> : library.isError ? <div role="alert" className="rounded-lg border p-6"><p className="text-sm">{errorMessage(library.error)}</p><Button className="mt-3" variant="outline" onClick={() => void library.refetch()}>Retry</Button></div> : <div className="grid min-h-[600px] flex-1 grid-cols-1 overflow-hidden rounded-xl border bg-background md:grid-cols-[260px_minmax(0,1fr)]">
            <aside aria-label="Evidence files" className="border-b bg-muted/15 md:border-b-0 md:border-r">
                <div className="flex items-center justify-between gap-2 border-b px-3 py-3">
                    <button type="button" className="text-sm font-medium" onClick={() => selectFolder(null)}>Dossier</button>
                    <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="size-7" aria-label="New folder" title="New folder" disabled={busy} onClick={() => { if (!canLeave()) return; setFolderName(""); setFolderError(""); setFolderDialog(true); }}><FolderPlus className="size-4" /></Button>
                        <Button variant="ghost" size="icon" className="size-7" aria-label="New evidence" title={folder ? "New evidence" : "Select a folder first"} disabled={!folder || busy} onClick={newFile}><FilePlus2 className="size-4" /></Button>
                    </div>
                </div>
                <nav className="max-h-[65vh] overflow-auto p-2">{library.data.folders.length ? tree("") : <p className="p-3 text-sm text-muted-foreground">Create a folder to start your dossier.</p>}</nav>
            </aside>
            <section className="flex min-w-0 flex-col" aria-label="Evidence editor">
                {(file || creating) ? <>
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3">
                        <div className="min-w-0"><p className="truncate text-xs text-muted-foreground">{folder}</p><p role="status" className="mt-1 text-xs">{busy ? "Saving…" : dirty || creating ? "Unsaved changes" : "Saved"}</p></div>
                        <div className="flex gap-2">{file && <Button variant="ghost" size="sm" aria-label="Delete evidence" disabled={busy} onClick={() => void deleteFile()}><Trash2 className="size-4" /></Button>}<Button size="sm" disabled={busy || !title.trim() || !text.trim() || (!dirty && !creating)} onClick={() => void save()}><Save className="mr-1.5 size-3.5" />Save</Button></div>
                    </div>
                    <div className="flex flex-1 flex-col gap-4 p-5 md:p-7">
                        <label className="sr-only" htmlFor="evidence-title">Evidence title</label><Input id="evidence-title" placeholder="Untitled evidence" value={title} maxLength={500} disabled={busy} onChange={event => setTitle(event.target.value)} className="border-0 px-0 text-lg! font-medium shadow-none focus-visible:ring-0" />
                        <label className="sr-only" htmlFor="evidence-text">Evidence text</label><Textarea id="evidence-text" placeholder="Write what you know. Describe a role, a project, or a problem you solved…" value={text} maxLength={200000} disabled={busy} onChange={event => setText(event.target.value)} onKeyDown={event => { if ((event.metaKey || event.ctrlKey) && event.key === "s") { event.preventDefault(); void save(); } }} className="min-h-[360px] flex-1 resize-y border-0 px-0 text-sm leading-7 shadow-none focus-visible:ring-0" />
                        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4 text-xs text-muted-foreground"><label className="flex items-center gap-2"><input type="checkbox" checked={matching} disabled={busy} onChange={event => setMatching(event.target.checked)} className="accent-primary" />Use for job matching</label><span>{text.length.toLocaleString()} characters</span></div>
                    </div>
                </> : <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
                    {folder ? <FolderOpen className="size-8 text-muted-foreground" /> : <FileText className="size-8 text-muted-foreground" />}<h2 className="text-base font-medium">{folder ? folder.split("/").pop() : "A place for your evidence"}</h2><p className="max-w-sm text-sm text-muted-foreground">{folder ? "Open a file from the tree or write something new." : "Select a file to edit it, or create a folder to get started."}</p>
                    {folder ? <div className="mt-2 flex gap-2"><Button size="sm" onClick={newFile}><FilePlus2 className="mr-2 size-4" />New evidence</Button><Button size="sm" variant="ghost" onClick={() => void deleteFolder()} disabled={busy}><Trash2 className="mr-2 size-4" />Delete folder</Button></div> : <Button size="sm" className="mt-2" onClick={() => { setFolderName(""); setFolderError(""); setFolderDialog(true); }}><FolderPlus className="mr-2 size-4" />New folder</Button>}
                </div>}
            </section>
        </div>}
        <Dialog open={folderDialog} onOpenChange={open => { if (!busy) setFolderDialog(open); }}><DialogContent><form onSubmit={event => void addFolder(event)}><DialogHeader><DialogTitle>New folder</DialogTitle></DialogHeader><p className="my-3 text-sm text-muted-foreground">Create inside {folder ?? "Dossier"}. Select Dossier in the tree to create a top-level folder.</p><label htmlFor="folder-name" className="sr-only">Folder name</label><Input id="folder-name" autoFocus placeholder="Folder name" value={folderName} disabled={busy} onChange={event => setFolderName(event.target.value)} />{folderError && <p role="alert" className="mt-2 text-sm text-destructive">{folderError}</p>}<DialogFooter className="mt-5"><Button type="button" variant="outline" disabled={busy} onClick={() => setFolderDialog(false)}>Cancel</Button><Button type="submit" disabled={busy || !folderName.trim()}>{busy ? "Creating…" : "Create folder"}</Button></DialogFooter></form></DialogContent></Dialog>
    </div>;
}
