import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // La 404 global lleva su propio <html>/<body> (no hay layout raíz: el único layout es app/[lang]).
  experimental: { globalNotFound: true },
};

export default nextConfig;
