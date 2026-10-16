const rawApiOrigin = process.env.COADO_API_ORIGIN
if (!rawApiOrigin) throw new Error('Defina COADO_API_ORIGIN no projeto Vercel.')

const apiOrigin = new URL(rawApiOrigin)
if (
  apiOrigin.protocol !== 'https:' ||
  apiOrigin.pathname !== '/' ||
  apiOrigin.search ||
  apiOrigin.hash
) {
  throw new Error('COADO_API_ORIGIN deve ser uma origem HTTPS sem caminho, query ou fragmento.')
}

export const config = {
  framework: null,
  installCommand: 'npm ci',
  buildCommand: 'npm run build -w @coado/web',
  outputDirectory: 'apps/web/dist',
  rewrites: [
    { source: '/api/:path*', destination: `${apiOrigin.origin}/api/:path*` },
    { source: '/(.*)', destination: '/index.html' },
  ],
  headers: [
    {
      source: '/((?!api/).*)',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https://*.googleusercontent.com; connect-src 'self'; frame-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
        },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
        { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
      ],
    },
    {
      source: '/assets/(.*)',
      headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
    },
  ],
}
