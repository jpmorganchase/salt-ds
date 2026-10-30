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

/** A link's `#` fragment, decoded unless it is malformed, as in `#50%-width`. */
export function decodeFragment(fragment) {
  try {
    return decodeURIComponent(fragment);
  } catch {
    return fragment;
  }
}

/** `https://www.saltdesignsystem.com/salt/x#y` -> `/salt/x#y`, so it can ship. */
function siteRelative(url) {
  return url.startsWith(`${SITE_ORIGIN}/`)
    ? url.slice(SITE_ORIGIN.length)
    : undefined;
}

/**
 * Resolves site links against the page they appear on.
 * `routeIndex` maps normalized site routes to `{ packageName, docPath }`.
 * `deferAnchor(route, anchor)`, if given, returns the `#…` to use for an
 * anchor on the site page at `route`, which a generated document may number
 * differently once it merges pages.
 * `siteRoutes`, if given, holds every route the site serves, shipped or not.
 * A link to another `/salt/` route is broken and reported to `ctx.error`.
 */
export function createLinkResolver(
  routeIndex,
  { deferAnchor, siteRoutes } = {},
) {
  // Component tabs (`/usage`, `/examples`, `/accessibility`) share one file.
  const withoutTab = (pathname) => {
    const segments = pathname.split("/");
    return TAB_ROUTE_SEGMENTS.has(segments.at(-1))
      ? segments.slice(0, -1).join("/")
      : undefined;
  };

  function lookup(pathname) {
    const direct = routeIndex.get(pathname);
    if (direct) return direct;
    const component = withoutTab(pathname);
    return component ? routeIndex.get(component) : undefined;
  }

  const routesByKey = new Map(
    [...(siteRoutes ?? [])].map((route) => [route.toLowerCase(), route]),
  );
  const isSiteRoute = (pathname) =>
    siteRoutes.has(pathname) || siteRoutes.has(withoutTab(pathname));

  const anchorFor = (route, hash) =>
    hash && deferAnchor
      ? deferAnchor(route, decodeFragment(hash.slice(1)))
      : hash;

  /**
   * Returns the rewritten URL, or `null` when the link should be dropped
   * (its text is kept) because it points at a site asset. `node` locates the
   * link for `ctx.error`.
   */
  function resolve(url, ctx, node) {
    const { sitePath, packageName, docPath } = ctx;
    const relativeUrl = url ? siteRelative(url) : undefined;
    if (!url || (!relativeUrl && SCHEME_PATTERN.test(url))) return url;
    if (url.startsWith("#")) return anchorFor(normalizeRoute(sitePath), url);
    const resolved = new URL(
      relativeUrl ?? url,
      `https://salt.invalid${sitePath}`,
    );
    const pathname = normalizeRoute(decodeURI(resolved.pathname));
    // Site assets don't ship with the docs: an absolute link to one still
    // works, and a relative one keeps only its text.
    if (ASSET_PATTERN.test(pathname)) return relativeUrl ? url : null;
    const target = lookup(pathname);
    if (!target) {
      if (
        siteRoutes &&
        /^\/salt(?:\/|$)/.test(pathname) &&
        !isSiteRoute(pathname)
      ) {
        const match =
          routesByKey.get(pathname.toLowerCase()) ??
          routesByKey.get(withoutTab(pathname)?.toLowerCase());
        ctx.error?.(
          node,
          `Link ${url} points to ${pathname}, which is not a page on the site.${match ? ` Did you mean ${match}?` : ""}`,
        );
      }
      return `${SITE_ORIGIN}${pathname}${resolved.hash}`;
    }
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
