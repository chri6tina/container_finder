export type CapacityUnit = 'ml' | 'oz';
export type LengthUnit = 'cm' | 'in';

export function mlToOz(ml: number): number {
  return ml / 29.5735;
}

export function ozToMl(oz: number): number {
  return oz * 29.5735;
}

export function cmToIn(cm: number): number {
  return cm / 2.54;
}

export function inToCm(inches: number): number {
  return inches * 2.54;
}

export function roundTo(value: number, fractionDigits: number): number {
  const p = 10 ** fractionDigits;
  return Math.round(value * p) / p;
}

export function normalizeCapacity(value: number, unit: CapacityUnit): { ml: number; oz: number } {
  const ml = unit === 'ml' ? value : ozToMl(value);
  const oz = unit === 'oz' ? value : mlToOz(value);
  return { ml, oz };
}

export function normalizeDimensions(
  dims: { length?: number; width?: number; height?: number },
  unit: LengthUnit
): { lengthCm?: number; widthCm?: number; heightCm?: number } {
  const toCm = unit === 'cm' ? (v: number) => v : inToCm;
  return {
    lengthCm: dims.length != null ? toCm(dims.length) : undefined,
    widthCm: dims.width != null ? toCm(dims.width) : undefined,
    heightCm: dims.height != null ? toCm(dims.height) : undefined
  };
}

export function isWithinPercentRange(value: number, target: number, percent: number): boolean {
  if (!isFinite(value) || !isFinite(target)) return false;
  const delta = Math.abs(value - target);
  return delta / target <= percent / 100;
}


