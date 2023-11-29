import {
  Button,
  ButtonProps,
  makePrefixer,
  NecessityType,
  StatusAdornment,
  useDensity,
  useForkRef,
  useId,
  useIsomorphicLayoutEffect,
} from "@salt-ds/core";
import {
  ChangeEventHandler,
  FocusEvent,
  FocusEventHandler,
  ForwardedRef,
  forwardRef,
  HTMLAttributes,
  KeyboardEvent,
  KeyboardEventHandler,
  ReactEventHandler,
  Ref,
  SyntheticEvent,
  TextareaHTMLAttributes,
  useCallback,
  useRef,
  useState,
} from "react";
import {
  TokenizedInputNextHelpers,
  TokenizedInputNextState,
  useTokenizedInputNext,
} from "./useTokenizedInputNext";
import { clsx } from "clsx";
import { InputPill } from "./internal/InputPill";
import { CloseIcon, OverflowMenuIcon } from "@salt-ds/icons";
import { useWidth } from "./internal/useWidth";
import { useResizeObserver } from "./internal/useResizeObserver";
import { calcFirstHiddenIndex } from "./internal/calcFirstHiddenIndex";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import tokenizedInputCss from "./TokenizedInputNext.css";

type ChangeHandler<Item> = (selectedItems: Item[] | undefined) => void;

type ExpandButtonProps = Pick<
  ButtonProps,
  "role" | "aria-roledescription" | "aria-describedby"
