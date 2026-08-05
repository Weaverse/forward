import type { Metadata } from "next";

import { SurfaceShell } from "@/components/surface-shell";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Forward account.",
};

export default function LoginPage() {
  return (
    <SurfaceShell
      eyebrow="Account"
      title="Sign in"
      description="Signing in uses Shopify Customer Account OAuth, which is not wired up in the foundation slice."
      dataDependency="This surface will start the Customer Account OAuth flow via /account/authorize. Until then, sign-in is intentionally unavailable — there is no form here because no credential handling exists."
    >
      <div className="max-w-xl border border-mist bg-parchment px-6 py-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-moss">
          Not yet available
        </p>
        <p className="mt-2 text-sm leading-relaxed text-slate">
          Authentication lands in a later slice. This page exists so the
          account route topology is complete and reviewable.
        </p>
      </div>
    </SurfaceShell>
  );
}
