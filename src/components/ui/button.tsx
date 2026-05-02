import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--md-surface)]",
    "disabled:pointer-events-none disabled:opacity-38",
    "[&_svg]:pointer-events-none [&_svg]:size-[1.125rem] [&_svg]:shrink-0",
    "relative overflow-hidden select-none",
    // State layer
    "before:absolute before:inset-0 before:rounded-[inherit] before:bg-current before:opacity-0 before:transition-opacity",
    "hover:before:opacity-[0.08] active:before:opacity-[0.12]",
  ].join(" "),
  {
    variants: {
      variant: {
        // MD3 Filled — highest emphasis
        filled:
          "bg-[var(--md-primary)] text-[var(--md-on-primary)] rounded-full shadow-sm hover:shadow-md",
        // MD3 Filled Tonal — medium-high emphasis
        tonal:
          "bg-[var(--md-secondary-container)] text-[var(--md-on-secondary-container)] rounded-full",
        // MD3 Elevated — medium emphasis with shadow
        elevated:
          "bg-[var(--md-surface-container-low)] text-[var(--md-primary)] rounded-full shadow-sm hover:shadow-md",
        // MD3 Outlined — medium emphasis
        outlined:
          "border border-[var(--md-outline)] bg-transparent text-[var(--md-primary)] rounded-full hover:bg-[var(--md-primary)]/8",
        // MD3 Text — low emphasis
        ghost:
          "bg-transparent text-[var(--md-primary)] rounded-full",
        // Destructive
        destructive:
          "bg-[var(--md-error)] text-[var(--md-on-error)] rounded-full shadow-sm",
        // Aliases for backward compatibility
        default:
          "bg-[var(--md-primary)] text-[var(--md-on-primary)] rounded-full shadow-sm hover:shadow-md",
        secondary:
          "bg-[var(--md-secondary-container)] text-[var(--md-on-secondary-container)] rounded-full",
        link:
          "bg-transparent text-[var(--md-primary)] underline-offset-4 hover:underline rounded-sm",
        // Deepal brand shortcuts
        cyan:
          "bg-[var(--md-primary)] text-[var(--md-on-primary)] rounded-full shadow-sm hover:shadow-md",
        blue:
          "bg-[var(--md-secondary)] text-[var(--md-on-secondary)] rounded-full shadow-sm",
        outline:
          "border border-[var(--md-outline)] bg-transparent text-[var(--md-primary)] rounded-full",
      },
      size: {
        default: "h-10 px-6 text-sm type-label-lg",
        sm: "h-8 px-4 text-xs type-label-lg rounded-full",
        lg: "h-12 px-8 text-base type-label-lg",
        xl: "h-14 px-10 text-base type-label-lg",
        icon: "h-10 w-10 rounded-full p-0",
      },
    },
    defaultVariants: {
      variant: "filled",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
