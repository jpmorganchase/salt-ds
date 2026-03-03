import {
  type AdornmentValidationStatus,
  Button,
  type ButtonProps,
  makePrefixer,
  type NecessityType,
  StatusAdornment,
  useForkRef,
  useIcon,
  useId,
  type ValidationStatus,
} from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ChangeEventHandler,
  type FocusEvent,
  type FocusEventHandler,
  type ForwardedRef,
  forwardRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type KeyboardEventHandler,
  type ReactEventHandler,
  type Ref,
  type SyntheticEvent,
  type TextareaHTMLAttributes,
  useRef,
} from "react";
import { InputPill } from "./internal/InputPill";
import tokenizedInputCss from "./TokenizedInputNext.css";
import {
  type TokenizedInputNextHelpers,
  type TokenizedInputNextState,
  useTokenizedInputNext,
} from "./useTokenizedInputNext";

type ChangeHandler<Item> = (
  event: SyntheticEvent,
  selectedItems: Item[] | undefined,
) => void;

type ExpandButtonProps = Pick<
  ButtonProps,
  "role" | "aria-roledescription" | "aria-describedby"
> & { "aria-label"?: string };

export interface TokenizedInputNextProps<Item>
  extends Partial<TokenizedInputNextState<Item>>,
    Omit<
      HTMLAttributes<HTMLDivElement>,
      "onFocus" | "onBlur" | "onChange" | "onKeyUp" | "onKeyDown"
    > {
  ExpandButtonProps?: ExpandButtonProps;
  disabled?: boolean;
  focused?: boolean;
  expandButtonRef?: Ref<HTMLButtonElement>;
  onBlur?: FocusEventHandler<HTMLTextAreaElement | HTMLButtonElement>;
  onKeyUp?: KeyboardEventHandler<HTMLTextAreaElement | HTMLButtonElement>;
  // Can key down on either input or expand button
  onKeyDown?: KeyboardEventHandler<HTMLTextAreaElement | HTMLButtonElement>;
  onRemoveItem?: (event: SyntheticEvent, index: number) => void;
  onInputBlur?: FocusEventHandler<HTMLTextAreaElement>;
  onInputFocus?: FocusEventHandler<HTMLTextAreaElement>;
  onInputChange?: ChangeEventHandler<HTMLTextAreaElement>;
  onClick?: ReactEventHandler;
  onClear?: ReactEventHandler;
  delimiters?: string[];
  disableAddOnBlur?: boolean;
  defaultSelected?: Item[];
  onChange?: ChangeHandler<Item>;
  onCollapse?: ReactEventHandler;
  onExpand?: ReactEventHandler;

  /// from input
  /**
   * Validation status.
   */
  validationStatus?: Omit<ValidationStatus, "info">;
  /**
   * If `true`, the component is read only.
   */
  readOnly?: boolean;
  /**
   * [Attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea#Attributes) applied to the `textarea` element.
   */
  textAreaProps?: TextareaHTMLAttributes<HTMLTextAreaElement>;
  /**
   * Optional ref for the textarea component
   */
  textAreaRef?: Ref<HTMLTextAreaElement>;
  necessity?: NecessityType;
  /**
   * Styling variant. Defaults to "primary".
   */
  variant?: "primary" | "secondary";
}

const withBaseName = makePrefixer("saltTokenizedInputNext");

const getItemsAriaLabel = (itemCount: number) =>
  itemCount === 0
    ? "no item selected"
    : `${itemCount} ${itemCount > 1 ? "items" : "item"}`;

