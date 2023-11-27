import {
  Button,
  ButtonProps,
  makePrefixer,
  MultilineInput,
  MultilineInputProps,
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
  useCallback,
  useRef,
  useState,
} from "react";
import {
  TokenizedInputHelpers,
  TokenizedInputState,
  useTokenizedInput,
} from "./useTokenizedInput";
import { clsx } from "clsx";
import { InputPill } from "./internal/InputPill";
import { CloseIcon, OverflowMenuIcon } from "@salt-ds/icons";
import { useWidth } from "./internal/useWidth";
import { useResizeObserver } from "./internal/useResizeObserver";
import { calcFirstHiddenIndex } from "./internal/calcFirstHiddenIndex";
import deepmerge from "deepmerge";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import tokenizedInputCss from "./TokenizedInput.css";

export type StringToItem<Item> = (
  selectedItems: Item[],
  value: string
) => Item | null | undefined;

export type ChangeHandler<Item> = (selectedItems: Item[] | undefined) => void;

export type ExpandButtonProps = Pick<
  ButtonProps,
  "role" | "aria-roledescription" | "aria-describedby"
> & { accessibleText?: string };

export interface TokenizedInputProps<Item>
  extends Partial<TokenizedInputState<Item>>,
    Omit<
      HTMLAttributes<HTMLDivElement>,
      "onFocus" | "onBlur" | "onChange" | "onKeyUp" | "onKeyDown"
    > {
  ExpandButtonProps?: ExpandButtonProps;
  InputProps?: Pick<MultilineInputProps, "aria-describedby" | "textAreaProps">;
  disabled?: boolean;
  expandButtonRef?: Ref<HTMLButtonElement>;
  onFocus?: FocusEventHandler<HTMLInputElement | HTMLButtonElement>;
  onBlur?: FocusEventHandler<HTMLInputElement | HTMLButtonElement>;
  onKeyUp?: KeyboardEventHandler<HTMLDivElement | HTMLButtonElement>;
  // Can key down on either input or expand button
  onKeyDown?: KeyboardEventHandler<HTMLInputElement | HTMLButtonElement>;
  onRemoveItem?: (index: number) => void;
  onInputBlur?: FocusEventHandler<HTMLInputElement>;
  onInputFocus?: FocusEventHandler<HTMLInputElement>;
  onInputChange?: ChangeEventHandler<HTMLInputElement>;
  onInputSelect?: ReactEventHandler<HTMLInputElement>;
  onClick?: (event: SyntheticEvent<HTMLElement>) => void;
  onClear?: ReactEventHandler;

  delimiter?: string | string[];
  disableAddOnBlur?: boolean;
  initialSelectedItems?: Item[];
  onChange?: ChangeHandler<Item>;
  onCollapse?: () => void;
  onExpand?: () => void;
  inputRef?: Ref<HTMLTextAreaElement>;
}

const withBaseName = makePrefixer("saltTokenizedInput");

const getItemsAriaLabel = (itemCount: number) =>
  itemCount === 0
    ? "no item selected"
    : `${itemCount} ${itemCount > 1 ? "items" : "item"}`;

export const TokenizedInput = forwardRef(function TokenizedInput<Item>(
  { inputRef: inputRefProp, onKeyUp, ...restProps }: TokenizedInputProps<Item>,
  ref: ForwardedRef<HTMLDivElement>
) {
  const { inputRef, helpers, inputProps } = useTokenizedInput(restProps);

  const {
    InputProps = {},
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
    onInputFocus,
    onInputBlur,
    onInputSelect,
    onClear,
    onClick,
    id: idProp,
    expandButtonRef: expandButtonRefProp,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    ...restInputProps
  } = inputProps;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-tokenized-input",
    css: tokenizedInputCss,
    window: targetWindow,
  });

  const density = useDensity();

  const id = useId(idProp);
  const inputId = `${id}-input`;
  const expandButtonId = `${id}-expand-button`;
  const clearButtonId = `${id}-clear-button`;

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

  const hasHelpers = (helpers: TokenizedInputHelpers<Item>) => {
    if (process.env.NODE_ENV !== "production") {
      if (helpers == null) {
        console.warn(
          'TokenizedInputBase is used without helpers. You should pass in "helpers" from "useTokenizedInput".'
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
    event: KeyboardEvent<HTMLButtonElement | HTMLInputElement>
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

  const mergedInputProps = deepmerge(
    {
      textAreaProps: {
        onKeyDown: onKeyDown,
        "aria-label": [ariaLabel, getItemsAriaLabel(selectedItems.length)]
          .filter(Boolean)
          .join(" "),
        "aria-labelledby": inputAriaLabelledBy.filter(Boolean).join(" "),
        "aria-activedescendant":
          highlightedIndex && highlightedIndex >= 0
            ? `${id}-pill-${highlightedIndex}`
            : undefined,
      },
    },
    InputProps
  );

  const {
    accessibleText: expandButtonAccessibleText,
    ...restExpandButtonProps
  } = ExpandButtonProps;

  const textAreaRef = useForkRef(inputRef, inputRefProp);
  return (
    <div>
      <span
        aria-owns={selectedItemIds.join(" ")}
        className={withBaseName("hidden")}
        role="listbox"
      />
      <MultilineInput
        rows={1}
        {...mergedInputProps}
        {...restInputProps}
        id={inputId}
        disabled={disabled}
        onChange={onInputChange}
        onBlur={onInputBlur}
        onFocus={onInputFocus}
        onSelect={onInputSelect}
        onClick={onClick}
        value={value}
        textAreaRef={textAreaRef}
        className={clsx(withBaseName(), className)}
        ref={useForkRef(ref, containerRef)}
        startAdornment={
          <div className={withBaseName("pillGroup")}>
            {selectedItems.map((item, index) => {
              const label = String(item);
              return (
                <InputPill
                  disabled={disabled}
                  className={clsx({
                    [withBaseName("expanded-pill")]: expanded,
                  })}
                  hidden={showExpandButton && index >= firstHiddenIndex}
                  // TODO: activeIndices is used to keep highlighted to copy items, check if needs rename
                  highlighted={
                    index === highlightedIndex ||
                    activeIndices.indexOf(index) !== -1
                  }
                  id={`${id}-pill-${index}`}
                  index={index}
                  key={`${index}-${label}`}
                  label={label}
                  lastVisible={
                    !showExpandButton && index === selectedItems.length - 1
                  }
                  onClose={expanded ? () => onRemoveItem?.(index) : undefined}
                  pillsRef={pillsRef}
                />
              );
            })}
          </div>
        }
        endAdornment={
          <>
            {expanded && !showExpandButton && selectedItems.length > 0 && (
              <Button
                className={clsx(withBaseName("clear-button"))}
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
                {...restExpandButtonProps}
              >
                <OverflowMenuIcon />
              </Button>
            )}
          </>
        }
      />
    </div>
  );
});
