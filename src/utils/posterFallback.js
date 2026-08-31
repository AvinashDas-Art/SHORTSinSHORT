// A crisp, dependency-free SVG poster used whenever a film's real thumbnail
// is missing, still REPLACE_ME, or fails to load (404 / network error).
// Encoded as a data URI so it never depends on network access.

export function fallbackPosterFor(title = '') {
  const safeTitle = title
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .slice(0, 40)

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#262626"/>
      <stop offset="55%" stop-color="#171717"/>
      <stop offset="100%" stop-color="#000000"/>
    </linearGradient>
  </defs>
  <rect width="640" height="360" fill="url(#g)"/>
  <g transform="translate(280,120)" stroke="#ffffff" stroke-opacity="0.35" stroke-width="3" fill="none">
    <rect x="0" y="0" width="80" height="62" rx="8"/>
    <circle cx="16" cy="16" r="2.6" fill="#ffffff" fill-opacity="0.35" stroke="none"/>
    <circle cx="16" cy="46" r="2.6" fill="#ffffff" fill-opacity="0.35" stroke="none"/>
    <circle cx="64" cy="16" r="2.6" fill="#ffffff" fill-opacity="0.35" stroke="none"/>
    <circle cx="64" cy="46" r="2.6" fill="#ffffff" fill-opacity="0.35" stroke="none"/>
    <path d="M32 20 L52 31 L32 42 Z" fill="#ffffff" fill-opacity="0.35" stroke="none"/>
  </g>
  <text x="320" y="235" font-family="Helvetica, Arial, sans-serif" font-size="20" font-weight="700"
        fill="#ffffff" fill-opacity="0.55" text-anchor="middle">${safeTitle}</text>
</svg>`.trim()

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}
