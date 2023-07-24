import {ChangeEvent, KeyboardEvent, ReactNode, useMemo, useState} from "react";
import {
  autoUpdate,
  flip,
  Placement,
  size,
  useFloating
} from "@floating-ui/react";
import {usePortal} from "./usePortal";
import {useList} from "../list-next/useList";
import {useForkRef} from "@salt-ds/core";

interface UseComboBoxProps {
  disabled?: boolean;
  defaultSelected?: string;
  placement?: Placement;
}

export const useComboBox = ({disabled, defaultSelected, listId, listRef, onChange, defaultValue, placement = "bottom"}: UseComboBoxProps) => {

  // STATE
  const [value, setValue] = useState<string | undefined>(defaultValue);

  const {
    open,
    setOpen,
    floating,
    reference,
    getTriggerProps,
    getPortalProps,
  } = usePortal({placement});

  const {
    focusHandler: listFocusHandler,
    keyDownHandler: listKeyDownHandler,
    blurHandler: listBlurHandler,
    activeDescendant,
    focusVisibleRef,
    selectedItem,
    highlightedIndex,
  } = useList({
    disabled,
    defaultSelected,
    id: listId,
    ref: listRef,
  });

  // Handlers
  console.log()

  const focusHandler = (event: FocusEvent<HTMLInputElement>) => {
    console.log('focus')
    listFocusHandler(event);
    setOpen(true);
    // onFocus?.(event);
  };

  const keyDownHandler = (event: KeyboardEvent<HTMLInputElement>) => {
    const { key, target } = event;
    const value = target.value;
    console.log(key)
    switch (key) {
      case "ArrowUp":
      case "ArrowDown":
        listKeyDownHandler(event);
        break;
      default:
        break;
    }

  }

  const changeHandler = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setValue(value);
    onChange?.(event);
  };

  // }

  // const setListRef = useForkRef(focusVisibleRef, floating);

  return {
    // state
    value,
    setValue,
    // portal
    open,
    setOpen,
    reference,
    getTriggerProps,
    getPortalProps,
    // list
    selectedItem,
    highlightedIndex,
    activeDescendant,
    setListRef: focusVisibleRef,
    keyDownHandler,
    focusHandler,
    changeHandler
  }
};
