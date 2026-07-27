import * as React from "react";

import { cn } from "../../lib/utils";

function Textarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "min-h-28 w-full resize-y rounded-[4px] border border-input bg-surface-raised px-3 py-2 text-base leading-6 text-foreground outline-none transition-[border-color,box-shadow,background-color] placeholder:text-muted-foreground/70 focus-visible:border-lightning focus-visible:ring-[3px] focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/25",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
