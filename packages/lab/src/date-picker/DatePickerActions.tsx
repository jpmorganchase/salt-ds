import { Button, type ButtonProps, makePrefixer } from "@salt-ds/core";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type MouseEventHandler,
  type Ref,
  type SyntheticEvent,
  useEffect,
} from "react";
import type { DateRangeSelection, SingleDateSelection } from "../calendar";
import {
  type RangeDatePickerState,
  type SingleDatePickerState,
  useDatePickerContext,
} from "./DatePickerContext";
import "./DatePickerActions.css";
import type { DateFrameworkType } from "@salt-ds/date-adapters";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { useLocalization } from "../localization-provider";
import datePickerActions from "./DatePickerActions.css";

const withBaseName = makePrefixer("saltDatePickerActions");

/**
 * Base props for DatePicker actions component.
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
  TDate extends DateFrameworkType,
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
        date: SingleDateSelection<TDate> | null,
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
        date: DateRangeSelection<TDate> | null,
      ) => void;
    };

export const DatePickerActions = forwardRef(function DatePickerActions<
  TDate extends DateFrameworkType,
>(
  props: DatePickerActionsProps<TDate, "single" | "range">,
  ref: React.Ref<HTMLDivElement>,
) {
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

  const { dateAdapter } = useLocalization<TDate>();

  const stateAndHelpers = useDatePickerContext<TDate>({
    selectionVariant,
  });

  const {
    state: { selectedDate },
    helpers: { cancel, setEnableApply },
  } = stateAndHelpers;

  useEffect(() => {
    setEnableApply(true);
  }, [setEnableApply]);

  const handleCancel: MouseEventHandler<HTMLButtonElement> = (event) => {
    cancel(event.nativeEvent);
    CancelButtonProps?.onClick?.(event);
    onCancel?.(event);
  };

  const handleApply: MouseEventHandler<HTMLButtonElement> = (event) => {
    if (selectionVariant === "range") {
      const {
        helpers: { apply },
        state: { selectedDate },
      } = stateAndHelpers as RangeDatePickerState<TDate>;
      apply(event, selectedDate);
      onApply?.(event, selectedDate);
    } else {
      const {
        helpers: { apply },
        state: { selectedDate },
      } = stateAndHelpers as SingleDatePickerState<TDate>;
      apply(event, selectedDate);
      onApply?.(event, selectedDate);
    }
    ApplyButtonProps?.onClick?.(event);
  };

  let selectedLabel = "";
  if (selectedDate === null) {
    selectedLabel = "no date selected";
  } else if (selectionVariant === "single") {
    const date = selectedDate as
      | SingleDateSelection<TDate>[]
      | SingleDateSelection<TDate>;
    if (Array.isArray(date)) {
      selectedLabel =
        date?.length === 0
          ? "no dates selected"
          : `${date.length} single dates`;
    } else {
      selectedLabel = `${dateAdapter.format(date, "dddd D MMMM YYYY")}`;
    }
  } else if (selectionVariant === "range") {
    const dateRange = selectedDate as DateRangeSelection<TDate>;
    if (Array.isArray(dateRange)) {
      selectedLabel =
        dateRange?.length === 0
          ? "no dates selected"
          : `${dateRange.length} range dates`;
    } else {
      selectedLabel = `${dateAdapter.format(dateRange?.startDate, "dddd D MMMM YYYY")} to ${dateAdapter.format(dateRange?.endDate, "dddd D MMMM YYYY")}`;
    }
  }

  return (
    <div className={clsx(className, withBaseName())} ref={ref} {...rest}>
      <div className={withBaseName("body")}>{children}</div>
      <Button
        aria-label={`Cancel ${selectedLabel}`}
        appearance="bordered"
        sentiment="neutral"
        ref={cancelButtonRef}
        {...CancelButtonProps}
        onClick={handleCancel}
        className={clsx(withBaseName("action"), CancelButtonProps?.className)}
      >
        Cancel
      </Button>
      <Button
        aria-label={`Apply ${selectedLabel}`}
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
