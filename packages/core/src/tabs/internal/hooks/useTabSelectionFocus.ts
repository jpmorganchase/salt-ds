import { computeAccessibleName } from "dom-accessibility-api";
import type { MutableRefObject } from "react";
import { useCallback } from "react";
import {
  useEventCallback,
  useIsomorphicLayoutEffect,
  usePrevious,
} from "../../../utils";
import type { TabsContextValue } from "../contexts/TabsContext";

function hasLostDocumentFocus(doc: Document) {
  const activeElement = doc.activeElement;
  return (
    !activeElement ||
    activeElement === doc.body ||
    activeElement === doc.documentElement ||
    !activeElement.isConnected
  );
}

function getTabAccessibleName(element: HTMLElement) {
  return computeAccessibleName(element).trim();
}

interface UseTabSelectionFocusArgs {
  announce: (message: string, timeout?: number) => void;
  canRecoverRemovalFocus: () => boolean;
  focusElementWithRetry: (
    getElement: () => HTMLElement | null | undefined,
  ) => void;
  getRenderedTab: TabsContextValue["getRenderedTab"];
  getSelectedTabElement: () => HTMLElement | null | undefined;
  menuOpen: boolean;
  resolvedOverflowActiveValue: string | null;
  selected?: string;
  selectionFromOverflowValueRef: MutableRefObject<string | null>;
  targetWindow: Window | null | undefined;
}

export function useTabSelectionFocus({
  announce,
  canRecoverRemovalFocus,
  focusElementWithRetry,
  getRenderedTab,
  getSelectedTabElement,
  menuOpen,
  resolvedOverflowActiveValue,
  selected,
  selectionFromOverflowValueRef,
  targetWindow,
}: UseTabSelectionFocusArgs) {
  const previousSelected = usePrevious(selected, [selected]);

  const focusSelectedTab = useCallback(() => {
    focusElementWithRetry(getSelectedTabElement);
  }, [focusElementWithRetry, getSelectedTabElement]);

  // Read through a stable callback so registry updates (e.g. a tab being
  // removed) don't re-run the effect below and pull focus back to the active
  // overflow tab, which would override removal focus recovery.
  const getRenderedTrigger = useEventCallback(
    (value: string) => getRenderedTab(value)?.trigger,
  );

  useIsomorphicLayoutEffect(() => {
    if (!menuOpen || !resolvedOverflowActiveValue) {
      return;
    }

    focusElementWithRetry(() =>
      getRenderedTrigger(resolvedOverflowActiveValue),
    );
  }, [
    focusElementWithRetry,
    getRenderedTrigger,
    menuOpen,
    resolvedOverflowActiveValue,
  ]);

  useIsomorphicLayoutEffect(() => {
    const doc = targetWindow?.document;
    if (
      !doc ||
      selected === undefined ||
      previousSelected === undefined ||
      selected === previousSelected
    ) {
      return;
    }

    if (!hasLostDocumentFocus(doc)) {
      return;
    }

    // Replacing a removed selection doesn't imply that the tabs lost focus.
    // Preserve ordinary selection focus behavior while leaving externally
    // removed tabs alone when focus was already on the body.
    if (
      !getRenderedTrigger(previousSelected)?.isConnected &&
      !canRecoverRemovalFocus()
    ) {
      return;
    }

    focusSelectedTab();
  }, [
    canRecoverRemovalFocus,
    focusSelectedTab,
    getRenderedTrigger,
    previousSelected,
    selected,
    targetWindow,
  ]);

  useIsomorphicLayoutEffect(() => {
    const selectedFromOverflow = selectionFromOverflowValueRef.current;
    if (
      selectedFromOverflow == null ||
      selected === undefined ||
      selected === previousSelected
    ) {
      return;
    }

    if (selected !== selectedFromOverflow) {
      selectionFromOverflowValueRef.current = null;
      return;
    }

    focusSelectedTab();

    const selectedTab = getSelectedTabElement();
    const selectedTabName = selectedTab
      ? getTabAccessibleName(selectedTab) || selected
      : selected;

    announce(`${selectedTabName} moved to main tab list`, 100);
    selectionFromOverflowValueRef.current = null;
  }, [
    announce,
    getSelectedTabElement,
    previousSelected,
    focusSelectedTab,
    selected,
    selectionFromOverflowValueRef,
  ]);
}
