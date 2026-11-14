import { useIsomorphicLayoutEffect } from "@salt-ds/core";
import { type RefObject, useState } from "react";

type LabelRoot = Document | ShadowRoot;

interface LabelObserver {
  observer: MutationObserver;
  listeners: Set<() => void>;
}

// Share one observer between ranges in the same document or shadow root.
const labelObservers = new WeakMap<LabelRoot, LabelObserver>();

function subscribeToLabelChanges(root: LabelRoot, listener: () => void) {
  let subscription = labelObservers.get(root);
  if (!subscription) {
    const ownerDocument =
      root.nodeType === 9 ? (root as Document) : root.ownerDocument;
    const Observer = ownerDocument?.defaultView?.MutationObserver;
    if (!Observer) {
      return;
    }

    const listeners = new Set<() => void>();
    const observer = new Observer((mutations) => {
      // Text changes cannot make an ID reference appear or disappear.
      if (
        !mutations.some(
          (mutation) =>
            mutation.type === "attributes" ||
            [...mutation.addedNodes, ...mutation.removedNodes].some(
              (node) => node.nodeType === 1,
            ),
        )
      ) {
        return;
      }
      for (const notify of listeners) {
        notify();
      }
    });
    observer.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["id"],
    });
    subscription = { observer, listeners };
    labelObservers.set(root, subscription);
  }

  subscription.listeners.add(listener);
  return () => {
    subscription.listeners.delete(listener);
    if (subscription.listeners.size === 0) {
      subscription.observer.disconnect();
      labelObservers.delete(root);
    }
  };
}

/**
 * An ID reference alone does not establish that a label is rendered. Preserve
 * the fallback during server rendering and hydration until a target is found.
 */
export function useHasResolvedLabel(
  inputRef: RefObject<HTMLInputElement | null>,
  labelledBy: string | undefined,
  enabled: boolean,
) {
  const [resolved, setResolved] = useState({ labelledBy, hasLabel: false });

  useIsomorphicLayoutEffect(() => {
    const input = inputRef.current;
    const ids = labelledBy?.split(/\s+/).filter(Boolean) ?? [];
    if (!enabled || !input || ids.length === 0) {
      setResolved((previous) =>
        previous.labelledBy === labelledBy && !previous.hasLabel
          ? previous
          : { labelledBy, hasLabel: false },
      );
      return;
    }

    let active = true;
    let observedRoot: LabelRoot | undefined;
    let unsubscribe: (() => void) | undefined;
    const update = () => {
      if (!active) {
        return;
      }
      const rootNode = input.getRootNode();
      const root =
        rootNode.nodeType === 11 && "host" in rootNode
          ? (rootNode as ShadowRoot)
          : input.ownerDocument;
      if (root !== observedRoot) {
        unsubscribe?.();
        observedRoot = root;
        unsubscribe = subscribeToLabelChanges(root, update);
      }
      const hasLabel = ids.some((id) => root.getElementById(id) !== null);
      setResolved((previous) =>
        previous.labelledBy === labelledBy && previous.hasLabel === hasLabel
          ? previous
          : { labelledBy, hasLabel },
      );
    };
    update();
    // A portal parent can attach its host after this child's layout effect.
    queueMicrotask(update);
    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [enabled, inputRef, labelledBy]);

  return enabled && resolved.labelledBy === labelledBy && resolved.hasLabel;
}
