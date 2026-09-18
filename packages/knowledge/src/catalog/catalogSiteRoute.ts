export const OFFICIAL_SALT_SITE_ORIGIN = "https://www.saltdesignsystem.com";
export const CANONICAL_SITE_ROUTE_PATTERN =
  /^(?!\/\/)(?!.*[\\?#%])(?!.*\/\.{1,2}(?:\/|$))(?!.*\/[iI][nN][dD][eE][xX]$)\/(?:[A-Za-z0-9._~!$&'()*+,;=:@/-]*[^/])?$/u;

/**
 * Returns true only for a canonical, origin-relative Salt documentation route.
 *
 * Routes are identifiers, not arbitrary URL references. Keeping this
 * predicate narrower than URL parsing prevents protocol-relative URLs,
 * encoded dot-segment traversal, query/fragment aliases, and platform-specific
 * path spellings from entering the catalog graph.
 */
export function isCanonicalSiteRoute(value: string): boolean {
  if (
    value.length === 0 ||
    value !== value.trim() ||
    value !== value.normalize("NFC") ||
    !CANONICAL_SITE_ROUTE_PATTERN.test(value)
  ) {
    return false;
  }

  let decoded: string;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    return false;
  }
  if (
    decoded.includes("\\") ||
    value.slice(1).includes("//") ||
    decoded.split("/").some((segment) => segment === "." || segment === "..")
  ) {
    return false;
  }

  try {
    const parsed = new URL(value, OFFICIAL_SALT_SITE_ORIGIN);
    return (
      parsed.origin === OFFICIAL_SALT_SITE_ORIGIN &&
      parsed.pathname === value &&
      parsed.search === "" &&
      parsed.hash === "" &&
      parsed.username === "" &&
      parsed.password === ""
    );
  } catch {
    return false;
  }
}

export function assertCanonicalSiteRoute(value: string): string {
  if (!isCanonicalSiteRoute(value)) {
    throw new Error(`Expected a canonical Salt documentation route: ${value}`);
  }
  return value;
}

export function officialSaltSiteUrl(route: string): string {
  return new URL(assertCanonicalSiteRoute(route), OFFICIAL_SALT_SITE_ORIGIN)
    .href;
}
