import { FocusEvent, KeyboardEvent, SyntheticEvent, useEffect } from "react";
import { useList, UseListProps } from "../list-next/useList";
import { useComboboxPortal, UseComboBoxPortalProps } from "./useComboboxPortal";
import { useControlled } from "@salt-ds/core";

interface UseComboBoxProps {
  inputValue?: string;
  defaultInputValue?: string;
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
  onMouseOver?: (event: SyntheticEvent) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  PortalProps?: UseComboBoxPortalProps;
  listProps: UseListProps;
}

export const useComboBox = ({
  defaultInputValue,
  onFocus,
  onBlur,
  onMouseOver,
  onKeyDown,
  inputValue: inputValueProp,
  PortalProps,
  listProps,
}: UseComboBoxProps) => {
  const [inputValue, setInputValue] = useControlled({
    controlled: inputValueProp,
    default: defaultInputValue,
    name: "Combo Box",
    state: "inputValue",
  });

  const {
    open,
    setOpen,
    floating,
    reference,
    getPortalProps,
    getTriggerProps,
    getPosition,
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
    ...listProps,
  });

  const setSelected = (value: string | undefined) => {
    setSelectedItem(value);
    setInputValue(value);
  };

  useEffect(() => {
    setInputValue(selectedItem);
  }, [selectedItem]);

  const focusHandler = (event: FocusEvent<HTMLInputElement>) => {
    setOpen(true);
    listFocusHandler(event);
    onFocus?.(event);
  };

  const blurHandler = (event: FocusEvent<HTMLInputElement>) => {
    setOpen(false);
    if (!selectedItem) {
      setSelected(undefined);
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
            setSelected(undefined);
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
          setSelected(highlightedItem);
          setOpen(false);
        }
        break;
      case "Escape":
        if (open) {
          setOpen(false);
          if (!selectedItem) {
            setSelected(undefined);
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
    inputValue,
    setInputValue,
    // portal
    portalProps: {
      open,
      setOpen,
      floating,
      reference,
      getTriggerProps,
      getPortalProps,
      getPosition,
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
