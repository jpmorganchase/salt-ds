export const SAFE_ABSOLUTE_HTTPS_URL_PATTERN =
  /^https:\/\/(?![^/?#]*@)(?!.*\s)(?!.*\\)(?:[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?|\[(?=[0-9A-Fa-f:.]*[0-9A-Fa-f])(?=[0-9A-Fa-f:.]*:)[0-9A-Fa-f:.]+\])(?::0*(?:[0-9]{1,4}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5]))?(?:[/?#].*)?$/u;

function containsAsciiControlCharacter(value: string): boolean {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code <= 0x1f || code === 0x7f) return true;
  }
  return false;
}

/**
 * Returns true only for an absolute HTTPS URL that is safe to preserve as an
 * exact catalog identifier.
 *
 * URL parsing alone is intentionally insufficient: the WHATWG parser repairs
 * backslashes and whitespace, accepts credentials, and can otherwise change
 * the authored locator before it reaches the catalog.
 */
export function isSafeAbsoluteHttpsUrl(value: string): boolean {
  if (
    value.length === 0 ||
    value !== value.trim() ||
    value !== value.normalize("NFC") ||
    value.includes("\\") ||
    containsAsciiControlCharacter(value) ||
    /\s/u.test(value) ||
    !SAFE_ABSOLUTE_HTTPS_URL_PATTERN.test(value)
  ) {
    return false;
  }

  try {
    const parsed = new URL(value);
    return (
      parsed.protocol === "https:" &&
      parsed.username === "" &&
      parsed.password === "" &&
      parsed.hostname.length > 0
    );
  } catch {
    return false;
  }
}
