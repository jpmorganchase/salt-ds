import { useControlled } from "@jpmorganchase/uitk-core";
import { KeyboardEvent, MouseEvent, useCallback } from "react";

const defaultSelectionKeys = ["Enter", " "];

export const isTabElement = (el: HTMLElement): boolean =>
  el && el.matches('[class*="uitkTab "]');

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
  selected?: number;
}): {
  activateTab: (tabIndex: number) => void;
  isControlled: boolean;
  onClick: (evt: MouseEvent<Element>, tabIndex: number) => void;
  onKeyDown: (evt: KeyboardEvent) => void;
  selected: number;
} => {
  const [selected, setSelected, isControlled] = useControlled({
    controlled: selectedProp,
    default: defaultSelected ?? (selectedProp === undefined ? 0 : undefined),
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
