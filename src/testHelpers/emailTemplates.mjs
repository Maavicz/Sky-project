export const SBNL_PAYMENT_ACCOUNT = {
  bank: "Moniepoint",
  accountNumber: "6812806059",
  accountName: "SKYBRIDGE NEXUS LOGISTICS LTD",
};

export function formatNaira(amount) {
  return `₦${Number(amount).toLocaleString("en-NG")}`;
}

export function buildInvoiceNumber(date = new Date(), sequence = 1) {
  const year = String(date.getFullYear()).slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `Sbnl-${year}${month}${day}-${Math.max(1, Math.floor(Number(sequence) || 1))}`;
}

export function buildQuoteEmail({ customerName, amount, route, service, collectionPoint, customerEmail }) {
  return {
    to: customerEmail,
    subject: "Your Skybridge delivery quote",
    body: `Hi ${customerName},\n\nYour Skybridge Quote for delivery is: ${formatNaira(amount)}\n\nRoute: ${route}\nService: ${service}\nIncludes: Verified Rider + Live Tracking + WareHub (${collectionPoint})\n\nPay to: ${SBNL_PAYMENT_ACCOUNT.bank} ${SBNL_PAYMENT_ACCOUNT.accountNumber}\n${SBNL_PAYMENT_ACCOUNT.accountName}\n\nReply CONFIRM to proceed.\n\nQuestions? hello@sbnldelivery.com`,
  };
}

export function buildInvoiceEmail({ customerName, amount, route, service, collectionPoint, invoiceNumber, customerEmail }) {
  return {
    to: customerEmail,
    subject: `Skybridge invoice ${invoiceNumber}`,
    body: `Hi ${customerName},\n\nThank you for confirming.\n\nPlease find attached your official invoice for booking ${invoiceNumber}.\n\nAmount Due: ${formatNaira(amount)}\nAccount: ${SBNL_PAYMENT_ACCOUNT.bank} ${SBNL_PAYMENT_ACCOUNT.accountNumber}\nAccount Name: ${SBNL_PAYMENT_ACCOUNT.accountName}\n\nRoute: ${route}\nService: ${service}\nIncludes: Verified Rider + Live Tracking + WareHub (${collectionPoint})\n\nOnce payment is received, we will assign your verified rider immediately and send you a payment receipt.\n\nWe appreciate your business.\n\nBest regards,\nElishah\nCustomer Success Team\n${SBNL_PAYMENT_ACCOUNT.accountName}\nhello@sbnldelivery.com`,
  };
}

export function buildInvoiceHtml({ customerName, amount, route, service, collectionPoint, invoiceNumber, issuedAt = new Date().toLocaleDateString("en-NG") }) {
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Invoice ${escapeHtml(invoiceNumber)}</title><style>body{font-family:Arial,sans-serif;color:#14221f;margin:0;padding:48px;background:#eef3f1}.invoice{max-width:760px;margin:auto;background:#fff;padding:48px;border-top:8px solid #047857}.top{display:flex;justify-content:space-between;gap:24px;border-bottom:1px solid #dce5e1;padding-bottom:24px}.muted{color:#60716b}.label{font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#60716b}.amount{font-size:30px;font-weight:700;color:#047857}.row{display:flex;justify-content:space-between;gap:16px;padding:14px 0;border-bottom:1px solid #e7eeeb}.pay{margin-top:28px;background:#eff8f4;padding:20px;border-radius:12px}@media print{body{padding:0;background:#fff}.invoice{box-shadow:none;padding:24px}}</style></head><body><main class="invoice"><div class="top"><div><p class="label">Skybridge Nexus Logistics LTD</p><h1>Invoice</h1><p class="muted">${escapeHtml(invoiceNumber)}</p></div><div><p class="label">Issued</p><p>${escapeHtml(issuedAt)}</p></div></div><p class="label">Bill to</p><p><strong>${escapeHtml(customerName)}</strong></p><div class="row"><span>Route</span><strong>${escapeHtml(route)}</strong></div><div class="row"><span>Service</span><strong>${escapeHtml(service)}</strong></div><div class="row"><span>Collection point</span><strong>${escapeHtml(collectionPoint)}</strong></div><div class="row"><span>Includes</span><strong>Verified Rider + Live Tracking + WareHub</strong></div><div class="row"><span>Amount due</span><strong class="amount">${formatNaira(amount)}</strong></div><section class="pay"><p class="label">Bank transfer</p><p><strong>${SBNL_PAYMENT_ACCOUNT.bank}</strong><br>Account: ${SBNL_PAYMENT_ACCOUNT.accountNumber}<br>Account name: ${SBNL_PAYMENT_ACCOUNT.accountName}</p><p class="muted">Use ${escapeHtml(invoiceNumber)} as your payment reference. Shipment dispatch follows payment verification.</p></section><p class="muted">Thank you for your business.</p></main></body></html>`;
}

export function buildMailtoUrl({ to, subject, body }) {
  const query = new URLSearchParams({ subject, body });
  return `mailto:${encodeURIComponent(to)}?${query.toString()}`;
}