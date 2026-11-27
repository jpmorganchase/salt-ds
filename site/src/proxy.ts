import {
  loadSnapshotRoutes,
  resolveContent,
  resolveMosaicMode,
} from "@jpmorganchase/mosaic-site-middleware";
import { type NextRequest, NextResponse } from "next/server";
import legacyDocumentationRoutes from "./lib/legacyDocumentationRoutes.json";
import { getMarkdownRoute } from "./lib/markdownRoutes";

let knownSnapshotRoutes:
  | {
      inventory: Awaited<ReturnType<typeof loadSnapshotRoutes>>;
      paths: Set<string>;
    }
  | undefined;

async function snapshotRouteExists(pathname: string) {
  const inventory = await loadSnapshotRoutes();
  if (knownSnapshotRoutes?.inventory !== inventory) {
    knownSnapshotRoutes = {
      inventory,
      paths: new Set(inventory.routes.map((route) => route.pathname)),
    };
  }
  return knownSnapshotRoutes.paths.has(pathname);
}

export async function proxy(request: NextRequest) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return NextResponse.next();
  }

  try {
    const pathname = decodeURIComponent(request.nextUrl.pathname);
    const markdownRoute = getMarkdownRoute(pathname);
    if (markdownRoute) {
      const destination = request.nextUrl.clone();
      destination.pathname = `/api/llms${markdownRoute}`;
      return NextResponse.rewrite(destination);
    }

    const [, section, page] = pathname.split("/");
    const legacy = legacyDocumentationRoutes.includes(section);
    if (!page && !legacy) {
      return NextResponse.next();
    }

    // Proxy runs before the legacy rewrites in next.config.js.
    const { mode, contentUrl } = resolveMosaicMode();
    if (mode === "snapshot-file") {
      try {
        // Most document requests are known from the completed snapshot. Avoid
        // parsing MDX and shared config just to check that they exist.
        const publicPath = legacy
          ? `/salt${request.nextUrl.pathname}`
          : request.nextUrl.pathname;
        if (await snapshotRouteExists(publicPath)) {
          return NextResponse.next();
        }
      } catch {
        // Legacy or incomplete snapshots retain the content resolver fallback.
      }
    }
    const result = await resolveContent(
      legacy ? `/salt${pathname}` : pathname,
      mode,
      contentUrl,
    );
    if (result.kind === "not-found") {
      // Next.js #62228 sends an empty HTML shell when a matched page calls
      // notFound(). The built-in 404 route already has server-rendered HTML.
      // In development, /_not-found is only reached when no app route
      // matches it, so there must be no page for a single path segment.
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
