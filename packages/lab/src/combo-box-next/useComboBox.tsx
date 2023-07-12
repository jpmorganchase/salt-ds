import {KeyboardEvent, ReactNode, useMemo, useState} from "react";

interface UseComboBoxProps {
  children?: ReactNode;
}

export const useComboBox = ({children}: UseComboBoxProps) => {

  const [expanded, setExpanded] = useState(false)
  const [value, setValue] = useState("");
  const [selected, setSelected] = useState("");
  const [index, setIndex] = useState(-1);

  // HANDLERS
  const blurHandler = () => {
    setExpanded(false);
  };
  const focusHandler = () => {
    setExpanded(true);
  };

  const keyDownHandler = (event: KeyboardEvent<HTMLInputElement>) => {
    const { key, target } = event;
    const value = target.value;
    console.log(index)
    switch (key) {
      case "Escape":
        setValue("");
        setExpanded(false);
        break;
      case "Enter":
        if (!expanded) {setExpanded(true)}
        break;
      //  TODO: arrows are incrementing by one but need a stop
      case "ArrowUp":
        setIndex(index - 1);
        break;
      case "ArrowDown":
        setIndex(index + 1);
        break;
      default:
        setValue(value)
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
    contextValue,
    expanded,
    value
  }
};
