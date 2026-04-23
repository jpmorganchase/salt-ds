import { useIsomorphicLayoutEffect, usePrevious } from "@salt-ds/core";
import { computeAccessibleName } from "dom-accessibility-api";
import type { MutableRefObject } from "react";
import { useCallback } from "react";
import type { TabsNextContextValue } from "../TabsNextContext";

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
  focusElementWithRetry: (
    getElement: () => HTMLElement | null | undefined,
  ) => void;
  getRenderedTab: TabsNextContextValue["getRenderedTab"];
  getSelectedTabElement: () => HTMLElement | null | undefined;
  menuOpen: boolean;
  resolvedOverflowActiveValue: string | null;
  selected?: string;
  selectionFromOverflowValueRef: MutableRefObject<string | null>;
  targetWindow: Window | null | undefined;
}

export function useTabSelectionFocus({
  announce,
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

  useIsomorphicLayoutEffect(() => {
    if (!menuOpen || !resolvedOverflowActiveValue) {
      return;
    }

    focusElementWithRetry(
      () => getRenderedTab(resolvedOverflowActiveValue)?.trigger,
    );
  }, [
    focusElementWithRetry,
    getRenderedTab,
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

    focusSelectedTab();
  }, [focusSelectedTab, previousSelected, selected, targetWindow]);

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
