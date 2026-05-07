import type { AnnounceFnOptions } from "./AriaAnnouncerContext";

type Announcer = (announcement: string, options?: AnnounceFnOptions) => void;

const registry = new Map<string, Announcer[]>();

export function registerAnnouncementTarget(
  target: string,
  announce: Announcer,
): () => void {
  const stack = registry.get(target) ?? [];
  stack.push(announce);
  registry.set(target, stack);

  return () => {
    const currentStack = registry.get(target);
    if (!currentStack) {
      return;
    }

    // Remove the most recent matching announcer first (LIFO nested providers).
    const index = currentStack.lastIndexOf(announce);
    if (index !== -1) {
      currentStack.splice(index, 1);
    }

    if (currentStack.length === 0) {
      registry.delete(target);
    } else {
      registry.set(target, currentStack);
    }
  };
}

export function getAnnouncementTarget(target: string): Announcer | undefined {
  const stack = registry.get(target);
  return stack?.[stack.length - 1];
}
