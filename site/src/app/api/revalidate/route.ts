import { createRevalidateHandler } from "@jpmorganchase/mosaic-site-middleware/revalidate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const revalidate = createRevalidateHandler({
  getSecret: () => ({ secret: process.env.MOSAIC_REVALIDATE_SECRET }),
});

/** Production reads immutable snapshots; only local authoring can invalidate. */
export function POST(request: Request): Promise<Response> {
  if (process.env.NODE_ENV !== "development") {
    return Promise.resolve(new Response("Not found", { status: 404 }));
  }
  return revalidate(request);
}
