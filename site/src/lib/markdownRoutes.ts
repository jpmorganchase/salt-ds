import legacyDocumentationRoutes from "./legacyDocumentationRoutes.json";

/** The content path used by Mosaic's Markdown handler, before HTML resolution. */
export function getMarkdownRoute(pathname: string) {
  if (pathname === "/llms.txt" || pathname === "/llms-full.txt") {
    return pathname;
  }

  // Use distinct URLs: Next owns the HTML/RSC Vary header and cannot preserve
  // an additional Accept field for content negotiation in this version.
  if (!/\.md$/i.test(pathname)) return undefined;

  const route = pathname.replace(/\.md$/i, "").replace(/\/+$/, "");
  if (route === "" || route === "/salt") return "/salt/index";
  const [, section] = route.split("/");
  return legacyDocumentationRoutes.includes(section) ? `/salt${route}` : route;
}
