import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type KeyboardEvent,
  type SyntheticEvent,
  useRef,
  useState,
} from "react";
import { useControlled, useForkRef } from "../utils";
import { PillGroupContext } from "./PillGroupContext";

// add form field support
// add test
// update styling
// rename from SelectablePillGroup to PillGroup/PillList - check with Karl and Jake
// aria-checked / aria-selected?

interface SelectablePillGroupProps extends ComponentPropsWithoutRef<"div"> {
  children?: React.ReactNode;
  disabled?: boolean; // add this
  selected?: string[];
  onSelectionChange?: (
    e: SyntheticEvent<Element, Event>,
    newSelected: string[],
  ) => void;
  defaultSelected?: string[];
  // multiselect?: boolean; always true
}

export const SelectablePillList = forwardRef<
  HTMLDivElement,
  SelectablePillGroupProps
>(function SelectablePillList(props, ref) {
  const {
    disabled,
    children,
    selected: selectedProp,
    defaultSelected,
    onSelectionChange,
    onKeyDown,
    ...rest
  } = props;

  const pillGroupRef = useRef<HTMLDivElement>(null);

  const handleRef = useForkRef(ref, pillGroupRef);

  const [focusInside, setFocusInside] = useState(false);
  const [selected, setSelected] = useControlled({
    controlled: selectedProp,
    default: defaultSelected || [],
    name: "SelectablePillList",
    state: "selected",
  });
  const select = (event: SyntheticEvent, value: string) => {
    // if not in list add it, else remove it
    const selectedIndex = selected.indexOf(value);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = [...selected, value];
    } else {
      newSelected = selected.filter((item) => item !== value);
    }
    // setSelected
    setSelected(newSelected);
    onSelectionChange?.(event, newSelected);
  };

  // left and right arrow nav
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);

    if (!pillGroupRef.current) return;

    const pills = Array.from(
      pillGroupRef.current.querySelectorAll<HTMLElement>('[role="option"]') ??
        [],
    );

    const activeIndex = pills.findIndex(
      (pill) => pill === document.activeElement,
    );

    switch (event.key) {
      case "ArrowRight":
        pills[Math.min(activeIndex + 1, pills.length - 1)]?.focus();
        event.preventDefault();
        break;
      case "ArrowLeft":
        pills[Math.max(activeIndex - 1, 0)]?.focus();
        event.preventDefault();
        break;
      case "Home":
        pills[0]?.focus();
        event.preventDefault();
        break;
      case "End":
        pills[pills.length - 1]?.focus();
        event.preventDefault();
        break;
    }
  };

  return (
    <PillGroupContext.Provider
      value={{
        disabled,
        focusInside,
        select,
        selected,
      }}
    >
      <div
        role="listbox"
        aria-multiselectable
        aria-orientation="horizontal"
        ref={handleRef}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocusInside(true)}
        onBlur={() => setFocusInside(false)}
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "var(--salt-spacing-100)",
        }}
        {...rest}
      >
        {children}
      </div>
    </PillGroupContext.Provider>
  );
});
