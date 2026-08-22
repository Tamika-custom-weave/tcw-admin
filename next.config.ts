import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';
const apiUrl = process.env.API_URL || (isProd ? '' : 'http://localhost:5000/api');

if (isProd && !apiUrl) {
  throw new Error('API_URL environment variable is required in production.');
}

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/:path*`,
      },
    ];
  },
  async headers() {
    const cspScriptSrc = isProd ? "'self' 'unsafe-inline'" : "'self' 'unsafe-inline' 'unsafe-eval'";
    const csp = `
      default-src 'self';
      script-src ${cspScriptSrc};
      style-src 'self' 'unsafe-inline';
      img-src 'self' blob: data: https://res.cloudinary.com;
      font-src 'self' data:;
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'none';
      frame-src 'none';
      upgrade-insecure-requests;
    `.replace(/\s{2,}/g, ' ').trim();

    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Content-Security-Policy', value: csp }
        ],
      },
    ];
  },
};

export default nextConfig;
