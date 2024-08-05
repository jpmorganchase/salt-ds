import { Button, type ButtonProps, makePrefixer } from "@salt-ds/core";
import {
  type DatePickerState,
  type DateRangeSelection,
  type SingleDateSelection,
  useDatePickerContext,
} from "@salt-ds/lab";
import { clsx } from "clsx";
import React, {
  type ComponentPropsWithoutRef,
  forwardRef,
  useEffect,
  type SyntheticEvent,
  type MouseEventHandler,
} from "react";
import "./DatePickerActions.css";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import datePickerActions from "./DatePickerActions.css";

const withBaseName = makePrefixer("saltDatePickerActions");

export interface DatePickerActionsBaseProps
  extends ComponentPropsWithoutRef<"div"> {
  disableApply: boolean;
  onCancel?: (_event: SyntheticEvent) => void;
  applyButtonProps?: ButtonProps;
  cancelButtonProps?: ButtonProps;
}

export type DatePickerActionsProps<
  SelectionVariant extends "single" | "range",
> = SelectionVariant extends "single"
  ? DatePickerActionsBaseProps & {
      selectionVariant: "single";
      onApply?: (
        _event: SyntheticEvent,
        date: SingleDateSelection | null | undefined,
      ) => void;
    }
  : DatePickerActionsBaseProps & {
      selectionVariant: "range";
      onApply?: (
        _event: SyntheticEvent,
        date: DateRangeSelection | null | undefined,
      ) => void;
    };

export const DatePickerActions = forwardRef<
  HTMLDivElement,
  DatePickerActionsProps<"single" | "range">
>(function DatePickerActions(props, ref) {
  const {
    applyButtonProps,
    children,
    className,
    cancelButtonProps,
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

  const handleCancel: MouseEventHandler<HTMLButtonElement> = (event) => {
    cancel();
    cancelButtonProps?.onClick?.(event);
    onCancel?.(event);
  };

  const handleApply: MouseEventHandler<HTMLButtonElement> = (event) => {
    if (selectionVariant === "single") {
      apply(selectedDate || null);
      onApply?.(event, selectedDate);
    } else {
      apply(selectedDate || null);
      onApply?.(event, selectedDate);
    }
    applyButtonProps?.onClick?.(event);
  };

  return (
    <div className={clsx(className, withBaseName())} ref={ref}>
      <div className={withBaseName("body")}>{children}</div>
      <Button
        variant={"secondary"}
        {...cancelButtonProps}
        onClick={handleCancel}
        className={clsx(withBaseName("action"), cancelButtonProps?.className)}
      >
        Cancel
      </Button>
      <Button
        variant={"cta"}
        {...applyButtonProps}
        onClick={handleApply}
        className={clsx(withBaseName("action"), applyButtonProps?.className)}
      >
        Apply
      </Button>
    </div>
  );
});
