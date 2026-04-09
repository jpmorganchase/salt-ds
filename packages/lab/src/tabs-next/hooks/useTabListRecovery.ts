import { type MutableRefObject, type RefObject, useEffect } from "react";

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

    const raf = requestAnimationFrame(() => {
      handleTabRemoval();
    });

    return () => {
      cancelAnimationFrame(raf);
    };
  }, [
    handleTabRemoval,
    pendingRemovalRecoveryRef,
    pendingRemovalRecoveryRetriesRef,
    removalVersion,
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
        event.target instanceof HTMLElement && isInTabList(event.target);
      const stillInTabList =
        event.relatedTarget instanceof HTMLElement &&
        isInTabList(event.relatedTarget);

      if (wasInTabList && !stillInTabList) {
        requestAnimationFrame(() => handleTabRemoval());
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
