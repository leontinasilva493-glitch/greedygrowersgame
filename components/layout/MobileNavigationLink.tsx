"use client";

import Link from "next/link";
import type { ReactNode } from "react";

export function MobileNavigationLink({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={className}
      onClick={(event) => {
        event.currentTarget.closest("details")?.removeAttribute("open");
      }}
    >
      {children}
    </Link>
  );
}
