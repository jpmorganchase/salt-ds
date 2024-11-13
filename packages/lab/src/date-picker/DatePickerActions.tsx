import { Button, type ButtonProps, makePrefixer } from "@salt-ds/core";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  type MouseEventHandler,
  type Ref,
  type SyntheticEvent,
  forwardRef,
  useEffect,
} from "react";
import type { DateRangeSelection, SingleDateSelection } from "../calendar";
import {
  type RangeDatePickerState,
  type SingleDatePickerState,
  useDatePickerContext,
} from "./DatePickerContext";
import "./DatePickerActions.css";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import datePickerActions from "./DatePickerActions.css";

const withBaseName = makePrefixer("saltDatePickerActions");

/**
 * Base props for DatePicker actions.
 */
export interface DatePickerActionsBaseProps
  extends ComponentPropsWithoutRef<"div"> {
  /**
   * Callback fired when the cancel action is triggered.
   * @param _event - The synthetic event.
   */
  onCancel?: (_event: SyntheticEvent) => void;
  /**
   * Ref to apply button
   */
  applyButtonRef?: Ref<HTMLButtonElement>;
  /**
   * Props for the apply button.
   */
  ApplyButtonProps?: ButtonProps;
  /**
   * Props for the cancel button.
   */
  CancelButtonProps?: ButtonProps;
  /**
   * Ref to cancel button
   */
  cancelButtonRef?: Ref<HTMLButtonElement>;
}

/**
 * Props for the DatePicker actions component.
 * @template SelectionVariant - The selection variant, either "single" or "range".
 */
export type DatePickerActionsProps<
  SelectionVariant extends "single" | "range",
> = SelectionVariant extends "single"
  ? DatePickerActionsBaseProps & {
      /**
       * The selection variant, set to "single".
       */
      selectionVariant: "single";
      /**
       * Callback fired when the apply action is triggered.
       * @param _event - The synthetic event.
       * @param date - The selected single date or null.
       */
      onApply?: (
        _event: SyntheticEvent,
        date: SingleDateSelection | null,
      ) => void;
    }
  : DatePickerActionsBaseProps & {
      /**
       * The selection variant, set to "range".
       */
      selectionVariant: "range";
      /**
       * Callback fired when the apply action is triggered.
       * @param _event - The synthetic event.
       * @param date - The selected date range or null.
       */
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
    applyButtonRef,
    ApplyButtonProps,
    cancelButtonRef,
    children,
    className,
    CancelButtonProps,
    onApply,
    onCancel,
    selectionVariant,
    ...rest
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
    helpers: { cancel, apply, setEnableApply },
  } = stateAndHelpers;

  useEffect(() => {
    setEnableApply(true);
  }, [setEnableApply]);

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
    <div className={clsx(className, withBaseName())} ref={ref} {...rest}>
      <div className={withBaseName("body")}>{children}</div>
      <Button
        appearance="transparent"
        sentiment="neutral"
        ref={cancelButtonRef}
        {...CancelButtonProps}
        onClick={handleCancel}
        className={clsx(withBaseName("action"), CancelButtonProps?.className)}
      >
        Cancel
      </Button>
      <Button
        appearance="solid"
        sentiment="accented"
        ref={applyButtonRef}
        {...ApplyButtonProps}
        onClick={handleApply}
        className={clsx(withBaseName("action"), ApplyButtonProps?.className)}
      >
        Apply
      </Button>
    </div>
  );
});
