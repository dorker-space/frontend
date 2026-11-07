import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import {
    BriefcaseIcon,
    ExternalLinkIcon,
    FileTextIcon,
    GlobeIcon,
    GraduationCapIcon,
    LanguagesIcon,
    MailIcon,
    MapPinIcon,
    PencilIcon,
    PhoneIcon,
    ShieldCheckIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchCandidateProfile } from "@/lib/api";

function ProfileSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-8 w-28" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-24 w-full rounded-xl" />
                ))}
            </div>
        </div>
    );
}

export function ProfileDisplay() {
    const [, setSearchParams] = useSearchParams();
    const {
        data: profile,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["profile"],
        queryFn: fetchCandidateProfile,
    });

    if (isLoading) {
        return <ProfileSkeleton />;
    }

    if (isError || !profile) {
        return (
            <Card className="p-6 text-center">
                <p className="text-sm text-destructive mb-3">
                    Unable to load candidate profile.
                </p>
                <Button
                    size="sm"
                    onClick={() => setSearchParams({ update: "true" })}
                >
                    Create Profile
                </Button>
            </Card>
        );
    }

    const activeVisas: string[] = [];
    if (profile.requiresEuVisa) activeVisas.push("EU Sponsorship");
    if (profile.requiresUsVisa) activeVisas.push("US Sponsorship");
    if (profile.requiresUkVisa) activeVisas.push("UK Sponsorship");
    if (profile.requiresChVisa) activeVisas.push("Switzerland Sponsorship");
    if (profile.requiresCaVisa) activeVisas.push("Canada Sponsorship");
    if (profile.requiresOtherVisa && profile.otherVisaDetails) {
        activeVisas.push(profile.otherVisaDetails);
    }

    return (
        <div className="space-y-6">
            {/* Top Identity Banner */}
            <Card className="py-4">
                <CardHeader className="pb-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <CardTitle className="text-lg font-semibold">
                                {profile.firstName} {profile.lastName}
                            </CardTitle>
                            <CardDescription className="flex flex-wrap items-center gap-3 mt-1 text-xs">
                                <span className="inline-flex items-center gap-1">
                                    <MailIcon className="size-3.5" />
                                    {profile.email}
                                </span>
                                {profile.phone && (
                                    <span className="inline-flex items-center gap-1">
                                        <PhoneIcon className="size-3.5" />
                                        {profile.phone}
                                    </span>
                                )}
                                {profile.location && (
                                    <span className="inline-flex items-center gap-1">
                                        <MapPinIcon className="size-3.5" />
                                        {profile.location}
                                    </span>
                                )}
                            </CardDescription>
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSearchParams({ update: "true" })}
                        >
                            <PencilIcon className="size-3.5 mr-1.5" />
                            Edit Profile
                        </Button>
                    </div>
                </CardHeader>

                {profile.summary && (
                    <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {profile.summary}
                        </p>
                    </CardContent>
                )}
            </Card>

            {/* Skills & Links Grid */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="py-4">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                            Core Technical Skills
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-1.5">
                            {profile.skills.map((skill) => (
                                <Badge key={skill} variant="secondary">
                                    {skill}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="py-4">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                            <GlobeIcon className="size-4 text-muted-foreground" />
                            <CardTitle className="text-sm font-medium">
                                Professional Links & Mobility
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div className="flex flex-wrap gap-2">
                            {profile.githubUrl && (
                                <Button variant="outline" size="sm" asChild>
                                    <a
                                        href={profile.githubUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        GitHub
                                        <ExternalLinkIcon className="size-3 ml-1.5" />
                                    </a>
                                </Button>
                            )}
                            {profile.linkedinUrl && (
                                <Button variant="outline" size="sm" asChild>
                                    <a
                                        href={profile.linkedinUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        LinkedIn
                                        <ExternalLinkIcon className="size-3 ml-1.5" />
                                    </a>
                                </Button>
                            )}
                            {profile.portfolioUrl && (
                                <Button variant="outline" size="sm" asChild>
                                    <a
                                        href={profile.portfolioUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Portfolio
                                        <ExternalLinkIcon className="size-3 ml-1.5" />
                                    </a>
                                </Button>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-muted-foreground">
                            <ShieldCheckIcon className="size-3.5 text-emerald-600" />
                            <span>
                                {profile.willingToRelocate
                                    ? "Open to relocation"
                                    : "Prefers current location / remote"}
                            </span>
                            {activeVisas.map((visa) => (
                                <Badge
                                    key={visa}
                                    variant="outline"
                                    className="text-[11px]"
                                >
                                    Requires {visa}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Experience */}
            <Card className="py-4">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <BriefcaseIcon className="size-4 text-muted-foreground" />
                        <CardTitle className="text-sm font-medium">
                            Engineering Experience
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {profile.experience.map((exp, index) => (
                        <div
                            key={`${exp.company}-${index}`}
                            className="rounded-lg border border-border p-3.5 space-y-1.5"
                        >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="font-medium text-sm">
                                    {exp.title}{" "}
                                    <span className="text-muted-foreground font-normal">
                                        at {exp.company}
                                    </span>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                    {exp.startDate} –{" "}
                                    {exp.current ? "Present" : exp.endDate}
                                </Badge>
                            </div>
                            {exp.description && (
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    {exp.description}
                                </p>
                            )}
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Education & Languages */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="py-4">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <GraduationCapIcon className="size-4 text-muted-foreground" />
                            <CardTitle className="text-sm font-medium">
                                Education
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {profile.education.map((edu, index) => (
                            <div
                                key={`${edu.institution}-${index}`}
                                className="rounded-lg border border-border p-3 space-y-1"
                            >
                                <div className="text-sm font-medium">
                                    {edu.degree}
                                    {edu.field ? ` — ${edu.field}` : ""}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {edu.institution} • {edu.startDate} –{" "}
                                    {edu.endDate}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="py-4">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <LanguagesIcon className="size-4 text-muted-foreground" />
                            <CardTitle className="text-sm font-medium">
                                Languages & Resume
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                            {profile.languages.map((lang) => (
                                <Badge key={lang.language} variant="outline">
                                    {lang.language} ({lang.proficiency})
                                </Badge>
                            ))}
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-border text-xs text-muted-foreground">
                            <FileTextIcon className="size-3.5" />
                            <span>
                                {profile.resumeUploaded
                                    ? `Primary resume active (${profile.resumeUrl || "resume.pdf"})`
                                    : "No resume file uploaded"}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
