import {ChangeEvent, KeyboardEvent, ReactNode, useMemo, useState} from "react";
import {
  autoUpdate,
  flip,
  Placement,
  size,
  useFloating
} from "@floating-ui/react";
import {usePortal} from "./usePortal";

interface UseComboBoxProps {
  children?: ReactNode;
  placement?: Placement;
}

export const useComboBox = ({children, placement = "bottom"}: UseComboBoxProps) => {

  const [value, setValue] = useState("");
  const [selected, setSelected] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const {
    open,
    setOpen,
    floating,
    reference,
    getTriggerProps,
    getPortalProps,
  } = usePortal({placement});

  // HANDLERS
  const blurHandler = () => {
    setOpen(false);
  };
  const focusHandler = () => {
    console.log('open')
    setOpen(true);
  };

  const selectHandler = (value) => {
    console.log(value)
    if (value) {

    // setSelected(value)
    }
    setValue(value)

  }
  const changeHandler = (event: ChangeEvent<HTMLInputElement>) => {
    const { key, target } = event;
    const value = target.value;
    setValue(value);
    console.log(value)
  }
  const keyDownHandler = (event: KeyboardEvent<HTMLInputElement>) => {
    const { key, target } = event;
    const value = target.value;
    console.log(highlightedIndex)
    switch (key) {
      case "Escape":
        setValue("");
        setOpen(false);
        break;
      case "Enter":
        if (!open) {setOpen(true)}
        break;
      //  TODO: arrows are incrementing by one but need a stop
      case "ArrowUp":
        console.log('arrow up')
        setHighlightedIndex(highlightedIndex - 1);
        break;
      case "ArrowDown":
        console.log('arrow down')
        setHighlightedIndex(highlightedIndex + 1);
        break;
      default:
        break;
    }
  }

  // CONTEXT
  const contextValue = useMemo(
    () => ({
      value,
      setValue
    }), [value, setValue]
  )

  return {
    focusHandler,
    keyDownHandler,
    blurHandler,
    changeHandler,
    contextValue,
    open,
    value,
    selected,
    selectHandler,
    highlightedIndex,
    floating,
    reference,
    getTriggerProps,
    getPortalProps,
  }
};
