import { useEffect, useRef, useState } from "react";
import {
    AlertCircleIcon,
    CheckIcon,
    CopyIcon,
    FileTextIcon,
    HelpCircleIcon,
    PlusIcon,
    SaveIcon,
    SparklesIcon,
    Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";
import {
    applicationsApi,
    mapApiApplicationQuestions,
    mapWorkspaceQuestionsToApi,
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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    loadPersistedDraftState,
    savePersistedDraftState,
} from "@/components/workspace/draft-storage";
import {
    ApiApplicationResponse,
    ApiGenerationInput,
    GenerationRequestPayload,
    Job,
    PersistedDraftState,
    WorkspaceMaterial,
    WorkspaceQuestion,
} from "@/lib/types";

interface DraftTabProps {
    job: Job;
    matchId: string;
    materials: WorkspaceMaterial[];
    latestApplication?: ApiApplicationResponse | null;
    onGenerate?: (payload: GenerationRequestPayload) => void;
}

interface QuestionInputsBuilderProps {
    inputs: string[];
    hasValidationError: boolean;
    firstInputRef: React.RefObject<HTMLInputElement | null>;
    onChangeInput: (index: number, value: string) => void;
    onAddRow: () => void;
    onRemoveRow: (index: number) => void;
}

function QuestionInputsBuilder({
    inputs,
    hasValidationError,
    firstInputRef,
    onChangeInput,
    onAddRow,
    onRemoveRow,
}: QuestionInputsBuilderProps) {
    return (
        <div className="mt-4 pt-4 border-t border-border space-y-3">
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="text-xs font-semibold text-foreground">
                        Application Questions
                    </h4>
                    <p className="text-xs text-muted-foreground">
                        Add the screening questions from the ATS form (saved
                        automatically to local storage)
                    </p>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 px-2.5 text-xs"
                    onClick={onAddRow}
                >
                    <PlusIcon className="size-3.5 mr-1" />
                    Add Question
                </Button>
            </div>

            <div className="space-y-2">
                {inputs.map((questionValue, index) => {
                    const isFirst = index === 0;
                    const isEmptyError =
                        hasValidationError && isFirst && !questionValue.trim();
                    const inputBorderClass = isEmptyError
                        ? "border-destructive focus-visible:ring-destructive"
                        : "";

                    return (
                        <div key={index} className="flex items-center gap-2">
                            <span className="text-xs font-mono text-muted-foreground w-5 text-right shrink-0">
                                {index + 1}.
                            </span>
                            <Input
                                ref={isFirst ? firstInputRef : undefined}
                                value={questionValue}
                                onChange={(e) =>
                                    onChangeInput(index, e.target.value)
                                }
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        onAddRow();
                                    }
                                }}
                                placeholder={`Enter screening question #${index + 1}...`}
                                className={`h-9 text-sm ${inputBorderClass}`}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-9 shrink-0 text-muted-foreground hover:text-destructive"
                                onClick={() => onRemoveRow(index)}
                                title="Remove question"
                            >
                                <Trash2Icon className="size-4" />
                            </Button>
                        </div>
                    );
                })}
            </div>

            {hasValidationError && (
                <div className="flex items-center gap-1.5 text-xs text-destructive pt-0.5">
                    <AlertCircleIcon className="size-3.5 shrink-0" />
                    <span>
                        Enter at least one question below, or uncheck{" "}
                        <strong>Questions</strong> before generating.
                    </span>
                </div>
            )}
        </div>
    );
}

interface GeneratedCoverLetterCardProps {
    coverLetter: string;
    copiedId: string | null;
    isDirty: boolean;
    isSaving: boolean;
    onChange: (value: string) => void;
    onSave: () => void;
    onCopy: (text: string, id: string) => void;
}

