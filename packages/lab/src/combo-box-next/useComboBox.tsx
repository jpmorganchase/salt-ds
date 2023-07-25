import {
  FocusEvent,
  KeyboardEvent,
  MouseEvent,
  RefObject,
  useEffect,
  useState,
} from "react";
import { useList, UseListProps } from "../list-next/useList";
import { useComboboxPortal, UsePortalProps } from "./useComboboxPortal";

interface UseComboBoxProps {
  disabled?: boolean;
  defaultSelected?: string;
  listId?: string;
  listRef: RefObject<HTMLUListElement>;
  //
  onBlur?: FocusEvent<HTMLInputElement>;
  onFocus?: FocusEvent<HTMLInputElement>;
  onMouseOver?: FocusEvent<HTMLUListElement>;
  PortalProps?: UsePortalProps;
  listProps: UseListProps;
}

export const useComboBox = ({
  onFocus,
  onBlur,
  onMouseOver,
  PortalProps,
  listProps,
}: UseComboBoxProps) => {
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
    activeDescendant,
    focusVisibleRef,
    selectedItem,
    setSelectedItem,
    setHighlightedItem,
    highlightedItem,
  } = useList({
    ...listProps,
  });

  const focusHandler = (event: FocusEvent<HTMLInputElement>) => {
    setOpen(true);
    onFocus?.(event);
  };

  const blurHandler = (event: FocusEvent<HTMLInputElement>) => {
    setOpen(false);
    if (!selectedItem) {
      setSelectedItem(undefined);
    }
    onBlur?.(event);
  };

  const mouseOverHandler = (event: MouseEvent<HTMLElement>) => {
    const hoveredElement = event.target;
    setHighlightedItem(hoveredElement?.dataset.value);
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
        }
        break;
      case "Escape":
        if (open) {
          setOpen(false);
          if (!selectedItem) {
            setSelectedItem(undefined);
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
  };

  return {
    // portal
    portalProps: {
      open,
      floating,
      reference,
      getTriggerProps,
      getPortalProps,
    },
    // list
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
