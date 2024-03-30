import { clsx } from "clsx";
import {
  ChangeEvent,
  KeyboardEvent,
  SyntheticEvent,
  ComponentPropsWithoutRef,
  MouseEvent,
  ForwardedRef,
  forwardRef,
  InputHTMLAttributes,
  ReactNode,
  Ref,
  useState,
  useRef,
} from "react";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { CloseIcon, OverflowMenuIcon } from "@salt-ds/icons";
import { makePrefixer, useControlled, useId, useForkRef } from "../utils";
import { useFormFieldProps } from "../form-field-context";
import { StatusAdornment } from "../status-adornment";
import { Pill } from "../pill";
import { useTruncatePills } from "./useTruncatePills";

import pillInputCss from "./PillInput.css";

const withBaseName = makePrefixer("saltPillInput");

export interface PillInputProps
  extends Omit<ComponentPropsWithoutRef<"div">, "defaultValue">,
    Pick<
      ComponentPropsWithoutRef<"input">,
      "disabled" | "value" | "defaultValue" | "placeholder"
    > {
  /**
   * The marker to use in an empty read only Input.
   * Use `''` to disable this feature. Defaults to '—'.
   */
  emptyReadOnlyMarker?: string;
  /**
   * End adornment component
   */
  endAdornment?: ReactNode;
  /**
   * [Attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#Attributes) applied to the `input` element.
   */
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
  /**
   * Optional ref for the input component
   */
  inputRef?: Ref<HTMLInputElement>;
  /**
   * If `true`, the component is read only.
   */
  readOnly?: boolean;
  /**
   * The tokens to display in the input.
   */
  pills?: string[];
  onPillRemove?: (event: SyntheticEvent, index: number) => void;
  /**
   * Start adornment component
   */
  startAdornment?: ReactNode;
  /**
   * Alignment of text within container. Defaults to "left"
   */
  textAlign?: "left" | "center" | "right";
  /**
   * Validation status.
   */
  validationStatus?: "error" | "warning" | "success";
  /**
   * Styling variant. Defaults to "primary".
   */
  variant?: "primary" | "secondary";
  hidePillClose?: boolean;
  truncate?: boolean;
}

