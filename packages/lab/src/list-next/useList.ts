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

interface UseListProps {
  /**
   * If true, all items in list will be disabled.
   */
  disabled?: boolean;
  /* Value for the controlled version. */
  highlightedIndex?: number;
  /* Value for the controlled version. */
  selected?: string;
  /* Initial value for the controlled version. */
  defaultSelected?: string;
  /* Callback for the uncontrolled version. */
  onChange?: (e: SyntheticEvent, data: { value: string }) => void;
  /* List id. */
  id?: string;
  /* List ref. */
  ref: RefObject<HTMLUListElement>;
}

export const useList = ({
  disabled = false,
  highlightedIndex,
  selected: selectedProp,
  defaultSelected,
  onChange,
  id,
  ref,
}: UseListProps) => {
  const getOptions: () => HTMLElement[] = useCallback(() => {
    return Array.from(
      ref.current?.querySelectorAll('[role="option"]:not([aria-disabled])') ??
        []
    );
  }, [ref]);

  const getId = useCallback(() => {
    if (highlightedIndex === undefined) return undefined;
    const activeOptions = getOptions();
    return activeOptions[highlightedIndex]?.id;
  }, [highlightedIndex, getOptions]);

  const [focusVisible, setFocusVisible] = useState(false);
  const [activeDescendant, setActiveDescendant] = useControlled({
    controlled: getId(),
    default: undefined,
    name: "ListNextHighlighted",
    state: "activeDescendant",
  });

  const [selectedItem, setSelectedItem] = useControlled({
    controlled: selectedProp,
    default: defaultSelected,
    name: "ListNextSelected",
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

  const updateActiveDescendant = useCallback(
    (element: HTMLElement) => {
      setActiveDescendant(element.id);
      updateScroll(element);
    },
    [setActiveDescendant, updateScroll]
  );
  const selectItem = useCallback(
    (element: HTMLElement) => {
      const newValue = element?.dataset.value;
      if (newValue) {
        setSelectedItem(newValue);
        updateActiveDescendant(element);
      }
    },
    [setSelectedItem, updateActiveDescendant]
  );

  // Effect to move the cursor when items change controlled.
  // this could be following active descendant if there is no better way of doing it when controlled
  useEffect(() => {
    const activeOptions = getOptions();
    highlightedIndex && updateScroll(activeOptions[highlightedIndex]);
  }, [highlightedIndex, getOptions, updateScroll]);

  const focusFirstItem = () => {
    // Find first active item
    const activeOptions = getOptions();
    const firstItem = activeOptions[0];
    if (firstItem) {
      updateActiveDescendant(firstItem);
    }
  };
  const focusLastItem = () => {
    // Find last active item
    const activeOptions = getOptions();
    const lastItem = activeOptions[activeOptions.length - 1];
    if (lastItem) {
      updateActiveDescendant(lastItem);
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
      if (newValue && selectedItem !== newValue && isActiveOption) {
        selectItem(event.currentTarget);
        onChange?.(event, { value: newValue });
      }
    },
    [selectItem, selectedItem, onChange, getOptions]
  );

  const isSelected = useCallback(
    (value: string) => selectedItem === value,
    [selectedItem]
  );

  const isFocused = useCallback(
    (id: string | undefined) => activeDescendant === id && focusVisible,
    [activeDescendant, focusVisible]
  );

  const highlight = useCallback(
    (event: SyntheticEvent<HTMLLIElement>) => {
      setActiveDescendant(event.currentTarget.id);
    },
    [setActiveDescendant]
  );

  const isHighlighted = useCallback(
    (id: string | undefined) => activeDescendant === id,
    [activeDescendant]
  );

  const getActiveItem = () => {
    const activeOptions = getOptions();
    const activeIndex = activeOptions.findIndex(
      (i) => i.id === activeDescendant
    );
    return activeOptions[activeIndex !== -1 ? activeIndex : 0];
  };

  // HANDLERS
  const blurHandler = () => {
    handleBlurVisible();
    if (!isFocusVisibleRef.current) {
      setFocusVisible(false);
    }
  };

  // takes care of focus when using keyboard navigation
  const focusHandler = (event: FocusEvent<HTMLUListElement>) => {
    handleFocusVisible(event);
    if (isFocusVisibleRef.current) {
      setFocusVisible(true);
    }
    const activeElement = getActiveItem();
    updateActiveDescendant(activeElement);
  };

  // takes care of keydown when using keyboard navigation
  const keyDownHandler = (event: KeyboardEvent<HTMLUListElement>) => {
    const { key } = event;
    const currentItem = getActiveItem();
    let nextItem = currentItem;
    if (!currentItem) {
      event.preventDefault();
      return;
    }
    if (isFocusVisibleRef.current) {
      setFocusVisible(true);
    }
    switch (key) {
      case "ArrowUp":
      case "ArrowDown":
        nextItem =
          key === "ArrowUp"
            ? findPreviousOption(currentItem, 1)
            : findNextOption(currentItem, 1);

        if (nextItem && nextItem !== currentItem) {
          event.preventDefault();
          updateActiveDescendant(nextItem);
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
      default:
        event.preventDefault();
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
    activeDescendant,
    contextValue,
    focusVisibleRef,
  };
};
