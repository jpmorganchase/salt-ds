import {
  Button,
  ButtonProps,
  makePrefixer,
  useDensity,
  useForkRef,
  useId,
  useIsomorphicLayoutEffect,
} from "@jpmorganchase/uitk-core";
import { CloseIcon, OverflowMenuIcon } from "@jpmorganchase/uitk-icons";
import classnames from "classnames";
import deepmerge from "deepmerge";
import {
  ChangeEventHandler,
  FocusEvent,
  FocusEventHandler,
  ForwardedRef,
  forwardRef,
  HTMLAttributes,
  KeyboardEvent,
  KeyboardEventHandler,
  ReactElement,
  ReactEventHandler,
  Ref,
  SyntheticEvent,
  useCallback,
  useRef,
  useState,
} from "react";
import warning from "warning";
import { Input, InputProps } from "../input";
import { calcFirstHiddenIndex } from "./internal/calcFirstHiddenIndex";
import { defaultItemToString } from "./internal/defaultItemToString";
import { InputPill } from "./internal/InputPill";
import { InputRuler } from "./internal/InputRuler";
import { useResizeObserver } from "./internal/useResizeObserver";
import { useWidth } from "./internal/useWidth";
import {
  TokenizedInputHelpers,
  TokenizedInputState,
} from "./useTokenizedInput";

export type RemoveItemHandler = (itemIndex: number) => void;
export type ItemToString<Item> = (item: Item) => string;
export type ExpandButtonProps = Pick<
  ButtonProps,
  "role" | "aria-roledescription" | "aria-describedby"
> & { accessibleText?: string };

export interface TokenizedInputBaseProps<Item>
  extends Partial<TokenizedInputState<Item>>,
    Omit<
      HTMLAttributes<HTMLDivElement>,
      "onFocus" | "onBlur" | "onChange" | "onKeyUp" | "onKeyDown"
    > {
  ExpandButtonProps?: ExpandButtonProps;
  InputProps?: Pick<InputProps, "aria-describedby" | "inputProps">;
  disabled?: boolean;
  expandButtonRef?: Ref<HTMLButtonElement>;
  helpers: TokenizedInputHelpers<Item>;
  inputRef?: Ref<HTMLInputElement>;
  itemToString?: ItemToString<Item>;
  onFocus?: FocusEventHandler<HTMLInputElement | HTMLButtonElement>;
  onBlur?: FocusEventHandler<HTMLInputElement | HTMLButtonElement>;
  onKeyUp?: KeyboardEventHandler<HTMLInputElement>;
  // Can key down on either input or expand button
  onKeyDown?: KeyboardEventHandler<HTMLInputElement | HTMLButtonElement>;
  onRemoveItem?: RemoveItemHandler;
  onInputBlur?: FocusEventHandler<HTMLInputElement>;
  onInputFocus?: FocusEventHandler<HTMLInputElement>;
  onInputChange?: ChangeEventHandler<HTMLInputElement>;
  onInputSelect?: ReactEventHandler<HTMLInputElement>;
  onClick?: (event: SyntheticEvent<HTMLElement>) => void;
  onClear?: ReactEventHandler;
}

const INITIAL_INPUT_WIDTH = 5;
const withBaseName = makePrefixer("uitkTokenizedInput");

const getItemsAriaLabel = (itemCount: number) =>
  itemCount === 0
    ? "no item selected"
    : `${itemCount} ${itemCount > 1 ? "items" : "item"}`;

const hasHelpers = (helpers: any) => {
  if (process.env.NODE_ENV !== "production") {
    warning(
      helpers != null,
      'TokenizedInputBase is used without helpers. You should pass in "helpers" from "useTokenizedInput".'
    );
  }
  return helpers != null;
};

