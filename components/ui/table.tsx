import * as React from "react";

import { cn } from "../../lib/utils";

type TableProps = React.ComponentProps<"table"> & {
  containerClassName?: string;
};

function Table({
  className,
  containerClassName,
  "aria-label": ariaLabel,
  ...props
}: TableProps) {
  return (
    <div
      data-slot="table-container"
      role="region"
      aria-label={ariaLabel ?? "Data table"}
      tabIndex={0}
      className={cn(
        "relative w-full overflow-x-auto overscroll-x-contain rounded-[4px] border border-survey-line focus-visible:ring-[3px] focus-visible:ring-ring/40",
        containerClassName,
      )}
    >
      <table
        data-slot="table"
        aria-label={ariaLabel}
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("bg-surface-raised [&_tr]:border-b", className)}
      {...props}
    />
  );
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  );
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "border-t border-survey-line bg-surface-raised font-semibold",
        className,
      )}
      {...props}
    />
  );
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b border-survey-line transition-colors hover:bg-surface-raised/70 data-[state=selected]:bg-surface-raised",
        className,
      )}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-11 whitespace-nowrap px-4 text-left align-middle text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "whitespace-nowrap px-4 py-3 align-middle text-foreground",
        className,
      )}
      {...props}
    />
  );
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-3 text-left text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
};
