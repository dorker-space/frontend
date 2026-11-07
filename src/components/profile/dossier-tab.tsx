import { useMemo, useRef, useState } from "react";
import {
    CheckIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    FileTextIcon,
    FolderIcon,
    FolderOpenIcon,
    FolderPlusIcon,
    PencilIcon,
    PlusIcon,
    SaveIcon,
    SearchIcon,
    Trash2Icon,
    UploadIcon,
    XIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
    dossierApi,
    getDescendantFolderIds,
    getFolderPath,
} from "@/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    DOSSIER_KIND_LABELS,
    DossierFolder,
    DossierLibraryState,
    DossierMaterial,
    DossierMaterialKind,
} from "@/lib/types";

const ALL_KINDS: DossierMaterialKind[] = [
    "experience",
    "project",
    "interview_answer",
    "writing_example",
    "coursework",
    "preferences",
];

interface FolderTreeNodeProps {
    folder: DossierFolder;
    allFolders: DossierFolder[];
    materials: DossierMaterial[];
    selectedFolderId: string | null;
    expandedIds: Set<string>;
    depth: number;
    onSelect: (folderId: string) => void;
    onToggleExpand: (folderId: string) => void;
}

function FolderTreeNode({
    folder,
    allFolders,
    materials,
    selectedFolderId,
    expandedIds,
    depth,
    onSelect,
    onToggleExpand,
}: FolderTreeNodeProps) {
    const children = allFolders
        .filter((f) => f.parentId === folder.id)
        .sort((a, b) => a.position - b.position);
    const hasChildren = children.length > 0;
    const isExpanded = expandedIds.has(folder.id);
    const isSelected = selectedFolderId === folder.id;

    const subtreeIds = useMemo(
        () => getDescendantFolderIds(folder.id, allFolders),
        [folder.id, allFolders]
    );
    const countInSubtree = useMemo(
        () =>
            materials.filter(
                (m) => !m.archivedAt && subtreeIds.has(m.folderId)
            ).length,
        [materials, subtreeIds]
    );

    const FolderStatusIcon = isExpanded ? FolderOpenIcon : FolderIcon;

    return (
        <div>
            <div
                className={`flex items-center justify-between gap-1.5 rounded-md px-2 py-1.5 text-xs cursor-pointer transition-colors ${
                    isSelected
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-foreground/85 hover:bg-muted/60"
                }`}
                style={{ paddingLeft: `${depth * 14 + 8}px` }}
                onClick={() => onSelect(folder.id)}
            >
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    {hasChildren ? (
                        <button
                            type="button"
                            className="p-0.5 rounded hover:bg-muted text-muted-foreground"
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleExpand(folder.id);
                            }}
                        >
                            {isExpanded ? (
                                <ChevronDownIcon className="size-3.5" />
                            ) : (
                                <ChevronRightIcon className="size-3.5" />
                            )}
                        </button>
                    ) : (
                        <span className="w-4 shrink-0" />
                    )}

                    <FolderStatusIcon className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate">{folder.name}</span>
                </div>

                {countInSubtree > 0 && (
                    <span className="text-[11px] font-mono text-muted-foreground shrink-0">
                        {countInSubtree}
                    </span>
                )}
            </div>

            {hasChildren && isExpanded && (
                <div className="space-y-0.5">
                    {children.map((child) => (
                        <FolderTreeNode
                            key={child.id}
                            folder={child}
                            allFolders={allFolders}
                            materials={materials}
                            selectedFolderId={selectedFolderId}
                            expandedIds={expandedIds}
                            depth={depth + 1}
                            onSelect={onSelect}
                            onToggleExpand={onToggleExpand}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export function DossierTab() {
    const [library, setLibrary] = useState<DossierLibraryState>(() =>
        dossierApi.getLibrary()
    );
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(
        null
    );
    const [expandedFolderIds, setExpandedFolderIds] = useState<Set<string>>(
        () => new Set(library.folders.map((f) => f.id))
    );

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(
        () => library.materials[0]?.id ?? null
    );

    // Folder inline management state
    const [isAddingSubfolder, setIsAddingSubfolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");
    const [isRenamingFolder, setIsRenamingFolder] = useState(false);
    const [renameFolderValue, setRenameFolderValue] = useState("");

    // Active material editor state
    const activeMaterial = useMemo(
        () =>
            library.materials.find((m) => m.id === selectedMaterialId) ?? null,
        [library.materials, selectedMaterialId]
    );

    const [draftTitle, setDraftTitle] = useState(activeMaterial?.title ?? "");
    const [draftKind, setDraftKind] = useState<DossierMaterialKind>(
        activeMaterial?.kind ?? "experience"
    );
    const [draftFolderId, setDraftFolderId] = useState(
        activeMaterial?.folderId ?? library.folders[0]?.id ?? ""
    );
    const [draftText, setDraftText] = useState(activeMaterial?.text ?? "");
    const [isEditorDirty, setIsEditorDirty] = useState(false);

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const selectMaterial = (material: DossierMaterial | null) => {
        setSelectedMaterialId(material?.id ?? null);
        setDraftTitle(material?.title ?? "");
        setDraftKind(material?.kind ?? "experience");
        setDraftFolderId(material?.folderId ?? library.folders[0]?.id ?? "");
        setDraftText(material?.text ?? "");
        setIsEditorDirty(false);
    };

    const selectedFolder = useMemo(
        () =>
            selectedFolderId
                ? library.folders.find((f) => f.id === selectedFolderId) ?? null
                : null,
        [library.folders, selectedFolderId]
    );

    const visibleMaterials = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        const allowedFolders = selectedFolderId
            ? getDescendantFolderIds(selectedFolderId, library.folders)
            : null;

        return library.materials.filter((m) => {
            if (m.archivedAt) return false;
            if (allowedFolders && !allowedFolders.has(m.folderId)) {
                return false;
            }
            if (!q) return true;
            return (
                m.title.toLowerCase().includes(q) ||
                m.text.toLowerCase().includes(q) ||
                (m.legacyKey ?? "").toLowerCase().includes(q)
            );
        });
    }, [library.materials, library.folders, selectedFolderId, searchQuery]);

    const rootFolders = useMemo(
        () =>
            library.folders
                .filter((f) => f.parentId === null)
                .sort((a, b) => a.position - b.position),
        [library.folders]
    );

    const handleToggleExpand = (folderId: string) => {
        setExpandedFolderIds((prev) => {
            const next = new Set(prev);
            if (next.has(folderId)) {
                next.delete(folderId);
            } else {
                next.add(folderId);
            }
            return next;
        });
    };

    const handleCreateFolder = () => {
        try {
            const nextState = dossierApi.createFolder(
                newFolderName,
                selectedFolderId
            );
            setLibrary(nextState);
            if (selectedFolderId) {
                setExpandedFolderIds((prev) =>
                    new Set(prev).add(selectedFolderId)
                );
            }
            setNewFolderName("");
            setIsAddingSubfolder(false);
            toast.success("Folder created");
        } catch (err) {
            toast.error(
                err instanceof Error ? err.message : "Failed to create folder"
            );
        }
    };

    const handleRenameFolder = () => {
        if (!selectedFolderId) return;
        try {
            const nextState = dossierApi.renameFolder(
                selectedFolderId,
                renameFolderValue
            );
            setLibrary(nextState);
            setIsRenamingFolder(false);
            toast.success("Folder renamed");
        } catch (err) {
            toast.error(
                err instanceof Error ? err.message : "Failed to rename folder"
            );
        }
    };

    const handleMoveSelectedFolder = (newParentIdValue: string) => {
        if (!selectedFolderId) return;
        const targetParentId =
            newParentIdValue === "__ROOT__" ? null : newParentIdValue;
        try {
            const nextState = dossierApi.moveFolder(
                selectedFolderId,
                targetParentId
            );
            setLibrary(nextState);
            toast.success("Folder moved (all material UUIDs preserved)");
        } catch (err) {
            toast.error(
                err instanceof Error ? err.message : "Failed to move folder"
            );
        }
    };

    const handleDeleteSelectedFolder = () => {
        if (!selectedFolderId) return;
        try {
            const nextState = dossierApi.deleteFolder(selectedFolderId);
            setLibrary(nextState);
            setSelectedFolderId(null);
            toast.success("Folder removed");
        } catch (err) {
            toast.error(
                err instanceof Error ? err.message : "Failed to remove folder"
            );
        }
    };

    const handleCreateMaterial = () => {
        const targetFolderId =
            selectedFolderId ??
            library.folders[0]?.id ??
            "";
        const { state: nextState, created } = dossierApi.createMaterial({
            folderId: targetFolderId,
            title: "New Evidence Block",
            kind: "experience",
            text: "",
        });
        setLibrary(nextState);
        selectMaterial(created);
        toast.success("Created new evidence block");
    };

    const handleSaveMaterial = () => {
        if (!activeMaterial) return;
        const nextState = dossierApi.updateMaterial(activeMaterial.id, {
            title: draftTitle,
            kind: draftKind,
            folderId: draftFolderId,
            text: draftText,
        });
        setLibrary(nextState);
        setIsEditorDirty(false);
        toast.success("Evidence saved");
    };

    const handleDeleteMaterial = (materialId: string) => {
        const nextState = dossierApi.deleteMaterial(materialId);
        setLibrary(nextState);
        if (selectedMaterialId === materialId) {
            const nextFirst = nextState.materials[0] ?? null;
            selectMaterial(nextFirst);
        }
        toast.success("Evidence removed");
    };

    const handleUploadFiles = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const fileList = event.target.files;
        if (!fileList || fileList.length === 0) return;

        const targetFolderId =
            selectedFolderId ?? library.folders[0]?.id ?? "";

        try {
            const { state: nextState, importedCount } =
                await dossierApi.importFiles(
                    Array.from(fileList),
                    targetFolderId
                );
            setLibrary(nextState);
            setExpandedFolderIds(new Set(nextState.folders.map((f) => f.id)));
            if (!selectedMaterialId && nextState.materials.length > 0) {
                selectMaterial(nextState.materials[0]);
            }
            toast.success(
                `Imported ${importedCount} evidence block${importedCount === 1 ? "" : "s"}`
            );
        } catch (err) {
            toast.error(
                err instanceof Error ? err.message : "Failed to import files"
            );
        } finally {
            event.target.value = "";
        }
    };

    return (
        <div className="space-y-4">
            {/* Hidden file input for XML / Markdown / Text upload */}
            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".xml,.md,.txt,.json"
                className="hidden"
                onChange={handleUploadFiles}
            />

            {/* Top Bar: Search + Upload + New Evidence */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="relative flex-1 min-w-[240px] max-w-md">
                    <SearchIcon className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                        placeholder="Search evidence by title, content, or legacy path..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-9 text-sm"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <UploadIcon className="size-3.5 mr-1.5" />
                        Upload XML / Files
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        onClick={handleCreateMaterial}
                    >
                        <PlusIcon className="size-3.5 mr-1.5" />
                        New Evidence
                    </Button>
                </div>
            </div>

            {/* Split-Pane Explorer: Left Folder Tree + Right Material List & Editor */}
            <div className="grid gap-4 lg:grid-cols-12 items-start">
                {/* Left Column: Folder Hierarchy */}
                <Card className="lg:col-span-4 py-3">
                    <CardHeader className="pb-2 px-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Folders
                            </CardTitle>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs"
                                onClick={() => {
                                    setIsAddingSubfolder((prev) => !prev);
                                    setIsRenamingFolder(false);
                                }}
                            >
                                <FolderPlusIcon className="size-3.5 mr-1" />
                                New
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="px-2 space-y-2">
                        {/* Inline New Folder Input */}
                        {isAddingSubfolder && (
                            <div className="flex items-center gap-1.5 px-1 pb-1">
                                <Input
                                    value={newFolderName}
                                    onChange={(e) =>
                                        setNewFolderName(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            handleCreateFolder();
                                        }
                                    }}
                                    placeholder={
                                        selectedFolder
                                            ? `Subfolder in ${selectedFolder.name}...`
                                            : "New root folder..."
                                    }
                                    className="h-7 text-xs"
                                />
                                <Button
                                    type="button"
                                    size="icon"
                                    className="size-7 shrink-0"
                                    onClick={handleCreateFolder}
                                >
                                    <CheckIcon className="size-3.5" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="size-7 shrink-0"
                                    onClick={() => setIsAddingSubfolder(false)}
                                >
                                    <XIcon className="size-3.5" />
                                </Button>
                            </div>
                        )}

                        {/* All Evidence Root Item */}
                        <div
                            className={`flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs cursor-pointer transition-colors ${
                                selectedFolderId === null
                                    ? "bg-primary/10 text-primary font-medium"
                                    : "text-foreground/85 hover:bg-muted/60"
                            }`}
                            onClick={() => setSelectedFolderId(null)}
                        >
                            <span className="flex items-center gap-2">
                                <FolderIcon className="size-3.5 text-muted-foreground" />
                                All Evidence
                            </span>
                            <span className="text-[11px] font-mono text-muted-foreground">
                                {
                                    library.materials.filter(
                                        (m) => !m.archivedAt
                                    ).length
                                }
                            </span>
                        </div>

                        {/* Recursive Folder Tree */}
                        <div className="space-y-0.5 max-h-[380px] overflow-y-auto pr-1">
                            {rootFolders.map((root) => (
                                <FolderTreeNode
                                    key={root.id}
                                    folder={root}
                                    allFolders={library.folders}
                                    materials={library.materials}
                                    selectedFolderId={selectedFolderId}
                                    expandedIds={expandedFolderIds}
                                    depth={0}
                                    onSelect={(id) => {
                                        setSelectedFolderId(id);
                                        setIsRenamingFolder(false);
                                    }}
                                    onToggleExpand={handleToggleExpand}
                                />
                            ))}
                        </div>

                        {/* Selected Folder Refactoring Controls (Rename / Move / Delete) */}
                        {selectedFolder && (
                            <div className="pt-2 mt-2 border-t border-border px-1 space-y-2">
                                <div className="flex items-center justify-between gap-1">
                                    <span className="text-[11px] text-muted-foreground truncate">
                                        {getFolderPath(
                                            selectedFolder.id,
                                            library.folders
                                        )}
                                    </span>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="size-6"
                                            title="Rename folder"
                                            onClick={() => {
                                                setRenameFolderValue(
                                                    selectedFolder.name
                                                );
                                                setIsRenamingFolder(
                                                    (prev) => !prev
                                                );
                                            }}
                                        >
                                            <PencilIcon className="size-3" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="size-6 text-muted-foreground hover:text-destructive"
                                            title="Delete folder"
                                            onClick={handleDeleteSelectedFolder}
                                        >
                                            <Trash2Icon className="size-3" />
                                        </Button>
                                    </div>
                                </div>

                                {isRenamingFolder && (
                                    <div className="flex items-center gap-1.5">
                                        <Input
                                            value={renameFolderValue}
                                            onChange={(e) =>
                                                setRenameFolderValue(
                                                    e.target.value
                                                )
                                            }
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    handleRenameFolder();
                                                }
                                            }}
                                            className="h-7 text-xs"
                                        />
                                        <Button
                                            type="button"
                                            size="icon"
                                            className="size-7 shrink-0"
                                            onClick={handleRenameFolder}
                                        >
                                            <CheckIcon className="size-3.5" />
                                        </Button>
                                    </div>
                                )}

                                <div className="space-y-1">
                                    <Label className="text-[11px] text-muted-foreground">
                                        Parent Folder
                                    </Label>
                                    <select
                                        value={
                                            selectedFolder.parentId ??
                                            "__ROOT__"
                                        }
                                        onChange={(e) =>
                                            handleMoveSelectedFolder(
                                                e.target.value
                                            )
                                        }
                                        className="w-full h-7 rounded-md border border-border bg-background px-2 text-xs"
                                    >
                                        <option value="__ROOT__">
                                            (Root level)
                                        </option>
                                        {library.folders
                                            .filter(
                                                (f) =>
                                                    f.id !== selectedFolder.id
                                            )
                                            .map((f) => (
                                                <option key={f.id} value={f.id}>
                                                    {getFolderPath(
                                                        f.id,
                                                        library.folders
                                                    )}
                                                </option>
                                            ))}
                                    </select>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Right Column: Materials in Folder + Clean Editor */}
                <div className="lg:col-span-8 space-y-4">
                    {/* Materials List in Selected Folder */}
                    <Card className="py-3">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-sm font-medium">
                                        {selectedFolder
                                            ? getFolderPath(
                                                  selectedFolder.id,
                                                  library.folders
                                              )
                                            : "All Evidence Blocks"}
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        {visibleMaterials.length} block
                                        {visibleMaterials.length === 1
                                            ? ""
                                            : "s"}{" "}
                                        available
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent>
                            {visibleMaterials.length > 0 ? (
                                <div className="grid gap-2 sm:grid-cols-2 max-h-[220px] overflow-y-auto pr-1">
                                    {visibleMaterials.map((item) => {
                                        const isSelected =
                                            item.id === selectedMaterialId;
                                        const pathLabel = getFolderPath(
                                            item.folderId,
                                            library.folders
                                        );

                                        return (
                                            <div
                                                key={item.id}
                                                onClick={() =>
                                                    selectMaterial(item)
                                                }
                                                className={`rounded-lg border p-3 cursor-pointer transition-colors ${
                                                    isSelected
                                                        ? "border-primary bg-primary/5"
                                                        : "border-border hover:bg-muted/30"
                                                }`}
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="font-medium text-xs truncate">
                                                        {item.title}
                                                    </div>
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-[10px] px-1.5 py-0 h-4 shrink-0"
                                                    >
                                                        {
                                                            DOSSIER_KIND_LABELS[
                                                                item.kind
                                                            ]
                                                        }
                                                    </Badge>
                                                </div>
                                                <p className="text-[11px] text-muted-foreground truncate mt-1">
                                                    {pathLabel}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="py-6 text-center text-xs text-muted-foreground">
                                    No evidence blocks in this folder yet. Click{" "}
                                    <strong>New Evidence</strong> or upload{" "}
                                    <code>profile.xml</code>.
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Active Material Editor */}
                    {activeMaterial ? (
                        <Card className="py-4">
                            <CardHeader className="pb-3 border-b border-border">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <FileTextIcon className="size-4 text-muted-foreground" />
                                        <CardTitle className="text-sm font-medium">
                                            Edit Evidence Block
                                        </CardTitle>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
                                            onClick={() =>
                                                handleDeleteMaterial(
                                                    activeMaterial.id
                                                )
                                            }
                                        >
                                            <Trash2Icon className="size-3.5 mr-1" />
                                            Delete
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            className="h-7 text-xs"
                                            disabled={!isEditorDirty}
                                            onClick={handleSaveMaterial}
                                        >
                                            <SaveIcon className="size-3.5 mr-1" />
                                            Save Changes
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="pt-4 space-y-4">
                                <div className="grid gap-3 sm:grid-cols-3">
                                    <div className="space-y-1.5">
                                        <Label
                                            htmlFor="material-title"
                                            className="text-xs"
                                        >
                                            Title
                                        </Label>
                                        <Input
                                            id="material-title"
                                            value={draftTitle}
                                            onChange={(e) => {
                                                setDraftTitle(e.target.value);
                                                setIsEditorDirty(true);
                                            }}
                                            className="h-8 text-xs"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label
                                            htmlFor="material-kind"
                                            className="text-xs"
                                        >
                                            Kind
                                        </Label>
                                        <select
                                            id="material-kind"
                                            value={draftKind}
                                            onChange={(e) => {
                                                setDraftKind(
                                                    e.target
                                                        .value as DossierMaterialKind
                                                );
                                                setIsEditorDirty(true);
                                            }}
                                            className="w-full h-8 rounded-md border border-border bg-background px-2.5 text-xs"
                                        >
                                            {ALL_KINDS.map((k) => (
                                                <option key={k} value={k}>
                                                    {DOSSIER_KIND_LABELS[k]}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label
                                            htmlFor="material-folder"
                                            className="text-xs"
                                        >
                                            Folder
                                        </Label>
                                        <select
                                            id="material-folder"
                                            value={draftFolderId}
                                            onChange={(e) => {
                                                setDraftFolderId(
                                                    e.target.value
                                                );
                                                setIsEditorDirty(true);
                                            }}
                                            className="w-full h-8 rounded-md border border-border bg-background px-2.5 text-xs"
                                        >
                                            {library.folders.map((folder) => (
                                                <option
                                                    key={folder.id}
                                                    value={folder.id}
                                                >
                                                    {getFolderPath(
                                                        folder.id,
                                                        library.folders
                                                    )}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="material-text"
                                        className="text-xs"
                                    >
                                        Evidence Content
                                    </Label>
                                    <Textarea
                                        id="material-text"
                                        value={draftText}
                                        onChange={(e) => {
                                            setDraftText(e.target.value);
                                            setIsEditorDirty(true);
                                        }}
                                        placeholder="Write or paste reusable engineering context..."
                                        className="min-h-[200px] text-sm leading-relaxed"
                                    />
                                </div>

                                {/* Subtle muted metadata caption (UUID, revision, legacy key) */}
                                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-muted-foreground font-mono">
                                    <span>
                                        id: {activeMaterial.id} • rev v
                                        {activeMaterial.revision}
                                    </span>
                                    {activeMaterial.legacyKey && (
                                        <span>
                                            legacy: {activeMaterial.legacyKey}
                                        </span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="py-10 text-center text-xs text-muted-foreground">
                            Select an evidence block above to view or edit its
                            content.
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
