import { useEffect, useRef, useState } from "react";
import {
  type DateValue,
  endOfMonth,
  getLocalTimeZone,
  startOfMonth,
  today,
} from "@internationalized/date";
import {
  useControlled,
  useForkRef,
  useFormFieldProps,
} from "@salt-ds/core";
import {
  type DateRangeSelection,
  type SingleDateSelection,
  isDateRangeSelection,
} from "../calendar";
import { DatePickerState } from "./DatePickerContext";
import { useDatePickerOverlay } from "./DatePickerOverlayProvider";

interface UseDatePickerBaseProps<T> {
  disabled?: boolean;
  readOnly?: boolean;
  focusedValue?: "start" | "end" | null;
  defaultFocusedValue?: UseDatePickerBaseProps<T>["focusedValue"];
  open?: boolean;
  defaultOpen?: UseDatePickerBaseProps<T>["open"];
  selectedDate?: T | null;
  defaultSelectedDate?: UseDatePickerBaseProps<T>["selectedDate"];
  onSelectedDateChange?: (newDate: T | null) => void;
  minDate?: DateValue;
  maxDate?: DateValue;
}

export interface UseDatePickerSingleProps
  extends UseDatePickerBaseProps<SingleDateSelection> {
  selectionVariant: "single";
}

export interface UseDatePickerRangeProps
  extends UseDatePickerBaseProps<DateRangeSelection> {
  selectionVariant: "range";
}

export type UseDatePickerProps<SelectionVariant> =
  SelectionVariant extends "single"
    ? UseDatePickerSingleProps
    : SelectionVariant extends "range"
      ? UseDatePickerRangeProps
      : never;

export function useDatePicker<SelectionVariant extends "single" | "range">(
  props: UseDatePickerProps<SelectionVariant>,
  ref: React.ForwardedRef<HTMLDivElement>,
): DatePickerState<SingleDateSelection> | DatePickerState<DateRangeSelection> {
  const {
    readOnly = false,
    disabled,
    selectionVariant,
    defaultSelectedDate = null,
    selectedDate: selectedDateProp,
    onSelectedDateChange,
    defaultFocusedValue = null,
    focusedValue: focusedValueProp,
    defaultOpen = false,
    open: openProp,
    minDate: minDateProp,
    maxDate: maxDateProp,
    ...rest
  } = props;

  const minDate: DateValue =
    minDateProp ?? startOfMonth(today(getLocalTimeZone()));
  const maxDate: DateValue =
    maxDateProp ?? endOfMonth(minDate.add({ months: 1 }));

  const datePickerRef = useRef<HTMLDivElement>(null);
  const containerRef = useForkRef(ref, datePickerRef);
  const prevSelectedDate = useRef<
    SingleDateSelection | DateRangeSelection | null
  >(null);

  const {
    state: { open },
    helpers: { setOpen },
  } = useDatePickerOverlay();

  const [focusedValue, setFocusedValue] = useControlled({
    controlled: focusedValueProp,
    default: defaultFocusedValue,
    name: "DatePicker",
    state: "focusedValue",
  });

  const [selectedDate, setSelectedDate] = useControlled({
    controlled: selectedDateProp,
    default: defaultSelectedDate,
    name: "DatePicker",
    state: "selectedDate",
  });

  const [autoApplyDisabled, setAutoApplyDisabled] = useState<boolean>(false);
  const [cancelled, setCancelled] = useState<boolean>(false);

  useEffect(() => {
    if (selectionVariant === "range") {
      const rangeSelection = selectedDate as DateRangeSelection;
      if (!rangeSelection?.startDate) {
        setFocusedValue("start");
      } else {
        setFocusedValue("end");
      }
    } else {
      const singleSelection = selectedDate as SingleDateSelection;
      if (singleSelection) {
        setFocusedValue("start");
      }
    }
    if (open) {
      prevSelectedDate.current = selectedDate;
    }
  }, [open]);

  const { disabled: formFieldDisabled, readOnly: formFieldReadOnly } =
    useFormFieldProps();
  const isReadOnly = readOnly || formFieldReadOnly || false;
  const isDisabled = disabled || formFieldDisabled || false;

  const apply = (
    newDate: SingleDateSelection | DateRangeSelection | null,
  ): void => {
    setCancelled(false);
    if (newDate === null) {
      onSelectedDateChange?.(newDate);
    } else {
      if (selectionVariant === "range") {
        const newRangeDate = newDate as DateRangeSelection;
        if (newRangeDate?.startDate && newRangeDate?.endDate) {
          setOpen(false);
        }
        onSelectedDateChange?.(newRangeDate);
      } else {
        const newSingleDate = newDate as SingleDateSelection;
        if (newSingleDate) {
          setOpen(false);
        }
        onSelectedDateChange?.(newSingleDate);
      }
    }
  };

  const setSelectedDateWrapper = (
    newDate: SingleDateSelection | DateRangeSelection | null,
  ) => {
    let inRangeNewDate;
    let startDateInRange = true;
    let endDateInRange = true;
    if (isDateRangeSelection(newDate)) {
      if (maxDate && newDate?.startDate) {
        startDateInRange = newDate.startDate.compare(minDate) >= 0;
      }
      if (maxDate && newDate?.endDate) {
        endDateInRange =
          newDate?.endDate && newDate.endDate.compare(maxDate) <= 0;
      }
      if (!startDateInRange && !endDateInRange) {
        inRangeNewDate = null;
      } else {
        inRangeNewDate = {
          startDate: startDateInRange ? newDate.startDate : undefined,
          endDate: endDateInRange ? newDate.endDate : undefined,
        };
      }
    } else {
      let dateAfterMinDate = true;
      let dateBeforeMaxDate = true;
      if (minDate && newDate) {
        dateAfterMinDate = newDate.compare(minDate) >= 0;
      }
      if (maxDate && newDate) {
        dateBeforeMaxDate = newDate.compare(maxDate) <= 0;
      }
      inRangeNewDate = dateAfterMinDate && dateBeforeMaxDate ? newDate : null;
    }
    setSelectedDate(inRangeNewDate);
    if (!autoApplyDisabled) {
      apply(inRangeNewDate);
    }
  };

  const cancel = () => {
    setSelectedDateWrapper(prevSelectedDate.current);
    prevSelectedDate.current = null;
    setCancelled(true);
    setOpen(false);
  };

  const returnValue = {
    state: {
      selectionVariant,
      selectedDate,
      cancelled,
      focusedValue,
      autoApplyDisabled,
      disabled: isDisabled,
      readOnly: isReadOnly,
      containerRef,
      minDate,
      maxDate,
      ...rest,
    },
    helpers: {
      apply,
      cancel,
      setFocusedValue,
      setSelectedDate: setSelectedDateWrapper,
      setAutoApplyDisabled,
    },
  };
  if (props.selectionVariant === "single") {
    return returnValue as DatePickerState<SingleDateSelection>;
  } else if (props.selectionVariant === "range") {
    return returnValue as DatePickerState<DateRangeSelection>;
  }
  throw new Error("Invalid variant");
}
