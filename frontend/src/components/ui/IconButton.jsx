import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const IconButton = forwardRef(({ className, dot, ...props }, ref) => (
    <button
        ref={ref}
        className={cn(
            "relative inline-flex items-center justify-center h-11 w-11 rounded-full bg-(--surface) border border-(--border) text-(--ink) shadow-card transition-all hover:shadow-hover hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--accent)/30",
            className,
        )}
        {...props}
    >
        {props.children}
        {dot && (
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-(--danger) ring-2 ring-(--surface)" />
        )}
    </button>
));
IconButton.displayName = "IconButton";