export const TokenizedInputNext = forwardRef(function TokenizedInputNext<Item>(
  {
    textAreaRef: textAreaRefProp,
    textAreaProps = {},
    variant = "primary",
    ...rest
  }: TokenizedInputNextProps<Item>,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-tokenized-input-next",
    css: tokenizedInputCss,
    window: targetWindow,
  });
  const {
    "aria-describedby": textAreaDescribedBy,
    "aria-labelledby": textAreaLabelledBy,
    required: textAreaRequired,
    ...restTextAreaProps
  } = textAreaProps;

  const { refs, helpers, inputProps, firstHiddenIndex } =
    useTokenizedInputNext(rest);

  const {
    textAreaRef: textAreaHookRef,
    pillsRef,
    clearButtonRef,
    expandButtonRef,
    statusAdornmentRef,
    containerRef: containerHookRef,
  } = refs;

  const {
    ExpandButtonProps = {
      "aria-label": "expand edit",
    },
    className,
    activeIndices = [],
    selectedItems = [],
    highlightedIndex,
    value,
    expanded,
    disabled,
    onBlur,
    onKeyDown,
    onRemoveItem,
    onInputChange,
    focused,
    validationStatus,
    readOnly,
    onInputFocus,
    onInputBlur,
    onClear,
    onClick,
    onKeyUp,
    id: idProp,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-describedby": ariaDescribedBy,
    ...restProps
  } = inputProps;
  const { OverflowIcon, CloseIcon } = useIcon();
  const id = useId(idProp);
  const inputId = `${id}-input`;
  const expandButtonId = `${id}-expand-button`;
  const clearButtonId = `${id}-clear-button`;

  const keydownExpandButton = useRef(false);
  const containerRef = useForkRef(ref, containerHookRef);
  const textAreaRef = useForkRef(textAreaHookRef, textAreaRefProp);
  const showExpandButton = !expanded && firstHiddenIndex != null;

  const hasHelpers = (helpers: TokenizedInputNextHelpers<Item>) => {
    if (process.env.NODE_ENV !== "production") {
      if (helpers == null) {
        console.warn(
          'TokenizedInputNext is used without helpers. You should pass in "helpers" from "useTokenizedInputNext".',
        );
      }
    }
    return helpers != null;
  };

  const handleExpandButtonKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
  ) => {
    const singleChar = event.key.length === 1;
    const triggerExpand =
      [
        "CONTROL",
        "META",
        "ENTER",
        "BACKSPACE",
        "ARROWDOWN",
        "ARROWLEFT",
        "ARROWRIGHT",
      ].indexOf(event.key.toUpperCase()) !== -1;

    if ((singleChar || triggerExpand) && hasHelpers(helpers)) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        event.stopPropagation();
      }
      helpers.updateExpanded(event, true);
      keydownExpandButton.current = true;
    }
  };

  const handleInputKeyUp = (
    event: KeyboardEvent<HTMLButtonElement | HTMLTextAreaElement>,
  ) => {
    // Call keydown again if the initial event has been used to expand the input
    if (keydownExpandButton.current && "Enter" !== event.key) {
      keydownExpandButton.current = false;
      onKeyDown?.(event);
    }
    onKeyUp?.(event);
  };

  const handleExpand = (event: SyntheticEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    if (hasHelpers(helpers)) {
      helpers.updateExpanded(event, true);
    }
  };

  const handleClearButtonFocus = (event: FocusEvent<HTMLButtonElement>) => {
    event.stopPropagation();
  };

  const selectedItemIds = selectedItems.map(
    (_, index) => `${id}-pill-${index}`,
  );

  const inputAriaLabelledBy = disabled
    ? [ariaLabelledBy, inputId, ...selectedItemIds]
    : [ariaLabelledBy, inputId];

  const expandedWithItems =
    expanded && !showExpandButton && selectedItems.length > 0;
  const { "aria-label": expandButtonAccessibleText, ...restExpandButtonProps } =
    ExpandButtonProps;

  return (
    <div className={withBaseName("container")}>
      <span
        aria-owns={selectedItemIds.join(" ")}
        className={withBaseName("hidden")}
        role="listbox"
      />
      <div
        className={clsx(
          withBaseName(),
          withBaseName(variant),
          {
            [withBaseName("expanded")]: expanded,
            [withBaseName("focused")]: !disabled && focused,
            [withBaseName("disabled")]: disabled,
            [withBaseName("readOnly")]: readOnly,
            [withBaseName(validationStatus as string)]: validationStatus,
          },
          className,
        )}
        ref={containerRef}
        onClick={onClick}
        // Tab index allows the div to be found as related target and prevents it closing when a click in happens
        tabIndex={-1}
        {...restProps}
      >
        {selectedItems.length > 0 &&
          selectedItems.map((item, index) => {
            const label = String(item);
            return (
              <InputPill
                disabled={disabled}
                hidden={showExpandButton && index >= firstHiddenIndex}
                highlighted={
                  index === highlightedIndex ||
                  activeIndices.indexOf(index) !== -1
                }
                id={`${id}-pill-${index}`}
                index={index}
                key={`${index}-${label}`}
                label={label}
                onClose={
                  expanded && !readOnly
                    ? (event) => onRemoveItem?.(event, index)
                    : undefined
                }
                pillsRef={pillsRef}
              />
            );
          })}
        <textarea
          aria-labelledby={
            clsx(inputAriaLabelledBy, textAreaLabelledBy) || undefined
          }
          aria-describedby={
            clsx(ariaDescribedBy, textAreaDescribedBy) || undefined
          }
          aria-label={clsx(ariaLabel, getItemsAriaLabel(selectedItems.length))}
          aria-activedescendant={
            highlightedIndex && highlightedIndex >= 0
              ? `${id}-pill-${highlightedIndex}`
              : undefined
          }
          disabled={disabled}
          id={inputId}
          readOnly={readOnly}
          ref={textAreaRef}
          required={textAreaRequired}
          rows={1}
          tabIndex={disabled ? -1 : 0}
          value={value}
          className={clsx(withBaseName("textarea"), textAreaProps?.className)}
          onChange={onInputChange}
          onBlur={onInputBlur}
          onFocus={!disabled ? onInputFocus : undefined}
          onKeyDown={onKeyDown}
          {...restTextAreaProps}
        />
        <div className={withBaseName("endAdornmentContainer")}>
          {!disabled && !readOnly && validationStatus && (
            <StatusAdornment
              className={withBaseName("statusAdornment")}
              ref={statusAdornmentRef}
              status={validationStatus as AdornmentValidationStatus}
            />
          )}
          {expandedWithItems && !readOnly && (
            <Button
              className={withBaseName("endAdornment")}
              disabled={disabled}
              id={clearButtonId}
              onBlur={onBlur}
              onClick={onClear}
              onFocus={handleClearButtonFocus}
              ref={clearButtonRef}
              variant="secondary"
              data-testid="clear-button"
              aria-label="clear input"
            >
              <CloseIcon aria-hidden />
            </Button>
          )}
          {showExpandButton && (
            <Button
              className={withBaseName("endAdornment")}
              aria-label={expandButtonAccessibleText}
              aria-labelledby={clsx(ariaLabelledBy, inputId, expandButtonId)}
              disabled={disabled}
              id={expandButtonId}
              onBlur={onBlur}
              onClick={handleExpand}
              onKeyDown={handleExpandButtonKeyDown}
              onKeyUp={handleInputKeyUp}
              ref={expandButtonRef}
              variant="secondary"
              data-testid="expand-button"
              {...restExpandButtonProps}
            >
              <OverflowIcon />
            </Button>
          )}
        </div>

        <div className={withBaseName("activationIndicator")} />
      </div>
    </div>
  );
});
