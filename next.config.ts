import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Genera .next/standalone con un servidor Node autocontenido: es lo que
  // ejecuta la imagen de Docker en Coolify.
  output: "standalone",
  images: {
    // Las imágenes de producto se cargan por URL desde el panel (CDN, S3, etc.).
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