function GeneratedCoverLetterCard({
    coverLetter,
    copiedId,
    isDirty,
    isSaving,
    onChange,
    onSave,
    onCopy,
}: GeneratedCoverLetterCardProps) {
    const isCopied = copiedId === "cover-letter";
    const CopyStatusIcon = isCopied ? CheckIcon : CopyIcon;

    return (
        <Card className="py-4">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <FileTextIcon className="size-4 text-muted-foreground" />
                        <div>
                            <CardTitle className="text-sm font-medium">
                                Tailored Cover Letter
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Editable draft grounded on your confirmed
                                profile materials
                            </CardDescription>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                        {isDirty && (
                            <Button
                                type="button"
                                size="sm"
                                className="h-7 text-xs"
                                disabled={isSaving}
                                onClick={onSave}
                            >
                                <SaveIcon className="size-3.5 mr-1" />
                                {isSaving ? "Saving..." : "Save Edits"}
                            </Button>
                        )}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => onCopy(coverLetter, "cover-letter")}
                        >
                            <CopyStatusIcon className="size-3.5 mr-1" />
                            Copy Letter
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Textarea
                    value={coverLetter}
                    onChange={(e) => onChange(e.target.value)}
                    className="min-h-[240px] text-sm leading-relaxed font-sans"
                />
            </CardContent>
        </Card>
    );
}

interface GeneratedQuestionsCardProps {
    questions: WorkspaceQuestion[];
    copiedId: string | null;
    isDirty: boolean;
    isSaving: boolean;
    onChangeAnswer: (id: string, answer: string) => void;
    onSave: () => void;
    onCopy: (text: string, id: string) => void;
}

