import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }) {
    return (
        <div
            className={cn(
                "animate-pulse rounded-full bg-(--surface-2)",
                className,
            )}
            {...props}
        />
    );
}
