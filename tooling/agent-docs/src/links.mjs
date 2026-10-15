import path from "node:path";
import { SITE_ORIGIN, TAB_ROUTE_SEGMENTS } from "./config.mjs";
import { normalizeRoute } from "./pages.mjs";

const ASSET_PATTERN =
  /\.(?:png|jpe?g|gif|svg|webp|pdf|zip|mp4|woff2?|fig|sketch)$/i;
const SCHEME_PATTERN = /^[a-z][a-z0-9+.-]*:/i;

/** Relative link between two doc files in the same package. */
export function relativeDocLink(fromDocPath, toDocPath) {
  const relative = path.posix.relative(
    path.posix.dirname(fromDocPath),
    toDocPath,
  );
  return relative.startsWith(".") ? relative : `./${relative}`;
}

/** Link to a doc file, qualified by package when it lives elsewhere. */
export function docLink({ fromPackage, fromDocPath, toPackage, toDocPath }) {
  return fromPackage === toPackage
    ? relativeDocLink(fromDocPath, toDocPath)
    : `${toPackage}/docs/${toDocPath}`;
}

function decodeAnchor(hash) {
  try {
    return decodeURIComponent(hash.slice(1));
  } catch {
    return hash.slice(1);
  }
}

/**
 * Resolves site links against the page they appear on.
 * `routeIndex` maps normalized site routes to `{ packageName, docPath }`.
 * `deferAnchor(route, anchor)`, if given, returns the `#…` to use for an
 * anchor on the site page at `route`, which a generated document may number
 * differently once it merges pages.
 */
export function createLinkResolver(routeIndex, { deferAnchor } = {}) {
  function lookup(pathname) {
    const direct = routeIndex.get(pathname);
    if (direct) return direct;
    // Component tabs (`/usage`, `/examples`, `/accessibility`) share one file.
    const segments = pathname.split("/");
    if (TAB_ROUTE_SEGMENTS.has(segments.at(-1))) {
      return routeIndex.get(segments.slice(0, -1).join("/"));
    }
    return undefined;
  }

  const anchorFor = (route, hash) =>
    hash && deferAnchor ? deferAnchor(route, decodeAnchor(hash)) : hash;

  /**
   * Returns the rewritten URL, or `null` when the link should be dropped
   * (its text is kept) because it points at a site asset.
   */
  function resolve(url, { sitePath, packageName, docPath }) {
    if (!url || SCHEME_PATTERN.test(url)) return url;
    if (url.startsWith("#")) return anchorFor(normalizeRoute(sitePath), url);
    const resolved = new URL(url, `https://salt.invalid${sitePath}`);
    const pathname = normalizeRoute(decodeURI(resolved.pathname));
    if (ASSET_PATTERN.test(pathname)) return null;
    const target = lookup(pathname);
    if (!target) return `${SITE_ORIGIN}${pathname}${resolved.hash}`;
    return (
      docLink({
        fromPackage: packageName,
        fromDocPath: docPath,
        toPackage: target.packageName,
        toDocPath: target.docPath,
      }) + anchorFor(pathname, resolved.hash)
    );
  }

  return { resolve, lookup };
}
