import {
  FocusEventHandler,
  KeyboardEventHandler,
  MouseEvent,
  MouseEventHandler,
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
  Space,
} from "../common-hooks";
import { useEventCallback } from "../utils";

interface UseListProps {
  deselectable: boolean;
  displayedItemCount: number;
  // ListNextControlProps
  onBlur?: FocusEventHandler<HTMLUListElement>;
  onFocus?: FocusEventHandler<HTMLUListElement>;
  onKeyDown?: KeyboardEventHandler<HTMLUListElement>;
  onMouseDown?: MouseEventHandler<HTMLUListElement>;
  onSelect?: (item: number[]) => void;
  onHoverChange?: (item: number) => void;
  selectedIndexesProp?: number[];
  hoveredIndexProp?: number;
}

export const useList = ({
  deselectable,
  displayedItemCount,
  onFocus,
  onHoverChange,
  onKeyDown,
  onBlur,
  onMouseDown,
  onSelect,
  selectedIndexesProp,
  hoveredIndexProp,
}: UseListProps) => {
  const listRef = useRef<HTMLUListElement | null>(null);
  let list = listRef.current;
  const [activeDescendant, setActiveDescendant] = useState<string>("");
  const [focusedIndex, setFocusedIndex] = useState<number | null>(
    hoveredIndexProp
  );
  const [selectedIndexes, setSelectedIndexes] =
    useState<number[]>(selectedIndexesProp);
  const [allOptions, setAllOptions] = useState<Element[]>([]);
  const [activeOptions, setActiveOptions] = useState<Element[]>([]);
  const [mouseDown, setMouseDown] = useState<boolean>(false);

  const getListItemIndex = (item: Element): number => {
    const optionIndex = allOptions.indexOf(item);
    return optionIndex !== -1 ? optionIndex : -1;
  };

  const focusAndSelect = (element: Element) => {
    setSelectedIndexes([getListItemIndex(element)]);
    setActiveDescendant(element.id);
    setFocusedIndex(getListItemIndex(element));
    updateScroll(element);
    if (onSelect) {
      onSelect(getListItemIndex(element));
    }

    if (onFocus) {
      onFocus();
    }
  };

  const focusFirstItem = () => {
    // Find first active item
    const firstItem = activeOptions[0];
    if (firstItem) {
      focusAndSelect(firstItem);
    }
  };

  const focusLastItem = () => {
    // Find last active item
    const lastItem = activeOptions[activeOptions.length - 1];
    if (lastItem) {
      focusAndSelect(lastItem);
    }
  };

  const toggleSelectItem = (element: Element) => {
    const elementIndex = getListItemIndex(element);
    const itemIsSelected =
      selectedIndexes && selectedIndexes.includes(elementIndex);
    const newSelection = deselectable && itemIsSelected ? [] : [elementIndex];
    setSelectedIndexes(newSelection);
    if (onSelect) {
      onSelect(newSelection);
    }
  };

  const justFocusItem = (element: Element) => {
    if (onFocus) {
      onFocus();
    }
    setActiveDescendant(element.id);
    setFocusedIndex(getListItemIndex(element));
    updateScroll(element);
  };

  const findNextOption = (
    currentOption: Element | null,
    moves: number
  ): Element => {
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
    const currentOptionIndex = activeOptions.indexOf(currentOption);
    return activeOptions[currentOptionIndex - moves] || activeOptions[0];
  };

  const updateScroll = (currentTarget: Element) => {
    if (!list || !currentTarget) return;
    const { offsetTop, offsetHeight } = currentTarget;
    const listHeight = list?.clientHeight;
    const listScrollTop = list?.scrollTop;
    if (offsetTop < listScrollTop) {
      list.scrollTop = offsetTop;
    } else if (offsetTop + offsetHeight > listScrollTop + listHeight) {
      list.scrollTop = offsetTop + offsetHeight - listHeight;
    }
  };

  // Handlers
  const handleClick = (evt: MouseEvent<HTMLUListElement>) => {
    const { currentTarget } = evt;
    const nonClickableTarget = activeOptions.indexOf(currentTarget) === -1;
    if (nonClickableTarget) {
      return;
    }
    toggleSelectItem(currentTarget);
    setActiveDescendant(currentTarget.id);
    setFocusedIndex(null);
    updateScroll(currentTarget);
  };

  const handleBlur = useEventCallback((evt) => {
    setFocusedIndex(null);
    if (onBlur) {
      onBlur(evt);
    }
  });

  const handleMouseDown = useEventCallback((evt: MouseEvent) => {
    setMouseDown(true);
    if (onMouseDown) {
      onMouseDown(evt);
    }
  });

  const handleFocus = useEventCallback((evt: FocusEvent) => {
    if (!activeDescendant && !mouseDown) {
      // Focus on first active option if no option was previously focused
      focusFirstItem();
    } else {
      const activeElement = document.getElementById(activeDescendant);
      if (activeElement) {
        justFocusItem(activeElement);
      }
    }
  });

  const handleKeyDown = useEventCallback((evt: KeyboardEvent) => {
    const { key } = evt;
    const currentItem =
      document.getElementById(activeDescendant) || activeOptions[0];
    let nextItem = currentItem;
    if (!currentItem) {
      return;
    }
    switch (key) {
      case PageUp:
      case PageDown:
        nextItem =
          key === PageUp
            ? findPreviousOption(currentItem, displayedItemCount)
            : findNextOption(currentItem, displayedItemCount);

        if (nextItem && nextItem !== currentItem) {
          evt.preventDefault();
          justFocusItem(nextItem);
        }
        break;
      case ArrowUp:
      case ArrowDown:
        nextItem =
          key === ArrowUp
            ? findPreviousOption(currentItem, 1)
            : findNextOption(currentItem, 1);

        if (nextItem && nextItem !== currentItem) {
          evt.preventDefault();
          justFocusItem(nextItem);
        }
        break;
      case Home:
        evt.preventDefault();
        focusFirstItem();
        break;
      case End:
        evt.preventDefault();
        focusLastItem();
        break;
      case Space:
        evt.preventDefault();
        toggleSelectItem(nextItem);
        break;
      default:
        break;
    }
    if (onKeyDown) {
      onKeyDown(currentItem);
    }
    return;
  });

  // Effects
  useEffect(() => {
    if (selectedIndexesProp) {
      setSelectedIndexes(selectedIndexesProp);
    }
  }, [selectedIndexesProp]);

  // Effects
  useEffect(() => {
    const hoveredItem = allOptions[hoveredIndexProp];
    //    if there is an item with the hovered indexed, set focus
    if (hoveredItem) {
      setFocusedIndex(hoveredIndexProp);
      setActiveDescendant(hoveredItem?.id);
      updateScroll(hoveredItem);
    }
  }, [hoveredIndexProp]);

  // Effects
  useEffect(() => {
    if (onHoverChange) {
      onHoverChange(focusedIndex);
    }
  }, [focusedIndex]);

  // Effects
  useEffect(() => {
    // sets list in first render
    list = listRef.current;
  }, []);

  useEffect(() => {
    const prepare = (list: HTMLUListElement) => {
      list.addEventListener("keydown", handleKeyDown);
      list.addEventListener("focus", handleFocus);
      list.addEventListener("blur", handleBlur);
      list.addEventListener("mousedown", handleMouseDown);
    };

    const tearDown = (list: HTMLUListElement): void => {
      list.removeEventListener("keydown", handleKeyDown);
      list.removeEventListener("focus", handleFocus);
      list.removeEventListener("blur", handleBlur);
      list.removeEventListener("mousedown", handleMouseDown);
    };

    if (list) {
      setAllOptions(
        Array.from(list.children).filter(
          (child) => child.getAttribute("role") === "option"
        )
      );
      setActiveOptions(
        Array.from(list.children)
          .filter((child) => child.getAttribute("role") === "option")
          .filter((option) => option.getAttribute("aria-disabled") !== "true")
      );
      prepare(list);
      // remove listeners
      return () => {
        tearDown(list);
      };
    }
  }, [list]);

  return {
    listRef,
    focusedIndex,
    selectedIndexes,
    activeDescendant,
    handleClick,
  };
};
