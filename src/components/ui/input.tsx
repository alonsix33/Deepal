import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // MD3 Outlined Text Field style
          "flex h-14 w-full rounded-[var(--shape-sm)] border border-[var(--md-outline)]",
          "bg-transparent px-4 py-2 text-base text-[var(--md-on-surface)]",
          "placeholder:text-[var(--md-on-surface-variant)]",
          "transition-all duration-200",
          "focus-visible:outline-none focus-visible:border-2 focus-visible:border-[var(--md-primary)]",
          "focus-visible:shadow-[inset_0_0_0_0px_transparent]",
          "disabled:cursor-not-allowed disabled:opacity-38",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[var(--md-on-surface)]",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

// MD3 Filled text field variant
const FilledInput = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-14 w-full rounded-t-[var(--shape-sm)] rounded-b-none",
          "border-b-2 border-b-[var(--md-outline)]",
          "bg-[var(--md-surface-container)] px-4 py-2 pt-4",
          "text-base text-[var(--md-on-surface)]",
          "placeholder:text-[var(--md-on-surface-variant)]",
          "transition-all duration-200",
          "focus-visible:outline-none focus-visible:border-b-[var(--md-primary)]",
          "disabled:cursor-not-allowed disabled:opacity-38",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
FilledInput.displayName = "FilledInput";

export { Input, FilledInput };
