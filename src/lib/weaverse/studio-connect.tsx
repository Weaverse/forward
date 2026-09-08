"use client";

import { WeaverseNextStudioConnect } from "@weaverse/next";

/**
 * Mounts the Studio bridge script once, from the root layout.
 *
 * Rendered only when a project is configured, so a credential-free deployment
 * ships no Studio script at all rather than an inert one.
 */
export function StudioConnect() {
  return <WeaverseNextStudioConnect />;
}
