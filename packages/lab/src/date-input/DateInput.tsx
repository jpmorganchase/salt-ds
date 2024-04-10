import { clsx } from "clsx";
import {
  ChangeEvent,
  ComponentPropsWithoutRef,
  FocusEvent,
  forwardRef,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";

import dateInputCss from "./DateInput.css";
import {
  Button,
  makePrefixer,
  useControlled,
  useFloatingUI,
  useForkRef,
  useFormFieldProps,
} from "@salt-ds/core";
import {
  CalendarDate,
  DateFormatter,
  DateValue,
} from "@internationalized/date";
import { CalendarIcon } from "@salt-ds/icons";
import { flip, size } from "@floating-ui/react";
import { DateInputContext } from "./DateInputContext";
import { DateInputPanel } from "./DateInputPanel";

const withBaseName = makePrefixer("saltDateInput");

const isInvalidDate = (value: Date | null) =>
  // @ts-ignore evaluating validity of date
  value && isNaN(value);

export const defaultDateFormatter = (date: DateValue | null): string => {
  const newDate = date && new Date(date?.year, date?.month, date?.day);
  if (newDate && !isInvalidDate(newDate)) {
    return new DateFormatter("EN-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(newDate);
  }
  return "";
};

const createDate = (date: string): Date | null => {
  try {
    return new Date(date);
  } catch (err) {
    return null;
  }
};
const dateStringParse = (date: string): string => {
  const newDate = createDate(date);
  return defaultDateFormatter(newDate);
};

export interface DateInputProps
  extends Omit<ComponentPropsWithoutRef<"div">, "defaultValue">,
    Pick<
      ComponentPropsWithoutRef<"input">,
      "disabled" | "value" | "defaultValue" | "placeholder"
    > {
  /**
   * If `true`, the component will be disabled.
   */
  disabled?: boolean;
  /**
   * If `true`, the component is read only.
   */
  readOnly?: boolean;
  /**
   * The marker to use in an empty read only dropdown.
   * Use `''` to disable this feature. Defaults to '—'.
   */
  emptyReadOnlyMarker?: string;
  /**
   * Validation status.
   */
  validationStatus?: "error" | "warning" | "success";
  /**
   * Styling variant. Defaults to "primary".
   */
  variant?: "primary" | "secondary";
  /**
   * Selection variant for calendar.
   */
  selectionVariant?: "default" | "range";
  /**
   * Function to format the input value.
   */
  dateFormatter?: (input: Date | null) => string;
}

export const DateInput = forwardRef<HTMLDivElement, DateInputProps>(
  function DateInput(
    {
      "aria-activedescendant": ariaActiveDescendant,
      "aria-expanded": ariaExpanded,
      "aria-owns": ariaOwns,
      className,
      disabled,
      selectionVariant = "default",
      readOnly,
      emptyReadOnlyMarker,
      value: valueProp,
      defaultValue: defaultStartDateProp = valueProp === undefined
        ? ""
        : undefined,
      validationStatus: validationStatusProp,
      variant = "primary",
      dateFormatter = defaultDateFormatter,
      placeholder = "dd mmm yyyy",
      onBlur,
      onFocus,
      onKeyDown,
      ...rest
    },
    ref
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-dateInput",
      css: dateInputCss,
      window: targetWindow,
    });

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

    const restA11yProps = {
      "aria-activedescendant": ariaActiveDescendant,
      "aria-expanded": ariaExpanded,
      "aria-owns": ariaOwns,
    };

    const isReadOnly = readOnly || formFieldReadOnly;
    const isEmptyReadOnly = isReadOnly && !defaultStartDateProp && !valueProp;
    const defaultValue = isEmptyReadOnly
      ? emptyReadOnlyMarker
      : defaultStartDateProp;
    const [startDate, setStartDate] = useState<DateValue | null>(null);
    const [value, setValue] = useControlled({
      controlled: valueProp,
      default: defaultValue,
      name: "DateInput",
      state: "value",
    });
    const inputRef = useRef();
    const [open, setOpen] = useState<boolean>(false);
    //
    useEffect(() => {
      setValue(dateFormatter(startDate));
    }, [startDate]);

    const dateStatus =
      value && isInvalidDate(new Date(value)) ? "error" : undefined;

    const isDisabled = disabled || formFieldDisabled;
    const validationStatus =
      dateStatus ?? formFieldValidationStatus ?? validationStatusProp;

    const [focused, setFocused] = useState(false);

    const { x, y, strategy, elements, floating, reference, context } =
      useFloatingUI({
        open: open,
        placement: "bottom-start",
        middleware: [
          size({
            apply({ rects, elements, availableHeight }) {
              Object.assign(elements.floating.style, {
                minWidth: `${rects.reference.width}px`,
                maxHeight: `max(calc((var(--salt-size-base) + var(--salt-spacing-100)) * 5), calc(${availableHeight}px - var(--salt-spacing-100)))`,
              });
            },
          }),
          flip({ fallbackStrategy: "initialPlacement" }),
        ],
      });
    const isRequired =
      formFieldRequired && ["required", "asterisk"].includes(formFieldRequired);

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
      setValue(event.target.value);
      // onChange?.(event);
    };

    const handleStartDateBlur = (event: FocusEvent<HTMLInputElement>) => {
      if (value) {
        const stringParsedValue = dateStringParse(value as string);
        const date = createDate(stringParsedValue);
        // TODO: This is not working
        const newDate =
          date &&
          new CalendarDate(date.getFullYear(), date.getMonth(), date.getDay());
        // setValue((old) => dateStringParse(old as string));
        setStartDate(() => newDate);
        // setDateStatus(getDateValidationStatus(stringDate));
      }
      setFocused(false);
      onBlur?.(event);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Tab" && event.shiftKey) {
        setOpen(false);
      }
      onKeyDown?.(event);
    };

    const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
      setFocused(true);
      setOpen(true);
      onFocus?.(event);
    };

    const dateInputContextValue = {
      openState: open,
      setOpen,
      startDate: startDate,
      setStartDate: setStartDate,
      inputValue: value,
      setInputValue: setValue,
    };

    const activeInput = selectionVariant === "default" && open;

    return (
      <DateInputContext.Provider value={dateInputContextValue}>
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
          ref={useForkRef(ref, reference)}
          {...rest}
        >
          <input
            aria-describedby={clsx(formFieldDescribedBy)}
            aria-labelledby={clsx(formFieldLabelledBy)}
            className={clsx(withBaseName("input"), {
              [withBaseName("active")]: activeInput,
            })}
            disabled={isDisabled}
            readOnly={isReadOnly}
            ref={inputRef}
            tabIndex={isDisabled ? -1 : 0}
            onBlur={handleStartDateBlur}
            onKeyDown={handleKeyDown}
            onChange={handleInputChange}
            onFocus={!isDisabled ? handleFocus : undefined}
            placeholder={placeholder}
            value={value}
            {...restA11yProps}
            required={isRequired}
          />
          {
            <div className={withBaseName("endAdornmentContainer")}>
              <Button variant="secondary" onClick={() => setOpen(!open)}>
                <CalendarIcon />
              </Button>
            </div>
          }
          <div className={withBaseName("activationIndicator")} />
        </div>
        <DateInputPanel
          left={x ?? 0}
          top={y ?? 0}
          context={context}
          position={strategy}
          width={elements.floating?.offsetWidth}
          height={elements.floating?.offsetHeight}
          ref={floating}
        />
      </DateInputContext.Provider>
    );
  }
);
