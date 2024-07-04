import { useCallback, useEffect, useRef, useState } from "react";
import {
  useControlled,
  useFloatingUI,
  useForkRef,
  useFormFieldProps,
} from "@salt-ds/core";
import {
  isRangeSelectionValueType,
  RangeSelectionValueType,
  SingleSelectionValueType,
} from "../calendar";
import { flip, useDismiss, useInteractions } from "@floating-ui/react";
import {
  DateValue,
  getLocalTimeZone,
  endOfMonth,
  startOfMonth,
  today,
} from "@internationalized/date";

interface useDatePickerBaseProps<SelectionVariantType> {
  selectionVariant: "single" | "range";
  disabled: boolean;
  readOnly: boolean;
  focusedInput: "start" | "end" | null;
  defaultFocusedInput?: useDatePickerBaseProps<SelectionVariantType>["focusedInput"];
  open: boolean;
  defaultOpen?: useDatePickerBaseProps<SelectionVariantType>["open"];
  selectedDate: SelectionVariantType | null;
  defaultSelectedDate?: useDatePickerBaseProps<SelectionVariantType>["selectedDate"];
  onSelectedDateChange: (newDate: SelectionVariantType | null) => void;
  minDate?: DateValue;
  maxDate?: DateValue;
}

export interface useDatePickerSingleProps
  extends useDatePickerBaseProps<SingleSelectionValueType> {
  selectionVariant: "single";
}

export interface useDatePickerRangeProps
  extends useDatePickerBaseProps<RangeSelectionValueType> {
  selectionVariant: "range";
}

export type useDatePickerProps =
  | useDatePickerSingleProps
  | useDatePickerRangeProps;

export function useDatePicker(
  props: useDatePickerProps,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const {
    readOnly = false,
    disabled,
    selectionVariant,
    defaultSelectedDate = null,
    selectedDate: selectedDateProp,
    onSelectedDateChange,
    defaultFocusedInput = null,
    focusedInput: focusedInputProp,
    defaultOpen = false,
    open: openProp,
    minDate = startOfMonth(today(getLocalTimeZone())),
    maxDate = endOfMonth(minDate.add({ months: 1 })),
    ...rest
  } = props;

  const datePickerRef = useRef<HTMLDivElement>(null);
  const containerRef = useForkRef(ref, datePickerRef);
  const prevSelectedDate = useRef<
    SingleSelectionValueType | RangeSelectionValueType | null
  >(null);

  const [focusedInput, setFocusedInput] = useControlled({
    controlled: focusedInputProp,
    default: defaultFocusedInput,
    name: "DatePicker",
    state: "focusedInput",
  });

  const [open, setOpen] = useControlled({
    controlled: openProp,
    default: Boolean(defaultOpen),
    name: "DatePicker",
    state: "openPanel",
  });

  const [selectedDate, setSelectedDate] = useControlled({
    controlled: selectedDateProp,
    default: defaultSelectedDate,
    name: "DatePicker",
    state: "selectedDate",
  });

  const [autoApplyDisabled, setAutoApplyDisabled] = useState<boolean>(false);

  useEffect(() => {
    if (selectionVariant === "range") {
      const rangeValue = selectedDate as RangeSelectionValueType;
      if (!rangeValue?.startDate) {
        setFocusedInput("start");
      } else {
        setFocusedInput("end");
      }
    } else {
      const singleSelectionValue = selectedDate as SingleSelectionValueType;
      if (singleSelectionValue) {
        setFocusedInput("start");
      }
    }
  }, [open]);

  const { disabled: formFieldDisabled, readOnly: formFieldReadOnly } =
    useFormFieldProps();
  const isReadOnly = readOnly || formFieldReadOnly || false;
  const isDisabled = disabled || formFieldDisabled || false;

  const floatingUIResult = useFloatingUI({
    open,
    onOpenChange(nextOpen) {
      setOpen(nextOpen);
    },
    placement: "bottom-start",
    middleware: [flip({ fallbackStrategy: "initialPlacement" })],
  });
  const { getFloatingProps: getFloatingPropsCallback, getReferenceProps } =
    useInteractions([useDismiss(floatingUIResult.context)]);
  const getFloatingProps = useCallback(
    (userProps: React.HTMLProps<HTMLElement> | undefined) => {
      const { x, y, strategy, elements } = floatingUIResult;
      return {
        top: y ?? 0,
        left: x ?? 0,
        position: strategy,
        width: elements.floating?.offsetWidth,
        height: elements.floating?.offsetHeight,
        ...getFloatingPropsCallback(userProps),
      };
    },
    [getFloatingPropsCallback, floatingUIResult]
  );

  const apply = (
    newDate: SingleSelectionValueType | RangeSelectionValueType | null
  ): void => {
    if (newDate === null) {
      onSelectedDateChange(newDate);
    } else {
      if (selectionVariant === "range") {
        const newRangeDate = newDate as RangeSelectionValueType;
        if (newRangeDate?.startDate && newRangeDate?.endDate) {
          setOpen(false);
        }
        onSelectedDateChange(newRangeDate);
      } else {
        const newSingleDate = newDate as SingleSelectionValueType;
        if (newSingleDate) {
          setOpen(false);
        }
        onSelectedDateChange(newSingleDate);
      }
    }
  };

  const setSelectedDateWrapper = (
    newDate: SingleSelectionValueType | RangeSelectionValueType | null
  ) => {
    let inRangeNewDate;
    let startDateInRange = true;
    let endDateInRange = true;
    if (isRangeSelectionValueType(newDate)) {
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

  const setOpenWrapper = (open: boolean): void => {
    prevSelectedDate.current = selectedDate;
    setOpen(open);
  };

  const cancel = () => {
    setSelectedDate(prevSelectedDate.current);
    prevSelectedDate.current = null;
    setOpen(false);
  };

  return {
    state: {
      selectionVariant,
      selectedDate,
      open,
      focusedInput,
      autoApplyDisabled,
      disabled: isDisabled,
      readOnly: isReadOnly,
      floatingUIResult,
      containerRef,
      minDate,
      maxDate,
      ...rest,
    },
    helpers: {
      apply,
      cancel,
      setOpen: setOpenWrapper,
      getFloatingProps,
      getReferenceProps,
      setFocusedInput,
      setSelectedDate: setSelectedDateWrapper,
      setAutoApplyDisabled,
    },
  };
}
