import { timingSafeEqual } from "node:crypto";
import { MOSAIC_CONTENT_CACHE_TAG } from "@jpmorganchase/mosaic-site-middleware/cache-tags";
import { revalidateTag } from "next/cache";
import { notifyContentChanged } from "../../../lib/liveReloadBus";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** The deployed site reads an immutable snapshot; only local authoring refreshes. */
export function POST(request: Request): Response {
  if (process.env.NODE_ENV !== "development") {
    return new Response("Not found", { status: 404 });
  }

  const configured = process.env.MOSAIC_REVALIDATE_SECRET;
  if (!configured) {
    return Response.json({ ok: false }, { status: 503 });
  }
  const provided = request.headers.get("x-mosaic-revalidate-secret");
  const expectedBytes = Buffer.from(configured);
  const providedBytes = Buffer.from(provided ?? "");
  if (
    expectedBytes.length !== providedBytes.length ||
    !timingSafeEqual(expectedBytes, providedBytes)
  ) {
    return Response.json({ ok: false }, { status: 401 });
  }

  revalidateTag(MOSAIC_CONTENT_CACHE_TAG, { expire: 0 });
  notifyContentChanged();
  return Response.json({ ok: true });
}
