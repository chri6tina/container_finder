import { describe, it, expect } from 'vitest';
import { mlToOz, ozToMl, cmToIn, inToCm, roundTo, isWithinPercentRange } from '@/lib/units';

describe('unit conversions', () => {
  it('converts ml <-> oz', () => {
    expect(roundTo(mlToOz(1000), 2)).toBe(33.81);
    expect(roundTo(ozToMl(1), 1)).toBe(29.6);
  });
  it('converts cm <-> in', () => {
    expect(roundTo(cmToIn(2.54), 2)).toBe(1);
    expect(roundTo(inToCm(10), 2)).toBe(25.4);
  });
  it('within percent range', () => {
    expect(isWithinPercentRange(108, 100, 8)).toBe(true);
    expect(isWithinPercentRange(92, 100, 8)).toBe(true);
    expect(isWithinPercentRange(120, 100, 8)).toBe(false);
  });
});


