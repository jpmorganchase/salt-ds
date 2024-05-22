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
  useCallback,
  useEffect,
  useId,
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
} from "@salt-ds/core";
import {
  CalendarDate,
  DateFormatter,
  DateValue,
  getLocalTimeZone,
  parseAbsoluteToLocal,
} from "@internationalized/date";
import { useDatePickerContext } from "../date-picker/DatePickerContext";

const withBaseName = makePrefixer("saltDateInput");
const isInvalidDate = (value: string) =>
  // @ts-ignore evaluating validity of date
  value && isNaN(new Date(value));
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

const getDateValidationStatus = (value: string | undefined) =>
  value && isInvalidDate(value) ? "error" : undefined;

const defaultDateFormatter = (date: DateValue | undefined): string => {
  return date
    ? new DateFormatter("EN-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(date.toDate(getLocalTimeZone()))
    : "";
};

export interface DateInputProps
  extends Omit<ComponentPropsWithoutRef<"div">, "defaultValue">,
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
}

export const DateInput = forwardRef<HTMLDivElement, DateInputProps>(
  function DateInput(
    {
      className,
      ariaLabel,
      disabled,
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
      startDate,
      endDate,
      setStartDate,
      setEndDate,
      selectionVariant,
      openState,
      setOpen,
      validationStatusState,
      setValidationStatus,
    } = useDatePickerContext();

    const endDateInputID = useId();
    const startDateInputID = useId();

    const [focused, setFocused] = useState(false);
    const [startDateStringValue, setStartDateStringValue] = useState<string>(
      dateFormatter(startDate)
    );
    const [endDateStringValue, setEndDateStringValue] = useState<string>(
      dateFormatter(endDate)
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

    const validationStatus =
      validationStatusState ??
      formFieldValidationStatus ??
      validationStatusProp;

    const {
      "aria-describedby": dateInputDescribedBy,
      "aria-labelledby": dateInputLabelledBy,
      onBlur,
      onChange,
      onFocus,
      required: dateInputPropsRequired,
      ...restDateInputProps
    } = inputProps;

    const validateRange = useCallback(() => {
      if (startDate && endDate) {
        setValidationStatus(
          startDate?.compare(endDate) >= 1 ? "error" : undefined
        );
      }
    }, [endDate, startDate, setValidationStatus]);

    // Effects. Update date strings when dates change
    useEffect(() => {
      setStartDateStringValue(dateFormatter(startDate));
      validateRange();
    }, [startDate, dateFormatter, validateRange]);

    useEffect(() => {
      setEndDateStringValue(dateFormatter(endDate));
      validateRange();
    }, [endDate, dateFormatter, validateRange]);

    const isRequired = formFieldRequired
      ? ["required", "asterisk"].includes(formFieldRequired)
      : dateInputPropsRequired;
    const updateStartDate = (dateString: string) => {
      if (!dateString) setStartDate(undefined);
      const inputDate = inputStringFormatter(dateString);
      const calendarDate = getCalendarDate(inputDate);
      const emptyDateStatus = !calendarDate && inputDate ? "error" : undefined;
      setValidationStatus(
        getDateValidationStatus(dateString) ??
          getDateValidationStatus(endDateStringValue) ??
          emptyDateStatus
      );
      if (calendarDate) {
        setStartDate(calendarDate);
      }
    };

    const updateEndDate = (dateString: string) => {
      if (!dateString) setEndDate(undefined);
      const inputDate = inputStringFormatter(dateString);
      const calendarDate = getCalendarDate(inputDate);
      const emptyDateStatus = !calendarDate && inputDate ? "error" : undefined;
      setValidationStatus(
        getDateValidationStatus(dateString) ??
          getDateValidationStatus(startDateStringValue) ??
          emptyDateStatus
      );
      if (calendarDate) {
        setEndDate(calendarDate);
      }
    };

    // Handlers
    const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
      onFocus?.(event);
      setFocused(true);
    };
    const handleStartDateBlur = (event: FocusEvent<HTMLInputElement>) => {
      updateStartDate(event.target.value);
      setFocused(false);
      onBlur?.(event);
    };

    const handleStartDateChange = (event: ChangeEvent<HTMLInputElement>) => {
      setStartDateStringValue(event.target.value);
      onChange?.(event);
    };

    const handleStartDateKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        updateStartDate(startDateStringValue);
        setOpen(false);
      }
      if (event.key === "Tab" && event.shiftKey && openState) {
        setOpen(false);
      }
    };

    const handleEndDateBlur = (event: FocusEvent<HTMLInputElement>) => {
      updateEndDate(event.target.value);
      setFocused(false);
      onBlur?.(event);
    };
    const handleEndDateChange = (event: ChangeEvent<HTMLInputElement>) => {
      setEndDateStringValue(event.target.value);
      onChange?.(event);
    };
    const handleEndDateKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        updateEndDate(endDateStringValue);
        setOpen(false);
      }
      if (event.key === "Tab" && openState) {
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
        ref={inputRef}
        {...rest}
      >
        <input
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
              aria-describedby={clsx(
                formFieldDescribedBy,
                dateInputDescribedBy
              )}
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
  }
);
