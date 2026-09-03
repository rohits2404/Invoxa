import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef(
    ({ className, type = "text", ...props }, ref) => (
        <input
            ref={ref}
            type={type}
            className={cn(
                "h-10 w-full rounded-full border border-(--border) bg-(--surface) px-4 text-sm text-(--ink) placeholder:text-(--ink-muted) outline-none transition-colors focus:border-(--accent)/50 focus:ring-2 focus:ring-(--accent)/15 disabled:opacity-50",
                className,
            )}
            {...props}
        />
    ),
);
Input.displayName = "Input";

export const SearchInput = forwardRef(
    ({ className, leftIcon, rightSlot, ...props }, ref) => (
        <div
            className={cn(
                "group flex items-center gap-3 h-11 rounded-full bg-(--surface) border border-(--border) pl-5 pr-1.5 shadow-card transition-shadow hover:shadow-hover focus-within:ring-2 focus-within:ring-(--accent)/20",
                className,
            )}
        >
            {leftIcon && (
                <span className="text-(--ink-muted) shrink-0">{leftIcon}</span>
            )}
            <input
                ref={ref}
                type="text"
                className="flex-1 bg-transparent text-sm text-(--ink) placeholder:text-(--ink-muted) outline-none"
                {...props}
            />
            {rightSlot}
        </div>
    ),
);
SearchInput.displayName = "SearchInput";
