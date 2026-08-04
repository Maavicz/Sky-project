export function validateBooking(booking) {
  if (!booking.pickup?.trim() || !booking.delivery?.trim() || !booking.weight?.trim() || !booking.contact?.trim()) {
    return { ok: false };
  }
  if (isNaN(Number(booking.weight)) || Number(booking.weight) <= 0) {
    return { ok: false };
  }
  return { ok: true };
}
