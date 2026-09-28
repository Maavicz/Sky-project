import { describe, it, expect } from 'vitest';
import { buildBookingTermsAcceptance, validatePaymentDetails, buildPaymentSummary, getPaymentOptions } from '../src/testHelpers/validation.mjs';
import { canAccessTracking } from '../src/testHelpers/appLogic.mjs';
import { buildInvoiceEmail, buildInvoiceHtml, buildInvoiceNumber, buildQuoteEmail } from '../src/testHelpers/emailTemplates.mjs';

describe('validatePaymentDetails', () => {
  it('rejects invalid card details', () => {
    expect(
      validatePaymentDetails({
        method: 'Card Payment',
        cardNumber: '4111',
        expiry: '13/99',
        cvv: '12',
      })
    ).toEqual({ ok: false, message: 'Card number is invalid' });
  });

  it('accepts valid card details', () => {
    expect(
      validatePaymentDetails({
        method: 'Card Payment',
        cardNumber: '4111111111111111',
        expiry: '12/29',
        cvv: '123',
      })
    ).toEqual({ ok: true, method: 'Card Payment' });
  });

  it('does not require customer bank details for a company bank transfer', () => {
    expect(
      validatePaymentDetails({
        method: 'Bank Transfer',
      })
    ).toEqual({ ok: true, method: 'Bank Transfer' });
  });

  it('builds a payment summary with an invoice total', () => {
    expect(
      buildPaymentSummary({
        bookingId: 'SB-2026-010',
        route: 'PHC → LOS',
        weight: '12.5',
        paymentMethod: 'Card Payment',
      })
    ).toEqual({
      bookingId: 'SB-2026-010',
      route: 'PHC → LOS',
      weight: '12.5',
      paymentMethod: 'Card Payment',
      amount: 62500,
      currency: 'NGN',
      fee: 2500,
      total: 65000,
    });
  });

  it('returns the three checkout options in order', () => {
    expect(getPaymentOptions().map((option) => option.method)).toEqual([
      'Card Payment',
      'Bank Transfer',
      'POS Payment',
    ]);
  });

  it('records accepted delivery terms with a version and timestamp', () => {
    expect(buildBookingTermsAcceptance({ accepted: false, version: '1.0', acceptedBy: 'Ada' })).toBeNull();
    expect(buildBookingTermsAcceptance({ accepted: true, version: '1.0', acceptedBy: 'Ada', acceptedAt: '2026-09-28T12:00:00.000Z' })).toEqual({
      version: '1.0',
      acceptedAt: '2026-09-28T12:00:00.000Z',
      acceptedBy: 'Ada',
    });
  });

  it('builds the requested quote email and bank details', () => {
    const quote = buildQuoteEmail({
      customerName: 'Elishah Omozusi',
      customerEmail: 'elishah@example.com',
      amount: 34500,
      route: 'Port Harcourt to Lagos',
      service: 'Sensitive - Next Day',
      collectionPoint: 'Lagos WareHub',
    });
    expect(quote.to).toBe('elishah@example.com');
    expect(quote.body).toContain('Your Skybridge Quote for delivery is: ₦34,500');
    expect(quote.body).toContain('Reply CONFIRM to proceed.');
    expect(quote.body).toContain('Moniepoint 6812806059');
  });

  it('builds the dated invoice identifier and confirmation invoice email', () => {
    const invoiceNumber = buildInvoiceNumber(new Date(2026, 8, 28), 2);
    const invoice = buildInvoiceEmail({
      customerName: 'Elishah Omozusi',
      customerEmail: 'elishah@example.com',
      amount: 34500,
      route: 'Port Harcourt to Lagos',
      service: 'Sensitive',
      collectionPoint: 'Lagos WareHub',
      invoiceNumber,
    });
    expect(invoiceNumber).toBe('Sbnl-260928-2');
    expect(invoice.body).toContain('Thank you for confirming.');
    expect(invoice.body).toContain('Amount Due: ₦34,500');
    expect(invoice.body).toContain('WareHub (Lagos WareHub)');
    const invoiceHtml = buildInvoiceHtml({ customerName: '<Elishah>', amount: 34500, route: 'Port Harcourt to Lagos', service: 'Sensitive', collectionPoint: 'Lagos WareHub', invoiceNumber });
    expect(invoiceHtml).toContain('Sbnl-260928-2');
    expect(invoiceHtml).toContain('&lt;Elishah&gt;');
    expect(invoiceHtml).toContain('Moniepoint');
  });

  it('requires authentication before tracking individual cargo', () => {
    expect(canAccessTracking('guest')).toBe(false);
    expect(canAccessTracking('client')).toBe(true);
    expect(canAccessTracking('admin')).toBe(true);
  });
});
