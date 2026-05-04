/**
 * Normalize `/public` asset paths so spaces and reserved characters survive
 * Next.js image optimization and case-sensitive hosts (avoids intermittent 400s on desktop vs mobile).
 */
export function publicImageSrc(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  try {
    return encodeURI(decodeURI(path));
  } catch {
    return encodeURI(path);
  }
}
