import type { NextConfig } from "next";

import packageJson from "./package.json" with { type: "json" };

import { REDIRECT_CONTRACT } from "./src/lib/routes/route-contract";
import {
  SHOPIFY_IMAGE_HOSTNAME,
  SHOPIFY_IMAGE_PATH_PREFIX,
} from "./src/lib/storefront/image-source";

const nextConfig: NextConfig = {
  /* The theme version Weaverse Studio shows, inlined at build time so the
   * browser never receives the rest of package.json. */
  env: { THEME_VERSION: packageJson.version },
  /*
   * Browser verification builds each credential matrix into its own directory
   * so a matrix run never clobbers the `.next` build that `check:routes` and
   * `smoke:routes` consume. Unset, this is the ordinary `.next` build.
   */
  distDir: process.env.FORWARD_DIST_DIR ?? ".next",
  images: {
    /*
     * Only Shopify CDN media (any shop's `/s/files/` path) is allowed; no
     * other remote host is. The product placeholder is a local file.
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
