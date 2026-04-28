import type { KeyboardEvent } from "react";
import { useCallback, useEffect, useRef } from "react";

const MENU_ITEM_FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
const REGION_CONTAINER_SELECTOR =
  '.saltMegaMenuGroup, [data-salt-mega-menu-region="true"]';
const TRIGGER_TO_MENU_ENTRY_SELECTOR =
  '.saltMegaMenuItem, a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface UseMegaMenuKeyboardNavigationProps {
  isOpen: boolean;
  reference: HTMLElement | null;
  floating: HTMLElement | null;
  elementsRef: React.MutableRefObject<Array<HTMLElement | null>>;
  onFocusReference: () => void;
  onCloseAndFocusNext: (container: HTMLElement) => void;
}

const getRegionItems = (container: HTMLElement): HTMLElement[][] =>
  Array.from(container.querySelectorAll<HTMLElement>(REGION_CONTAINER_SELECTOR))
    .map((region) =>
      Array.from(
        region.querySelectorAll<HTMLElement>(MENU_ITEM_FOCUSABLE_SELECTOR),
      ),
    )
    .filter((items) => items.length > 0);

const getFocusableItems = (
  elementsRef: React.MutableRefObject<Array<HTMLElement | null>>,
): HTMLElement[] =>
  elementsRef.current.filter((item): item is HTMLElement => item != null);

/**
 * Hook for mega menu keyboard navigation.
 * Handles all keyboard events for menu item navigation, including:
 * - Arrow key navigation (up, down, left, right)
 * - Tab and Shift+Tab with boundary handling
 * - Focus management between trigger and items
 */
export const useMegaMenuKeyboardNavigation = ({
  isOpen,
  reference,
  floating,
  elementsRef,
  onFocusReference,
  onCloseAndFocusNext,
}: UseMegaMenuKeyboardNavigationProps) => {
  const containerRef = useRef<HTMLElement | null>(null);

  const handleArrowUp = useCallback(
    ({ focusedItemIndex }: { focusedItemIndex: number }) => {
      if (focusedItemIndex !== 0) {
        return;
      }

      onFocusReference();
    },
    [onFocusReference],
  );

  const handleHorizontalArrow = useCallback(
    ({
      container,
      focusedItem,
      focusedItemIndex,
      isBoundaryItem,
      direction,
    }: {
      container: HTMLElement;
      focusedItem: HTMLElement;
      focusedItemIndex: number;
      isBoundaryItem: boolean;
      direction: "left" | "right";
    }) => {
      if (focusedItemIndex === -1) {
        return;
      }

      if (direction === "left" && focusedItemIndex === 0) {
        onFocusReference();
        return;
      }

      if (direction === "right" && isBoundaryItem) {
        return;
      }

      const regions = getRegionItems(container);
      const regionIndex = regions.findIndex((region) =>
        region.includes(focusedItem),
      );
      const targetRegionIndex =
        direction === "left" ? regionIndex - 1 : regionIndex + 1;
      regions[targetRegionIndex]?.[0]?.focus();
    },
    [onFocusReference],
  );

  const handleTab = useCallback(
    ({
      focusedItemIndex,
      isFirstItem,
      isLastItem,
      items,
      direction,
    }: {
      focusedItemIndex: number;
      isFirstItem: boolean;
      isLastItem: boolean;
      items: HTMLElement[];
      direction: -1 | 1;
    }) => {
      if (focusedItemIndex === -1) {
        return;
      }

      if (direction === -1 && isFirstItem) {
        onFocusReference();
        return;
      }

      if (direction === 1 && isLastItem) {
        if (containerRef.current) {
          onCloseAndFocusNext(containerRef.current);
        }
        return;
      }

      items[focusedItemIndex + direction]?.focus();
    },
    [onCloseAndFocusNext, onFocusReference],
  );

  const handleContainerKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (!isOpen) return;

      const target = event.target as HTMLElement;
      containerRef.current = event.currentTarget;
      const container = event.currentTarget;
      const focusedItem = target.closest(
        MENU_ITEM_FOCUSABLE_SELECTOR,
      ) as HTMLElement | null;
      const items = getFocusableItems(elementsRef);
      const focusedItemIndex = focusedItem ? items.indexOf(focusedItem) : -1;
      const isFirstItem = focusedItemIndex === 0;
      const isLastItem = focusedItemIndex === items.length - 1;

      switch (event.key) {
        case "ArrowUp":
          if (focusedItemIndex === -1) return;
          event.preventDefault();
          handleArrowUp({ focusedItemIndex });
          return;

        case "ArrowDown":
          event.preventDefault();
          return;

        case "ArrowLeft":
          if (!focusedItem) return;
          event.preventDefault();
          handleHorizontalArrow({
            container,
            focusedItem,
            focusedItemIndex,
            isBoundaryItem: false,
            direction: "left",
          });
          return;

        case "ArrowRight":
          if (!focusedItem) return;
          event.preventDefault();
          handleHorizontalArrow({
            container,
            focusedItem,
            focusedItemIndex,
            isBoundaryItem: isLastItem,
            direction: "right",
          });
          return;

        case "Tab":
          event.preventDefault();
          handleTab({
            focusedItemIndex,
            isFirstItem,
            isLastItem,
            items,
            direction: event.shiftKey ? -1 : 1,
          });
          return;

        default:
          return;
      }
    },
    [elementsRef, handleArrowUp, handleHorizontalArrow, handleTab, isOpen],
  );

  useEffect(() => {
    if (!isOpen || !reference) return;

    const doc = reference.ownerDocument;

    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      const activeElement = doc.activeElement;
      if (!(activeElement instanceof HTMLElement)) return;
      if (!(reference === activeElement || reference.contains(activeElement))) {
        return;
      }
      if ((e.key === "Tab" && !e.shiftKey) || e.key === "ArrowDown") {
        if (floating) {
          const items = elementsRef.current.filter(
            (item): item is HTMLElement => item != null,
          );
          const firstFocusable =
            items[0] ??
            floating.querySelector<HTMLElement>(TRIGGER_TO_MENU_ENTRY_SELECTOR);
          if (firstFocusable) {
            e.preventDefault();
            e.stopImmediatePropagation();
            firstFocusable.focus();
          }
        }
      }
    };

    doc.addEventListener("keydown", onKeyDown, true);
    return () => doc.removeEventListener("keydown", onKeyDown, true);
  }, [isOpen, reference, floating, elementsRef]);

  return { handleContainerKeyDown };
};
