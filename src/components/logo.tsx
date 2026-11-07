import { cn } from "@/lib/utils";
import { DorkerDocs } from "./logo-small";

export function Dorker({
    className,
    showDocs = true,
    docsSize = 28,
}: {
    className?: string;
    showDocs?: boolean;
    docsSize?: number;
}) {
    return (
        <div
            className={cn(
                "flex flex-row items-center gap-2 text-xl font-bold text-foreground tracking-tight",
                className
            )}
        >
            {showDocs && <DorkerDocs size={docsSize} />}
            <span className="leading-none">Dorker</span>
        </div>
    );
}

export function DorkerFullLogo({
    className,
    height = 30,
}: {
    className?: string;
    height?: number;
}) {
    return (
        <img
            src="/dorker-logo-integrated.svg"
            alt="Dorker"
            style={{ height: `${height}px` }}
            className={cn("w-auto object-contain block dark:invert-[0.1]", className)}
        />
    );
}
