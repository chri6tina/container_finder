const ASIN_RE = /(?:[/dp/]|gp\/product\/|product\/)([A-Z0-9]{10})/i;

export function extractAsin(input: string): string | null {
  const trimmed = input.trim();
  // Direct ASIN
  if (/^[A-Z0-9]{10}$/i.test(trimmed)) return trimmed.toUpperCase();
  // URL patterns
  const m = trimmed.match(ASIN_RE);
  if (m?.[1]) return m[1].toUpperCase();
  // Query param fallback
  try {
    const url = new URL(trimmed);
    const qp = url.searchParams.get('asin') || url.searchParams.get('ASIN');
    if (qp && /^[A-Z0-9]{10}$/i.test(qp)) return qp.toUpperCase();
  } catch {}
  return null;
}

export function buildAffiliateUrl(asin: string): string {
  const tag = process.env.NEXT_PUBLIC_AMAZON_PARTNER_TAG;
  if (tag && tag !== 'MY_TAG_HERE') {
    return `https://www.amazon.com/dp/${asin}?tag=${encodeURIComponent(tag)}`;
  }
  // Fallback without tag to avoid leaking placeholder values
  return `https://www.amazon.com/dp/${asin}`;
}


