import {
  KeyboardEvent,
  MouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

export interface UseListProps {
  items: array;
  onSelect: () => void;
  onFocus: () => void;
  deselectable: boolean;
}

export const useList = ({
  items,
  onSelect,
  onFocus,
  deselectable,
  multiselect,
}: UseListProps) => {
  // State
  const [activeDescendant, setActiveDescendant] = useState(null);
  const [focusedIndex, setItemFocusedIndex] = useState(null);
  const [selectedIdxs, setSelectedIdxs] = useState([]);

  //Refs
  const listRef = useRef(null);

  // Functions

  const defocusActiveDescendant = () => {
    const currentFocusedItem = document.getElementById(
      listRef.current?.activeDescendant
    );
    if (!currentFocusedItem) return;
    if (!multiselect) {
      setSelectedIdxs([]);
    }
    currentFocusedItem.classList.remove("focused");
  };

  const focusListItem = (itemClicked, index) => {
    defocusActiveDescendant();

    if (!multiselect && !deselectable) {
      setSelectedIdxs([index]);
    }
    itemClicked.classList.add("focused");
    listRef.current.activeDescendant = index;
    setActiveDescendant(index);

    // handleFocusChange
  };

  const toggleSelect = (index) => {
    if (multiselect || deselectable) {
      const itemIsSelected = selectedIdxs.indexOf(index) !== -1;

      const toggleFilter = deselectable
        ? []
        : selectedIdxs.filter((i) => i !== index);
      const toggleAdd = deselectable ? [index] : [...selectedIdxs, index];

      const newSelection = itemIsSelected ? toggleFilter : toggleAdd;
      setSelectedIdxs(newSelection);
    }
  };

  const handleKeyDown = useCallback((evt: KeyboardEvent) => {}, []);

  // Key/ click / focus Handlers
  const handleClick = (evt: MouseEvent, index: number) => {
    // TODO: should this be wrapped in a callback?
    const itemClicked = evt.target;
    const { disabled } = items[index]?.props;

    const targetIsClickable =
      (itemClicked.getAttribute("role") === "option" && !disabled) ||
      (itemClicked.getAttribute("type") === "checkbox" && !disabled);

    if (!targetIsClickable) return;

    evt.preventDefault();
    focusListItem(itemClicked, index);
    toggleSelect(index);
    //  TODO: we will have to handle scroll on our own for active descendant
    // scroll();
    //  TODO: handle multi select with shift
    if (multiselect && evt.shiftKey) {
      setSelectedIdxs();
    }
  };

  const handleFocus = () => {
    if (listRef.current?.activeDescendant) return;
  };

  const handleMouseDown = (evt: MouseEvent) => {
    if (
      multiselect &&
      evt.shiftKey &&
      evt.target.getAttribute("role") === "option"
    ) {
      evt.preventDefault();
    }
  };

  useEffect(() => {
    const list = listRef.current;

    if (list) {
      list.addEventListener("focus", handleFocus);
      // list.addEventListener('keydown', handleKeyDown);
      if (multiselect) {
        list.addEventListener("mousedown", handleMouseDown);
      }
      return () => {
        list.removeEventListener("focus", handleFocus);
        // list.removeEventListener('keydown', handleKeyDown);
        if (multiselect) {
          list.removeEventListener("mousedown", handleMouseDown);
        }
      };
    }
  }, []);

  return {
    selectedIdxs,
    focusedIndex,
    listRef,
    handleClick,
  };
};
