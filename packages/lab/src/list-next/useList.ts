import {
  Children,
  FocusEventHandler,
  isValidElement,
  KeyboardEventHandler,
  MouseEvent,
  MouseEventHandler,
  ReactNode,
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
  Enter,
  Space,
} from "../common-hooks";
import { useEventCallback } from "../utils";

interface UseListProps {
  children: ReactNode;
  displayedItemCount: number;
  // ListNextControlProps
  onBlur?: FocusEventHandler;
  onFocus?: FocusEventHandler;
  onKeyDown?: KeyboardEventHandler;
  onMouseDown?: MouseEventHandler;
}

const getSelected = (children: ReactNode): number[] =>
  Children.toArray(children).reduce(
    (selectedItems: number[], child: ReactNode, index) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (isValidElement(child) && child.props?.selected) {
        selectedItems.push(index);
      }
      return selectedItems;
    },
    []
  );

export const useList = ({
  children,
  displayedItemCount,
  onFocus,
  onKeyDown,
  onBlur,
  onMouseDown,
}: UseListProps) => {
  const listRef = useRef<HTMLUListElement | null>(null);
  let list = listRef.current;

  const [activeDescendant, setActiveDescendant] = useState<string>("");
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>(
    getSelected(children)
  );
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

    if (onFocus) {
      onFocus(element);
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
    setSelectedIndexes([elementIndex]);
  };

  const justFocusItem = (element: Element) => {
    if (onFocus) {
      onFocus(element);
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
    const { offsetTop, offsetHeight } = currentTarget as HTMLLIElement;
    const listHeight = list?.clientHeight;
    const listScrollTop = list?.scrollTop;
    if (offsetTop < listScrollTop) {
      list.scrollTop = offsetTop;
    } else if (offsetTop + offsetHeight > listScrollTop + listHeight) {
      list.scrollTop = offsetTop + offsetHeight - listHeight;
    }
  };

  // Handlers
  const handleClick = ({ currentTarget }: MouseEvent<HTMLUListElement>) => {
    const nonClickableTarget = activeOptions.indexOf(currentTarget) === -1;
    if (nonClickableTarget) {
      return;
    }
    toggleSelectItem(currentTarget);
    setActiveDescendant(currentTarget.id);
    setFocusedIndex(null);
    updateScroll(currentTarget);
  };

  const handleBlur = useEventCallback((e: FocusEvent) => {
    setFocusedIndex(null);
    if (onBlur) {
      onBlur(e);
    }
  });

  const handleMouseDown = useEventCallback(() => {
    setMouseDown(true);
    if (onMouseDown) {
      onMouseDown();
    }
  });

  // takes care of focus when using keyboard navigation
  const handleFocus = useEventCallback(() => {
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
      case Enter:
        evt.preventDefault();
        toggleSelectItem(nextItem);
        break;
      default:
        break;
    }
    if (onKeyDown) {
      onKeyDown(currentItem);
    }
  });

  useEffect(() => {
    list = listRef.current;

    if (!list) return;

    const addListeners = (list: HTMLUListElement) => {
      list.addEventListener("keydown", handleKeyDown);
      list.addEventListener("focus", handleFocus);
      list.addEventListener("blur", handleBlur);
      list.addEventListener("mousedown", handleMouseDown);
    };

    const removeListeners = (list: HTMLUListElement | null): void => {
      if (list) {
        list.removeEventListener("keydown", handleKeyDown);
        list.removeEventListener("focus", handleFocus);
        list.removeEventListener("blur", handleBlur);
        list.removeEventListener("mousedown", handleMouseDown);
      }
    };

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
    addListeners(list);

    return () => {
      removeListeners(list);
    };
  }, [handleFocus, handleBlur, handleKeyDown, handleMouseDown]);

  return {
    listRef,
    focusedIndex,
    selectedIndexes,
    activeDescendant,
    handleClick,
  };
};
