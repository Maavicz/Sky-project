export function validateBooking(booking = {}) {
  const name = String(booking.name ?? "").trim();
  const pickup = String(booking.pickup ?? "").trim();
  const delivery = String(booking.delivery ?? "").trim();
  const weight = String(booking.weight ?? "").trim();
  const contact = String(booking.contact ?? "").trim();

  if (!name || !pickup || !delivery || !weight || !contact) {
    return { ok: false };
  }

  const normalizedWeight = Number(weight);
  if (Number.isNaN(normalizedWeight) || normalizedWeight <= 0) {
    return { ok: false };
  }

  const phoneDigits = contact.replace(/\D/g, "");
  const isValidPhone = /^\+?[0-9()\-\s]{10,15}$/.test(contact) && phoneDigits.length >= 10;

  if (!isValidPhone) {
    return { ok: false };
  }

  return { ok: true };
}
