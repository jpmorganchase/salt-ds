import React, {
  type ComponentPropsWithoutRef,
  forwardRef,
  useEffect,
  type SyntheticEvent,
} from "react";
import { clsx } from "clsx";
import { Button, makePrefixer } from "@salt-ds/core";
import {
  type DateRangeSelection,
  type DatePickerState,
  SingleDateSelection,
  useDatePickerContext,
} from "@salt-ds/lab";
import "./DatePickerFooter.css";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import datePickerFooter from "./DatePickerFooter.css";

const withBaseName = makePrefixer("saltDatePickerFooter");

export interface DatePickerFooterBaseProps
  extends ComponentPropsWithoutRef<"div"> {
  onCancel?: (_event: SyntheticEvent) => void;
}

export type DatePickerFooterProps<SelectionVariant extends "single" | "range"> =
  SelectionVariant extends "single"
    ? DatePickerFooterBaseProps & {
        selectionVariant: "single";
        onApply?: (
          _event: SyntheticEvent,
          date: SingleDateSelection | null | undefined,
        ) => void;
      }
    : DatePickerFooterBaseProps & {
        selectionVariant: "range";
        onApply?: (
          _event: SyntheticEvent,
          date: DateRangeSelection | null | undefined,
        ) => void;
      };

export const DatePickerFooter = forwardRef<
  HTMLDivElement,
  DatePickerFooterProps<"single" | "range">
>(function DatePickerFooter(props, ref) {
  const { children, className, onApply, onCancel, selectionVariant } = props;
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-date-picker-footer",
    css: datePickerFooter,
    window: targetWindow,
  });

  let stateAndHelpers: any;
  if (selectionVariant === "range") {
    stateAndHelpers = useDatePickerContext({
      selectionVariant: "range",
    }) as DatePickerState<DateRangeSelection>;
  } else {
    stateAndHelpers = useDatePickerContext({
      selectionVariant: "single",
    }) as DatePickerState<SingleDateSelection>;
  }

  const {
    state: { selectedDate },
    helpers: { cancel, apply, setAutoApplyDisabled },
  } = stateAndHelpers;

  useEffect(() => {
    setAutoApplyDisabled(true);
  }, []);

  const handleCancel = (event: SyntheticEvent) => {
    cancel();
    onCancel?.(event);
  };

  const handleApply = (event: SyntheticEvent) => {
    if (selectionVariant === "single") {
      apply(selectedDate || null);
      onApply?.(event, selectedDate);
    } else {
      apply(selectedDate || null);
      onApply?.(event, selectedDate);
    }
  };

  return (
    <div className={clsx(className, withBaseName())} ref={ref}>
      <div className={withBaseName("body")}>{children}</div>
      <Button
        className={withBaseName("action")}
        variant={"secondary"}
        onClick={handleCancel}
      >
        Cancel
      </Button>
      <Button
        className={withBaseName("action")}
        variant={"cta"}
        onClick={handleApply}
      >
        Apply
      </Button>
    </div>
  );
});
