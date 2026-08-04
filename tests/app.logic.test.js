import { describe, it, expect } from 'vitest';

// Small unit tests for booking and tracking logic extracted from App.jsx
import { computeNewId } from '../src/testHelpers/appLogic.mjs';

describe('computeNewId', () => {
  it('generates sequential IDs based on length', () => {
    expect(computeNewId(0)).toBe('SB-2026-001');
    expect(computeNewId(5)).toBe('SB-2026-006');
  });
});
