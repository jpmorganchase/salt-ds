import {
  KeyboardEvent,
  MouseEvent,
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
  children: React.ReactNode;
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
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
  const [startRangeIndex, setStartRangeIndex] = useState(0);

  const focusFirstItem = () => {
    console.log(listRef.current?.children);
    const firstItem = listRef.current.querySelector('[role="option"]');
    if (firstItem) {
      focusItem(firstItem);
    }
  };
  const focusLastItem = useCallback(() => {
    const itemList = Array.from(
      listRef.current.querySelectorAll('[role="option"]')
    );
    const lastItem = itemList[itemList.length - 1];

    if (lastItem) {
      focusItem(lastItem);
    }
  }, []);

  const handleKeyDown = (evt: KeyboardEvent<HTMLUListElement>) => {
    const { key, shiftKey, ctrlKey, metaKey } = evt;
    const allOptions = Array.from(
      listRef.current.querySelectorAll('[role="option"]')
    );
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
        if (!activeDescendantRef.current) {
          // focus first option if no option was previously focused, and perform no other actions
          focusItem(currentItem);
          break;
        }
        nextItem =
          key === ArrowUp
            ? findPreviousOption(currentItem)
            : findNextOption(currentItem);

        if (nextItem && multiselect && shiftKey) {
          selectRange(startRangeIndex, nextItem);
        }

        if (nextItem) {
          focusItem(nextItem);
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
        // handle control + A
        if (multiselect && (ctrlKey || metaKey)) {
          evt.preventDefault();
          selectRange(0, allOptions.length - 1);
          break;
        }
      // fall through
      default:
        break;
    }
  };

  const getElementIndex = (option) => {
    const allOptions = Array.from(
      listRef.current.querySelectorAll('[role="option"]')
    );
    const optionIndex = allOptions.indexOf(option);

    return typeof optionIndex === "number" ? optionIndex : null;
  };

  const findNextOption = (currentOption) => {
    const allOptions = Array.from(
      listRef.current.querySelectorAll('[role="option"]')
    ).filter((option) => option.getAttribute("aria-disabled") !== "true"); // get options array
    const currentOptionIndex = allOptions.indexOf(currentOption);

    return allOptions[currentOptionIndex + 1];
  };

  // Return the previous listbox option, if it exists; otherwise, returns null
  const findPreviousOption = (currentOption) => {
    const allOptions = Array.from(
      listRef.current.querySelectorAll('[role="option"]')
    ).filter((option) => option.getAttribute("aria-disabled") !== "true"); // get options array
    const currentOptionIndex = allOptions.indexOf(currentOption);

    return allOptions[currentOptionIndex - 1];
  };

  //
  const handleClick = useCallback(
    ({ target, shiftKey }: MouseEvent<HTMLUListElement>, index) => {
      const nonClickableTarget =
        target.getAttribute("role") !== "option" ||
        target.getAttribute("aria-disabled") === "true";
      if (nonClickableTarget) {
        return;
      }

      focusItem(target);
      toggleSelectItem(target);

      if (multiselect && shiftKey) {
        selectRange(startRangeIndex, target);
      }
    },
    []
  );

  const toggleSelectItem = (element) => {
    const index = getElementIndex(element);
    if (multiselect || deselectable) {
      const itemIsSelected = selectedIndexes.indexOf(index) !== -1;
      const toggleFilter = deselectable
        ? []
        : selectedIndexes.filter((i) => i !== index);
      const toggleAdd = deselectable ? [index] : [...selectedIndexes, index];

      const newSelection = itemIsSelected ? toggleFilter : toggleAdd;
      setSelectedIndexes(newSelection);
    }
  };

  const defocusItem = (element) => {
    if (!element) {
      return;
    }

    if (!multiselect) {
      setSelectedIndexes([]);
    }
    setFocusedIndex(null);
  };

  const focusItem = (element) => {
    const currentActive = document.getElementById(activeDescendantRef.current);
    defocusItem(currentActive);
    if (!multiselect && !deselectable) {
      setSelectedIndexes([getElementIndex(element)]);
    }

    setFocusedIndex(getElementIndex(element));
    listRef.current.setAttribute("aria-activedescendant", element.id);
    activeDescendantRef.current = element.id;

    if (onFocus) {
      onFocus(element);
    }
  };

  const checkInRange = (index, start, end) => {
    const [rangeStart, rangeEnd] = start < end ? [start, end] : [end, start];
    return index >= rangeStart && index <= rangeEnd;
  };

  const selectRange = (start, end) => {
    const allOptions = Array.from(
      listRef.current.querySelectorAll('[role="option"]')
    );
    const startIndex =
      typeof start === "number" ? start : getElementIndex(start);
    const endIndex = typeof end === "number" ? end : getElementIndex(end);

    const temp = [];
    for (let index = 0; index < allOptions.length; index++) {
      const isDisabled =
        allOptions[index].getAttribute("aria-disabled") === "true";
      const selected = checkInRange(index, startIndex, endIndex) && !isDisabled; // check item in range and not disabled
      if (selected) {
        temp.push(index);
      }
    }
    setSelectedIndexes(temp);
  };

  // Check if the focused option is in view, and scroll to it if not
  // TODO: the first item should be getting focus on first tab in, this is jumping a bit with first item, we need to check once that is done that it still works
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

  useEffect(() => {
    const list = listRef.current;
    if (list) {
      list.addEventListener("keydown", handleKeyDown);
      return () => {
        list.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, []);

  return {
    listRef,
    focusedIndex,
    selectedIndexes,
    activeDescendant: activeDescendantRef.current,
    handleClick,
  };
};
