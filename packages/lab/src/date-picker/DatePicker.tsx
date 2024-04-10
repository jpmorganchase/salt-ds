import { clsx } from "clsx";
import { ComponentPropsWithoutRef, forwardRef, useState } from "react";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";

import datePickerCss from "./DatePicker.css";
import { makePrefixer, useFloatingUI, useForkRef } from "@salt-ds/core";
import { DatePickerContext } from "./DatePickerContext";
import { DatePickerPanel } from "./DatePickerPanel";
import { flip, size } from "@floating-ui/react";
import { DateInput } from "../date-input";
import { DateValue } from "@internationalized/date";

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

    const datePickerContextValue = {
      openState: open,
      setOpen,
      disabled: disabled,
      endDate: null,
      setEndDate: () => undefined,
      startDate: startDate,
      setStartDate: setStartDate,
      selectionVariant: selectionVariant,
    };

    const inputRef = useForkRef(ref, reference);
    return (
      <DatePickerContext.Provider value={datePickerContextValue}>
        {/*// TODO: parse before passing to unput */}
        <DateInput
          className={clsx(withBaseName())}
          ref={inputRef}
          startDate={startDate as string}
          placeholder={placeholder}
          {...rest}
        />
        <DatePickerPanel
          left={x ?? 0}
          top={y ?? 0}
          context={context}
          position={strategy}
          width={elements.floating?.offsetWidth}
          height={elements.floating?.offsetHeight}
          ref={floating}
        />
      </DatePickerContext.Provider>
    );
  }
);
