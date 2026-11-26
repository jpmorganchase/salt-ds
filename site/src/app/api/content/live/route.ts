import { createLiveReloadHandler } from "@jpmorganchase/mosaic-site-middleware/live-reload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = createLiveReloadHandler({
  isDevelopment: () => process.env.NODE_ENV === "development",
});
