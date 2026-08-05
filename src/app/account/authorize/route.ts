/**
 * Customer Account OAuth callback — explicit foundation-slice placeholder.
 *
 * Answers 501 so nothing can mistake this for a working auth endpoint. The
 * real implementation (state validation, token exchange, session issuance)
 * lands with the Customer Account slice and must not assume any credential
 * from this file.
 */
export function GET(): Response {
  return new Response(
    "Forward foundation slice: Customer Account authorization is not implemented yet.",
    {
      status: 501,
      headers: { "content-type": "text/plain; charset=utf-8" },
    },
  );
}
