import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import clsx from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type KeyboardEvent,
  type SyntheticEvent,
  useRef,
  useState,
} from "react";
import { useFormFieldProps } from "../form-field-context";
import { makePrefixer, useControlled, useForkRef } from "../utils";
import pillGroupCss from "./PillGroup.css";
import { PillGroupContext } from "./PillGroupContext";

export interface PillGroupProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * The currently selected values.
   */
  selected?: string[];
  /**
   * The default selected values for un-controlled component.
   */
  defaultSelected?: string[];
  /**
   * If `true`, the Pill group will be disabled.
   */
  disabled?: boolean;
  /**
   * Callback fired when the selection changes.
   * @param event
   * @param newSelected The new selected values.
   */
  onSelectionChange?: (
    event: SyntheticEvent<Element, Event>,
    newSelected: string[],
  ) => void;
}

const withBaseName = makePrefixer("saltPillGroup");

export const PillGroup = forwardRef<HTMLDivElement, PillGroupProps>(
  function PillGroup(props, ref) {
    const {
      "aria-labelledby": ariaLabelledBy,
      "aria-describedby": ariaDescribedBy,
      disabled: disabledProp,
      children,
      selected: selectedProp,
      defaultSelected,
      onSelectionChange,
      onKeyDown,
      className,
      ...rest
    } = props;
    const [focusInside, setFocusInside] = useState(false);

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-pill-group",
      css: pillGroupCss,
      window: targetWindow,
    });

    const { a11yProps: formFieldA11yProps, disabled: formFieldDisabled } =
      useFormFieldProps();

    const pillGroupRef = useRef<HTMLDivElement>(null);
    const handleRef = useForkRef(ref, pillGroupRef);

    const disabled = formFieldDisabled || disabledProp;

    const [selected, setSelected] = useControlled({
      controlled: selectedProp,
      default: defaultSelected || [],
      name: "PillGroup",
      state: "selected",
    });

    const select = (event: SyntheticEvent, newValue: string) => {
      if (disabled) {
        return;
      }

      let newSelected = [];
      if (selected.includes(newValue)) {
        newSelected = selected.filter((item) => item !== newValue);
      } else {
        newSelected = [...selected, newValue];
      }

      setSelected(newSelected);
      onSelectionChange?.(event, newSelected);
    };

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
        case "ArrowDown":
        case "ArrowRight":
          event.preventDefault();
          pills[Math.min(activeIndex + 1, pills.length - 1)]?.focus();
          break;
        case "ArrowUp":
        case "ArrowLeft":
          event.preventDefault();
          pills[Math.max(activeIndex - 1, 0)]?.focus();
          break;
        case "Home":
          event.preventDefault();
          pills[0]?.focus();
          break;
        case "End":
          event.preventDefault();
          pills[pills.length - 1]?.focus();
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
          aria-labelledby={
            clsx(formFieldA11yProps?.["aria-labelledby"], ariaLabelledBy) ||
            undefined
          }
          aria-describedby={
            clsx(formFieldA11yProps?.["aria-describedby"], ariaDescribedBy) ||
            undefined
          }
          className={clsx(withBaseName(), className)}
          role="listbox"
          aria-multiselectable
          aria-orientation="horizontal"
          onFocus={() => setFocusInside(true)}
          onBlur={() => setFocusInside(false)}
          onKeyDown={handleKeyDown}
          ref={handleRef}
          {...rest}
        >
          {children}
        </div>
      </PillGroupContext.Provider>
    );
  },
);
