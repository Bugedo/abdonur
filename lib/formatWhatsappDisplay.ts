/** Formats wa.me-style digits (549...) for human-readable AR mobile display. */
export function formatWhatsappArgentinaDisplay(digits: string): string {
  const s = digits.replace(/\D/g, '');
  if (!s.startsWith('549')) {
    return s ? `+${s}` : digits;
  }
  const afterCountry = s.slice(3);
  if (!afterCountry.startsWith('9')) {
    return `+54 ${afterCountry}`;
  }
  const rest = afterCountry.slice(1);
  if (rest.length < 10) {
    return `+54 9 ${rest}`;
  }
  const area = rest.slice(0, 3);
  const subscriber = rest.slice(3);
  const tail = subscriber.length > 4 ? `${subscriber.slice(0, 4)}-${subscriber.slice(4)}` : subscriber;
  return `+54 9 ${area} ${tail}`;
}
