import {
  isValidElement,
  type KeyboardEvent,
  type MouseEvent,
  useCallback,
  useRef,
} from "react";
import {
  type CollectionItem,
  closestListItemIndex,
  type ListHandlers,
  type SelectHandler,
  type SelectionChangeHandler,
  type SelectionStrategy,
  type SingleSelectionStrategy,
  useCollapsibleGroups,
  useKeyboardNavigation,
  useSelection,
  useTypeahead,
  useViewportTracking,
} from "../common-hooks";

import type {
  ListControlProps,
  ListHookProps,
  ListHookResult,
} from "./listTypes";

export const useList = <Item, Selection extends SelectionStrategy = "default">({
  collapsibleHeaders,
  collectionHook: dataHook,
  containerRef,
  contentRef,
  defaultHighlightedIndex,
  defaultSelected,
  disabled,
  disableAriaActiveDescendant,
  disableHighlightOnFocus,
  disableTypeToSelect,
  highlightedIndex: highlightedIndexProp,
  label = "",
  listHandlers: listHandlersProp,
  onSelect,
  onSelectionChange,
  onHighlight,
  onKeyboardNavigation,
  onKeyDown,
  restoreLastFocus,
  selected,
  selectionStrategy,
  selectionKeys,
  stickyHeaders,
  tabToSelect,
}: ListHookProps<Item, Selection>): ListHookResult<Item, Selection> => {
  const lastSelection = useRef<typeof selected>(selected || defaultSelected);
  const handleKeyboardNavigation = (
    evt: KeyboardEvent<HTMLElement>,
    nextIndex: number,
  ) => {
    selectionHook.listHandlers.onKeyboardNavigation?.(evt, nextIndex);
    onKeyboardNavigation?.(evt, nextIndex);
  };

  // TODO where do these belong ?
  const handleSelect = useCallback<SelectHandler<CollectionItem<Item>>>(
    (evt, selectedItem) => {
      if (onSelect) {
        if (isValidElement(selectedItem.value)) {
          onSelect(evt, selectedItem.label as Item);
        } else if (selectedItem.value !== null) {
          onSelect(evt, selectedItem.value);
        }
      }
    },
    [onSelect],
  );

  const handleSelectionChange = useCallback<
    SelectionChangeHandler<CollectionItem<Item>, Selection>
  >(
    (evt, selected) => {
      if (onSelectionChange) {
        onSelectionChange(
          evt,
          (Array.isArray(selected)
            ? selected.map((s) => (isValidElement(s.value) ? s.label : s.value))
            : selected &&
              (isValidElement(selected.value)
                ? selected.label
                : selected.value)) as Selection extends SingleSelectionStrategy
            ? Item
            : Item[],
        );
      }
    },
    [onSelectionChange],
  );

  const {
    highlightedIndex,
    listProps: {
      onKeyDown: navigationKeyDown,
      onMouseMove: navigationMouseMove,
      ...navigationControlProps
    },
    setHighlightedIndex,
    ...keyboardHook
  } = useKeyboardNavigation<Item, Selection>({
    containerRef,
    defaultHighlightedIndex,
    disableHighlightOnFocus,
    highlightedIndex: highlightedIndexProp,
    indexPositions: dataHook.data,
    label,
    onHighlight,
    onKeyboardNavigation: handleKeyboardNavigation,
    restoreLastFocus,
    selected: lastSelection.current,
  });

  const collapsibleHook = useCollapsibleGroups({
    collapsibleHeaders,
    highlightedIdx: highlightedIndex,
    collectionHook: dataHook,
  });

  const selectionHook = useSelection<Item, Selection>({
    defaultSelected,
    highlightedIdx: highlightedIndex,
    indexPositions: dataHook.data,
    label,
    onSelect: handleSelect,
    onSelectionChange: handleSelectionChange,
    selected,
    selectionStrategy,
    selectionKeys,
    tabToSelect,
  });

  const { onKeyDown: typeaheadOnKeyDown } = useTypeahead<Item>({
    disableTypeToSelect,
    highlightedIdx: highlightedIndex,
    highlightItemAtIndex: setHighlightedIndex,
    typeToNavigate: true,
    items: dataHook.data,
  });

  const handleKeyDown = useCallback(
    (evt: KeyboardEvent<HTMLElement>) => {
      if (!evt.defaultPrevented) {
        typeaheadOnKeyDown?.(evt);
      }
      // We still let the keyboard navigation hook process the event even
      // if it has been handled by the typeahead hook. That is so it can
      // correctly manage the focusVisible state.
      navigationKeyDown(evt);
      if (!evt.defaultPrevented) {
        selectionHook.listHandlers.onKeyDown?.(evt);
      }
      if (!evt.defaultPrevented) {
        collapsibleHook?.onKeyDown?.(evt);
      }

      if (!evt.defaultPrevented) {
        onKeyDown?.(evt);
      }
    },
    [
      collapsibleHook,
      navigationKeyDown,
      onKeyDown,
      selectionHook.listHandlers,
      typeaheadOnKeyDown,
    ],
  );

  // This is only appropriate when we are directly controlling a List,
  // not when a control is manipulating the list
  const { isScrolling, scrollIntoView } = useViewportTracking({
    containerRef,
    contentRef,
    highlightedIdx: highlightedIndex,
    indexPositions: dataHook.data,
    stickyHeaders,
  });

  const handleMouseMove = useCallback(
    (evt: MouseEvent) => {
      if (!isScrolling.current && !disabled) {
        navigationMouseMove();
        const idx = closestListItemIndex(evt.target as HTMLElement);
        if (idx !== highlightedIndex) {
          const item = dataHook.data[idx];
          if (!item || item.disabled) {
            setHighlightedIndex(-1);
          } else {
            setHighlightedIndex(idx);
          }
        }
      }
    },
    [
      isScrolling,
      disabled,
      setHighlightedIndex,
      navigationMouseMove,
      highlightedIndex,
      dataHook.data,
    ],
  );

  const getActiveDescendant = () =>
    highlightedIndex === undefined ||
    highlightedIndex === -1 ||
    disableAriaActiveDescendant
      ? undefined
      : dataHook.data[highlightedIndex]?.id;

  // We need this on reEntry for navigation hook to handle focus
  lastSelection.current = selectionHook.selected;

  // controlProps ?
  const listControlProps: ListControlProps = {
    "aria-activedescendant": getActiveDescendant(),
    onBlur: navigationControlProps.onBlur,
    onFocus: navigationControlProps.onFocus,
    onKeyDown: handleKeyDown,
    onMouseDownCapture: navigationControlProps.onMouseDownCapture,
    onMouseLeave: navigationControlProps.onMouseLeave,
  };

  const listHandlers: ListHandlers = listHandlersProp || {
    onClick: selectionHook.listHandlers.onClick,
    // MouseEnter would be much better for this. There is a bug in Cypress
    // wheby it emits spurious MouseEnter (and MouseOver) events around
    // keypress events, which break many tests.
    onMouseMove: handleMouseMove,
  };

  return {
    focusVisible: keyboardHook.focusVisible,
    controlledHighlighting: keyboardHook.controlledHighlighting,
    highlightedIndex,
    keyboardNavigation: keyboardHook.keyboardNavigation,
    listHandlers,
    listItemHeaderHandlers: collapsibleHook,
    listControlProps,
    scrollIntoView,
    selected: selectionHook.selected,
    setHighlightedIndex,
    setIgnoreFocus: keyboardHook.setIgnoreFocus,
    setSelected: selectionHook.setSelected,
  };
};
