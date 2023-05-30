import {
  ReactNode,
  MouseEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
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
  children: ReactNode;
  deselectable: boolean;
  multiselect: boolean;
  onFocus: (element: HTMLElement) => void;
}

export const useList = ({
  children,
  deselectable,
  multiselect,
  onFocus,
}: UseListProps) => {
  const listRef = useRef<HTMLUListElement | null>(null);
  const activeDescendantRef = useRef<string>("");
  const selectedRef = useRef<number[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [startRangeIndex, setStartRangeIndex] = useState<number>(0);
  const [isSpaceClicked, setSpaceClicked] = useState(false);

  // triggers a rerender and update selected items when using SPACE to select. TODO: is there a better way?
  useEffect(() => {
    if (isSpaceClicked) {
      setSpaceClicked(false);
    }
  }, [isSpaceClicked, setSpaceClicked]);

  const getAllOptions = (): Element[] => {
    const list = listRef.current;
    return (
      Array.from(list?.children).filter(
        (child) => child.getAttribute("role") === "option"
      ) || []
    );
  };

  const getAllActiveOptions = () =>
    getAllOptions().filter(
      (option) => option.getAttribute("aria-disabled") !== "true"
    );

  // disabledSelectedOnly
  const getDisabledSelectedOptions = () =>
    getAllOptions().filter(
      (option) =>
        option.getAttribute("aria-disabled") === "true" &&
        option.getAttribute("aria-selected") === "true"
    );

  // focusable options: non disabled, disabled selected, and all others
  const getKeyboardFocusableOptions = () => {
    const disabledSelectedOnly = getDisabledSelectedOptions();

    const options = [...getAllActiveOptions(), ...disabledSelectedOnly];

    const sortedOptions = options.sort((a, b) => {
      const idA = a.getAttribute("id");
      const idB = b.getAttribute("id");

      if (!idA || !idB) return;
      if (idA < idB) {
        return -1;
      } else if (idB > idA) {
        return 1;
      }
    });

    return sortedOptions;
  };

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

  const getListItemIndex = (item): number => {
    const optionIndex = getAllOptions().indexOf(item);
    return optionIndex !== -1 ? optionIndex : -1;
  };

  /* finds next active option */
  const findNextOption = (currentOption: Element | null): Element | null => {
    const allActiveOptions = getKeyboardFocusableOptions(); // keyboard should be able to focus on disabledSelected options too
    // Returns next item, if no current option it will return 0
    const nextOptionIndex = allActiveOptions.indexOf(currentOption) + 1;
    return allActiveOptions[nextOptionIndex] || null;
  };

  /**/
  const findPreviousOption = (currentOption: Element): Element | null => {
    // Return the previous option if it exists; otherwise, returns null
    const allActiveOptions = getKeyboardFocusableOptions(); // keyboard should be able to focus on disabledSelected options too
    const currentOptionIndex = allActiveOptions.indexOf(currentOption);
    return allActiveOptions[currentOptionIndex - 1] || null;
  };

  const toggleSelectItem = useCallback(
    (element: HTMLElement, index: number) => {
      const selectedIndexes = selectedRef.current;
      const itemAlreadySelected = selectedIndexes.includes(index);
      let newSelection;

      if (multiselect) {
        newSelection = itemAlreadySelected
          ? selectedIndexes.filter((i) => i !== index)
          : [...selectedIndexes, index];
        selectedRef.current = newSelection;
      } else {
        // deselectable and single select only
        newSelection =
          deselectable && itemAlreadySelected
            ? []
            : [getListItemIndex(element)];
        selectedRef.current = newSelection;
      }
    },
    []
  );

  const focusAndSelect = (element: HTMLElement) => {
    if (!multiselect) {
      selectedRef.current = [getListItemIndex(element)];
    }

    setFocusedIndex(getListItemIndex(element));

    if (onFocus) {
      onFocus(element);
    }
    activeDescendantRef.current = element.id;
  };

  const justFocusItem = (element: HTMLElement) => {
    setFocusedIndex(getListItemIndex(element));

    if (onFocus) {
      onFocus(element);
    }
    activeDescendantRef.current = element.id;
  };

  const checkInRange = (index: number, start: number, end: number) => {
    const [rangeStart, rangeEnd] = start < end ? [start, end] : [end, start];
    return index >= rangeStart && index <= rangeEnd;
  };

  // TODO: selectrange currently can take indexes or elements, let's use just one or the other
  const selectRange = (start, end) => {
    const allOptions = getAllOptions();
    const startIndex =
      typeof start === "number" ? start : getListItemIndex(start);
    const endIndex = typeof end === "number" ? end : getListItemIndex(end);

    const newRange: number[] = [];
    allOptions.forEach((option, index) => {
      // Check item is in range and not disabled
      const isDisabled = option.getAttribute("aria-disabled") === "true";
      const selected = checkInRange(index, startIndex, endIndex) && !isDisabled;
      if (selected) {
        newRange.push(index);
      }
    });
    selectedRef.current = newRange;
  };

  // Handlers

  const handleFocus = useCallback(() => {
    if (!activeDescendantRef.current && !selectedRef.current) {
      // Focus on first active option if no option was previously focused
      focusFirstItem();
    } else {
      const activeDescendant = document.getElementById(
        activeDescendantRef.current
      );
      if (activeDescendant) {
        justFocusItem(activeDescendant);
      }
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
    let nextItem = currentItem as HTMLElement;

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
          selectRange(startRangeIndex, getListItemIndex(nextItem));
        }

        if (nextItem) {
          justFocusItem(nextItem);
          // evt.preventDefault(); // TODO: check if needed
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
        setStartRangeIndex(getListItemIndex(currentItem));
        break;
      case Space:
        evt.preventDefault(); // ensure list items dont move down on space key
        toggleSelectItem(nextItem, getListItemIndex(nextItem));
        setSpaceClicked(isSpaceClicked === true ? false : true);
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
    (evt: MouseEvent<HTMLUListElement>, index: number) => {
      const { currentTarget, shiftKey } = evt;
      const activeOptions = getAllActiveOptions();
      const nonClickableTarget = activeOptions.indexOf(currentTarget) === -1;
      if (nonClickableTarget) {
        return;
      }
      justFocusItem(currentTarget);
      toggleSelectItem(currentTarget, index);

      if (multiselect && shiftKey) {
        selectRange(startRangeIndex, currentTarget);
      }
    },
    []
  );

  // Effects
  /*
   * Check if the focused index is in view, and scroll to it if not.
   */
  useEffect(() => {
    const list = listRef.current;
    if (!list || focusedIndex === null) return;

    const allOptions = getAllOptions();

    const focusedOption = allOptions[focusedIndex];
    if (!focusedOption) return;
    const { offsetTop, offsetHeight } = focusedOption;
    const listHeight = list.clientHeight;
    const listScrollTop = list.scrollTop;

    if (offsetTop < listScrollTop) {
      list.scrollTop = offsetTop;
    } else if (offsetTop + offsetHeight > listScrollTop + listHeight) {
      list.scrollTop = offsetTop + offsetHeight - listHeight;
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
