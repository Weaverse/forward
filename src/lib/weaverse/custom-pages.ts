/**
 * The pathnames Weaverse serves, cached for the proxy.
 *
 * The proxy has to decide, before rendering starts, whether a path is a
 * Weaverse custom page. It cannot ask the route: once a dynamic route begins
 * streaming the response is already a `200`, so `notFound()` inside it can only
 * produce a soft 404. Next's own documentation says a real status has to be
 * decided before the response streams, in the proxy.
 *
 * Deliberately free of `server-only`, `next/headers`, and the SDK: this runs in
 * the proxy, which has none of them. It calls the public discovery endpoint,
 * which needs no API key and returns each published page's exact path.
 */

const DEFAULT_API_BASE = "https://api.weaverse.io";
/** Short enough that a merchant publishing in Studio sees it within a minute. */
const TTL_MS = 60_000;
/** How soon to retry after a failed listing fetch. */
const RETRY_MS = 5_000;

interface CustomPageEntry {
  path?: string;
  handle?: string;
}

interface Snapshot {
  /** `null` when no listing has ever been fetched successfully. */
  paths: ReadonlySet<string> | null;
  fetchedAt: number;
}

let snapshot: Snapshot | null = null;
let inFlight: Promise<Snapshot> | null = null;

function normalize(value: string): string {
  const trimmed = value.trim().replace(/^\/+|\/+$/g, "");
  return trimmed.length === 0 ? "" : `/${trimmed}`;
}

async function fetchPaths(projectId: string): Promise<ReadonlySet<string>> {
  const base = process.env.WEAVERSE_HOST?.trim() || DEFAULT_API_BASE;
  const response = await fetch(
    `${base}/api/public/v1/projects/${projectId}/custom-pages`,
    { headers: { accept: "application/json" } },
  );
  if (!response.ok) {
    throw new Error(`custom-pages responded ${response.status}`);
  }

  const body = (await response.json()) as { data?: CustomPageEntry[] };
  const paths = (body.data ?? [])
    .map((entry) => normalize(entry.path ?? entry.handle ?? ""))
    .filter((path) => path.length > 0);
  return new Set(paths);
}

/**
 * Whether Weaverse publishes a custom page at this pathname.
 *
 * Fails open, and that direction is deliberate. The renderer no longer sits at
 * the app root, so a path this returns `false` for has no route at all and
 * answers a hard 404. If a failed fetch were treated as "no pages", every
 * custom page would 404 for as long as Weaverse was unreachable.
 *
 * So when there is no usable listing, the answer is `true`: the request goes to
 * the renderer, which asks Weaverse directly and answers a soft 404 if there is
 * genuinely no page. An outage then costs a soft 404 on invented URLs rather
 * than a hard 404 on real pages.
 */
export async function isWeaverseCustomPage(
  pathname: string,
  projectId: string,
): Promise<boolean> {
  const now = Date.now();
  if (snapshot !== null && now - snapshot.fetchedAt < TTL_MS) {
    return snapshot.paths === null || snapshot.paths.has(pathname);
  }

  /* Concurrent requests share one refresh rather than each opening a call. */
  inFlight ??= fetchPaths(projectId)
    .then((paths) => {
      const next: Snapshot = { paths, fetchedAt: Date.now() };
      snapshot = next;
      return next;
    })
    .catch(() => {
      /* Keep the last good listing when there is one; a shorter retry window
       * than the success TTL so a transient failure heals quickly. */
      const fallback: Snapshot = {
        paths: snapshot?.paths ?? null,
        fetchedAt: now - (TTL_MS - RETRY_MS),
      };
      snapshot = fallback;
      return fallback;
    })
    .finally(() => {
      inFlight = null;
    });

  const resolved = await inFlight;
  return resolved.paths === null || resolved.paths.has(pathname);
}

/** Clears the cache. Tests only. */
export function resetCustomPageCache(): void {
  snapshot = null;
  inFlight = null;
}
