import { clsx } from "clsx";
import {
  ChangeEvent,
  ComponentPropsWithoutRef,
  FocusEvent,
  forwardRef,
  InputHTMLAttributes,
  KeyboardEvent,
  ReactNode,
  RefObject,
  SyntheticEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";

import dateInputCss from "./DateInput.css";
import {
  makePrefixer,
  StatusAdornment,
  useForkRef,
  useFormFieldProps,
  useId,
} from "@salt-ds/core";
import {
  CalendarDate,
  DateFormatter,
  DateValue,
  getLocalTimeZone,
  parseAbsoluteToLocal,
} from "@internationalized/date";
import { useDatePickerContext } from "../date-picker/DatePickerContext";
import {
  isRangeOrOffsetSelectionWithStartDate,
  RangeSelectionValueType,
  SingleSelectionValueType,
} from "../calendar";

const withBaseName = makePrefixer("saltDateInput");
const isInvalidDate = (value: string) =>
  value && isNaN(new Date(value).getDay());
const createDate = (date: string): Date | null => {
  if (!date || isInvalidDate(date)) {
    return null;
  }
  return new Date(date);
};

const getIsoDate = (date: Date) => {
  try {
    return parseAbsoluteToLocal(date?.toISOString());
  } catch (err) {
    return undefined;
  }
};

function getCalendarDate(inputDate: string) {
  const date = createDate(inputDate);
  if (!date) return undefined;
  const isoDate = getIsoDate(date);
  return isoDate && new CalendarDate(isoDate.year, isoDate.month, isoDate.day);
}

const defaultDateFormatter = (date: DateValue | undefined): string => {
  return date
    ? new DateFormatter("EN-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(date.toDate(getLocalTimeZone()))
    : "";
};

export interface DateInputProps<SelectionVariantType>
  extends Omit<ComponentPropsWithoutRef<"div">, "defaultValue" | "onChange">,
    Pick<ComponentPropsWithoutRef<"input">, "disabled" | "placeholder"> {
  ariaLabel?: string;
  /**
   * The marker to use in an empty read only DateInput.
   * Use `''` to disable this feature. Defaults to '—'.
   */
  emptyReadOnlyMarker?: string;
  /**
   * End adornment component
   */
  endAdornment?: ReactNode;
  /**
   * [Attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dateInput#Attributes) applied to the `input` elements.
   */
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
  /**
   * If `true`, the component is read only.
   */
  readOnly?: boolean;
  /**
   * Validation status.
   */
  validationStatus?: "error" | "warning" | "success";
  /**
   * Styling variant. Defaults to "primary".
   */
  variant?: "primary" | "secondary";
  /**
   * Function to format the input value.
   */
  dateFormatter?: (input: DateValue | undefined) => string;
  /**
   * Reference for the startInput;
   */
  startInputRef?: RefObject<HTMLInputElement>;
  /**
   * Reference for the endInput;
   */
  endInputRef?: RefObject<HTMLInputElement>;
  /**
   * Selection variant. Defaults to single select.
   */
  selectionVariant?: "default" | "range";
  /**
   * Callback fired when the selected date change.
   */
  onSelectionChange?: (
    event: SyntheticEvent,
    selectedDate?: SelectionVariantType
  ) => void;
  /**
   * Callback fired when the input value change.
   */
  onChange?: SelectionVariantType extends SingleSelectionValueType
    ? (
        event: ChangeEvent<HTMLInputElement>,
        selectedDateInputValue?: string
      ) => void
    : (
        event: ChangeEvent<HTMLInputElement>,
        startDateInputValue?: string,
        endDateInputValue?: string
      ) => void;
}

export const DateInput = forwardRef<
  HTMLDivElement,
  DateInputProps<SingleSelectionValueType | RangeSelectionValueType>
>(function DateInput(
  {
    className,
    disabled,
    "aria-label": ariaLabel,
    selectionVariant: selectionVariantProp,
    emptyReadOnlyMarker = "—",
    inputProps = {},
    endAdornment,
    readOnly: readOnlyProp,
    validationStatus: validationStatusProp,
    variant = "primary",
    dateFormatter = defaultDateFormatter,
    placeholder = "dd mmm yyyy",
    startInputRef,
    endInputRef,
    onSelectionChange,
    onChange,
    ...rest
  },
  ref
) {
  const wrapperRef = useRef(null);
  const inputRef = useForkRef<HTMLDivElement>(ref, wrapperRef);
  const inputStringFormatter = (input: string): string => {
    const date = getCalendarDate(input);
    return !input || !date ? input : dateFormatter(date);
  };
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-dateInput",
    css: dateInputCss,
    window: targetWindow,
  });

  const {
    selectedDate,
    setSelectedDate,
    selectionVariant: pickerSelectionVariant,
    openState,
    setOpen,
  } = useDatePickerContext();

  const selectionVariant = selectionVariantProp ?? pickerSelectionVariant;
  const isRangePicker =
    isRangeOrOffsetSelectionWithStartDate(selectedDate) ||
    selectionVariant === "range";

  const endDateInputID = useId();
  const startDateInputID = useId();

  const [focused, setFocused] = useState(false);
  const [startDateStringValue, setStartDateStringValue] = useState<string>(
    dateFormatter(
      isRangeOrOffsetSelectionWithStartDate(selectedDate)
        ? selectedDate?.startDate
        : selectedDate
    )
  );
  const [endDateStringValue, setEndDateStringValue] = useState<string>(
    dateFormatter(
      isRangeOrOffsetSelectionWithStartDate(selectedDate)
        ? selectedDate?.endDate
        : undefined
    )
  );

  const {
    a11yProps: {
      "aria-describedby": formFieldDescribedBy,
      "aria-labelledby": formFieldLabelledBy,
    } = {},
    disabled: formFieldDisabled,
    readOnly: formFieldReadOnly,
    necessity: formFieldRequired,
    validationStatus: formFieldValidationStatus,
  } = useFormFieldProps();

  const isReadOnly = readOnlyProp || formFieldReadOnly;
  const isDisabled = disabled || formFieldDisabled;

  const validationStatus = formFieldValidationStatus ?? validationStatusProp;

  const {
    "aria-describedby": dateInputDescribedBy,
    "aria-labelledby": dateInputLabelledBy,
    onBlur,
    onKeyDown,
    onFocus,
    required: dateInputPropsRequired,
    ...restDateInputProps
  } = inputProps;

  // Update date strings when dates change
  useEffect(() => {
    if (isRangeOrOffsetSelectionWithStartDate(selectedDate)) {
      selectedDate?.startDate &&
        setStartDateStringValue(dateFormatter(selectedDate?.startDate));
      selectedDate?.endDate &&
        setEndDateStringValue(dateFormatter(selectedDate?.endDate));
    } else {
      setStartDateStringValue(dateFormatter(selectedDate));
    }
  }, [selectedDate, dateFormatter, selectionVariant]);

  const isRequired = formFieldRequired
    ? ["required", "asterisk"].includes(formFieldRequired)
    : dateInputPropsRequired;
  const updateStartDate = (event: SyntheticEvent, dateString: string) => {
    const inputDate = inputStringFormatter(dateString);
    const calendarDate = getCalendarDate(inputDate);
    const newSelectedDate = isRangePicker
      ? { ...selectedDate, startDate: calendarDate }
      : calendarDate;
    setSelectedDate(newSelectedDate);
    onSelectionChange?.(event, newSelectedDate);
  };

  const updateEndDate = (event: SyntheticEvent, dateString: string) => {
    const inputDate = inputStringFormatter(dateString);
    const calendarDate = getCalendarDate(inputDate);
    const newSelectedDate = { ...selectedDate, endDate: calendarDate };
    setSelectedDate(newSelectedDate);
    onSelectionChange?.(event, newSelectedDate);
  };

  // Handlers
  const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
    onFocus?.(event);
    setFocused(true);
  };
  const handleStartDateBlur = (event: FocusEvent<HTMLInputElement>) => {
    updateStartDate(event, event.target.value);
    setFocused(false);
  };

  const handleStartDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newStartValue = event.target.value;
    setStartDateStringValue(newStartValue);
    onChange?.(event, newStartValue, endDateStringValue);
  };

  const handleStartDateKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      updateStartDate(event, startDateStringValue);
      setOpen(false);
    }
    if (event.key === "Tab" && event.shiftKey && openState) {
      setOpen(false);
    }
  };

  const handleEndDateBlur = (event: FocusEvent<HTMLInputElement>) => {
    updateEndDate(event, event.target.value);
    setFocused(false);
  };
  const handleEndDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newEndValue = event.target.value;
    setEndDateStringValue(newEndValue);
    onChange?.(event, startDateStringValue, newEndValue);
  };
  const handleEndDateKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      updateEndDate(event, endDateStringValue);
      setOpen(false);
    }
  };

  const handleInputClick = (event: SyntheticEvent<HTMLDivElement>) => {
    if (event.target === wrapperRef.current) {
      startInputRef?.current?.focus();
    }
  };

  return (
    <div
      className={clsx(
        withBaseName(),
        withBaseName(variant),
        {
          [withBaseName("focused")]: !isDisabled && focused,
          [withBaseName("disabled")]: isDisabled,
          [withBaseName("readOnly")]: isReadOnly,
          [withBaseName(validationStatus ?? "")]: validationStatus,
        },
        className
      )}
      onClick={(event) => handleInputClick(event)}
      onKeyDown={onKeyDown}
      onBlur={onBlur}
      ref={inputRef}
      {...rest}
    >
      <input
        autoComplete="off"
        aria-describedby={clsx(formFieldDescribedBy, dateInputDescribedBy)}
        aria-labelledby={clsx(
          formFieldLabelledBy,
          dateInputLabelledBy,
          startDateInputID
        )}
        aria-label={clsx("Start date", ariaLabel)}
        id={startDateInputID}
        className={withBaseName("input")}
        disabled={isDisabled}
        readOnly={isReadOnly}
        ref={startInputRef}
        tabIndex={isDisabled ? -1 : 0}
        onBlur={handleStartDateBlur}
        onChange={handleStartDateChange}
        onKeyDown={handleStartDateKeyDown}
        onFocus={!isDisabled ? handleFocus : undefined}
        placeholder={placeholder}
        size={placeholder.length}
        value={
          isReadOnly && !startDateStringValue
            ? emptyReadOnlyMarker
            : startDateStringValue
        }
        {...restDateInputProps}
        required={isRequired}
      />
      {selectionVariant === "range" && (
        <>
          <span>-</span>
          <input
            autoComplete="off"
            aria-describedby={clsx(formFieldDescribedBy, dateInputDescribedBy)}
            aria-labelledby={clsx(
              formFieldLabelledBy,
              dateInputLabelledBy,
              endDateInputID
            )}
            aria-label={clsx("End date", ariaLabel)}
            id={endDateInputID}
            className={withBaseName("input")}
            disabled={isDisabled}
            readOnly={isReadOnly}
            ref={endInputRef}
            tabIndex={isDisabled ? -1 : 0}
            onBlur={handleEndDateBlur}
            onChange={handleEndDateChange}
            onKeyDown={handleEndDateKeyDown}
            onFocus={!isDisabled ? handleFocus : undefined}
            placeholder={placeholder}
            size={placeholder.length}
            value={
              isReadOnly && !endDateStringValue
                ? emptyReadOnlyMarker
                : endDateStringValue
            }
            required={isRequired}
            {...restDateInputProps}
          />
        </>
      )}
      {
        <div className={withBaseName("endAdornmentContainer")}>
          {!isDisabled && !isReadOnly && validationStatus && (
            <StatusAdornment status={validationStatus} />
          )}
          {endAdornment}
        </div>
      }
      <div className={withBaseName("activationIndicator")} />
    </div>
  );
});
