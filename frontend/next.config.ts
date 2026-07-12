import type { NextConfig } from "next";

/** Build-time API origins for CSP connect-src (NEXT_PUBLIC_API_URL + local defaults). */
function apiConnectOrigins(): string[] {
  const origins = new Set<string>([
    "http://127.0.0.1:8000",
    "http://localhost:8000",
  ]);
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/$/, "");
  if (raw) {
    try {
      origins.add(new URL(raw).origin);
    } catch {
      // Ignore invalid URL; local defaults remain.
    }
  }
  return [...origins];
}

function buildContentSecurityPolicy(): string {
  const connectSrc = [
    "'self'",
    ...apiConnectOrigins(),
    "https://www.google-analytics.com",
    "https://analytics.google.com",
    "https://*.google-analytics.com",
    "https://www.googletagmanager.com",
  ].join(" ");

  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://commons.wikimedia.org https://upload.wikimedia.org https://image.pollinations.ai https://*.google-analytics.com https://*.googletagmanager.com",
    "font-src 'self'",
    `connect-src ${connectSrc}`,
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
}

const csp = buildContentSecurityPolicy();

const securityHeaders = [
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
  {
    key: "Content-Security-Policy",
    value: csp,
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "commons.wikimedia.org",
        pathname: "/wiki/Special:FilePath/**",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
        pathname: "/wikipedia/commons/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
