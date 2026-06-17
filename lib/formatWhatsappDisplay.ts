/** Normalizes stored branch digits to wa.me format (549351…, digits only). */
export function normalizeWhatsappWaMe(digits: string): string {
  return digits.replace(/\D/g, '');
}

/** Formats wa.me-style digits (549…) for human-readable AR mobile display. */
export function formatWhatsappArgentinaDisplay(digits: string): string {
  const s = normalizeWhatsappWaMe(digits);
  if (!s.startsWith('549') || s.length < 13) {
    return s ? `+${s}` : digits;
  }
  const local = s.slice(3);
  const area = local.slice(0, 3);
  const subscriber = local.slice(3);
  const tail =
    subscriber.length === 7
      ? `${subscriber.slice(0, 3)}-${subscriber.slice(3)}`
      : subscriber.length > 4
        ? `${subscriber.slice(0, 4)}-${subscriber.slice(4)}`
        : subscriber;
  return `+54 9 ${area} ${tail}`;
}