export const TokenizedInputBase = forwardRef(function TokenizedInputBase<Item>(
  props: TokenizedInputBaseProps<Item>,
  ref: ForwardedRef<HTMLDivElement>
) {
  const {
    InputProps = {},
    ExpandButtonProps = {},
    className,
    activeIndices = [],
    selectedItems = [],
    highlightedIndex,
    value,
    focused,
    expanded,
    disabled,
    helpers,
    onFocus,
    onBlur,
    onKeyUp,
    onKeyDown,
    onRemoveItem,
    onInputChange,
    onInputFocus,
    onInputBlur,
    onInputSelect,
    onClear,
    onClick,
    inputRef,
    itemToString = defaultItemToString,
    id: idProp,
    expandButtonRef: expandButtonRefProp,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    ...restProps
  } = props;

  const density = useDensity();

  const id = useId(idProp);
  const inputId = `${id}-input`;
  const expandButtonId = `${id}-expand-button`;
  const clearButtonId = `${id}-clear-button`;

  // TODO: Use proper machanism to get variable values from theme in React. Something like below
  // getComputedStyle(document.documentElement)
  // .getPropertyValue('--my-variable-name'); // #999999
  const pillGroupPadding = 16;
  const lastVisiblePillMargin = 4;

  const pillsRef = useRef<{ [index: number]: number | undefined }>({});
  const inputRulerRef = useRef<HTMLSpanElement | null>(null);
  const keydownExpandButton = useRef(false);

  const [expandButtonRef, expandButtonWidth] = useWidth(density);
  const [clearButtonRef, clearButtonWidth] = useWidth(density);
  const [inputWidth, setInputWidth] = useState(INITIAL_INPUT_WIDTH);
  const [pillGroupWidth, setPillGroupWidth] = useState<number | null>(null);
  const [firstHiddenIndex, setFirstHiddenIndex] = useState<number | null>(null);

  const showExpandButton = !expanded && firstHiddenIndex != null;

  const widthOffset =
    pillGroupPadding +
    INITIAL_INPUT_WIDTH +
    (expanded ? clearButtonWidth : expandButtonWidth);

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

  useIsomorphicLayoutEffect(() => {
    if (expanded && inputRulerRef.current) {
      const newInputWidth = inputRulerRef.current.scrollWidth;
      setInputWidth(Math.min(newInputWidth, pillGroupWidth || 0));
    }
  }, [expanded, pillGroupWidth, value]);

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

  const handleInputKeyUp = (event: KeyboardEvent<HTMLInputElement>) => {
    // Call keydown again if the initail event has been used to expand the input
    if (keydownExpandButton.current && "Enter" !== event.key) {
      keydownExpandButton.current = false;

      if (onKeyDown) {
        onKeyDown(event);
      }
    }

    if (onKeyUp) {
      onKeyUp(event);
    }
  };

  const handleExpand = (event: SyntheticEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    if (hasHelpers(helpers)) {
      helpers.updateExpanded(true);
    }
  };

  const handleClearButtonFocus = (event: FocusEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    if (hasHelpers(helpers)) {
      helpers.setFocused(false);
      helpers.cancelBlur();
    }
  };

  const selectedItemIds = selectedItems.map(
    (_, index) => `${id}-pill-${index}`
  );

  const inputAriaLabelledBy = disabled
    ? [ariaLabelledBy, inputId, ...selectedItemIds]
    : [ariaLabelledBy, inputId];

  const mergedInputProps = deepmerge(
    {
      inputProps: {
        style: {
          width: inputWidth,
          minWidth: inputWidth,
        },
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

  return (
    <div
      {...restProps}
      className={classnames(
        withBaseName(),
        {
          [withBaseName("focused")]: focused,
          [withBaseName("expanded")]: expanded,
          [withBaseName("disabled")]: disabled,
        },
        className
      )}
      id={id}
      onClick={onClick}
      ref={useForkRef(ref, containerRef)}
    >
      <span
        aria-owns={selectedItemIds.join(" ")}
        className={withBaseName("hidden")}
        role="listbox"
      />
      <div className={withBaseName("pillGroup")}>
        {selectedItems.map((item, index) => {
          const label = itemToString(item);

          return (
            <InputPill
              active={activeIndices.indexOf(index) !== -1}
              disabled={disabled}
              hidden={showExpandButton && index >= firstHiddenIndex}
              highlighted={index === highlightedIndex}
              id={`${id}-pill-${index}`}
              index={index}
              key={`${index}-${label}`}
              label={label}
              lastVisible={
                !showExpandButton && index === selectedItems.length - 1
              }
              onDelete={expanded ? onRemoveItem : undefined}
              pillsRef={pillsRef}
            />
          );
        })}
        <Button
          aria-labelledby={[ariaLabelledBy, inputId, expandButtonId]
            .filter(Boolean)
            .join(" ")}
          className={classnames(withBaseName("expandButton"), {
            [withBaseName("hidden")]: !showExpandButton,
          })}
          disabled={disabled}
          id={expandButtonId}
          onBlur={onBlur}
          onClick={handleExpand}
          onFocus={onFocus}
          onKeyDown={handleExpandButtonKeyDown}
          ref={useForkRef(expandButtonRef, expandButtonRefProp)}
          variant="secondary"
          {...restExpandButtonProps}
        >
          <OverflowMenuIcon
            aria-label={
              expandButtonAccessibleText === undefined
                ? "expand edit"
                : expandButtonAccessibleText
            }
          />
        </Button>
        <Input
          {...mergedInputProps}
          className={classnames(
            withBaseName("input"),
            withBaseName("inputField"),
            {
              [withBaseName("hidden")]: showExpandButton,
            }
          )}
          disabled={disabled}
          id={inputId}
          // TODO: Use multi line input when available
          // multiline
          onBlur={onInputBlur}
          onChange={onInputChange}
          onFocus={onInputFocus}
          onKeyDown={onKeyDown}
          onKeyUp={handleInputKeyUp}
          onSelect={onInputSelect}
          renderSuffix={() => <InputRuler ref={inputRulerRef} value={value} />}
          value={value}
          ref={inputRef}
        />
      </div>
      <Button
        className={classnames(withBaseName("clearButton"), {
          [withBaseName("hidden")]: !expanded || selectedItems.length === 0,
        })}
        disabled={disabled}
        id={clearButtonId}
        onBlur={onBlur}
        onClick={onClear}
        onFocus={handleClearButtonFocus}
        ref={clearButtonRef}
        variant="secondary"
        data-testid="clear-button"
      >
        <CloseIcon aria-label="clear input" />
      </Button>
    </div>
  );
}) as <Item>(
  p: TokenizedInputBaseProps<Item> & { ref?: ForwardedRef<HTMLDivElement> }
) => ReactElement<TokenizedInputBaseProps<Item>>;
