import type { NextConfig } from "next";

import { REDIRECT_CONTRACT } from "./src/lib/routes/route-contract";
import {
  SHOPIFY_IMAGE_HOSTNAME,
  SHOPIFY_IMAGE_PATH_PREFIX,
} from "./src/lib/storefront/image-source";

const nextConfig: NextConfig = {
  images: {
    /*
     * Only the exact owned Shopify CDN media path is allowed. Static mode keeps
     * serving the approved local catalog from `public/images/products/`, and no
     * remote editorial hotlinks are introduced by this slice.
     */
    remotePatterns: [
      {
        protocol: "https",
        hostname: SHOPIFY_IMAGE_HOSTNAME,
        port: "",
        pathname: `${SHOPIFY_IMAGE_PATH_PREFIX}**`,
      },
    ],
  },
  async redirects() {
    return REDIRECT_CONTRACT.map((entry) => ({
      source: entry.source,
      destination: entry.destination,
      permanent: entry.permanent,
    }));
  },
};

export default nextConfig;
