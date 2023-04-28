import {
  FocusEvent,
  KeyboardEvent,
  MouseEvent, useCallback,
  useEffect, useRef,
  useState,
} from "react";

export interface UseListProps {
  items: array,
  onSelect: () => void,
  onFocus: () => void,
  deselectable: boolean
}

export const useList = ({ items, onSelect, onFocus, deselectable}: UseListProps) => {
const [selectedIndex, setSelectedIndex] = useState(-1);
  // change for   const lastFocus = useRef(-1);
  const [focusedIndex, setItemFocusedIndex] = useState(0);

const listRef = useRef(null);

const handleClick =(evt: MouseEvent, index: number) => {
  // wrap this in a callback? this might be kicking it too often
  evt.preventDefault();
  if (items[index]?.disabled) return;
  if(deselectable && selectedIndex === index) {
    setSelectedIndex(-1);
    onSelect(null);
  } else {
    setSelectedIndex(index);
    onSelect(items[index]);
  }
};

useEffect(() => {
  const list = listRef.current;

  if (list) {
    // list.addEventListener('focus', handleFocus);
    // list.addEventListener('keydown', handleKeyDown);
    return () => {
      // list.removeEventListener('focus', handleFocus);
      // list.removeEventListener('keydown', handleKeyDown);
    }
  }
}, []);

return {
  selectedIndex, focusedIndex, listRef, handleClick
}
}
