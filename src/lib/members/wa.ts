/**
 * Normalisasi nomor WhatsApp Indonesia.
 * Disimpan sebagai digit dengan prefix `62` (mis. `0812...` → `62812...`).
 */

/** Ubah input nomor apa pun menjadi digit ternormalisasi, atau `null` kalau tidak valid. */
export function normalizeWaNumber(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  if (!digits) return null;

  let normalized = digits;
  if (normalized.startsWith("62")) {
    // sudah benar
  } else if (normalized.startsWith("0")) {
    normalized = `62${normalized.slice(1)}`;
  } else if (normalized.startsWith("8")) {
    normalized = `62${normalized}`;
  } else {
    return null;
  }

  // Nomor Indonesia: 62 + 9–13 digit → total 11–15 digit.
  if (normalized.length < 11 || normalized.length > 15) return null;
  return normalized;
}

/** True kalau string terlihat seperti nomor telepon (boleh mengandung `+`, spasi, `-`). */
export function looksLikePhone(input: string): boolean {
  return /^[+\d][\d\s-]{6,}$/.test(input.trim());
}
