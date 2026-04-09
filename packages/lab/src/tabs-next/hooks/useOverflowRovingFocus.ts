import { useIsomorphicLayoutEffect } from "@salt-ds/core";
import {
  type KeyboardEvent,
  type MutableRefObject,
  useCallback,
  useEffect,
  useState,
} from "react";

interface UseOverflowRovingFocusArgs {
  open: boolean;
  itemCount: number;
  listRef: MutableRefObject<HTMLButtonElement[]>;
}

interface OverflowRovingFocus {
  activeIndex: number | null;
  handleItemFocus: (index: number | null | undefined) => void;
  handleItemKeyDown: (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number | null | undefined,
  ) => void;
}

export function useOverflowRovingFocus({
  open,
  itemCount,
  listRef,
}: UseOverflowRovingFocusArgs): OverflowRovingFocus {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    const nextIndex = open && itemCount > 0 ? 0 : null;
    setActiveIndex((currentIndex) => {
      return currentIndex === nextIndex ? currentIndex : nextIndex;
    });
  }, [itemCount, open]);

  useIsomorphicLayoutEffect(() => {
    if (!open || activeIndex == null) {
      return;
    }

    // Focus after render so the newly active item already owns tabIndex=0.
    listRef.current[activeIndex]?.focus({ preventScroll: true });
  }, [activeIndex, listRef, open]);

  const handleItemFocus = useCallback((index: number | null | undefined) => {
    if (index == null) {
      return;
    }

    setActiveIndex((currentIndex) => {
      return currentIndex === index ? currentIndex : index;
    });
  }, []);

  const handleItemKeyDown = useCallback(
    (
      event: KeyboardEvent<HTMLButtonElement>,
      index: number | null | undefined,
    ) => {
      if (itemCount < 1) {
        return;
      }

      const currentIndex = index ?? activeIndex ?? 0;
      const lastIndex = itemCount - 1;
      let nextIndex: number | null = null;

      switch (event.key) {
        case "ArrowDown":
          nextIndex = currentIndex >= lastIndex ? 0 : currentIndex + 1;
          break;
        case "ArrowUp":
          nextIndex = currentIndex <= 0 ? lastIndex : currentIndex - 1;
          break;
        case "Home":
          nextIndex = 0;
          break;
        case "End":
          nextIndex = lastIndex;
          break;
      }

      if (nextIndex == null) {
        return;
      }

      event.preventDefault();
      setActiveIndex(nextIndex);
    },
    [activeIndex, itemCount],
  );

  return {
    activeIndex,
    handleItemFocus,
    handleItemKeyDown,
  };
}
