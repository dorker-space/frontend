import { cn } from "@/lib/utils";

interface DorkerIconProps {
    className?: string;
    size?: number;
}

export function DorkerDocs({ className, size = 28 }: DorkerIconProps) {
    return (
        <img
            src="/dorker-icon.svg"
            alt="Dorker"
            width={size}
            height={size}
            className={cn("inline-block object-contain shrink-0", className)}
        />
    );
}
