import { describe, it, expect } from 'vitest';

// Small unit tests for booking and tracking logic extracted from App.jsx
import { appendShipmentEvent, computeNewId, ensureShipmentAudit, getAdminTabs, getFutureFlightSchedulePreview, verifyShipmentHandoffPin } from '../src/testHelpers/appLogic.mjs';

describe('shipment audit history', () => {
  it('records status changes with an actor and timestamp while preserving prior events', () => {
    const order = { id: 'SB-1', status: 'Pending', history: [{ at: '2026-09-28T08:00:00.000Z', actor: 'system', event: 'Booking created' }] };
    const updated = appendShipmentEvent(order, { status: 'Picked Up' }, 'Status changed to Picked Up', { actor: 'ops.user', at: '2026-09-28T09:00:00.000Z' });

    expect(updated.statusUpdatedAt).toBe('2026-09-28T09:00:00.000Z');
    expect(updated.updatedAt).toBe('2026-09-28T09:00:00.000Z');
    expect(updated.history).toHaveLength(2);
    expect(updated.history[1]).toEqual({ at: '2026-09-28T09:00:00.000Z', actor: 'ops.user', event: 'Status changed to Picked Up' });
  });

  it('marks imported records with unknown original booking dates honestly', () => {
    const migrated = ensureShipmentAudit({ id: 'SB-legacy' }, '2026-09-28T09:00:00.000Z');

    expect(migrated.createdAt).toBeNull();
    expect(migrated.updatedAt).toBe('2026-09-28T09:00:00.000Z');
    expect(migrated.history[0]).toEqual({
      at: '2026-09-28T09:00:00.000Z',
      actor: 'system',
      event: 'Legacy shipment imported; original booking date unavailable',
    });
  });
});

describe('shipment handoff PIN', () => {
  it('accepts only a matching configured 4 to 8 digit PIN', () => {
    expect(verifyShipmentHandoffPin('2468', '2468')).toBe(true);
    expect(verifyShipmentHandoffPin('2468', '1111')).toBe(false);
    expect(verifyShipmentHandoffPin('12', '12')).toBe(false);
    expect(verifyShipmentHandoffPin('', '')).toBe(false);
  });
});

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
    expect(tabs.some((tab) => tab.key === 'settings')).toBe(true);
  });

  it('does not expose admin settings to sub-admins', () => {
    expect(getAdminTabs('subadmin').some((tab) => tab.key === 'settings')).toBe(false);
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
