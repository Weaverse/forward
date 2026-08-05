/**
 * Logout endpoint — explicit foundation-slice placeholder.
 *
 * Answers 501 because there is no session to terminate; redirecting would
 * falsely imply authentication exists.
 */
export function GET(): Response {
  return new Response(
    "Forward foundation slice: logout is not implemented because no authentication exists yet.",
    {
      status: 501,
      headers: { "content-type": "text/plain; charset=utf-8" },
    },
  );
}
