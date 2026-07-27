import * as React from "react";

import { cn } from "../../lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      data-slot="input"
      type={type}
      className={cn(
        "min-h-11 w-full rounded-[4px] border border-input bg-surface-raised px-3 py-2 text-base text-foreground tabular-nums outline-none transition-[border-color,box-shadow,background-color] placeholder:text-muted-foreground/70 focus-visible:border-lightning focus-visible:ring-[3px] focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/25",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
