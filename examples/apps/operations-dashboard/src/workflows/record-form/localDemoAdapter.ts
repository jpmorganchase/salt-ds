import type { RecordDraft } from "./types";

export interface LocalDemoAdapter {
  submit(draft: RecordDraft): Promise<RecordDraft>;
}

const delay = (milliseconds: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, milliseconds);
  });

/**
 * Simulates a local save only. The first save fails so the example can
 * demonstrate retained input and an explicit retry.
 */
export function createLocalDemoAdapter(): LocalDemoAdapter {
  let failedOnce = false;

  return {
    async submit(draft) {
      await delay(1500);
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
