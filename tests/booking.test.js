import { describe, it, expect } from 'vitest';
import { validateBooking } from '../src/testHelpers/validation.mjs';
import { normalizePhoneNumber, phoneCountries } from '../src/testHelpers/phone.mjs';

describe('international phone numbers', () => {
  it('normalizes national input to E.164 and includes global calling codes', () => {
    expect(normalizePhoneNumber('08012345678', 'NG')).toBe('+2348012345678');
    expect(normalizePhoneNumber('+1 415 555 2671', 'NG')).toBe('+14155552671');
    expect(phoneCountries.some((country) => country.country === 'US' && country.callingCode === '1')).toBe(true);
    expect(phoneCountries.some((country) => country.country === 'NG' && country.callingCode === '234')).toBe(true);
  });

  it('rejects incomplete numbers during normalization', () => {
    expect(normalizePhoneNumber('1234', 'NG')).toBe('');
  });
});

describe('validateBooking', () => {
  it('rejects empty fields', () => {
    expect(validateBooking({ pickup: '', delivery: '', weight: '', contact: '' })).toEqual({ ok: false });
  });

  it('rejects non-numeric weight', () => {
    expect(validateBooking({ pickup: 'PHC', delivery: 'LOS', weight: 'abc', contact: '080' })).toEqual({ ok: false });
  });

  it('rejects invalid phone formats', () => {
    expect(validateBooking({ name: 'Ada Okafor', pickup: 'PHC', delivery: 'LOS', weight: '2.5', contact: 'abc' })).toEqual({ ok: false });
  });

  it('requires country-coded international sender and receiver phone numbers', () => {
    expect(validateBooking({ name: 'Ada Okafor', email: 'ada@example.com', receiverName: 'Tunde Bello', receiverContact: '08087654321', itemDescription: 'Documents', quantity: '1', pickup: 'PHC', delivery: 'LOS', service: 'Next Day', collectionPoint: 'LMD (Last mile delivery)', weight: '2', contact: '08012345678' })).toEqual({ ok: false });
  });

  it('requires a customer name before submission', () => {
    expect(validateBooking({ pickup: 'PHC', delivery: 'LOS', weight: '2.5', contact: '08012345678', name: '' })).toEqual({ ok: false });
  });

  it('accepts valid booking', () => {
    expect(validateBooking({ name: 'Ada Okafor', email: 'ada@example.com', receiverName: 'Tunde Bello', receiverContact: '+2348087654321', itemDescription: 'Documents', quantity: '1', pickup: 'PHC', delivery: 'LOS', service: 'Sensitive - Next Day', collectionPoint: 'Lagos WareHub', weight: '2.5', contact: '+2348012345678' })).toEqual({ ok: true });
  });

  it('requires a valid customer email', () => {
    expect(validateBooking({ name: 'Ada Okafor', email: 'not-an-email', receiverName: 'Tunde Bello', receiverContact: '08087654321', itemDescription: 'Documents', quantity: '1', pickup: 'PHC', delivery: 'LOS', service: 'Sensitive - Next Day', collectionPoint: 'Lagos WareHub', weight: '2.5', contact: '08012345678' })).toEqual({ ok: false });
  });

  it('requires receiver and cargo details', () => {
    expect(validateBooking({ name: 'Ada Okafor', pickup: 'PHC', delivery: 'LOS', weight: '2.5', contact: '08012345678' })).toEqual({ ok: false });
  });
});
