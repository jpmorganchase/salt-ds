import { KeyboardEvent, ReactNode, useMemo, useState } from "react";

interface UseDropdownNextProps {
  children: ReactNode;
}

export const useDropdownNext = ({ children }: UseDropdownNextProps) => {
  const [listExpanded, setListExpanded] = useState(false);
  const [valueSelected, setValueSelected] = useState<string>("");

  // HANDLERS
  const blurHandler = () => {
    setListExpanded(false);
  };

  // TODO: do we want list to open on DD focus??
  const focusHandler = () => {
    // setListExpanded(true);
  };

  const mouseDownHandler = () => {
    setListExpanded(!listExpanded);
  };

  const keyDownHandler = (event: KeyboardEvent<HTMLUListElement>) => {
    const { key, target } = event;
    switch (key) {
      case "ArrowUp":
        console.log("===> arrowUp");
        setListExpanded(true);
        break;
      case "ArrowDown":
        console.log("===> arrowDown");
        setListExpanded(true);
        break;
      case "Home":
      case "Escape":
        setListExpanded(false);
        break;
      case " ":
      case "Enter":
        setListExpanded(!listExpanded);
        break;
      default:
        console.log("===> default");
        setValueSelected(target.value);
        break;
    }
  };

  // CONTEXT
  const contextValue = useMemo(
    () => ({
      valueSelected,
      setValueSelected,
    }),
    [valueSelected, setValueSelected]
  );

  return {
    focusHandler,
    keyDownHandler,
    blurHandler,
    mouseDownHandler,
    listExpanded,
    setListExpanded,
    contextValue,
    valueSelected,
    setValueSelected,
  };
};
