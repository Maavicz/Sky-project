import { describe, it, expect } from 'vitest';
import { validateBooking } from '../src/testHelpers/validation.mjs';

describe('validateBooking', () => {
  it('rejects empty fields', () => {
    expect(validateBooking({ pickup: '', delivery: '', weight: '', contact: '' })).toEqual({ ok: false });
  });

  it('rejects non-numeric weight', () => {
    expect(validateBooking({ pickup: 'PHC', delivery: 'LOS', weight: 'abc', contact: '080' })).toEqual({ ok: false });
  });

  it('accepts valid booking', () => {
    expect(validateBooking({ pickup: 'PHC', delivery: 'LOS', weight: '2.5', contact: '08012345678' })).toEqual({ ok: true });
  });
});
