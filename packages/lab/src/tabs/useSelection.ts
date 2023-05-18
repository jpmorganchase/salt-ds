import { useControlled } from "@salt-ds/core";
import { KeyboardEvent, MouseEvent, useCallback } from "react";

const defaultSelectionKeys = ["Enter", " "];

export const isTabElement = (el: HTMLElement): boolean =>
  el && el.matches('[class*="saltTab "]');

// TODO use SelectionProps
export const useSelection = ({
  defaultSelected,
  highlightedIdx,
  onSelectionChange,
  selected: selectedProp,
}: {
  defaultSelected?: number;
  highlightedIdx: number;
  onSelectionChange?: (tabIndex: number) => void;
  selected?: number | null;
}): {
  activateTab: (tabIndex: number) => void;
  isControlled: boolean;
  onClick: (evt: MouseEvent<Element>, tabIndex: number) => void;
  onKeyDown: (evt: KeyboardEvent) => void;
  selected: number | null;
} => {
  const [selected, setSelected, isControlled] = useControlled({
    controlled: selectedProp,
    default: defaultSelected ?? 0,
    name: "Tabstrip",
    state: "value",
  });

  const isSelectionEvent = useCallback(
    (evt: KeyboardEvent) => defaultSelectionKeys.includes(evt.key),
    []
  );

  const selectItem = useCallback(
    (tabIndex: number) => {
      setSelected(tabIndex);
      onSelectionChange?.(tabIndex);
    },
    [onSelectionChange, setSelected]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const targetElement = e.target as HTMLElement;
      if (
        isSelectionEvent(e) &&
        highlightedIdx !== selected &&
        isTabElement(targetElement)
      ) {
        e.stopPropagation();
        e.preventDefault();
        selectItem(highlightedIdx);
      }
    },
    [isSelectionEvent, highlightedIdx, selected, selectItem]
  );

  const onClick = useCallback(
    (e: MouseEvent, tabIndex: number) => {
      if (tabIndex !== selected) {
        selectItem(tabIndex);
      }
    },
    [selectItem, selected]
  );

  return {
    activateTab: selectItem,
    isControlled,
    onClick,
    onKeyDown: handleKeyDown,
    selected,
  };
};
