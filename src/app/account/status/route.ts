import { readAccountSession } from "@/lib/account/account-view";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

/**
 * Boolean-only header state. It never returns customer data, session material,
 * or provider errors, and the account proxy strips every surrogate cache hint.
 */
export async function GET(): Promise<Response> {
  const session = await readAccountSession({
    path: "/account/status",
    refreshed: false,
  });
  return Response.json(
    { signedIn: session.status !== "signed-out" },
    {
      headers: {
        "cache-control": "private, no-store, max-age=0, must-revalidate",
      },
    },
  );
}
