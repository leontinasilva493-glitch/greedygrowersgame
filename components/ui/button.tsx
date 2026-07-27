import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[4px] border border-transparent px-4 text-base font-semibold tracking-[0.01em] transition-[background-color,border-color,color,box-shadow,translate] duration-150 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[inset_0_1px_0_rgb(255_255_255_/_0.24)] hover:bg-lightning/90 active:translate-y-px",
        growth:
          "bg-grow text-ink shadow-[inset_0_1px_0_rgb(255_255_255_/_0.2)] hover:bg-grow/90 active:translate-y-px",
        destructive:
          "bg-destructive text-background hover:bg-destructive/90 active:translate-y-px",
        outline:
          "border-survey-line bg-surface text-foreground hover:border-lightning/70 hover:bg-surface-raised",
        secondary:
          "border-survey-line/80 bg-surface-raised text-foreground hover:border-fog/60",
        ghost: "text-foreground hover:bg-surface-raised hover:text-lightning",
        link: "min-h-0 border-0 px-0 text-lightning underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11",
        sm: "h-11 px-3 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "size-11 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Component = asChild ? Slot : "button";

  return (
    <Component
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
export type { ButtonProps };
