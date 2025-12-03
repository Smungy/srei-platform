import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.rawg.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.rawg.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'rawg.io',
        pathname: '/**',
      },
    ],
    // Configuración para evitar timeouts
    minimumCacheTTL: 60 * 60 * 24, // Cache por 24 horas
    dangerouslyAllowSVG: false,
    // Usar unoptimized para evitar proxy de imágenes externas lentas
    unoptimized: true,
  },
};

export default nextConfig;
