import {
  makePrefixer,
  useControlled,
  useForkRef,
} from "@jpmorganchase/uitk-core";
import cx from "classnames";
import {
  ChangeEvent,
  ElementType,
  FocusEvent,
  FocusEventHandler,
  forwardRef,
  HTMLAttributes,
  InputHTMLAttributes,
  KeyboardEventHandler,
  MouseEvent,
  MouseEventHandler,
  ReactNode,
  useRef,
  useState,
} from "react";
import { useFormFieldProps } from "../form-field-context";
import { useCursorOnFocus } from "./useCursorOnFocus";

import "./Input.css";

const withBaseName = makePrefixer("uitkInput");

// TODO: Double confirm whether this should be extending DivElement given root is `<div>`.
// And forwarded ref is not assigned to the root like other components.
export interface InputProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /**
   * Determines the position of the text cursor on focus of the input.
   *
   * start = place cursor at the beginning<br>
   * end = place cursor at the end<br>
   * \# = index to place the cursor<br>
   */
  cursorPositionOnFocus?: "start" | "end" | number;
  /**
   * The value of the `input` element, required for an uncontrolled component.
   */
  defaultValue?: HTMLInputElement["defaultValue"];
  /**
   * If `true`, the component is disabled.
   */
  disabled?: HTMLInputElement["disabled"];
  /**
   * The marker to use in an empty read only Input.
   * Use `''` to disable this feature. Defaults to '—'.
   */
  emptyReadOnlyMarker?: string;
  /**
   * Determines what gets highlighted on focus of the input.
   *
   * If `true` all text will be highlighted.
   * If an array text between those indices will be highlighted
   * e.g. [0,1] will highlight the first character.
   */
  highlightOnFocus?: boolean | number[];
  /**
   * The HTML element to render the Input, e.g. 'input', a custom React component.
   */
  inputComponent?: ElementType;
  /**
   * [Attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#Attributes) applied to the `input` element.
   */
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  /**
   * Callback for change event.
   */
  onChange?: (event: ChangeEvent<HTMLInputElement>, value: string) => void;
  onFocus?: FocusEventHandler<HTMLInputElement>;
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>;
  onKeyUp?: KeyboardEventHandler<HTMLInputElement>;
  onMouseUp?: MouseEventHandler<HTMLInputElement>;
  onMouseMove?: MouseEventHandler<HTMLInputElement>;
  onMouseDown?: MouseEventHandler<HTMLInputElement>;
  /**
   * If `true`, the component is read only.
   */
  readOnly?: boolean;
  /**
   *
   * Determines the alignment of the input text.
   */
  textAlign?: "left" | "right" | "center";
  type?: HTMLInputElement["type"];
  /**
   * The value of the `input` element, required for a controlled component.
   */
  value?: HTMLInputElement["value"];
  renderSuffix?: (state: {
    disabled?: boolean;
    error?: boolean;
    focused?: boolean;
    margin?: "dense" | "none" | "normal";
    required?: boolean;
    startAdornment?: ReactNode;
  }) => ReactNode;
  endAdornment?: ReactNode;
  startAdornment?: ReactNode;
}

function mergeA11yProps(
  a11yProps: Partial<ReturnType<typeof useFormFieldProps>["a11yProps"]> = {},
  inputProps: InputProps["inputProps"] = {}
) {
  const ariaLabelledBy = cx(
    a11yProps["aria-labelledby"],
    inputProps["aria-labelledby"]
  );

  return {
    ...a11yProps,
    ...inputProps,
    // THe weird filtering is due to TokenizedInputBase
    "aria-labelledby": ariaLabelledBy
      ? Array.from(new Set(ariaLabelledBy.split(" "))).join(" ")
      : null,
  };
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    className: classNameProp,
    cursorPositionOnFocus,
    disabled,
    emptyReadOnlyMarker = "—",
    endAdornment,
    highlightOnFocus,
    id,
    inputComponent: InputComponent = "input",
    inputProps: inputPropsProp,
    style,
    value: valueProp,
    // If we leave both value and defaultValue undefined, we will get a React warning on first edit
    // (uncontrolled to controlled warning) from the React input
    defaultValue: defaultValueProp = valueProp === undefined ? "" : undefined,
    onBlur,
    onChange,
    onFocus,
    onKeyDown,
    onKeyUp,
    onMouseUp,
    onMouseMove,
    onMouseDown,
    readOnly: readOnlyProp,
    renderSuffix,
    startAdornment,
    textAlign = "left",
    type = "text",
    ...other
  },
  ref
) {
  const {
    a11yProps: {
      readOnly: a11yReadOnly,
      disabled: a11yDisabled,
      ...restA11y
    } = {},
    setFocused: setFormFieldFocused,
    inFormField,
  } = useFormFieldProps();

  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);
  const handleRef = useForkRef(inputRef, ref);
  const cursorOnFocusHelpers = useCursorOnFocus(inputRef, {
    cursorPositionOnFocus,
    highlightOnFocus,
  });

  const isDisabled = disabled || a11yDisabled;
  const isReadOnly = readOnlyProp || a11yReadOnly;
  const inputProps = mergeA11yProps(restA11y, inputPropsProp);
  const isEmptyReadOnly = isReadOnly && !defaultValueProp && !valueProp;
  const defaultValue = isEmptyReadOnly ? emptyReadOnlyMarker : defaultValueProp;

  const [value, setValue] = useControlled({
    controlled: valueProp,
    default: defaultValue,
    name: "Input",
    state: "value",
  });

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setValue(value);
    onChange?.(event, value);
  };

  const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
    onFocus?.(event);
    setFormFieldFocused?.(true);
    setFocused(true);
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    onBlur?.(event);
    setFormFieldFocused?.(false);
    setFocused(false);
  };

  const handleMouseMove = (event: MouseEvent<HTMLInputElement>) => {
    cursorOnFocusHelpers.handleMouseMove(event);

    onMouseMove?.(event);
  };

  const handleMouseUp = (event: MouseEvent<HTMLInputElement>) => {
    cursorOnFocusHelpers.handleMouseUp();

    onMouseUp?.(event);
  };

  const handleMouseDown = (event: MouseEvent<HTMLInputElement>) => {
    cursorOnFocusHelpers.handleMouseDown();

    onMouseDown?.(event);
  };

  return (
    <div
      className={cx(
        withBaseName(),
        {
          [withBaseName(`${textAlign}TextAlign`)]: textAlign,
          [withBaseName("formField")]: inFormField,
          [withBaseName("focused")]: focused && !inFormField,
          [withBaseName("disabled")]: isDisabled,
          [withBaseName("inputAdornedStart")]: startAdornment,
          [withBaseName("inputAdornedEnd")]: endAdornment,
        },
        classNameProp
      )}
      style={style}
      {...other}
    >
      {startAdornment && (
        <div className={withBaseName("prefixContainer")}>{startAdornment}</div>
      )}
      <InputComponent
        type={type}
        id={id}
        {...inputProps}
        className={cx(withBaseName("input"), inputProps?.className)}
        disabled={isDisabled}
        ref={handleRef}
        value={value}
        onBlur={handleBlur}
        onChange={handleChange}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        onFocus={handleFocus}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        readOnly={isReadOnly}
      />
      {endAdornment && (
        <div className={withBaseName("suffixContainer")}>{endAdornment}</div>
      )}
      {/* TODO: Confirm implementation of suffix */}
      {renderSuffix?.({ disabled, focused })}
    </div>
  );
});
