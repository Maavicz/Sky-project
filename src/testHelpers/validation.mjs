import { isValidInternationalPhone } from "./phone.mjs";

export function validateBooking(booking = {}) {
  const name = String(booking.name ?? "").trim();
  const receiverName = String(booking.receiverName ?? "").trim();
  const receiverContact = String(booking.receiverContact ?? "").trim();
  const itemDescription = String(booking.itemDescription ?? "").trim();
  const email = String(booking.email ?? "").trim();
  const quantity = Number(booking.quantity);
  const pickup = String(booking.pickup ?? "").trim();
  const delivery = String(booking.delivery ?? "").trim();
  const service = String(booking.service ?? "").trim();
  const collectionPoint = String(booking.collectionPoint ?? "").trim();
  const weight = String(booking.weight ?? "").trim();
  const contact = String(booking.contact ?? "").trim();

  if (!name || !receiverName || !receiverContact || !itemDescription || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !Number.isInteger(quantity) || quantity < 1 || !pickup || !delivery || !service || !collectionPoint || !weight || !contact) {
    return { ok: false };
  }

  const normalizedWeight = Number(weight);
  if (Number.isNaN(normalizedWeight) || normalizedWeight <= 0) {
    return { ok: false };
  }

  if (!isValidInternationalPhone(contact) || !isValidInternationalPhone(receiverContact)) {
    return { ok: false };
  }

  return { ok: true };
}

export function buildBookingTermsAcceptance({ accepted, version, acceptedBy, acceptedAt = new Date().toISOString() }) {
  if (accepted !== true) return null;
  return { version, acceptedAt, acceptedBy };
}

function luhnCheck(cardNumber) {
  const digits = String(cardNumber ?? "").replace(/\D/g, "");
  if (!/^\d{13,19}$/.test(digits)) {
    return false;
  }

  let sum = 0;
  let shouldDouble = false;

  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

export function validatePaymentDetails(details = {}) {
  const method = String(details.method ?? "Bank Transfer").trim() || "Bank Transfer";

  if (method === "Card Payment") {
    const cardNumber = String(details.cardNumber ?? "").replace(/\s+/g, "");
    const expiry = String(details.expiry ?? "").trim();
    const cvv = String(details.cvv ?? "").trim();

    if (!luhnCheck(cardNumber)) {
      return { ok: false, message: "Card number is invalid" };
    }

    if (!/^(0[1-9]|1[0-2])\/(?:\d{2})$/.test(expiry)) {
      return { ok: false, message: "Expiry date is invalid" };
    }

    if (!/^\d{3,4}$/.test(cvv)) {
      return { ok: false, message: "CVV is invalid" };
    }

    return { ok: true, method };
  }

  if (method === "POS Payment") {
    const terminalId = String(details.terminalId ?? "").trim();
    const transactionId = String(details.transactionId ?? "").trim();

    if (!terminalId || !transactionId) {
      return { ok: false, message: "Terminal ID and transaction ID are required" };
    }

    return { ok: true, method };
  }

  return { ok: true, method };
}

export function buildPaymentSummary({
  bookingId,
  route,
  weight,
  paymentMethod = "Bank Transfer",
  amountPerKg = 5000,
  serviceFee = 2500,
}) {
  const parsedWeight = Number(weight ?? 0);
  const baseAmount = Number.isFinite(parsedWeight) && parsedWeight > 0 ? parsedWeight * amountPerKg : 0;
  const total = baseAmount + serviceFee;

  return {
    bookingId,
    route,
    weight: String(weight ?? "0"),
    paymentMethod,
    amount: baseAmount,
    currency: "NGN",
    fee: serviceFee,
    total,
  };
}

export function getPaymentOptions() {
  return [
    {
      method: "Card Payment",
      label: "Card Payment",
      subtitle: "Visa / Mastercard / Verve",
      description: "Pay instantly with your credit or debit card and receive a confirmation receipt.",
    },
    {
      method: "Bank Transfer",
      label: "Bank Transfer",
      subtitle: "Direct transfer",
      description: "Transfer funds into our dedicated logistics account and confirm the reference.",
    },
    {
      method: "POS Payment",
      label: "POS Payment",
      subtitle: "In-person checkout",
      description: "Use approved POS terminals for quick in-person settlement and transaction logging.",
    },
  ];
}
