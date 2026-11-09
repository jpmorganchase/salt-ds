import {
  resolveContent,
  resolveMosaicMode,
} from "@jpmorganchase/mosaic-site-middleware";
import { type NextRequest, NextResponse } from "next/server";
import legacyDocumentationRoutes from "./lib/legacyDocumentationRoutes.json";

export async function proxy(request: NextRequest) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return NextResponse.next();
  }

  try {
    const pathname = decodeURIComponent(request.nextUrl.pathname);
    const [, section, page] = pathname.split("/");
    const legacy = legacyDocumentationRoutes.includes(section);
    if (!page && !legacy) return NextResponse.next();

    // Proxy runs before the legacy rewrites in next.config.js.
    const { mode, contentUrl } = resolveMosaicMode();
    const result = await resolveContent(
      legacy ? `/salt${pathname}` : pathname,
      mode,
      contentUrl,
    );
    if (result.kind === "not-found") {
      // Next.js #62228 sends an empty HTML shell when a matched page calls
      // notFound(). The built-in 404 route already has server-rendered HTML.
      return NextResponse.rewrite(new URL("/_not-found", request.url), {
        status: 404,
      });
    }
  } catch {
    // Let the page handle malformed URLs and content service failures.
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/((?!api(?:/|$)|_next(?:/|$)|img(?:/|$)|example-data(?:/|$)).+)",
};
