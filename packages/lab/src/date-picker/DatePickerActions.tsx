import { Button, type ButtonProps, makePrefixer } from "@salt-ds/core";
import { clsx } from "clsx";
import React, {
  type ComponentPropsWithoutRef,
  forwardRef,
  useEffect,
  type SyntheticEvent,
  type MouseEventHandler,
} from "react";
import type { DateRangeSelection, SingleDateSelection } from "../calendar";
import {
  type RangeDatePickerState,
  type SingleDatePickerState,
  useDatePickerContext,
} from "./index";
import "./DatePickerActions.css";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import datePickerActions from "./DatePickerActions.css";

const withBaseName = makePrefixer("saltDatePickerActions");

export interface DatePickerActionsBaseProps
  extends ComponentPropsWithoutRef<"div"> {
  onCancel?: (_event: SyntheticEvent) => void;
  ApplyButtonProps?: ButtonProps;
  CancelButtonProps?: ButtonProps;
}

export type DatePickerActionsProps<
  SelectionVariant extends "single" | "range",
> = SelectionVariant extends "single"
  ? DatePickerActionsBaseProps & {
      selectionVariant: "single";
      onApply?: (
        _event: SyntheticEvent,
        date: SingleDateSelection | null,
      ) => void;
    }
  : DatePickerActionsBaseProps & {
      selectionVariant: "range";
      onApply?: (
        _event: SyntheticEvent,
        date: DateRangeSelection | null,
      ) => void;
    };

export const DatePickerActions = forwardRef<
  HTMLDivElement,
  DatePickerActionsProps<"single" | "range">
>(function DatePickerActions(props, ref) {
  const {
    ApplyButtonProps,
    children,
    className,
    CancelButtonProps,
    onApply,
    onCancel,
    selectionVariant,
  } = props;
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-date-picker-actions",
    css: datePickerActions,
    window: targetWindow,
  });

  // biome-ignore lint/suspicious/noExplicitAny: state and helpers coerced based on selectionVariant
  let stateAndHelpers: any;
  if (selectionVariant === "range") {
    stateAndHelpers = useDatePickerContext({
      selectionVariant: "range",
    }) as RangeDatePickerState;
  } else {
    stateAndHelpers = useDatePickerContext({
      selectionVariant: "single",
    }) as SingleDatePickerState;
  }

  const {
    state: { selectedDate },
    helpers: { cancel, apply, setAutoApplyDisabled },
  } = stateAndHelpers;

  useEffect(() => {
    setAutoApplyDisabled(true);
  }, [setAutoApplyDisabled]);

  const handleCancel: MouseEventHandler<HTMLButtonElement> = (event) => {
    cancel();
    CancelButtonProps?.onClick?.(event);
    onCancel?.(event);
  };

  const handleApply: MouseEventHandler<HTMLButtonElement> = (event) => {
    if (selectionVariant === "single") {
      apply(selectedDate, false);
      onApply?.(event, selectedDate);
    } else {
      apply(selectedDate, { startDate: false, endDate: false });
      onApply?.(event, selectedDate);
    }
    ApplyButtonProps?.onClick?.(event);
  };

  return (
    <div className={clsx(className, withBaseName())} ref={ref}>
      <div className={withBaseName("body")}>{children}</div>
      <Button
        variant={"secondary"}
        {...CancelButtonProps}
        onClick={handleCancel}
        className={clsx(withBaseName("action"), CancelButtonProps?.className)}
      >
        Cancel
      </Button>
      <Button
        variant={"cta"}
        {...ApplyButtonProps}
        onClick={handleApply}
        className={clsx(withBaseName("action"), ApplyButtonProps?.className)}
      >
        Apply
      </Button>
    </div>
  );
});