> & { accessibleText?: string };

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
  onFocus?: FocusEventHandler<HTMLTextAreaElement | HTMLButtonElement>;
  onBlur?: FocusEventHandler<HTMLTextAreaElement | HTMLButtonElement>;
  onKeyUp?: KeyboardEventHandler<HTMLTextAreaElement | HTMLButtonElement>;
  // Can key down on either input or expand button
  onKeyDown?: KeyboardEventHandler<HTMLTextAreaElement | HTMLButtonElement>;
  onRemoveItem?: (index: number) => void;
  onInputBlur?: FocusEventHandler<HTMLTextAreaElement>;
  onInputFocus?: FocusEventHandler<HTMLTextAreaElement>;
  onInputChange?: ChangeEventHandler<HTMLTextAreaElement>;
  onInputSelect?: ReactEventHandler<HTMLTextAreaElement>;
  onClick?: (event: SyntheticEvent<HTMLElement>) => void;
  onClear?: ReactEventHandler;

  delimiter?: string | string[];
  disableAddOnBlur?: boolean;
  initialSelectedItems?: Item[];
  onChange?: ChangeHandler<Item>;
  onCollapse?: () => void;
  onExpand?: () => void;

  /// from input
  /**
   * Validation status.
   */
  validationStatus?: "error" | "warning" | "success";
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
  //  TODO: should we have variant and bordered?
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
  ref: ForwardedRef<HTMLDivElement>
) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-tokenized-input",
    css: tokenizedInputCss,
    window: targetWindow,
  });

  const density = useDensity();
  const { textAreaRef, helpers, inputProps } = useTokenizedInputNext(rest);

  const {
    "aria-describedby": textAreaDescribedBy,
    "aria-labelledby": textAreaLabelledBy,
    required: textAreaRequired,
    ...restTextAreaProps
  } = textAreaProps;

  const {
    ExpandButtonProps = {
      accessibleText: "expand edit",
    },
    className,
    activeIndices = [],
    selectedItems = [],
    highlightedIndex,
    value,
    expanded,
    disabled,
    onFocus,
    onBlur,
    onKeyDown,
    onRemoveItem,
    onInputChange,
    focused,
    validationStatus,
    readOnly,
    necessity,
    onInputFocus,
    onInputBlur,
    onInputSelect,
    onClear,
    onClick,
    onKeyUp,
    id: idProp,
    expandButtonRef: expandButtonRefProp,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-describedby": ariaDescribedBy,
    ...restProps
  } = inputProps;

  const id = useId(idProp);
  const inputId = `${id}-input`;
  const expandButtonId = `${id}-expand-button`;
  const clearButtonId = `${id}-clear-button`;

  const isRequired = necessity
    ? ["required", "asterisk"].includes(necessity)
    : undefined ?? textAreaRequired;

  const pillsRef = useRef<Record<number, number | undefined>>({});
  const keydownExpandButton = useRef(false);

  const [expandButtonHookRef, expandButtonWidth] = useWidth(density);
  const [clearButtonRef, clearButtonWidth] = useWidth(density);
  const [pillGroupWidth, setPillGroupWidth] = useState<number | null>(null);
  const [firstHiddenIndex, setFirstHiddenIndex] = useState<number | null>(null);
  const expandButtonRef = useForkRef(expandButtonHookRef, expandButtonRefProp);
  const showExpandButton = !expanded && firstHiddenIndex != null;

  const widthOffset = expanded ? clearButtonWidth : expandButtonWidth;

  const containerRef = useResizeObserver<HTMLDivElement>(
    useCallback(
      ([{ contentRect }]) => {
        setPillGroupWidth(contentRect.width - widthOffset);
      },
      [widthOffset]
    )
  );

  useIsomorphicLayoutEffect(
    () => () => {
      // When density changes, set hidden index to null so that pills are in their
      // readonly state before they are measured.
      setFirstHiddenIndex(null);
    },
    [density]
  );

  // useLayoutEffect because of potential layout change
  // We want to do that before paint to avoid layout jumps
  useIsomorphicLayoutEffect(
    () => {
      if (expanded) {
        setFirstHiddenIndex(null);
      } else if (pillGroupWidth != null) {
        setFirstHiddenIndex(
          calcFirstHiddenIndex({
            containerWidth: pillGroupWidth,
            pillWidths: Object.values(pillsRef.current).filter(
              Boolean
            ) as number[],
          })
        );
      }
    },
    // Additional dependency on selectedItems is for the controlled version
    [expanded, pillGroupWidth, selectedItems]
  );

  const hasHelpers = (helpers: TokenizedInputNextHelpers<Item>) => {
    if (process.env.NODE_ENV !== "production") {
      if (helpers == null) {
        console.warn(
          'TokenizedInputNext is used without helpers. You should pass in "helpers" from "useTokenizedInputNext".'
        );
      }
    }
    return helpers != null;
  };

  const handleExpandButtonKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>
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
      helpers.updateExpanded(true);
      keydownExpandButton.current = true;
    }
  };

  const handleInputKeyUp = (
    event: KeyboardEvent<HTMLButtonElement | HTMLTextAreaElement>
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
      helpers.updateExpanded(true);
    }
  };

  const handleClearButtonFocus = (event: FocusEvent<HTMLButtonElement>) => {
    event.stopPropagation();
  };

  const selectedItemIds = selectedItems.map(
    (_, index) => `${id}-pill-${index}`
  );

  const inputAriaLabelledBy = disabled
    ? [ariaLabelledBy, inputId, ...selectedItemIds]
    : [ariaLabelledBy, inputId];

  const expandedWithItems =
    expanded && !showExpandButton && selectedItems.length > 0;
  const {
    accessibleText: expandButtonAccessibleText,
    ...restExpandButtonProps
  } = ExpandButtonProps;

  return (
    <div>
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
            // [withBaseName("bordered")]: bordered,
            [withBaseName("focused")]: !disabled && focused,
            [withBaseName("disabled")]: disabled,
            [withBaseName("readOnly")]: readOnly,
            [withBaseName(validationStatus ?? "")]: validationStatus,
          },
          className
        )}
        ref={useForkRef(ref, containerRef)}
        onClick={onClick}
        {...restProps}
      >
        {selectedItems.length > 0 &&
          selectedItems.map((item, index) => {
            const label = String(item);
            return (
              <InputPill
                disabled={disabled}
                className={clsx({
                  [withBaseName("expanded-pill")]: expanded,
                })}
                hidden={showExpandButton && index >= firstHiddenIndex}
                highlighted={
                  index === highlightedIndex ||
                  activeIndices.indexOf(index) !== -1
                }
                id={`${id}-pill-${index}`}
                index={index}
                key={`${index}-${label}`}
                label={label}
                onClick={expanded ? () => onRemoveItem?.(index) : undefined}
                lastVisible={
                  !showExpandButton && index === selectedItems.length - 1
                }
                onClose={expanded ? () => onRemoveItem?.(index) : undefined}
                closeButtonProps={{ tabIndex: -1 }}
                pillsRef={pillsRef}
              />
            );
          })}
        <textarea
          aria-labelledby={clsx(inputAriaLabelledBy, textAreaLabelledBy)}
          aria-describedby={clsx(ariaDescribedBy, textAreaDescribedBy)}
          aria-label={clsx(ariaLabel, getItemsAriaLabel(selectedItems.length))}
          aria-activedescendant={
            highlightedIndex && highlightedIndex >= 0
              ? `${id}-pill-${highlightedIndex}`
              : undefined
          }
          disabled={disabled}
          id={inputId}
          readOnly={readOnly}
          ref={useForkRef(textAreaRef, textAreaRefProp)}
          required={isRequired}
          rows={1}
          tabIndex={disabled ? -1 : 0}
          value={value}
          className={clsx(withBaseName("textarea"), textAreaProps?.className)}
          onChange={onInputChange}
          onBlur={onInputBlur}
          onFocus={!disabled ? onInputFocus : undefined}
          onSelect={onInputSelect}
          onKeyDown={onKeyDown}
          {...restTextAreaProps}
        />
        {!disabled && !readOnly && validationStatus && (
          <div className={withBaseName("statusAdornmentContainer")}>
            <StatusAdornment status={validationStatus} />
          </div>
        )}
          {expandedWithItems && (
            <Button
              className={clsx(withBaseName("clear-button"), withBaseName("endAdornment"))}
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
              onFocus={onFocus}
              onKeyDown={handleExpandButtonKeyDown}
              onKeyUp={handleInputKeyUp}
              ref={expandButtonRef}
              variant="secondary"
              data-testid="expand-button"
              {...restExpandButtonProps}
            >
              <OverflowMenuIcon />
            </Button>
          )}
        <div className={withBaseName("activationIndicator")} />
      </div>
    </div>
  );
});
