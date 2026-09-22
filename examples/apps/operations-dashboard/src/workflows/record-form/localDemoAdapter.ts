import type { RecordDraft } from "./types";

export interface LocalDemoAdapter {
  submit(draft: RecordDraft, signal: AbortSignal): Promise<RecordDraft>;
}

const delay = (milliseconds: number, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(signal.reason);
      return;
    }
    const abort = () => {
      clearTimeout(timer);
      reject(signal.reason);
    };
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", abort);
      resolve();
    }, milliseconds);
    signal.addEventListener("abort", abort, { once: true });
  });

/**
 * Simulates a cancellable local save only. The first completed attempt fails
 * so the example can demonstrate retained input and an explicit retry.
 */
export function createLocalDemoAdapter(): LocalDemoAdapter {
  let failedOnce = false;

  return {
    async submit(draft, signal) {
      await delay(1500, signal);
      signal.throwIfAborted();
      if (!failedOnce) {
        failedOnce = true;
        throw new Error(
          "The local demo rejected this first save. Your details are still available; retry when ready.",
        );
      }
      return {
        title: draft.title.trim(),
        service: draft.service.trim(),
      };
    },
  };
}
