/** @type {import('next').NextConfig} */
const rawBackendProxyUrl =
  (process.env.BACKEND_PROXY_URL || "").trim() || "http://127.0.0.1:8001";

let backendProxyBaseUrl;
try {
  const parsed = new URL(rawBackendProxyUrl);
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(`Unsupported protocol "${parsed.protocol}"`);
  }
  backendProxyBaseUrl = rawBackendProxyUrl.replace(/\/+$/, "");
} catch (error) {
  throw new Error(
    `Invalid BACKEND_PROXY_URL ("${rawBackendProxyUrl}"): ${
      error instanceof Error ? error.message : String(error)
    }`
  );
}

const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendProxyBaseUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
