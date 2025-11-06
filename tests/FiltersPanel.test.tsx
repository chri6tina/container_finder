import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FiltersPanel, { type Filters } from '@/components/ui/FiltersPanel';

const base: Filters = {
  q: undefined,
  minOz: undefined,
  maxOz: undefined,
  minMl: undefined,
  maxMl: undefined,
  len: undefined,
  wid: undefined,
  ht: undefined,
  units: 'cm',
  materials: [],
  features: [],
  shape: undefined,
  sort: 'popularity'
};

describe('FiltersPanel sync', () => {
  it('changing oz updates ml', () => {
    let state = base;
    const { container } = render(<FiltersPanel value={state} onChange={(n) => (state = n)} />);
    const ozMin = container.querySelector('input[placeholder="Min"]') as HTMLInputElement;
    fireEvent.change(ozMin, { target: { value: '16' } });
    expect(state.minOz).toBe(16);
    // Approximately 473 ml
    expect(state.minMl && Math.round(state.minMl)).toBe(473);
  });
});


