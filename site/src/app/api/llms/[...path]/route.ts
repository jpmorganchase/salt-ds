import { createLlmsHandler } from "@jpmorganchase/mosaic-site-middleware";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Read the current content snapshot, or the local content server during authoring.
export const GET = createLlmsHandler();
