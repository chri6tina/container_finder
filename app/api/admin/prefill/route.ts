import { NextResponse } from 'next/server';
import { extractAsin, buildAffiliateUrl } from '@/lib/asin';
import { requireAdmin } from '@/lib/adminAuth';
import { rateLimit, ipKey } from '@/lib/rateLimit';

function extractMeta(html: string, key: string): string | null {
  const reProp = new RegExp(`<meta[^>]+property=["']${key}["'][^>]+content=["']([^"']+)["']`, 'i');
  const m1 = html.match(reProp);
  if (m1?.[1]) return m1[1];
  const reName = new RegExp(`<meta[^>]+name=["']${key}["'][^>]+content=["']([^"']+)["']`, 'i');
  const m2 = html.match(reName);
  return m2?.[1] ?? null;
}

function extractTitle(html: string): string | null {
  const m = html.match(/<title>([^<]+)<\/title>/i);
  return m?.[1] ?? null;
}

function extractJsonLd(html: string): { name?: string; brand?: string; images?: string[] } | null {
  const scripts = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  if (!scripts) return null;
  for (const s of scripts) {
    const m = s.match(/<script[^>]+>([\s\S]*?)<\/script>/i);
    if (!m?.[1]) continue;
    try {
      const data = JSON.parse(m[1].trim());
      const candidate = Array.isArray(data) ? data.find((x) => x && (x['@type'] === 'Product' || x.name)) : data;
      if (candidate) {
        const name = candidate.name as string | undefined;
        let brand: string | undefined;
        if (typeof candidate.brand === 'string') brand = candidate.brand;
        else if (candidate.brand && typeof candidate.brand.name === 'string') brand = candidate.brand.name;
        let images: string[] | undefined;
        if (typeof candidate.image === 'string') images = [candidate.image];
        else if (Array.isArray(candidate.image)) images = candidate.image.filter((x: any) => typeof x === 'string');
        return { name, brand, images };
      }
    } catch {
      // ignore bad JSON chunks
    }
  }
  return null;
}

function textBetween(html: string, re: RegExp): string | null {
  const m = html.match(re);
  if (!m) return null;
  return m[1].replace(/\s+/g, ' ').trim();
}

function mapFeaturesFromText(texts: string[]): string[] {
  const t = texts.join(' ').toLowerCase();
  const out: string[] = [];
  if (/leak\w*proof|no leak|leak[-\s]?resistant/.test(t)) out.push('LEAKPROOF');
  if (/stackable|stack\s*able/.test(t)) out.push('STACKABLE');
  if (/dishwasher/.test(t)) out.push('DISHWASHER_SAFE');
  if (/microwave/.test(t)) out.push('MICROWAVE_SAFE');
  if (/bpa[-\s]?free|bpa free/.test(t)) out.push('BPA_FREE');
  return Array.from(new Set(out));
}

function parseCapacity(text: string): { ml?: number; oz?: number; kg?: number } | null {
  const m = text.match(/(\d+(?:\.\d+)?)\s*(oz|ounce|ounces|ml|milliliter|milliliters|kg|kilogram|kilograms)\b/i);
  if (!m) return null;
  const num = parseFloat(m[1]);
  const unit = m[2].toLowerCase();
  if (unit.startsWith('oz') || unit.startsWith('ounce')) {
    return { oz: num, ml: num * 29.5735 };
  }
  if (unit === 'kg' || unit.startsWith('kilogram')) {
    return { kg: num };
  }
  return { ml: num, oz: num / 29.5735 };
}

function parseDimensions(text: string): { lengthCm?: number; widthCm?: number; heightCm?: number } | null {
  // Match patterns like 10 x 5 x 2 inches or 10x5 in or 25.4 × 12.7 × 5 cm
  const re = /(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)(?:\s*[x×]\s*(\d+(?:\.\d+)?))?\s*(inches|inch|in|cm|centimeters|centimetres|centimeter)?/i;
  const m = text.match(re);
  if (!m) return null;
  const a = parseFloat(m[1]);
  const b = parseFloat(m[2]);
  const c = m[3] ? parseFloat(m[3]) : undefined;
  const unit = (m[4] || '').toLowerCase();
  const toCm = unit === 'in' || unit.startsWith('inch') ? (v: number) => v * 2.54 : (v: number) => v;
  const result: { lengthCm?: number; widthCm?: number; heightCm?: number } = {
    lengthCm: toCm(a),
    widthCm: toCm(b)
  };
  if (c != null) result.heightCm = toCm(c);
  return result;
}

