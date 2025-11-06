import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as route from '@/app/api/products/search/route';
import * as db from '@/lib/db';

describe('API /api/products/search', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('applies capacity range filters', async () => {
    const spy = vi.spyOn(db, 'prisma', 'get');
    const findMany = vi.fn().mockResolvedValue([]);
    spy.mockReturnValue({ product: { findMany } } as any);

    const url = 'http://localhost/api/products/search?minOz=15&maxOz=17';
    const res = await (route as any).GET(new Request(url));
    expect(res.status).toBe(200);
    expect(findMany).toHaveBeenCalled();
    const arg = findMany.mock.calls[0][0];
    expect(arg.where.size.AND.capacityMl).toBeDefined();
    expect(arg.where.size.AND.OR[0].capacityOz.gte).toBe(15);
    expect(arg.where.size.AND.OR[0].capacityOz.lte).toBe(17);
  });
});


