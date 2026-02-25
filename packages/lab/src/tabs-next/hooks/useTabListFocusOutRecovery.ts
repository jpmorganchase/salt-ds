import { type RefObject, useEffect } from "react";

interface UseTabListFocusOutRecoveryArgs {
  targetWindow: Window | null | undefined;
  tabstripRef: RefObject<HTMLDivElement | null>;
  overflowListRef: RefObject<HTMLDivElement | null>;
  handleTabRemoval: () => void;
}

export function useTabListFocusOutRecovery({
  targetWindow,
  tabstripRef,
  overflowListRef,
  handleTabRemoval,
}: UseTabListFocusOutRecoveryArgs) {
  useEffect(() => {
    const isInTabList = (node: HTMLElement | null) => {
      if (!node) return;

      return (
        (tabstripRef.current?.contains(node) ?? false) ||
        (overflowListRef.current?.contains(node) ?? false)
      );
    };

    const handleFocus = (event: FocusEvent) => {
      if (!tabstripRef.current) return;

      const wasInTablist =
        event.target instanceof HTMLElement && isInTabList(event.target);
      const stillInTablist =
        event.relatedTarget instanceof HTMLElement &&
        isInTabList(event.relatedTarget);

      if (wasInTablist && !stillInTablist) {
        requestAnimationFrame(() => handleTabRemoval());
      }
    };

    targetWindow?.document.addEventListener("focusout", handleFocus, true);

    return () => {
      targetWindow?.document.removeEventListener("focusout", handleFocus, true);
    };
  }, [targetWindow, handleTabRemoval, tabstripRef, overflowListRef]);
}
