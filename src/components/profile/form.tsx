import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { PlusIcon, TrashIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
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
import { fetchCandidateProfile, saveCandidateProfile } from "@/lib/api";
import { ProfileData, ProfileExperience } from "@/lib/types";

export function ProfileForm() {
    const [, setSearchParams] = useSearchParams();
    const queryClient = useQueryClient();

    const { data: initialProfile } = useQuery({
        queryKey: ["profile"],
        queryFn: fetchCandidateProfile,
    });

    const [formState, setFormState] = useState<ProfileData | null>(null);
    const [skillDraft, setSkillDraft] = useState("");

    useEffect(() => {
        if (initialProfile && !formState) {
            setFormState(initialProfile);
        }
    }, [initialProfile, formState]);

    const saveMutation = useMutation({
        mutationFn: saveCandidateProfile,
        onSuccess: (saved) => {
            queryClient.setQueryData(["profile"], saved);
            toast.success("Profile saved");
            setSearchParams({});
        },
        onError: () => {
            toast.error("Failed to save profile");
        },
    });

    if (!formState) {
        return null;
    }

    const updateField = <K extends keyof ProfileData>(
        key: K,
        value: ProfileData[K]
    ) => {
        setFormState((prev) => (prev ? { ...prev, [key]: value } : prev));
    };

    const handleAddSkill = () => {
        const trimmed = skillDraft.trim();
        if (!trimmed) return;
        if (!formState.skills.includes(trimmed)) {
            updateField("skills", [...formState.skills, trimmed]);
        }
        setSkillDraft("");
    };

    const handleRemoveSkill = (skillToRemove: string) => {
        updateField(
            "skills",
            formState.skills.filter((skill) => skill !== skillToRemove)
        );
    };

    const handleUpdateExperience = (
        index: number,
        patch: Partial<ProfileExperience>
    ) => {
        const updated = formState.experience.map((item, idx) =>
            idx === index ? { ...item, ...patch } : item
        );
        updateField("experience", updated);
    };

    const handleAddExperience = () => {
        updateField("experience", [
            ...formState.experience,
            {
                title: "",
                company: "",
                location: "Remote",
                startDate: "2025-01",
                current: true,
                description: "",
            },
        ]);
    };

    const handleRemoveExperience = (index: number) => {
        updateField(
            "experience",
            formState.experience.filter((_, idx) => idx !== index)
        );
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        saveMutation.mutate(formState);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <Card className="py-4">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">
                        Personal Information
                    </CardTitle>
                    <CardDescription className="text-xs">
                        Core identity and contact details used for application drafts
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                            id="firstName"
                            value={formState.firstName}
                            onChange={(e) =>
                                updateField("firstName", e.target.value)
                            }
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                            id="lastName"
                            value={formState.lastName}
                            onChange={(e) =>
                                updateField("lastName", e.target.value)
                            }
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={formState.email}
                            onChange={(e) =>
                                updateField("email", e.target.value)
                            }
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                            id="phone"
                            value={formState.phone || ""}
                            onChange={(e) =>
                                updateField("phone", e.target.value)
                            }
                        />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                            id="location"
                            value={formState.location || ""}
                            onChange={(e) =>
                                updateField("location", e.target.value)
                            }
                        />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                        <Label htmlFor="summary">Executive Summary</Label>
                        <Textarea
                            id="summary"
                            rows={3}
                            value={formState.summary || ""}
                            onChange={(e) =>
                                updateField("summary", e.target.value)
                            }
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Skills */}
            <Card className="py-4">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">
                        Technical Skills
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Add a skill (e.g. Rust, Kubernetes, pgvector)..."
                            value={skillDraft}
                            onChange={(e) => setSkillDraft(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleAddSkill();
                                }
                            }}
                        />
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleAddSkill}
                        >
                            Add
                        </Button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {formState.skills.map((skill) => (
                            <Badge
                                key={skill}
                                variant="secondary"
                                className="gap-1 pr-1"
                            >
                                {skill}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveSkill(skill)}
                                    className="hover:text-destructive"
                                >
                                    <XIcon className="size-3" />
                                </button>
                            </Badge>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Experience */}
            <Card className="py-4">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">
                            Experience
                        </CardTitle>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleAddExperience}
                        >
                            <PlusIcon className="size-3.5 mr-1.5" />
                            Add Role
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {formState.experience.map((exp, index) => (
                        <div
                            key={index}
                            className="rounded-lg border border-border p-3.5 space-y-3"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-muted-foreground">
                                    Role #{index + 1}
                                </span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="size-7 text-muted-foreground hover:text-destructive"
                                    onClick={() =>
                                        handleRemoveExperience(index)
                                    }
                                >
                                    <TrashIcon className="size-3.5" />
                                </Button>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <Input
                                    placeholder="Job Title"
                                    value={exp.title}
                                    onChange={(e) =>
                                        handleUpdateExperience(index, {
                                            title: e.target.value,
                                        })
                                    }
                                />
                                <Input
                                    placeholder="Company"
                                    value={exp.company}
                                    onChange={(e) =>
                                        handleUpdateExperience(index, {
                                            company: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <Textarea
                                rows={2}
                                placeholder="Key achievements & technical scope..."
                                value={exp.description || ""}
                                onChange={(e) =>
                                    handleUpdateExperience(index, {
                                        description: e.target.value,
                                    })
                                }
                            />
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Links & Mobility */}
            <Card className="py-4">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">
                        Links & Work Authorization
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="githubUrl">GitHub URL</Label>
                            <Input
                                id="githubUrl"
                                value={formState.githubUrl || ""}
                                onChange={(e) =>
                                    updateField("githubUrl", e.target.value)
                                }
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                            <Input
                                id="linkedinUrl"
                                value={formState.linkedinUrl || ""}
                                onChange={(e) =>
                                    updateField("linkedinUrl", e.target.value)
                                }
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="portfolioUrl">Portfolio URL</Label>
                            <Input
                                id="portfolioUrl"
                                value={formState.portfolioUrl || ""}
                                onChange={(e) =>
                                    updateField("portfolioUrl", e.target.value)
                                }
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-6 pt-2">
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="willingToRelocate"
                                checked={Boolean(formState.willingToRelocate)}
                                onCheckedChange={(checked) =>
                                    updateField(
                                        "willingToRelocate",
                                        checked === true
                                    )
                                }
                            />
                            <Label
                                htmlFor="willingToRelocate"
                                className="text-xs font-normal cursor-pointer"
                            >
                                Willing to relocate
                            </Label>
                        </div>

                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="requiresEuVisa"
                                checked={Boolean(formState.requiresEuVisa)}
                                onCheckedChange={(checked) =>
                                    updateField(
                                        "requiresEuVisa",
                                        checked === true
                                    )
                                }
                            />
                            <Label
                                htmlFor="requiresEuVisa"
                                className="text-xs font-normal cursor-pointer"
                            >
                                Requires EU Visa Sponsorship
                            </Label>
                        </div>

                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="requiresUsVisa"
                                checked={Boolean(formState.requiresUsVisa)}
                                onCheckedChange={(checked) =>
                                    updateField(
                                        "requiresUsVisa",
                                        checked === true
                                    )
                                }
                            />
                            <Label
                                htmlFor="requiresUsVisa"
                                className="text-xs font-normal cursor-pointer"
                            >
                                Requires US Visa Sponsorship
                            </Label>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSearchParams({})}
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? "Saving..." : "Save Profile"}
                </Button>
            </div>
        </form>
    );
}
