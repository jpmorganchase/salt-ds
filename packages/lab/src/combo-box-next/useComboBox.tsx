import { FocusEvent, KeyboardEvent, SyntheticEvent, useState } from "react";
import { useList, UseListProps } from "../list-next/useList";
import { useComboboxPortal, UseComboBoxPortalProps } from "./useComboboxPortal";

interface UseComboBoxProps {
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
  onMouseOver?: (event: SyntheticEvent) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  PortalProps?: UseComboBoxPortalProps;
  listProps: UseListProps;
}

export const useComboBox = ({
  onFocus,
  onBlur,
  onMouseOver,
  onKeyDown,
  PortalProps,
  listProps,
}: UseComboBoxProps) => {
  const { defaultSelected, ...restListProps } = listProps;
  const [inputValue, setInputValue] = useState<string | undefined>(
    defaultSelected
  );

  const {
    open,
    setOpen,
    floating,
    reference,
    getPortalProps,
    getTriggerProps,
  } = useComboboxPortal(PortalProps);

  const {
    keyDownHandler: listKeyDownHandler,
    focusHandler: listFocusHandler,
    activeDescendant,
    focusVisibleRef,
    selectedItem,
    setSelectedItem,
    setHighlightedItem,
    highlightedItem,
  } = useList({
    ...restListProps,
  });

  const focusHandler = (event: FocusEvent<HTMLInputElement>) => {
    setOpen(true);
    listFocusHandler(event);
    onFocus?.(event);
  };

  const blurHandler = (event: FocusEvent<HTMLInputElement>) => {
    setOpen(false);
    if (!selectedItem) {
      setSelectedItem(undefined);
      setInputValue(undefined);
      setHighlightedItem(undefined);
    }
    onBlur?.(event);
  };

  const mouseOverHandler = (event: SyntheticEvent<HTMLElement>) => {
    setHighlightedItem(event.currentTarget.dataset.value);
    onMouseOver?.(event);
  };

  const keyDownHandler = (event: KeyboardEvent<HTMLInputElement>) => {
    const { key, altKey } = event;
    switch (key) {
      case "ArrowDown":
      case "ArrowUp":
        if (altKey) {
          event.preventDefault();
          if (open && !selectedItem) {
            setSelectedItem(undefined);
            setInputValue(undefined);
          }
          setOpen(!open);
          break;
        }
        if (!open) {
          setOpen(true);
        }
        listKeyDownHandler(event);
        break;
      case "PageDown":
      case "PageUp":
      case "Home":
      case "End":
        if (open) {
          listKeyDownHandler(event);
        }
        break;
      case "Enter":
        if (!open) {
          setOpen(true);
        } else {
          setSelectedItem(highlightedItem);
          setInputValue(highlightedItem);
          setOpen(false);
        }
        break;
      case "Escape":
        if (open) {
          setOpen(false);
          if (!selectedItem) {
            setSelectedItem(undefined);
            setInputValue(undefined);
          }
        }
        break;
      case "Backspace":
        if (!open) {
          setOpen(true);
        }
        break;
      default:
        break;
    }
    onKeyDown?.(event);
  };

  return {
    // portal
    portalProps: {
      open,
      setOpen,
      floating,
      reference,
      getTriggerProps,
      getPortalProps,
    },
    // list
    inputValue,
    setInputValue,
    selectedItem,
    setSelectedItem,
    highlightedItem,
    setHighlightedItem,
    activeDescendant,
    focusVisibleRef,
    keyDownHandler,
    focusHandler,
    blurHandler,
    mouseOverHandler,
  };
};
