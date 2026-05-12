import { type MutableRefObject, type RefObject, useEffect } from "react";
import { isHTMLElement } from "../utils/domUtils";

interface UseTabListRecoveryArgs {
  removalVersion: number;
  targetWindow: Window | null | undefined;
  tabstripRef: RefObject<HTMLDivElement | null>;
  overflowListRef: RefObject<HTMLDivElement | null>;
  handleTabRemoval: () => void;
  pendingRemovalRecoveryRef: MutableRefObject<boolean>;
  pendingRemovalRecoveryRetriesRef: MutableRefObject<number>;
}

export function useTabListRecovery({
  removalVersion,
  targetWindow,
  tabstripRef,
  overflowListRef,
  handleTabRemoval,
  pendingRemovalRecoveryRef,
  pendingRemovalRecoveryRetriesRef,
}: UseTabListRecoveryArgs) {
  useEffect(() => {
    if (removalVersion < 1) {
      return;
    }

    pendingRemovalRecoveryRef.current = true;
    pendingRemovalRecoveryRetriesRef.current = 0;

    const raf = targetWindow?.requestAnimationFrame(() => {
      handleTabRemoval();
    });

    return () => {
      if (raf != null) {
        targetWindow?.cancelAnimationFrame(raf);
      }
    };
  }, [
    handleTabRemoval,
    pendingRemovalRecoveryRef,
    pendingRemovalRecoveryRetriesRef,
    removalVersion,
    targetWindow,
  ]);

  useEffect(() => {
    const isInTabList = (node: HTMLElement | null) => {
      if (!node) {
        return false;
      }

      return (
        (tabstripRef.current?.contains(node) ?? false) ||
        (overflowListRef.current?.contains(node) ?? false)
      );
    };

    const handleFocusOut = (event: FocusEvent) => {
      if (!pendingRemovalRecoveryRef.current) {
        return;
      }

      const wasInTabList =
        isHTMLElement(event.target) && isInTabList(event.target);
      const stillInTabList =
        isHTMLElement(event.relatedTarget) && isInTabList(event.relatedTarget);

      if (wasInTabList && !stillInTabList) {
        if (targetWindow?.requestAnimationFrame) {
          targetWindow.requestAnimationFrame(() => handleTabRemoval());
        } else {
          queueMicrotask(() => handleTabRemoval());
        }
      }
    };

    targetWindow?.document.addEventListener("focusout", handleFocusOut, true);

    return () => {
      targetWindow?.document.removeEventListener(
        "focusout",
        handleFocusOut,
        true,
      );
    };
  }, [
    handleTabRemoval,
    overflowListRef,
    pendingRemovalRecoveryRef,
    tabstripRef,
    targetWindow,
  ]);
}
