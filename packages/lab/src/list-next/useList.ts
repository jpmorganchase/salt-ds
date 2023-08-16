import {
  FocusEvent,
  KeyboardEvent,
  RefObject,
  SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useControlled, useIsFocusVisible } from "@salt-ds/core";

export interface UseListProps {
  /**
   * If true, all items in list will be disabled.
   */
  disabled?: boolean;
  /* Highlighted index for when the list is controlled. */
  highlightedItem?: string;
  /* Selected value for when the list is controlled. */
  selected?: string;
  /* Initial selected value for when the list is controlled. */
  defaultSelected?: string;
  /* Callback for change event. This is called when the selected value changes */
  onChange?: (e: SyntheticEvent, data: { value: string | undefined }) => void;
  /* Callback for select event. This is called when any selection occurs, even if a previously selected value is selected again. */
  onSelect?: (e: SyntheticEvent, data: { value: string }) => void;
  /* List id. */
  id?: string;
  /* List ref. */
  ref: RefObject<HTMLUListElement>;
}

export const useList = ({
  disabled = false,
  highlightedItem: highlightedItemProp,
  selected: selectedProp,
  defaultSelected,
  onChange,
  onSelect,
  id,
  ref,
}: UseListProps) => {
  const getOptions: () => HTMLElement[] = useCallback(() => {
    return Array.from(
      ref.current?.querySelectorAll('[role="option"]:not([aria-disabled])') ??
        []
    );
  }, [ref]);

  const [focusVisible, setFocusVisible] = useState(false);
  const [activeDescendant, setActiveDescendant] = useState<string | undefined>(
    undefined
  );

  const [highlightedItem, setHighlightedItem] = useControlled({
    controlled: highlightedItemProp,
    default: undefined,
    name: "ListNext",
    state: "highlighted",
  });

  const [selectedItem, setSelectedItem] = useControlled({
    controlled: selectedProp,
    default: defaultSelected,
    name: "ListNext",
    state: "selected",
  });

  const {
    isFocusVisibleRef,
    onFocus: handleFocusVisible,
    onBlur: handleBlurVisible,
    ref: focusVisibleRef,
  } = useIsFocusVisible();

  const updateScroll = useCallback(
    (currentTarget: Element) => {
      const list = ref.current;
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
    [ref]
  );

  const updateHighlighted = useCallback(
    (element: HTMLElement) => {
      setHighlightedItem(element.dataset.value);
      setActiveDescendant(element.id);
      updateScroll(element);
    },
    [setHighlightedItem, updateScroll]
  );

  const selectItem = useCallback(
    (element: HTMLElement) => {
      const newValue = element?.dataset.value;
      if (newValue) {
        setSelectedItem(newValue);
        updateHighlighted(element);
      }
    },
    [setSelectedItem, updateHighlighted]
  );

  // Effect to move the cursor when items change controlled.
  // this could be following active descendant if there is no better way of doing it when controlled
  useEffect(() => {
    const activeOptions = getOptions();
    const highlightedIndex = activeOptions.findIndex(
      (i) => i.dataset.value === highlightedItem
    );
    if (highlightedIndex) {
      setActiveDescendant(activeOptions[highlightedIndex]?.id);
      highlightedItem && updateScroll(activeOptions[highlightedIndex]);
    }
  }, [highlightedItem, getOptions, updateScroll]);

  const focusFirstItem = () => {
    // Find first active item
    const activeOptions = getOptions();
    const firstItem = activeOptions[0];
    if (firstItem) {
      updateHighlighted(firstItem);
    }
  };
  const focusLastItem = () => {
    // Find last active item
    const activeOptions = getOptions();
    const lastItem = activeOptions[activeOptions.length - 1];
    if (lastItem) {
      updateHighlighted(lastItem);
      updateScroll(lastItem);
    }
  };

  const findNextOption = (
    currentOption: HTMLElement | null,
    moves: number
  ): HTMLElement => {
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
    currentOption: HTMLElement,
    moves: number
  ): HTMLElement => {
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
      const activeOptions = getOptions();
      const isActiveOption =
        activeOptions.findIndex((i) => i.id === event.currentTarget.id) !== -1;
      if (newValue && isActiveOption) {
        onSelect?.(event, { value: newValue });
        if (selectedItem !== newValue) {
          selectItem(event.currentTarget);
          onChange?.(event, { value: selectedItem });
        }
      }
    },
    [selectItem, selectedItem, onChange, onSelect, getOptions]
  );

  const isSelected = useCallback(
    (value: string) => selectedItem === value,
    [selectedItem]
  );

  const highlight = useCallback(
    (event: SyntheticEvent<HTMLLIElement>) => {
      setHighlightedItem(event.currentTarget.dataset.value);
    },
    [setHighlightedItem]
  );

  const isHighlighted = useCallback(
    (value: string) => highlightedItem === value,
    [highlightedItem]
  );

  const isFocused = useCallback(
    (value: string) => isHighlighted(value) && focusVisible,
    [focusVisible, isHighlighted]
  );

  const getActiveItem = () => {
    const activeOptions = getOptions();
    const activeIndex = activeOptions.findIndex(
      (i) => i.id === activeDescendant
    );
    return activeOptions[activeIndex];
  };

  // HANDLERS
  const blurHandler = () => {
    handleBlurVisible();
    if (!isFocusVisibleRef.current) {
      setFocusVisible(false);
    }
  };

  const mouseOverHandler = () => {
    if (focusVisible) {
      setFocusVisible(false);
    }
  };

  // takes care of focus when using keyboard navigation
  const focusHandler = (event: FocusEvent<HTMLUListElement | HTMLElement>) => {
    handleFocusVisible(event);
    if (isFocusVisibleRef.current) {
      setFocusVisible(true);
    }
    const activeElement = getActiveItem();
    if (activeElement) {
      updateHighlighted(activeElement);
    } else {
      focusFirstItem();
    }
  };

  // takes care of keydown when using keyboard navigation
  const keyDownHandler = (event: KeyboardEvent<HTMLElement>) => {
    const { key } = event;
    const currentItem = getActiveItem();
    let nextItem = currentItem;
    if (isFocusVisibleRef.current || !focusVisible) {
      setFocusVisible(true);
    }
    switch (key) {
      case "ArrowUp":
      case "ArrowDown":
        if (!currentItem) {
          focusFirstItem();
          break;
        }
        nextItem =
          key === "ArrowUp"
            ? findPreviousOption(currentItem, 1)
            : findNextOption(currentItem, 1);

        if (nextItem && nextItem !== currentItem) {
          event.preventDefault();
          updateHighlighted(nextItem);
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
        if (nextItem) {
          selectItem(nextItem);
          onChange?.(event, { value: nextItem.dataset.value || "" });
        }
        break;
      case "PageDown":
      case "PageUp":
        event.preventDefault();
        break;
      default:
        break;
    }
  };

  // CONTEXT
  const contextValue = useMemo(
    () => ({
      disabled,
      id,
      select,
      isSelected,
      isFocused,
      highlight,
      isHighlighted,
    }),
    [disabled, id, select, isSelected, isFocused, highlight, isHighlighted]
  );

  return {
    focusHandler,
    keyDownHandler,
    blurHandler,
    mouseOverHandler,
    activeDescendant,
    selectedItem,
    highlightedItem,
    setSelectedItem,
    setHighlightedItem,
    contextValue,
    focusVisibleRef,
  };
};
