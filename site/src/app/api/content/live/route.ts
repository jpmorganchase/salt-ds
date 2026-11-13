import { subscribeContentChanged } from "../../../../lib/liveReloadBus";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request: Request): Response {
  if (process.env.NODE_ENV !== "development") {
    return new Response("Not found", { status: 404 });
  }

  const encoder = new TextEncoder();
  let cleanup: (() => void) | undefined;
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (data: string) => controller.enqueue(encoder.encode(data));
      send(": connected\n\n");
      const unsubscribe = subscribeContentChanged(() => {
        send("event: content-changed\ndata: 1\n\n");
      });
      const keepalive = setInterval(() => send(": keepalive\n\n"), 15_000);
      const abort = () => {
        cleanup?.();
        controller.close();
      };
      cleanup = () => {
        clearInterval(keepalive);
        unsubscribe();
        request.signal.removeEventListener("abort", abort);
        cleanup = undefined;
      };
      request.signal.addEventListener("abort", abort, { once: true });
      if (request.signal.aborted) abort();
    },
    cancel() {
      cleanup?.();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
