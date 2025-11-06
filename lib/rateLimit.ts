type Bucket = { tokens: number; lastRefillMs: number };

const globalAny = globalThis as unknown as { __RL__: Map<string, Bucket> | undefined };
if (!globalAny.__RL__) globalAny.__RL__ = new Map();
const BUCKETS = globalAny.__RL__!;

export function rateLimit(key: string, capacity: number, refillPerMs: number): boolean {
  const now = Date.now();
  const b = BUCKETS.get(key) || { tokens: capacity, lastRefillMs: now };
  if (now > b.lastRefillMs) {
    const elapsed = now - b.lastRefillMs;
    const refill = (elapsed / refillPerMs) * capacity;
    b.tokens = Math.min(capacity, b.tokens + refill);
    b.lastRefillMs = now;
  }
  if (b.tokens < 1) {
    BUCKETS.set(key, b);
    return false;
  }
  b.tokens -= 1;
  BUCKETS.set(key, b);
  return true;
}

export function ipKey(request: Request, scope: string): string {
  const xff = request.headers.get('x-forwarded-for') || '';
  const ip = xff.split(',')[0].trim() || 'unknown';
  return `${scope}:${ip}`;
}



