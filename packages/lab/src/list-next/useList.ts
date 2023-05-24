import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  End,
  Home,
  PageDown,
  PageUp,
  Shift,
  Space,
} from "../common-hooks";

interface UseListProps {
  children: React.ReactNode;
  deselectable: boolean;
  multiselect: boolean;
  onFocus: (element: HTMLElement) => void;
}

export const useList = ({
  children,
  deselectable,
  multiselect,
  displayedItemCount,
  onFocus,
}: UseListProps) => {
  const listRef = useRef<HTMLUListElement | null>(null);
  const activeDescendantRef = useRef<string>("");
  const selectedRef = useRef<number[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [startRangeIndex, setStartRangeIndex] = useState<number>(0);

  const getAllOptions = () =>
    Array.from(listRef.current.querySelectorAll('[role="option"]')) ?? [];

  const getAllActiveOptions = () =>
    getAllOptions().filter(
      (option) => option.getAttribute("aria-disabled") !== "true"
    );

  // debugger;

  /**/
  const focusFirstItem = () => {
    // Find first active item
    const firstItem = findNextOption(null);
    if (firstItem) {
      focusAndSelect(firstItem);
    }
  };

  const focusLastItem = () => {
    // Find last active item
    const allActiveOptions = getAllActiveOptions();
    const lastItem = allActiveOptions[allActiveOptions.length - 1];
    if (lastItem) {
      focusAndSelect(lastItem);
    }
  };

  const getElementIndex = (option): number => {
    const optionIndex = getAllOptions().indexOf(option);

    return typeof optionIndex === "number" ? optionIndex : -1;
  };

  /* finds next active option */
  const findNextOption = (currentOption: Element | null) => {
    const allActiveOptions = getAllActiveOptions();
    // Returns next item, if no current option it will return 0
    const nextOptionIndex = allActiveOptions.indexOf(currentOption) + 1;
    return allActiveOptions[nextOptionIndex];
  };

  /**/
  const findPreviousOption = (currentOption: Element) => {
    // Return the previous option if it exists; otherwise, returns null
    const allActiveOptions = getAllActiveOptions();
    const currentOptionIndex = allActiveOptions.indexOf(currentOption);
    return allActiveOptions[currentOptionIndex - 1];
  };

  const toggleSelectItem = (element, index) => {
    const selectedIndexes = selectedRef.current;
    const itemIsSelected = selectedIndexes.indexOf(index) !== -1;
    let newSelection;
    if (multiselect) {
      newSelection = itemIsSelected
        ? selectedIndexes.filter((i) => i !== index)
        : [...selectedIndexes, index];
    } else {
      newSelection =
        deselectable && itemIsSelected ? [] : [getElementIndex(element)];
    }
    //  TODO: This is sending back the right selection, but it is not being updated on time
    selectedRef.current = newSelection;
  };

  // TODO: rename this, it should convey that it focuses and handles seelcts/
  const focusAndSelect = (element) => {
    if (!multiselect) {
      selectedRef.current = [getElementIndex(element)];
    }

    setFocusedIndex(getElementIndex(element));

    if (onFocus) {
      onFocus(element);
    }
    activeDescendantRef.current = element.id;
  };

  const justFocusItem = (element) => {
    setFocusedIndex(getElementIndex(element));

    if (onFocus) {
      onFocus(element);
    }
    activeDescendantRef.current = element.id;
  };

  const checkInRange = (index, start, end) => {
    const [rangeStart, rangeEnd] = start < end ? [start, end] : [end, start];
    return index >= rangeStart && index <= rangeEnd;
  };

  // TODO: selectrange currently can take indexes or elements, let's use just one or the other
  const selectRange = (start, end) => {
    const allOptions = getAllOptions();
    const startIndex =
      typeof start === "number" ? start : getElementIndex(start);
    const endIndex = typeof end === "number" ? end : getElementIndex(end);

    const newRange = [];
    allOptions.forEach((option, index) => {
      // Check item is in range and not disabled
      const isDisabled =
        allOptions[index].getAttribute("aria-disabled") === "true";
      const selected = checkInRange(index, startIndex, endIndex) && !isDisabled;
      if (selected) {
        newRange.push(index);
      }
    });
    selectedRef.current = newRange;
  };

  // Handlers

  const handleFocus = useCallback(() => {
    if (!activeDescendantRef.current) {
      // Focus on first active option if no option was previously focused
      focusFirstItem();
    } else {
      justFocusItem(document.getElementById(activeDescendantRef.current));
    }
  }, []);

  const handleBlur = useCallback(() => {
    setFocusedIndex(null);

    // if (onBlur) {
    //   onBlur();
    // }
  }, []);

  const handleKeyDown = useCallback((evt: KeyboardEvent<HTMLUListElement>) => {
    const { key, shiftKey, ctrlKey, metaKey } = evt;
    const allOptions = getAllOptions();
    const currentItem =
      document.getElementById(activeDescendantRef.current) || allOptions[0];
    let nextItem = currentItem;

    if (!currentItem) {
      return;
    }
    switch (key) {
      case PageUp:
        // TODO: moveUpCountItems();
        break;
      case PageDown:
        // TODO: moveDownCountItems();
        break;
      case ArrowUp:
      case ArrowDown:
        nextItem =
          key === ArrowUp
            ? findPreviousOption(currentItem)
            : findNextOption(currentItem);

        if (nextItem && multiselect && shiftKey) {
          selectRange(startRangeIndex, getElementIndex(nextItem));
        }

        if (nextItem) {
          justFocusItem(nextItem);
          evt.preventDefault();
        }

        break;
      case Home:
        evt.preventDefault();
        focusFirstItem();

        if (multiselect && shiftKey && ctrlKey) {
          selectRange(startRangeIndex, 0);
        }
        break;
      case End:
        evt.preventDefault();
        focusLastItem();

        if (multiselect && shiftKey && ctrlKey) {
          selectRange(startRangeIndex, allOptions.length - 1);
        }
        break;
      case Shift:
        setStartRangeIndex(getElementIndex(currentItem));
        break;
      case Space:
        evt.preventDefault();
        toggleSelectItem(nextItem);
        break;
      case "a":
      case "A":
        // handle control + A
        if (multiselect && (ctrlKey || metaKey)) {
          evt.preventDefault();
          if (shiftKey) {
            selectedRef.current = [];
            break;
          }
          selectRange(0, allOptions.length - 1);
          break;
        }
      // fall through
      default:
        break;
    }
  }, []);

  const handleClick = useCallback(
    ({ target, shiftKey }: MouseEvent<HTMLUListElement>, index) => {
      const activeOptions = getAllActiveOptions();
      const nonClickableTarget = activeOptions.indexOf(target) === -1;
      if (nonClickableTarget) {
        return;
      }
      justFocusItem(target);
      toggleSelectItem(target, index);

      if (multiselect && shiftKey) {
        selectRange(startRangeIndex, target);
      }
    },
    []
  );

  /*
   * Check if the focused index is in view, and scroll to it if not.
   */
  useEffect(() => {
    const list = listRef.current;
    if (!list || focusedIndex === null) return;

    const allOptions = Array.from(list?.children).filter(
      (child) => child.getAttribute("role") === "option"
    );

    const focusedOption = allOptions[focusedIndex];
    if (!focusedOption) return;
    const outlineWidth = 2; // --salt-focused-outlineWidth TODO: check if this will work without focus ring (clicks)
    const { offsetTop, offsetHeight } = focusedOption;
    const listHeight = list.clientHeight;
    const listScrollTop = list.scrollTop;

    if (offsetTop < listScrollTop) {
      list.scrollTop = offsetTop - outlineWidth;
    } else if (offsetTop + offsetHeight > listScrollTop + listHeight) {
      list.scrollTop = offsetTop + offsetHeight - listHeight + outlineWidth;
    }
  }, [focusedIndex]);

  /*
   * add listeners to list on first render.
   */
  // TODO: the handlers could also be passed up if we dont want to do this...
  useEffect(() => {
    const list = listRef.current;
    if (list) {
      list.addEventListener("keydown", handleKeyDown);
      list.addEventListener("focus", handleFocus);
      list.addEventListener("blur", handleBlur);
      // remove listeners
      return () => {
        list.removeEventListener("keydown", handleKeyDown);
        list.removeEventListener("focus", handleFocus);
        list.removeEventListener("blur", handleBlur);
      };
    }
  }, []);

  return {
    listRef,
    focusedIndex,
    selectedIndexes: selectedRef.current,
    activeDescendant: activeDescendantRef.current,
    handleClick,
  };
};
