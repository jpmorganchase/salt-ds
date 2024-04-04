import { clsx } from "clsx";
import {
  ChangeEvent,
  ComponentPropsWithoutRef,
  FocusEvent,
  forwardRef,
  InputHTMLAttributes,
  Ref,
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
  UseFloatingUIProps,
  useForkRef,
  useFormFieldProps,
} from "@salt-ds/core";
import { DateFormatter } from "@internationalized/date";
import { InputCalendar } from "./InputCalendar";
import { CalendarIcon } from "@salt-ds/icons";
import { flip, size } from "@floating-ui/react";

const withBaseName = makePrefixer("saltDateInput");

const isInvalidDate = (value: string) =>
  // @ts-ignore evaluating validity of date
  value && isNaN(new Date(value));

const defaultDateFormatter = (input: string): string => {
  const date = new Date(input);

  return isInvalidDate(input)
    ? input
    : new DateFormatter("EN-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(date);
};

export interface DateInputProps
  extends Omit<ComponentPropsWithoutRef<"div">, "defaultValue">,
    Pick<
      ComponentPropsWithoutRef<"input">,
      "disabled" | "value" | "defaultValue" | "placeholder"
    > {
  /**
   * The marker to use in an empty read only DateInput.
   * Use `''` to disable this feature. Defaults to '—'.
   */
  emptyReadOnlyMarker?: string;
  /**
   * [Attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dateInput#Attributes) applied to the `input` elements.
   */
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
  /**
   * Optional ref for the dateInput component
   */
  inputRef?: Ref<HTMLInputElement>;
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
  dateFormatter?: (input: string) => string;
}

export const DateInput = forwardRef<HTMLDivElement, DateInputProps>(
  function DateInput(
    {
      "aria-activedescendant": ariaActiveDescendant,
      "aria-expanded": ariaExpanded,
      "aria-owns": ariaOwns,
      className,
      disabled,
      emptyReadOnlyMarker = "—",
      inputProps = {},
      inputRef,
      readOnly: readOnlyProp,
      value: valueProp,
      defaultValue: defaultStartDateProp = valueProp === undefined
        ? ""
        : undefined,
      validationStatus: validationStatusProp,
      variant = "primary",
      dateFormatter = defaultDateFormatter,
      placeholder = "dd mmm yyyy",
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

    const isReadOnly = readOnlyProp || formFieldReadOnly;
    const isEmptyReadOnly = isReadOnly && !defaultStartDateProp && !valueProp;
    const defaultValue = isEmptyReadOnly
      ? emptyReadOnlyMarker
      : defaultStartDateProp;
    const [value, setValue] = useControlled({
      controlled: valueProp,
      default: defaultValue,
      name: "DateInput",
      state: "value",
    });

    const [open, setOpen] = useState<boolean>(false);

    const getDateValidationStatus = (value: string) =>
      isInvalidDate(value) ? "error" : undefined;

    const [dateStatus, setDateStatus] = useState<"error" | undefined>(
      getDateValidationStatus(value as string)
    );

    const isDisabled = disabled || formFieldDisabled;
    const validationStatus =
      dateStatus ?? formFieldValidationStatus ?? validationStatusProp;

    const [focused, setFocused] = useState(false);

    const {
      "aria-describedby": dateInputDescribedBy,
      "aria-labelledby": dateInputLabelledBy,
      onBlur,
      onChange,
      onFocus,
      required: dateInputPropsRequired,
      ...restDateInputProps
    } = inputProps;

    const handleOpenChange: UseFloatingUIProps["onOpenChange"] = (
      newOpen,
      _event,
      reason
    ) => {
      const focusNotBlur = reason === "focus" && newOpen;
      if (readOnly || focusNotBlur) return;
      setOpen(newOpen);
    };

    const { x, y, strategy, elements, floating, reference, context } =
      useFloatingUI({
        open: true,
        onOpenChange: handleOpenChange,
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
    const isRequired = formFieldRequired
      ? ["required", "asterisk"].includes(formFieldRequired)
      : dateInputPropsRequired;

    const format = (date: string) => {
      const formattedDate = dateFormatter(date);
      setValue(formattedDate);
    };
    const handleStartDateChange = (event: ChangeEvent<HTMLInputElement>) => {
      setValue(event.target.value);
      onChange?.(event);
    };

    const handleStartDateBlur = (event: FocusEvent<HTMLInputElement>) => {
      const stringDate = value as string;
      value && format(stringDate);
      onBlur?.(event);
      setDateStatus(getDateValidationStatus(stringDate));
      setFocused(false);
    };

    const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
      onFocus?.(event);
      setFocused(true);
    };

    return (
      <>
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
            aria-describedby={clsx(formFieldDescribedBy, dateInputDescribedBy)}
            aria-labelledby={clsx(formFieldLabelledBy, dateInputLabelledBy)}
            className={clsx(withBaseName("input"), inputProps?.className)}
            disabled={isDisabled}
            readOnly={isReadOnly}
            ref={inputRef}
            tabIndex={isDisabled ? -1 : 0}
            onBlur={handleStartDateBlur}
            onChange={handleStartDateChange}
            onFocus={!isDisabled ? handleFocus : undefined}
            placeholder={placeholder}
            value={value}
            {...restA11yProps}
            {...restDateInputProps}
            required={isRequired}
          />
          {/*// TODO: add condition to show calendar*/}
          {
            <div className={withBaseName("endAdornmentContainer")}>
              <Button variant="secondary" onClick={() => setOpen(!open)}>
                <CalendarIcon />
              </Button>
            </div>
          }
          <div className={withBaseName("activationIndicator")} />
        </div>
        <InputCalendar
          open={open}
          value={value}
          left={x ?? 0}
          top={y ?? 0}
          position={strategy}
          width={elements.floating?.offsetWidth}
          height={elements.floating?.offsetHeight}
          ref={floating}
        />
      </>
    );
  }
);
