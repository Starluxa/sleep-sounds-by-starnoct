import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

interface GlassButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof glassButtonVariants> {
  asChild?: boolean;
}

const glassButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border shadow-sm active:scale-95",
  {
    variants: {
      variant: {
        // UNIQUE BRIGHT COSMIC COLORS - Each with distinct, vivid gradient schemes
        cosmic1: "bg-gradient-to-br from-purple-500/90 via-purple-600/80 to-indigo-600/70 text-white border-purple-400/90 hover:from-purple-400/95 hover:via-purple-500/85 hover:to-indigo-500/75 shadow-purple-500/30",
        cosmic2: "bg-gradient-to-br from-blue-500/90 via-cyan-500/80 to-blue-600/70 text-white border-blue-400/90 hover:from-blue-400/95 hover:via-cyan-400/85 hover:to-blue-500/75 shadow-blue-500/30",
        cosmic3: "bg-gradient-to-br from-cyan-500/90 via-teal-500/80 to-cyan-600/70 text-white border-cyan-400/90 hover:from-cyan-400/95 hover:via-teal-400/85 hover:to-cyan-500/75 shadow-cyan-500/30",
        cosmic4: "bg-gradient-to-br from-indigo-500/90 via-purple-500/80 to-violet-600/70 text-white border-indigo-400/90 hover:from-indigo-400/95 hover:via-purple-400/85 hover:to-violet-500/75 shadow-indigo-500/30",
        cosmic5: "bg-gradient-to-br from-teal-500/90 via-green-500/80 to-cyan-600/70 text-white border-teal-400/90 hover:from-teal-400/95 hover:via-green-400/85 hover:to-cyan-500/75 shadow-teal-500/30",
        cosmic6: "bg-gradient-to-br from-violet-500/90 via-magenta-500/80 to-purple-600/70 text-white border-violet-400/90 hover:from-violet-400/95 hover:via-magenta-400/85 hover:to-purple-500/75 shadow-violet-500/30",
        cosmic7: "bg-gradient-to-br from-magenta-500/90 via-pink-500/80 to-violet-600/70 text-white border-magenta-400/90 hover:from-magenta-400/95 hover:via-pink-400/85 hover:to-violet-500/75 shadow-magenta-500/30",
        // Enhanced selected state with full color and glow
        selected: "bg-gradient-to-br from-blue-500/95 to-blue-600/90 text-white border-blue-400/95 shadow-xl shadow-blue-500/30 ring-2 ring-blue-400/40",
        // Enhanced glassmorphism with layered transparency
        glass: "bg-gradient-to-br from-white/10 via-white/20 to-white/10 text-white border border-white/30 hover:from-white/15 hover:via-white/25 hover:to-white/15",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-9 rounded-lg px-3",
        lg: "h-14 rounded-xl px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "glass",
      size: "lg",
    },
  }
);

const GlassButton = React.forwardRef<
  HTMLButtonElement,
  GlassButtonProps
>(
  (
    {
      children,
      className,
      variant,
      size,
      asChild = false,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(glassButtonVariants({ variant, size, className }))}
        {...props}
      >
        {children}
      </button>
    );
  }
);
GlassButton.displayName = "GlassButton";

export { GlassButton, glassButtonVariants };