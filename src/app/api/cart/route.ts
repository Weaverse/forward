export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

import { handleShopifyCartRequest } from "@/lib/cart/shopify-cart";

const handleCart = (request: Request) => handleShopifyCartRequest(request);

export { handleCart as GET, handleCart as POST };
