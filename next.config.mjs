/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  compress: true,
  async headers() { return [{ source: "/(.*)", headers: [
    { key: "Content-Security-Policy", value: "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' https:; frame-ancestors 'none'" },
    { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
  ] }, {
    source: "/_next/static/:path*",
    headers: [
      { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
    ],
  }, {
    source: "/images/:path*",
    headers: [
      { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
    ],
  }, {
    source: "/api/:path*",
    headers: [
      { key: "Cache-Control", value: "no-store" },
    ],
  }] },
  distDir: process.env.NEXT_DIST_DIR || ".next",
  trailingSlash: true,
};

export default nextConfig;
