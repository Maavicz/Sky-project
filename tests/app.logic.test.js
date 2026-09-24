import { describe, it, expect } from 'vitest';

// Small unit tests for booking and tracking logic extracted from App.jsx
import { computeNewId, getAdminTabs, getFutureFlightSchedulePreview } from '../src/testHelpers/appLogic.mjs';

describe('computeNewId', () => {
  it('generates sequential IDs based on length', () => {
    expect(computeNewId(0)).toBe('SB-2026-001');
    expect(computeNewId(5)).toBe('SB-2026-006');
  });
});

describe('getAdminTabs', () => {
  it('includes a client details tab for admins', () => {
    const tabs = getAdminTabs('admin');
    expect(tabs.some((tab) => tab.key === 'client-details')).toBe(true);
    expect(tabs.some((tab) => tab.label === 'Client Details')).toBe(true);
  });
});

describe('getFutureFlightSchedulePreview', () => {
  it('returns upcoming takeoff times for the next days and weeks', () => {
    const schedules = getFutureFlightSchedulePreview(14);
    expect(Array.isArray(schedules)).toBe(true);
    expect(schedules.length).toBeGreaterThan(0);
    expect(schedules[0]).toHaveProperty('takeoffTime');
    expect(schedules[0]).toHaveProperty('takeoffDate');
    expect(schedules[0].takeoffDate).toMatch(/\d{4}-\d{2}-\d{2}/);
  });
});
