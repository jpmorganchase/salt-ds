import { useEffect, useRef, useState } from "react";
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

export const useList = ({ children, deselectable, multiselect, onFocus }) => {
  const listRef = useRef(null);
  const activeDescendant = useRef(null);
  const [startRangeIndex, setStartRangeIndex] = useState(0);

  useEffect(() => {
    const list = listRef.current;
    if (list) {
      list.addEventListener("keydown", handleKeyDown);
      list.addEventListener("click", handleClick);
      return () => {
        list.removeEventListener("keydown", handleKeyDown);
        list.addEventListener("click", handleClick);
      };
    }
  }, []);

  const focusFirstItem = () => {
    const firstItem = listRef.current.querySelector('[role="option"]');
    if (firstItem) {
      focusItem(firstItem);
    }
  };
  const focusLastItem = () => {
    const itemList = listRef.current.querySelectorAll('[role="option"]');
    const lastItem = itemList[itemList.length - 1];

    if (lastItem) {
      focusItem(lastItem);
    }
  };

  const handleKeyDown = (evt) => {
    const { key, shiftKey, ctrlKey, metaKey } = evt;
    var lastActiveId = activeDescendant.current;
    const allOptions = [...listRef.current.querySelectorAll('[role="option"]')];
    const currentItem =
      document.getElementById(activeDescendant.current) || allOptions[0];
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
        if (!activeDescendant.current) {
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
        setStartRangeIndex(getElementIndex(currentItem, allOptions));
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

    if (activeDescendant.current !== lastActiveId) {
      scrollToSelected();
    }
  };

  const getElementIndex = (option, options) => {
    const allOptions = Array.from(options); // convert to array
    const optionIndex = allOptions.indexOf(option);

    return typeof optionIndex === "number" ? optionIndex : null;
  };

  const findNextOption = (currentOption) => {
    const allOptions = Array.from(
      listRef.current.querySelectorAll('[role="option"]')
    ); // get options array
    const currentOptionIndex = allOptions.indexOf(currentOption);

    return allOptions[currentOptionIndex + 1];
  };

  // Return the previous listbox option, if it exists; otherwise, returns null
  const findPreviousOption = (currentOption) => {
    const allOptions = Array.from(
      listRef.current.querySelectorAll('[role="option"]')
    ); // get options array
    const currentOptionIndex = allOptions.indexOf(currentOption);

    return allOptions[currentOptionIndex - 1];
  };

  //
  const handleClick = ({ target, shiftKey }) => {
    const nonClickableTarget =
      target.getAttribute("role") !== "option" ||
      target.getAttribute("aria-disabled") === "true";
    if (nonClickableTarget) {
      return;
    }
    focusAndToggleSelectItem(target);
    scrollToSelected();

    if (multiselect && shiftKey) {
      selectRange(startRangeIndex, target);
    }
  };

  const focusAndToggleSelectItem = (element) => {
    focusItem(element);
    toggleSelectItem(element);
  };

  const toggleSelectItem = (element) => {
    if (multiselect || deselectable) {
      const currentSelected = element.getAttribute("aria-selected") === "true";
      const newSelected = currentSelected ? "false" : "true";
      element.setAttribute("aria-selected", newSelected);
    }
  };

  const defocusItem = (element) => {
    if (!element) {
      return;
    }

    if (!multiselect) {
      element.removeAttribute("aria-selected");
    }

    element.classList.remove("focused");
  };

  const focusItem = (element) => {
    const currentActive = document.getElementById(activeDescendant.current);
    defocusItem(currentActive);
    if (!multiselect && !deselectable) {
      element.setAttribute("aria-selected", "true");
    }

    element.classList.add("focused");
    listRef.current.setAttribute("aria-activedescendant", element.id);
    activeDescendant.current = element.id;

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
      typeof start === "number" ? start : getElementIndex(start, allOptions);
    const endIndex =
      typeof end === "number" ? end : getElementIndex(end, allOptions);

    for (let index = 0; index < allOptions.length; index++) {
      const disabled =
        allOptions[index].getAttribute("aria-disabled") === "true";
      const selected = checkInRange(index, startIndex, endIndex) && !disabled; // check item in range and not disabled
      allOptions[index].setAttribute("aria-selected", `${selected}`);
    }
  };

  // Check if the selected option is in view, and scroll if not
  const scrollToSelected = () => {
    const selectedOption = document.getElementById(activeDescendant.current);
    const { clientHeight, scrollTop, scrollHeight } = listRef;

    if (selectedOption && scrollHeight > clientHeight) {
      const { offsetTop, offsetHeight } = selectedOption;
      const scrollBottom = clientHeight + scrollTop;

      if (offsetTop + offsetHeight > scrollBottom) {
        listRef.current.scrollTop = `${
          offsetTop + offsetHeight - clientHeight
        }px`;
      } else if (offsetTop < scrollTop) {
        listRef.current.scrollTop = `${offsetTop}px`;
      }
    }
  };
  return { listRef };
};
