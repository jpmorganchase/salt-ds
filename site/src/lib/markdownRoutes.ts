import legacyDocumentationRoutes from "./legacyDocumentationRoutes.json";

function prefersMarkdown(accept: string | null) {
  let markdown = 0;
  let html: number | undefined;
  let textWildcard: number | undefined;
  let wildcard = 0;
  for (const range of (accept ?? "").toLowerCase().split(",")) {
    const [type, ...parameters] = range.trim().split(";");
    const quality = parameters.find((parameter) =>
      parameter.trim().startsWith("q="),
    );
    const weight = quality ? Number(quality.trim().slice(2)) : 1;
    if (!Number.isFinite(weight) || weight < 0 || weight > 1) continue;
    if (type.trim() === "text/markdown") markdown = weight;
    if (type.trim() === "text/html") html = weight;
    if (type.trim() === "text/*") textWildcard = weight;
    if (type.trim() === "*/*") wildcard = weight;
  }
  return markdown > 0 && markdown >= (html ?? textWildcard ?? wildcard);
}

/** The content path used by Mosaic's Markdown handler, before HTML resolution. */
export function getMarkdownRoute(pathname: string, accept: string | null) {
  if (pathname === "/llms.txt" || pathname === "/llms-full.txt") {
    return pathname;
  }

  const explicitMarkdown = /\.md$/i.test(pathname);
  if (!explicitMarkdown) {
    if (!prefersMarkdown(accept) || /\/[^/]*\.[^/]*$/.test(pathname)) {
      return undefined;
    }
  }

  const route = pathname.replace(/\.md$/i, "").replace(/\/+$/, "");
  if (route === "" || route === "/salt") return "/salt/index";
  const [, section] = route.split("/");
  return legacyDocumentationRoutes.includes(section) ? `/salt${route}` : route;
}
