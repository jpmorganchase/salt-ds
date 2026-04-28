import type { KeyboardEvent } from "react";
import { useCallback } from "react";

type AdjacentDirection = "next" | "previous";
export type TriggerOpenIntent = "focus-first-item" | "preserve-trigger-focus";

interface UseMegaMenuTriggerKeyboardNavigationProps {
  isOpen: boolean;
  floating: HTMLElement | null;
  onOpenMenu: (intent: TriggerOpenIntent) => void;
  onMoveToAdjacentTrigger: (
    direction: AdjacentDirection,
    currentTarget: HTMLElement,
  ) => void;
}

const ADJACENT_TRIGGER_FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
const MENU_ENTRY_FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

const getAdjacentTrigger = (
  currentTarget: HTMLElement,
  direction: AdjacentDirection,
): HTMLElement | null => {
  const triggerListItem = currentTarget.closest("li");
  if (!triggerListItem) return null;

  const sibling =
    direction === "next"
      ? triggerListItem.nextElementSibling
      : triggerListItem.previousElementSibling;

  if (!(sibling instanceof HTMLElement)) return null;

  return sibling.querySelector<HTMLElement>(
    ADJACENT_TRIGGER_FOCUSABLE_SELECTOR,
  );
};

interface MoveFocusToAdjacentTriggerArgs {
  direction: AdjacentDirection;
  currentTarget: HTMLElement;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  setRequestFocusFirstItemOnOpen: (value: boolean) => void;
}

export const moveFocusToAdjacentTriggerAndSyncMenuState = ({
  direction,
  currentTarget,
  isOpen,
  setOpen,
  setRequestFocusFirstItemOnOpen,
}: MoveFocusToAdjacentTriggerArgs) => {
  const adjacentTrigger = getAdjacentTrigger(currentTarget, direction);

  if (!adjacentTrigger) {
    return;
  }

  if (isOpen) {
    setOpen(false);
  }

  setRequestFocusFirstItemOnOpen(false);
  adjacentTrigger.focus();
};

export const useMegaMenuTriggerKeyboardNavigation = ({
  isOpen,
  floating,
  onOpenMenu,
  onMoveToAdjacentTrigger,
}: UseMegaMenuTriggerKeyboardNavigationProps) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      const currentTarget = event.currentTarget;
      const isEnter = event.key === "Enter";
      const isSpace = event.key === " ";
      const isArrowDown = event.key === "ArrowDown";
      const isArrowRight = event.key === "ArrowRight";
      const isArrowLeft = event.key === "ArrowLeft";
      const isTab = event.key === "Tab" && !event.shiftKey;

      if (isArrowRight || isArrowLeft) {
        event.preventDefault();
        onMoveToAdjacentTrigger(
          isArrowRight ? "next" : "previous",
          currentTarget,
        );
        return;
      }

      if ((isEnter || isSpace) && !isOpen) {
        event.preventDefault();
        onOpenMenu("preserve-trigger-focus");
        return;
      }

      if (isArrowDown && !isOpen) {
        event.preventDefault();
        onOpenMenu("focus-first-item");
        return;
      }

      if (isTab && isOpen) {
        const firstFocusable = floating?.querySelector<HTMLElement>(
          MENU_ENTRY_FOCUSABLE_SELECTOR,
        );
        if (firstFocusable) {
          event.preventDefault();
          firstFocusable.focus();
        }
      }
    },
    [isOpen, floating, onOpenMenu, onMoveToAdjacentTrigger],
  );

  return { handleKeyDown };
};
