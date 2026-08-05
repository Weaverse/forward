import type { ReactNode } from "react";

interface SurfaceShellProps {
  eyebrow: string;
  title: string;
  description: string;
  /** Which live integration this surface waits on, stated honestly. */
  dataDependency: string;
  children?: ReactNode;
}

/**
 * Standard frame for every foundation-slice route: identifies the surface,
 * carries branded copy, and states its future live-data dependency.
 */
export function SurfaceShell({
  eyebrow,
  title,
  description,
  dataDependency,
  children,
}: SurfaceShellProps) {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <header className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay">
          {eyebrow}
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold uppercase tracking-[0.04em] text-pine sm:text-4xl">
          {title}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-slate">
          {description}
        </p>
      </header>
      {children ? <div className="mt-10">{children}</div> : null}
      <aside
        aria-label="Data status"
        className="mt-12 border-l-2 border-moss bg-parchment px-5 py-4"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-moss">
          Awaiting live data
        </p>
        <p className="mt-1 text-sm leading-relaxed text-slate">
          {dataDependency}
        </p>
      </aside>
    </div>
  );
}
