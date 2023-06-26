import {
  Children,
  isValidElement,
  MouseEvent,
  KeyboardEvent,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

interface UseListProps {
  children: ReactNode;
  displayedItemCount: number;
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

export const useList = ({ children, displayedItemCount }: UseListProps) => {
  const listRef = useRef<HTMLUListElement | null>(null);
  const list = listRef.current;

  const [activeDescendant, setActiveDescendant] = useState<string>("");
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [selectedIndices, setSelectedIndices] = useState<number[]>(
    getSelected(children)
  );
  const [allOptions, setAllOptions] = useState<Element[]>([]);
  const [mouseDown, setMouseDown] = useState<boolean>(false);

  const activeOptions = allOptions.filter(
    (option) => option.getAttribute("aria-disabled") !== "true"
  );

  const getListItemIndex = (item: Element): number => {
    return allOptions.indexOf(item);
  };

  const selectItem = (element: Element) => {
    const index = getListItemIndex(element);
    setSelectedIndices([index]);
  };

  const moveFocus = (element: Element) => {
    const index = getListItemIndex(element);
    setFocusedIndex(index);
  };

  const moveActiveDescendant = (element: Element) => {
    setActiveDescendant(element.id);
    updateScroll(element);
  };

  const selectAndMoveActive = (element: Element) => {
    selectItem(element);
    moveActiveDescendant(element);
  };

  const focusAndMoveActive = (element: Element) => {
    moveFocus(element);
    moveActiveDescendant(element);
  };

  const focusFirstItem = () => {
    // Find first active item
    const firstItem = activeOptions[0];
    if (firstItem) {
      focusAndMoveActive(firstItem);
      updateScroll(firstItem);
    }
  };
  const focusLastItem = () => {
    // Find last active item
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
    setFocusedIndex(null);
    selectAndMoveActive(currentTarget);
  };

  const handleBlur = () => {
    setFocusedIndex(null);
  };

  const handleMouseDown = () => {
    // When list gets focused, we can't guarantee that focus happens after click event.
    // If first focus (where !activeDescendant) happens from a click, list shouldn't render focus ring in the first element.
    setMouseDown(true);
  };

  // takes care of focus when using keyboard navigation
  const handleFocus = () => {
    const activeElement = document.getElementById(activeDescendant);
    if (activeElement) {
      focusAndMoveActive(activeElement);
    } else if (!mouseDown) {
      // Focus on first active option if no option was previously focused
      focusFirstItem();
    }
  };

  // takes care of keydown when using keyboard navigation
  const handleKeyDown = (event: KeyboardEvent) => {
    const { key } = event;
    const currentItem =
      document.getElementById(activeDescendant) || activeOptions[0];
    let nextItem = currentItem;
    if (!currentItem) {
      return;
    }
    switch (key) {
      case "PageUp":
      case "PageDown":
        nextItem =
          key === "PageUp"
            ? findPreviousOption(currentItem, displayedItemCount)
            : findNextOption(currentItem, displayedItemCount);

        if (nextItem && nextItem !== currentItem) {
          event.preventDefault();
          focusAndMoveActive(nextItem);
        }
        break;
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
        selectAndMoveActive(nextItem);
        moveFocus(nextItem);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    console.log('setting')
    setAllOptions(
      Array.from(list.children).filter(
        (child) => child.getAttribute("role") === "option"
      )
    );
  }, []);

  return {
    listRef,
    focusedIndex,
    selectedIndices,
    activeDescendant,
    handleClick,
    handleFocus,
    handleKeyDown,
    handleBlur,
    handleMouseDown,
  };
};