export async function POST(req: Request) {
  try {
    requireAdmin(req);
    if (!rateLimit(ipKey(req, 'admin:prefill'), 20, 60_000)) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }
    const { urlOrAsin } = await req.json();
    if (!urlOrAsin || typeof urlOrAsin !== 'string') {
      return NextResponse.json({ error: 'urlOrAsin is required' }, { status: 400 });
    }

    let inputUrl: string | null = null;
    try {
      if (/^https?:\/\//i.test(urlOrAsin)) inputUrl = new URL(urlOrAsin).toString();
    } catch {}

    // If input is an amzn.to shortlink, preserve it for display but expand for parsing
    let sourceForParsing: string | null = inputUrl;
    let affiliateUrl: string | null = null;
    if (inputUrl && /^(https?:\/\/)?amzn\.to\//i.test(inputUrl)) {
      affiliateUrl = inputUrl; // keep short link as the final display URL
      try {
        const res = await fetch(inputUrl, { redirect: 'follow', cache: 'no-store' });
        if (res.ok && res.url) sourceForParsing = res.url;
      } catch {}
    }

    // Extract ASIN from either original or expanded URL, or from raw ASIN input
    const asin = extractAsin(sourceForParsing || urlOrAsin);
    const envTag = process.env.NEXT_PUBLIC_AMAZON_PARTNER_TAG;
    if (!affiliateUrl && asin) {
      affiliateUrl = envTag && envTag !== 'MY_TAG_HERE' ? `https://www.amazon.com/dp/${asin}?tag=${encodeURIComponent(envTag)}` : `https://www.amazon.com/dp/${asin}`;
    }

    const out: { asin: string | null; affiliateUrl: string | null; title?: string; brand?: string; images?: string[]; features?: string[]; capacityMl?: number; capacityOz?: number; lengthCm?: number; widthCm?: number; heightCm?: number } = {
      asin,
      affiliateUrl
    };

    // Best-effort: if input URL already includes a partner tag, prefer it
    if ((sourceForParsing && /amazon\./i.test(sourceForParsing)) || (/^https?:\/\//i.test(urlOrAsin) && /amazon\./i.test(urlOrAsin))) {
      try {
        const u = new URL(sourceForParsing || urlOrAsin);
        const tagParam = u.searchParams.get('tag');
        const tagFromUrl = tagParam && !/^(MY_TAG_HERE|yourtag-20)$/i.test(tagParam) ? tagParam : undefined;
        const finalTag = tagFromUrl || (envTag && envTag !== 'MY_TAG_HERE' ? envTag : undefined);
        if (asin) {
          // Only override if we didn't already preserve an amzn.to short link
          if (!affiliateUrl || !/^https?:\/\/amzn\.to\//i.test(affiliateUrl)) {
            affiliateUrl = finalTag ? `https://www.amazon.com/dp/${asin}?tag=${encodeURIComponent(finalTag)}` : `https://www.amazon.com/dp/${asin}`;
          }
        }
      } catch {}
    }

    // Best-effort OpenGraph scrape (optional): only if we have a resolvable Amazon URL
    const isAmazon = (u: string | null) => !!u && /(^https?:\/\/)?([a-z0-9-]+\.)*amazon\.[a-z.]+/i.test(u);
    if (isAmazon(sourceForParsing) || (isAmazon(urlOrAsin) && /^https?:\/\//i.test(urlOrAsin))) {
      try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 5000);
        const res = await fetch(sourceForParsing || urlOrAsin, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (prefill) ContainerFinder/0.1',
            'Accept-Language': 'en-US,en;q=0.9'
          },
          cache: 'no-store',
          signal: ctrl.signal
        });
        clearTimeout(t);
        if (res.ok) {
          const html = (await res.text()).slice(0, 1_000_000); // cap at 1MB
          const ogTitle = extractMeta(html, 'og:title') || extractMeta(html, 'twitter:title') || extractTitle(html);
          const ogImage = extractMeta(html, 'og:image') || extractMeta(html, 'twitter:image');
          if (ogTitle) out.title = ogTitle;
          if (ogImage) out.images = [ogImage];
          const ld = extractJsonLd(html);
          if (ld?.name) out.title = out.title || ld.name;
          if (ld?.brand) out.brand = ld.brand;
          if (ld?.images?.length) out.images = out.images?.length ? out.images : ld.images;

          // Brand from byline
          if (!out.brand) {
            const byline = textBetween(html, /id=["']bylineInfo["'][^>]*>([^<]+)</i);
            if (byline) out.brand = byline.replace(/^Brand:\s*/i, '');
          }

          // Try to find a higher-res image in inline scripts or img tags
          if (!out.images?.length) {
            const hi1 = textBetween(html, /data-old-hires=["']([^"']+)["']/i);
            const hi2 = textBetween(html, /"hiRes"\s*:\s*"(https?:[^"']+)"/i);
            const lg = textBetween(html, /"large"\s*:\s*"(https?:[^"']+)"/i);
            const img = hi1 || hi2 || lg;
            if (img) out.images = [img];
          }

          // Feature bullets text
          const bulletsBlock = html.match(/id=["']feature-bullets["'][\s\S]*?<ul[\s\S]*?>([\s\S]*?)<\/ul>/i);
          if (bulletsBlock?.[1]) {
            const items = Array.from(bulletsBlock[1].matchAll(/<li[^>]*>\s*<span[^>]*>([\s\S]*?)<\/span>\s*<\/li>/gi)).map((m) =>
              m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
            );
            if (items.length) {
              const mapped = mapFeaturesFromText(items);
              if (mapped.length) out.features = mapped;
              // capacity/dimensions heuristics from feature bullets
              const joined = items.join(' | ');
              const cap = parseCapacity(joined);
              if (cap) {
                out.capacityMl = cap.ml;
                out.capacityOz = cap.oz;
                (out as any).weightKg = cap.kg;
              }
              const dims = parseDimensions(joined);
              if (dims) {
                out.lengthCm = dims.lengthCm;
                out.widthCm = dims.widthCm;
                out.heightCm = dims.heightCm;
              }
            }
          }

          // Fallback capacity/dimensions from title if not found
          if (!out.capacityMl && out.title) {
            const cap = parseCapacity(out.title);
            if (cap) {
              out.capacityMl = cap.ml;
              out.capacityOz = cap.oz;
            }
          }
          if (!out.lengthCm && out.title) {
            const dims = parseDimensions(out.title);
            if (dims) {
              out.lengthCm = dims.lengthCm;
              out.widthCm = dims.widthCm;
              out.heightCm = dims.heightCm;
            }
          }
        }
      } catch {
        // Ignore errors; manual entry will still work
      }
    }

    return NextResponse.json(out);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Invalid request' }, { status: 400 });
  }
}


