import { Button, Label, makePrefixer } from "@salt-ds/core";
import {
  type DateRangeSelection,
  useDatePickerContext,
} from "@salt-ds/lab";
import { clsx } from "clsx";
import React, {
  type ComponentPropsWithoutRef,
  forwardRef,
  useEffect,
  type SyntheticEvent,
} from "react";
import "./DatePickerRangeFooter.css";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import datePickerRangeFooter from "./DatePickerRangeFooter.css";

const withBaseName = makePrefixer("datePickerRangeFooter");

export interface DatePickerRangeFooterProps
  extends ComponentPropsWithoutRef<"div"> {
  placeholder?: string | undefined;
  onApply?: (
    _event: SyntheticEvent,
    date: DateRangeSelection | null | undefined,
  ) => void;
  onCancel?: (_event: SyntheticEvent) => void;
}

export const DatePickerRangeFooter = forwardRef<
  HTMLDivElement,
  DatePickerRangeFooterProps
>(function DatePickerRangeFooter(props, ref) {
  const { className, onApply, onCancel, placeholder = "DD MMM YYYY" } = props;
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-date-picker-range-footer",
    css: datePickerRangeFooter,
    window: targetWindow,
  });

  const {
    state: { selectedDate },
    helpers: { apply, cancel, setAutoApplyDisabled },
  } = useDatePickerContext<DateRangeSelection>();

  useEffect(() => {
    setAutoApplyDisabled(true);
  }, []);

  const handleCancel = (event: SyntheticEvent) => {
    cancel();
    onCancel?.(event);
  };

  const handleApply = (event: SyntheticEvent) => {
    apply(selectedDate || null);
    onApply?.(event, selectedDate);
  };

  const noOfDaysSelected =
    selectedDate?.startDate && selectedDate?.endDate
      ? selectedDate.endDate.compare(selectedDate.startDate) + 1
      : 0;
  return (
    <div className={clsx(className, withBaseName())} ref={ref}>
      <Label className={withBaseName("rangeLabel")}>
        <small>Selected dates:</small>
      </Label>
      <div className={withBaseName("range")}>
        <Label>{`${selectedDate?.startDate || placeholder} - ${
          selectedDate?.endDate || placeholder
        }`}</Label>
        {noOfDaysSelected > 0 ? (
          <Label className={withBaseName("noOfDaysSelected")}>
            <small>
              ({noOfDaysSelected} day{noOfDaysSelected === 1 ? "" : "s"}{" "}
              selected)
            </small>
          </Label>
        ) : null}
      </div>
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
