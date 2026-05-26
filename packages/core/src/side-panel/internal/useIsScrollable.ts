import { type RefObject, useEffect, useState } from "react";

const observedAttributes = ["class", "hidden", "style"];

export function useIsScrollable(ref: RefObject<HTMLElement>) {
  const [isScrollable, setIsScrollable] = useState(false);

  useEffect(() => {
    const element = ref.current;
    const win = element?.ownerDocument.defaultView;
    if (!element || !win) {
      return;
    }

    let animationFrame: number | undefined;

    const checkScrollable = () => {
      animationFrame = undefined;
      const nextIsScrollable =
        element.scrollHeight > element.clientHeight ||
        element.scrollWidth > element.clientWidth;

      setIsScrollable((currentIsScrollable) =>
        currentIsScrollable === nextIsScrollable
          ? currentIsScrollable
          : nextIsScrollable,
      );
    };

    const scheduleCheck = () => {
      if (animationFrame === undefined) {
        animationFrame = win.requestAnimationFrame(checkScrollable);
      }
    };

    scheduleCheck();

    const resizeObserver = win.ResizeObserver
      ? new win.ResizeObserver(scheduleCheck)
      : undefined;
    resizeObserver?.observe(element);

    const mutationObserver = win.MutationObserver
      ? new win.MutationObserver(scheduleCheck)
      : undefined;
    mutationObserver?.observe(element, {
      attributeFilter: observedAttributes,
      attributes: true,
      characterData: true,
      childList: true,
      subtree: true,
    });

    return () => {
      if (animationFrame !== undefined) {
        win.cancelAnimationFrame(animationFrame);
      }
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
    };
  }, [ref]);

  return isScrollable;
}
