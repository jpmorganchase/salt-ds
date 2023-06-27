import {
  KeyboardEvent,
  RefObject,
  SyntheticEvent,
  useCallback,
  useMemo,
  useState,
} from "react";
import { useControlled } from "@salt-ds/core";

interface UseListProps {
  /* Value for the uncontrolled version. */
  selected?: string;
  /* Initial value for the uncontrolled version. */
  defaultSelected?: string;
  /* Callback for the controlled version. */
  onChange?: (e: SyntheticEvent, data: { value: string }) => void;
  id?: string;
  ref: RefObject<HTMLUListElement>;
}

export const useList = ({
  selected: selectedProp,
  defaultSelected,
  onChange,
  id,
  ref: listRef,
}: UseListProps) => {
  const [activeDescendant, setActiveDescendant] = useState<string | undefined>(
    undefined
  );
  const [showFocusRing, setShowFocusRing] = useState<boolean>(true);
  const [selectedItem, setSelectedItem] = useControlled({
    controlled: selectedProp,
    default: defaultSelected,
    name: "ListNext",
    state: "selected",
  });

  const getOptions = () => {
    return Array.from(
      listRef.current?.querySelectorAll(
        '[role="option"]:not([aria-disabled])'
      ) ?? []
    );
  };

  const updateScroll = useCallback(
    (currentTarget: Element) => {
      const list = listRef.current;
      if (!list || !currentTarget) return;
      const { offsetTop, offsetHeight } = currentTarget as HTMLLIElement;
      const listHeight = list?.clientHeight;
      const listScrollTop = list?.scrollTop;
      if (offsetTop < listScrollTop) {
        list.scrollTop = offsetTop;
      } else if (offsetTop + offsetHeight > listScrollTop + listHeight) {
        list.scrollTop = offsetTop + offsetHeight - listHeight;
      }
    },
    [listRef]
  );

  const updateActiveDescendant = useCallback(
    (element: Element) => {
      setActiveDescendant(element.id);
      updateScroll(element);
    },
    [setActiveDescendant, updateScroll]
  );
  const selectItem = useCallback(
    (element: Element) => {
      const newValue = element?.dataset.value;
      if (newValue) {
        setSelectedItem(newValue);
        updateActiveDescendant(element);
      }
    },
    [setSelectedItem, updateActiveDescendant]
  );

  const focusAndMoveActive = (element: Element) => {
    setShowFocusRing(true);
    updateActiveDescendant(element);
  };

  const focusFirstItem = () => {
    // Find first active item
    const activeOptions = getOptions();
    const firstItem = activeOptions[0];
    if (firstItem) {
      focusAndMoveActive(firstItem);
    }
  };
  const focusLastItem = () => {
    // Find last active item
    const activeOptions = getOptions();
    const lastItem = activeOptions[activeOptions.length - 1];
    if (lastItem) {
      focusAndMoveActive(lastItem);
      updateScroll(lastItem);
    }
  };

  const findNextOption = (
    currentOption: Element | null,
    moves: number
  ): Element => {
    const activeOptions = getOptions();
    // Returns next item, if no current option it will return 0
    const nextOptionIndex = currentOption
      ? activeOptions.indexOf(currentOption) + moves
      : 0;
    return (
      activeOptions[nextOptionIndex] || activeOptions[activeOptions.length - 1]
    );
  };

  const findPreviousOption = (
    currentOption: Element,
    moves: number
  ): Element => {
    // Return the previous option if it exists; otherwise, returns first option
    const activeOptions = getOptions();
    const currentOptionIndex = activeOptions.findIndex(
      (i) => i.id === currentOption.id
    );
    return activeOptions[currentOptionIndex - moves] || activeOptions[0];
  };

  // CONTEXT CALLBACKS
  const select = useCallback(
    (event: SyntheticEvent<HTMLLIElement>) => {
      const newValue = event.currentTarget.dataset.value;
      if (event.type === "click") {
        setShowFocusRing(false);
      }
      const activeOptions = getOptions();
      const isActiveOption =
        activeOptions.findIndex((i) => i.id === event.currentTarget.id) !== -1;
      if (newValue && selectedItem !== newValue && isActiveOption) {
        selectItem(event.currentTarget);
        onChange?.(event, { value: newValue });
      }
    },
    [selectItem, selectedItem, onChange, getOptions]
  );

  const isSelected = useCallback(
    (id: string) => selectedItem === id,
    [selectedItem]
  );

  const isFocused = useCallback(
    (id: string | undefined) => activeDescendant === id && showFocusRing,
    [activeDescendant, showFocusRing]
  );

  // HANDLERS
  const handleBlur = () => {
    setShowFocusRing(false);
  };

  const handleMouseDown = () => {
    // When list gets focused, we can't guarantee that focus happens after click event.
    // If first focus (where !activeDescendant) happens from a click, list shouldn't render focus ring in the first element.
    setShowFocusRing(false);
  };

  // takes care of focus when using keyboard navigation
  const handleFocus = () => {
    const activeElement =
      activeDescendant && document.getElementById(activeDescendant);
    if (activeElement) {
      focusAndMoveActive(activeElement);
    } else if (showFocusRing) {
      // Focus on first active option if no option was previously focused
      focusFirstItem();
    }
  };

  // takes care of keydown when using keyboard navigation
  const handleKeyDown = (event: KeyboardEvent) => {
    const { key } = event;
    const activeOptions = getOptions();
    const currentItem =
      (activeDescendant && document.getElementById(activeDescendant)) ||
      activeOptions[0];
    let nextItem = currentItem;
    if (!currentItem) {
      return;
    }
    setShowFocusRing(true);
    switch (key) {
      // TODO: since we are getting rid of displayItemCount. should we do this with height?
      // case "PageUp":
      // case "PageDown":
      //   nextItem =
      //     key === "PageUp"
      //       ? findPreviousOption(currentItem, displayedItemCount)
      //       : findNextOption(currentItem, displayedItemCount);
      //
      //   if (nextItem && nextItem !== currentItem) {
      //     event.preventDefault();
      //     focusAndMoveActive(nextItem);
      //   }
      //   break;
      case "ArrowUp":
      case "ArrowDown":
        nextItem =
          key === "ArrowUp"
            ? findPreviousOption(currentItem, 1)
            : findNextOption(currentItem, 1);

        if (nextItem && nextItem !== currentItem) {
          event.preventDefault();
          focusAndMoveActive(nextItem);
        }
        break;
      case "Home":
        event.preventDefault();
        focusFirstItem();
        break;
      case "End":
        event.preventDefault();
        focusLastItem();
        break;
      case " ":
      case "Enter":
        event.preventDefault();
        selectItem(nextItem);
        break;
      default:
        break;
    }
  };

  // CONTEXT
  const contextValue = useMemo(
    () => ({
      id,
      select,
      isSelected,
      isFocused,
    }),
    [id, select, isSelected, isFocused]
  );

  return {
    handleFocus,
    handleKeyDown,
    handleBlur,
    handleMouseDown,
    activeDescendant,
    contextValue,
  };
};
