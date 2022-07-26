import { KeyboardEvent, useCallback, useRef } from "react";
import {
  closestListItemIndex,
  ListHandlers,
  SelectionStrategy,
  useCollapsibleGroups,
  useKeyboardNavigation,
  useSelection,
  useViewportTracking,
} from "../common-hooks";
import { ListControlProps } from "../list/listTypes";
import { TreeHookProps, TreeHookResult } from "./treeTypes";
import { useKeyboardNavigation as useTreeNavigation } from "./use-tree-keyboard-navigation";

export const useTree = <Item, Selection extends SelectionStrategy = "default">({
  collectionHook,
  containerRef,
  contentRef = containerRef,
  defaultSelected,
  disabled,
  groupSelection,
  onSelect,
  onSelectionChange,
  onToggle,
  onHighlight: onHighlightProp,
  selected: selectedProp,
  selectionStrategy,
}: // totalItemCount,
TreeHookProps<Item, Selection>): TreeHookResult<Item, Selection> => {
  const lastSelection = useRef(selectedProp || defaultSelected);

  const handleKeyboardNavigation = (evt: KeyboardEvent, nextIdx: number) => {
    selectionHook.listHandlers.onKeyboardNavigation?.(evt, nextIdx);
  };

  const { highlightedIndex: highlightedIdx, ...keyboardHook } =
    useKeyboardNavigation<Item, Selection>({
      indexPositions: collectionHook.data,
      onHighlight: onHighlightProp,
      onKeyboardNavigation: handleKeyboardNavigation,
      selected: lastSelection.current,
    });

  const collapsibleHook = useCollapsibleGroups<Item>({
    collapsibleHeaders: true,
    collectionHook,
    highlightedIdx,
    onToggle,
  });

  const selectionHook = useSelection({
    defaultSelected,
    // groupSelection,
    highlightedIdx,
    indexPositions: collectionHook.data,
    onSelect,
    onSelectionChange,
    selected: selectedProp,
    selectionStrategy: selectionStrategy,
  });

  const treeNavigationHook = useTreeNavigation<Item>({
    collectionHook,
    highlightedIdx,
    highlightItemAtIndex: keyboardHook.setHighlightedIndex,
  });

  const handleClick = useCallback(
    (evt) => {
      collapsibleHook?.onClick?.(evt);
      if (!evt.defaultPrevented) {
        selectionHook.listHandlers.onClick?.(evt);
      }
    },
    [collapsibleHook, selectionHook]
  );

  const handleKeyDown = useCallback(
    (evt) => {
      keyboardHook.listProps.onKeyDown?.(evt);
      if (!evt.defaultPrevented) {
        selectionHook.listHandlers.onKeyDown?.(evt);
      }
      if (!evt.defaultPrevented) {
        collapsibleHook?.onKeyDown?.(evt);
      }
      if (!evt.defaultPrevented) {
        treeNavigationHook.listHandlers.onKeyDown?.(evt);
      }
    },
    [
      collapsibleHook.onClick,
      collapsibleHook.onKeyDown,
      keyboardHook.listProps,
      selectionHook.listHandlers,
      treeNavigationHook.listHandlers,
    ]
  );

  // This is only appropriate whan we are directly controlling a List,
  // not when a control is manipulating the list
  const { isScrolling, scrollIntoView } = useViewportTracking({
    containerRef,
    contentRef,
    highlightedIdx,
    indexPositions: collectionHook.data,
  });

  const handleMouseMove = useCallback(
    (evt: React.MouseEvent) => {
      if (!isScrolling.current && !disabled) {
        keyboardHook.listProps.onMouseMove();
        const idx = closestListItemIndex(evt.target as HTMLElement);
        if (idx !== undefined && idx !== highlightedIdx) {
          const item = collectionHook.data[idx];
          if (item.disabled) {
            keyboardHook.setHighlightedIndex(-1);
          } else {
            keyboardHook.setHighlightedIndex(idx);
          }
        }
      }
    },
    [
      collectionHook.data,
      disabled,
      keyboardHook.setHighlightedIndex,
      highlightedIdx,
      isScrolling,
    ]
  );

  const getActiveDescendant = () =>
    highlightedIdx === undefined || highlightedIdx === -1
      ? undefined
      : collectionHook.data[highlightedIdx]?.id;

  // We need this on reEntry for navigation hook to handle focus
  lastSelection.current = selectionHook.selected;

  const listProps: ListControlProps = {
    "aria-activedescendant": getActiveDescendant(),
    onBlur: keyboardHook.listProps.onBlur,
    onFocus: keyboardHook.listProps.onFocus,
    onKeyDown: handleKeyDown,
    onMouseDownCapture: keyboardHook.listProps.onMouseDownCapture,
    onMouseLeave: keyboardHook.listProps.onMouseLeave,
  };

  const listHandlers: ListHandlers = /*listHandlersProp || */ {
    onClick: handleClick,
    // MouseEnter would be much better for this. There is a bug in Cypress
    // wheby it emits spurious MouseEnter (and MouseOver) events around
    // keypress events, which break many tests.
    onMouseMove: handleMouseMove,
  };

  const listItemHandlers = {
    onClick: handleClick,
  };

  return {
    focusVisible: keyboardHook.focusVisible,
    highlightedIdx,
    highlightItemAtIndex: keyboardHook.setHighlightedIndex,
    listHandlers,
    listProps,
    listItemHandlers,
    selected: selectionHook.selected,
    setSelected: selectionHook.setSelected,
  };
};
