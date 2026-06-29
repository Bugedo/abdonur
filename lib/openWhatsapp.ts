/** True on phones/tablets where wa.me should open the native app. */
export function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

/** Instagram, Facebook, etc. often show "Download WhatsApp" instead of opening the app. */
export function isInAppBrowser(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return /(FBAN|FBAV|Instagram|Line\/|Twitter|LinkedInApp)/i.test(ua);
}

export function buildWhatsappSendUrl(phoneDigits: string, message: string): string {
  const phone = phoneDigits.replace(/\D/g, '');
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/**
 * Opens WhatsApp after an async step (e.g. order creation).
 * Returns false when the browser blocked navigation; caller should show a manual link.
 */
export function openWhatsappSendUrl(url: string): boolean {
  if (isInAppBrowser()) {
    return false;
  }

  if (isMobileDevice()) {
    window.location.assign(url);
    return true;
  }

  const opened = window.open(url, '_blank', 'noopener,noreferrer');
  return opened != null;
}
