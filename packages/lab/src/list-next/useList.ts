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
  /**
   * If true, all items in list will be disabled.
   */
  disabled?: boolean;
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
  disabled = false,
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

  const getOptions = useCallback(() => {
    return Array.from(
      listRef.current?.querySelectorAll(
        '[role="option"]:not([aria-disabled])'
      ) ?? []
    ) as HTMLElement[];
  }, [listRef]);

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

  const focusAndMoveActive = (element: HTMLElement) => {
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

  const getActiveItem = () => {
    const activeOptions = getOptions();
    const activeIndex = activeOptions.findIndex(
      (i) => i.id === activeDescendant
    );
    return activeOptions[activeIndex !== -1 ? activeIndex : 0];
  };

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
    const activeElement = getActiveItem();
    focusAndMoveActive(activeElement);
  };

  // takes care of keydown when using keyboard navigation
  const handleKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    const { key } = event;
    const currentItem = getActiveItem();
    let nextItem = currentItem;
    if (!currentItem) {
      return;
    }
    setShowFocusRing(true);
    switch (key) {
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
        nextItem && selectItem(nextItem);
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
    }),
    [disabled, id, select, isSelected, isFocused]
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