export const PillInput = forwardRef(function PillInput(
  {
    "aria-activedescendant": ariaActiveDescendant,
    "aria-expanded": ariaExpanded,
    "aria-owns": ariaOwns,
    className: classNameProp,
    disabled,
    emptyReadOnlyMarker = "—",
    endAdornment,
    hidePillClose,
    id: idProp,
    inputProps = {},
    inputRef: inputRefProp,
    placeholder,
    pills = [],
    onPillRemove,
    readOnly: readOnlyProp,
    role,
    startAdornment,
    style,
    textAlign = "left",
    value: valueProp,
    defaultValue: defaultValueProp = valueProp === undefined ? "" : undefined,
    validationStatus: validationStatusProp,
    variant = "primary",
    truncate,
    ...other
  }: PillInputProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-pill-input",
    css: pillInputCss,
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

  const isDisabled = disabled || formFieldDisabled;
  const isReadOnly = readOnlyProp || formFieldReadOnly;
  const validationStatus = formFieldValidationStatus ?? validationStatusProp;

  const [focusedPillIndex, setFocusedPillIndex] = useState(-1);

  const isEmptyReadOnly = isReadOnly && !defaultValueProp && !valueProp;
  const defaultValue = isEmptyReadOnly ? emptyReadOnlyMarker : defaultValueProp;

  const {
    "aria-describedby": inputDescribedBy,
    "aria-labelledby": inputLabelledBy,
    onChange,
    required: inputPropsRequired,
    onKeyDown: inputOnKeyDown,
    ...restInputProps
  } = inputProps;

  const isRequired = formFieldRequired
    ? ["required", "asterisk"].includes(formFieldRequired)
    : inputPropsRequired;

  const [value, setValue] = useControlled({
    controlled: valueProp,
    default: defaultValue,
    name: "Input",
    state: "value",
  });

  const { visiblePills, pillListRef } = useTruncatePills({
    pills,
    enable: truncate && pills.length > 0,
  });

  const id = useId(idProp);
  const pillListId = `${id}-optionsList`;

  const pillElementsRef = useRef<HTMLElement[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputRef = useForkRef(inputRef, inputRefProp);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setValue(value);
    onChange?.(event);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const target = event.currentTarget;
    if (target.selectionStart === 0 && target.selectionEnd == 0) {
      const lastPillIndex = pills.length - 1;
      const lastPill = pills[lastPillIndex];
      if (event.key === "Backspace" && lastPill) {
        event.preventDefault();
        onPillRemove?.(event, lastPillIndex);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        // Move focus to last pill
        pillElementsRef.current[lastPillIndex]?.focus();
      }
    }

    inputOnKeyDown?.(event);
  };

  const handlePillKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const target = event.currentTarget;
    const index = Number(target.dataset.index);
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      // Move focus to previous pill
      pillElementsRef.current[index - 1]?.focus();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      // Move focus to next pill or input
      if (index === pills.length - 1) {
        inputRef?.current?.focus();
      } else {
        pillElementsRef.current[index + 1]?.focus();
      }
    } else if (event.key == "Delete" || event.key === "Backspace") {
      event.preventDefault();
      onPillRemove?.(event, index);

      if (pills.length === 1) {
        inputRef.current?.focus();
      } else if (index === pills.length - 1) {
        pillElementsRef.current[pills.length - 2]?.focus();
      } else {
        pillElementsRef.current[index]?.focus();
      }
    }
  };

  const handlePillClick = (event: MouseEvent<HTMLButtonElement>) => {
    const target = event.currentTarget;
    const index = Number(target.dataset.index);
    onPillRemove?.(event, index);
    inputRef.current?.focus();
  };

  const inputStyle = {
    "--input-textAlign": textAlign,
    ...style,
  };

  return (
    <div
      className={clsx(
        withBaseName(),
        withBaseName(variant),
        {
          [withBaseName("disabled")]: isDisabled,
          [withBaseName("readOnly")]: isReadOnly,
          [withBaseName("truncate")]: truncate,
          [withBaseName(validationStatus ?? "")]: validationStatus,
        },
        classNameProp
      )}
      ref={ref}
      style={inputStyle}
      {...other}
    >
      {startAdornment && (
        <div className={withBaseName("startAdornmentContainer")}>
          {startAdornment}
        </div>
      )}
      <div className={withBaseName("inputWrapper")} ref={pillListRef}>
        <div
          role="list"
          className={withBaseName("pillList")}
          aria-labelledby={clsx(formFieldLabelledBy, pillListId)}
          aria-label="Selected Options"
          id={pillListId}
        >
          {visiblePills?.map((pill, index) => (
            <div role="listitem" key={index}>
              <Pill
                data-index={index}
                disabled={disabled}
                ref={(element) => {
                  if (element) {
                    pillElementsRef.current[index] = element;
                  } else {
                    pillElementsRef.current = pillElementsRef.current.filter(
                      (pillEl) => pillEl !== element
                    );
                  }
                }}
                onFocus={() => setFocusedPillIndex(index)}
                onKeyDown={handlePillKeyDown}
                onClick={handlePillClick}
                tabIndex={
                  focusedPillIndex === -1 || focusedPillIndex === index ? 0 : -1
                }
              >
                {pill}
                {!hidePillClose && <CloseIcon aria-label="click to close" />}
              </Pill>
            </div>
          ))}
          {visiblePills.length < pills.length && (
            <div role="listitem">
              <div
                data-overflowindicator
                className={withBaseName("overflowIndicator")}
              >
                <OverflowMenuIcon aria-hidden />
              </div>
            </div>
          )}
        </div>
        <input
          aria-describedby={clsx(formFieldDescribedBy, inputDescribedBy)}
          aria-labelledby={clsx(formFieldLabelledBy, inputLabelledBy)}
          className={clsx(withBaseName("input"), inputProps?.className)}
          disabled={isDisabled}
          id={id}
          readOnly={isReadOnly}
          ref={handleInputRef}
          role={role}
          tabIndex={isDisabled ? -1 : 0}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          value={value}
          {...restA11yProps}
          {...restInputProps}
          required={isRequired}
        />
      </div>
      {!isDisabled && !isReadOnly && validationStatus && (
        <StatusAdornment status={validationStatus} />
      )}
      {endAdornment && (
        <div className={withBaseName("endAdornmentContainer")}>
          {endAdornment}
        </div>
      )}
      <div className={withBaseName("activationIndicator")} />
    </div>
  );
});
