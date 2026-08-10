import { handleShopifyCartRequest } from "@/lib/cart/shopify-cart";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

export async function GET(request: Request): Promise<Response> {
  return handleShopifyCartRequest(request);
}

export async function POST(request: Request): Promise<Response> {
  return handleShopifyCartRequest(request);
}