function GeneratedQuestionsCard({
    questions,
    copiedId,
    isDirty,
    isSaving,
    onChangeAnswer,
    onSave,
    onCopy,
}: GeneratedQuestionsCardProps) {
    return (
        <Card className="py-4">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <HelpCircleIcon className="size-4 text-muted-foreground" />
                        <div>
                            <CardTitle className="text-sm font-medium">
                                Screening Questions ({questions.length})
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Generated responses ready for ATS submission
                            </CardDescription>
                        </div>
                    </div>

                    {isDirty && (
                        <Button
                            type="button"
                            size="sm"
                            className="h-7 text-xs"
                            disabled={isSaving}
                            onClick={onSave}
                        >
                            <SaveIcon className="size-3.5 mr-1" />
                            {isSaving ? "Saving..." : "Save Edits"}
                        </Button>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                {questions.map((item) => {
                    const isCopied = copiedId === item.id;
                    const CopyStatusIcon = isCopied ? CheckIcon : CopyIcon;

                    return (
                        <div
                            key={item.id}
                            className="rounded-lg border border-border bg-muted/20 p-3.5 space-y-2"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <h4 className="text-xs font-semibold text-foreground">
                                    {item.question}
                                </h4>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs shrink-0"
                                    onClick={() => onCopy(item.answer, item.id)}
                                >
                                    <CopyStatusIcon className="size-3 mr-1" />
                                    Copy
                                </Button>
                            </div>
                            <Textarea
                                value={item.answer}
                                onChange={(e) =>
                                    onChangeAnswer(item.id, e.target.value)
                                }
                                className="min-h-[84px] text-sm leading-relaxed bg-background"
                            />
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}

export function DraftTab({
    job,
    matchId,
    materials,
    latestApplication = null,
    onGenerate,
}: DraftTabProps) {
    const [draftState, setDraftState] = useState<PersistedDraftState>(() =>
        loadPersistedDraftState(job.id, job.questions, latestApplication)
    );
    const [hasValidationError, setHasValidationError] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSavingPatch, setIsSavingPatch] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const firstQuestionInputRef = useRef<HTMLInputElement | null>(null);

    // Reload persisted state whenever the active job or latest backend application changes
    useEffect(() => {
        setDraftState(
            loadPersistedDraftState(job.id, job.questions, latestApplication)
        );
        setHasValidationError(false);
        setIsDirty(false);
    }, [job.id, job.questions, latestApplication]);

    // Persist state changes to localStorage
    useEffect(() => {
        savePersistedDraftState(job.id, draftState);
    }, [job.id, draftState]);

    const handleToggleCoverLetter = (checked: boolean) => {
        setDraftState((prev) => ({
            ...prev,
            coverLetterRequired: checked,
        }));
    };

    const handleToggleQuestions = (checked: boolean) => {
        setHasValidationError(false);
        setDraftState((prev) => ({
            ...prev,
            questionsRequired: checked,
            questionInputs:
                prev.questionInputs.length > 0 ? prev.questionInputs : [""],
        }));
    };

    const handleChangeQuestionInput = (index: number, value: string) => {
        if (value.trim().length > 0) {
            setHasValidationError(false);
        }
        setDraftState((prev) => {
            const nextInputs = [...prev.questionInputs];
            nextInputs[index] = value;
            return {
                ...prev,
                questionInputs: nextInputs,
            };
        });
    };

    const handleAddQuestionRow = () => {
        setDraftState((prev) => ({
            ...prev,
            questionInputs: [...prev.questionInputs, ""],
        }));
    };

    const handleRemoveQuestionRow = (index: number) => {
        setDraftState((prev) => {
            if (prev.questionInputs.length <= 1) {
                return {
                    ...prev,
                    questionInputs: [""],
                };
            }
            return {
                ...prev,
                questionInputs: prev.questionInputs.filter(
                    (_, idx) => idx !== index
                ),
            };
        });
    };

    const handleGenerate = async () => {
        const {
            applicationId,
            coverLetterRequired,
            questionsRequired,
            questionInputs,
        } = draftState;

        if (!coverLetterRequired && !questionsRequired) {
            toast.error("Select Cover Letter, Questions, or both to generate");
            return;
        }

        const nonEmptyQuestions = questionInputs
            .map((q) => q.trim())
            .filter((q) => q.length > 0);

        if (questionsRequired && nonEmptyQuestions.length === 0) {
            setHasValidationError(true);
            toast.error("Enter at least one question or uncheck Questions");
            firstQuestionInputRef.current?.focus();
            return;
        }

        setHasValidationError(false);
        setIsGenerating(true);

        const generationInput: ApiGenerationInput = {
            generate_cover_letter: coverLetterRequired,
            generate_answers: questionsRequired,
            questions: questionsRequired ? nonEmptyQuestions : [],
        };

        const payload: GenerationRequestPayload = {
            matchId,
            coverLetterRequired,
            questionsRequired,
            questions: generationInput.questions,
        };

        try {
            const response =
                applicationId !== null
                    ? await applicationsApi.regenerate(
                          applicationId,
                          generationInput
                      )
                    : await applicationsApi.create(matchId, generationInput);

            setDraftState((prev) => ({
                ...prev,
                applicationId: response.id,
                updatedAt: response.updated_at ?? response.created_at,
                generatedCoverLetter: response.cover_letter,
                generatedQuestions: mapApiApplicationQuestions(
                    response.questions,
                    response.id
                ),
            }));
            setIsDirty(false);

            if (onGenerate) {
                onGenerate(payload);
            }

            toast.success("Application draft generated");
        } catch (err) {
            toast.error(
                err instanceof Error
                    ? err.message
                    : "Application generation failed"
            );
        } finally {
            setIsGenerating(false);
        }
    };

    const handleUpdateCoverLetter = (value: string) => {
        setIsDirty(true);
        setDraftState((prev) => ({
            ...prev,
            generatedCoverLetter: value,
        }));
    };

    const handleUpdateQuestionAnswer = (questionId: string, answer: string) => {
        setIsDirty(true);
        setDraftState((prev) => ({
            ...prev,
            generatedQuestions: prev.generatedQuestions.map((q) =>
                q.id === questionId ? { ...q, answer } : q
            ),
        }));
    };

    const handleSaveEdits = async () => {
        if (draftState.applicationId === null) {
            toast.success("Saved to local storage");
            setIsDirty(false);
            return;
        }

        setIsSavingPatch(true);
        try {
            const updated = await applicationsApi.update(
                draftState.applicationId,
                {
                    cover_letter: draftState.generatedCoverLetter,
                    questions: mapWorkspaceQuestionsToApi(
                        draftState.generatedQuestions
                    ),
                }
            );
            setDraftState((prev) => ({
                ...prev,
                updatedAt: updated.updated_at ?? updated.created_at,
                generatedCoverLetter: updated.cover_letter,
                generatedQuestions: mapApiApplicationQuestions(
                    updated.questions,
                    updated.id
                ),
            }));
            setIsDirty(false);
            toast.success("Application draft saved");
        } catch (err) {
            toast.error(
                err instanceof Error
                    ? err.message
                    : "Failed to save draft changes"
            );
        } finally {
            setIsSavingPatch(false);
        }
    };

    const handleCopy = async (text: string, id: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedId(id);
        toast.success("Copied to clipboard");
        setTimeout(() => setCopiedId(null), 1800);
    };

    const isNothingSelected =
        !draftState.coverLetterRequired && !draftState.questionsRequired;

    return (
        <div className="space-y-4">
            {/* Step 1: Generation Configuration Card */}
            <Card className="py-4">
                <CardContent className="space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        {/* Left: Checkboxes */}
                        <div className="flex flex-wrap items-center gap-6">
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="draft-cover-letter"
                                    disabled={isGenerating}
                                    checked={draftState.coverLetterRequired}
                                    onCheckedChange={(checked) =>
                                        handleToggleCoverLetter(
                                            checked === true
                                        )
                                    }
                                />
                                <Label
                                    htmlFor="draft-cover-letter"
                                    className="text-sm font-medium cursor-pointer"
                                >
                                    Cover Letter
                                </Label>
                            </div>

                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="draft-questions"
                                    disabled={isGenerating}
                                    checked={draftState.questionsRequired}
                                    onCheckedChange={(checked) =>
                                        handleToggleQuestions(checked === true)
                                    }
                                />
                                <Label
                                    htmlFor="draft-questions"
                                    className="text-sm font-medium cursor-pointer"
                                >
                                    Questions
                                </Label>
                            </div>

                            {materials.length > 0 && (
                                <Badge
                                    variant="secondary"
                                    className="text-xs font-normal"
                                >
                                    <SparklesIcon className="size-3 mr-1" />
                                    {materials.length} Evidence Blocks Active
                                </Badge>
                            )}
                        </div>

                        {/* Right: Generate Action */}
                        <Button
                            type="button"
                            size="sm"
                            disabled={isNothingSelected || isGenerating}
                            onClick={handleGenerate}
                        >
                            <SparklesIcon className="size-3.5 mr-1.5" />
                            {isGenerating
                                ? "Generating..."
                                : draftState.applicationId !== null
                                  ? "Regenerate"
                                  : "Generate"}
                        </Button>
                    </div>

                    {/* Expandable Questions Input Form */}
                    {draftState.questionsRequired && (
                        <QuestionInputsBuilder
                            inputs={draftState.questionInputs}
                            hasValidationError={hasValidationError}
                            firstInputRef={firstQuestionInputRef}
                            onChangeInput={handleChangeQuestionInput}
                            onAddRow={handleAddQuestionRow}
                            onRemoveRow={handleRemoveQuestionRow}
                        />
                    )}
                </CardContent>
            </Card>

            {/* Step 2: Conditionally Rendered Generated Outputs */}
            {draftState.generatedCoverLetter !== null && (
                <GeneratedCoverLetterCard
                    coverLetter={draftState.generatedCoverLetter}
                    copiedId={copiedId}
                    isDirty={isDirty}
                    isSaving={isSavingPatch}
                    onChange={handleUpdateCoverLetter}
                    onSave={handleSaveEdits}
                    onCopy={handleCopy}
                />
            )}

            {draftState.generatedQuestions.length > 0 && (
                <GeneratedQuestionsCard
                    questions={draftState.generatedQuestions}
                    copiedId={copiedId}
                    isDirty={isDirty}
                    isSaving={isSavingPatch}
                    onChangeAnswer={handleUpdateQuestionAnswer}
                    onSave={handleSaveEdits}
                    onCopy={handleCopy}
                />
            )}
        </div>
    );
}
