import type { NextConfig } from "next";

import { REDIRECT_CONTRACT } from "./src/lib/routes/route-contract";

const nextConfig: NextConfig = {
  async redirects() {
    return REDIRECT_CONTRACT.map((entry) => ({
      source: entry.source,
      destination: entry.destination,
      permanent: entry.permanent,
    }));
  },
};

export default nextConfig;
