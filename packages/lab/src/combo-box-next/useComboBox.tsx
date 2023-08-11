import { FocusEvent, KeyboardEvent, SyntheticEvent } from "react";
import { useList, UseListProps } from "../list-next/useList";
import { useComboboxPortal, UseComboBoxPortalProps } from "./useComboboxPortal";
import { useControlled } from "@salt-ds/core";

interface UseComboBoxProps {
  value?: string;
  defaultValue?: string;
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
  onMouseOver?: (event: SyntheticEvent) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  onSelect?: (
    event: SyntheticEvent<HTMLInputElement>,
    data: { value?: string }
  ) => void;
  PortalProps?: UseComboBoxPortalProps;
  useListProps: UseListProps;
}

export const useComboBox = ({
  value,
  defaultValue,
  onFocus,
  onBlur,
  onMouseOver,
  onKeyDown,
  PortalProps,
  useListProps,
  onSelect,
}: UseComboBoxProps) => {
  const [inputValue, setInputValue] = useControlled({
    controlled: value,
    default: useListProps.defaultSelected || defaultValue,
    name: "ComboBox Next",
    state: "value",
  });

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
    ...useListProps,
  });

  const resetSelected = () => {
    setSelectedItem(undefined);
    setInputValue(undefined);
    setHighlightedItem(undefined);
  };
  const focusHandler = (event: FocusEvent<HTMLInputElement>) => {
    setOpen(true);
    listFocusHandler(event);
    onFocus?.(event);
  };

  const blurHandler = (event: FocusEvent<HTMLInputElement>) => {
    setOpen(false);
    if (!selectedItem) {
      resetSelected();
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
            resetSelected();
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
          onSelect?.(event, { value: highlightedItem });
          setOpen(false);
        }
        break;
      case "Escape":
        if (open) {
          setOpen(false);
          if (!selectedItem) {
            resetSelected();
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
    },
    // list
    selectedItem,
    setSelectedItem,
    highlightedItem,
    setHighlightedItem,
    activeDescendant,
    focusVisibleRef,
    // handlers
    keyDownHandler,
    focusHandler,
    blurHandler,
    mouseOverHandler,
  };
};
