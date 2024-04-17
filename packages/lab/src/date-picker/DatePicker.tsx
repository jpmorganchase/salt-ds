import { clsx } from "clsx";
import {
  ChangeEvent,
  ComponentPropsWithoutRef,
  forwardRef,
  KeyboardEvent,
  useEffect,
  useState,
} from "react";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";

import datePickerCss from "./DatePicker.css";
import { Button, makePrefixer, useFloatingUI, useForkRef } from "@salt-ds/core";
import { DatePickerContext } from "./DatePickerContext";
import { DatePickerPanel } from "./DatePickerPanel";
import { flip, size, useDismiss, useInteractions } from "@floating-ui/react";
import { DateInput } from "../date-input";
import { DateValue } from "@internationalized/date";
import { CalendarIcon } from "@salt-ds/icons";

const withBaseName = makePrefixer("saltDatePicker");

export interface DatePickerProps
  extends Omit<ComponentPropsWithoutRef<"div">, "defaultValue">,
    Pick<
      ComponentPropsWithoutRef<"input">,
      "disabled" | "value" | "defaultValue" | "placeholder"
    > {
  selectionVariant?: "default" | "range";
  disabled?: boolean;
}

export const DatePicker = forwardRef<HTMLDivElement, DatePickerProps>(
  function DatePicker(
    {
      selectionVariant = "default",
      disabled = false,
      placeholder = "dd mmm yyyy",
      ...rest
    },
    ref
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-datePicker",
      css: datePickerCss,
      window: targetWindow,
    });

    const [open, setOpen] = useState<boolean>(false);
    const [startDate, setStartDate] = useState<DateValue | null>(null);
    const [endDate, setEndDate] = useState<DateValue | null>(null);
    const [inputValue, setInputValue] = useState<string>("");

    useEffect(() => {
      // TODO: Format
      setInputValue(startDate as string);
    }, [startDate]);
    const { x, y, strategy, elements, floating, reference, context } =
      useFloatingUI({
        open: open,
        placement: "bottom-start",
        middleware: [
          size({
            apply({ rects, elements, availableHeight }) {
              Object.assign(elements.floating.style, {
                minWidth: `${rects.reference.width}px`,
                maxHeight: `max(calc((var(--salt-size-base) + var(--salt-spacing-100)) * 5), calc(${availableHeight}px - var(--salt-spacing-100)))`,
              });
            },
          }),
          flip({ fallbackStrategy: "initialPlacement" }),
        ],
      });

    const dismiss = useDismiss(context);

    const { getReferenceProps, getFloatingProps } = useInteractions([dismiss]);

    const datePickerContextValue = {
      openState: open,
      setOpen,
      disabled,
      endDate,
      setEndDate,
      startDate,
      setStartDate,
      selectionVariant,
    };

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setInputValue(value);
    };
    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Tab" && event.shiftKey) {
        setOpen(false);
      }
    };

    const inputRef = useForkRef(ref, reference);
    return (
      <DatePickerContext.Provider value={datePickerContextValue}>
        <DateInput
          className={clsx(withBaseName())}
          ref={inputRef}
          {...getReferenceProps()}
          onFocus={() => setOpen(true)}
          selectionVariant={selectionVariant}
          startDate={inputValue}
          endDate={endDate}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          endAdornment={
            <Button variant="secondary" onClick={() => setOpen(!open)}>
              <CalendarIcon />
            </Button>
          }
          {...rest}
        />
        <DatePickerPanel
          left={x ?? 0}
          top={y ?? 0}
          position={strategy}
          width={elements.floating?.offsetWidth}
          height={elements.floating?.offsetHeight}
          ref={floating}
          {...getFloatingProps()}
        />
      </DatePickerContext.Provider>
    );
  }
);
