import {
  ownerWindow,
  useControlled,
  useDensity,
  useForkRef,
  useFormFieldProps,
  useId,
  useIsomorphicLayoutEffect,
} from "@salt-ds/core";
import copy from "clipboard-copy";
import {
  type ChangeEvent,
  type FocusEvent,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type KeyboardEventHandler,
  type MutableRefObject,
  type Ref,
  type SetStateAction,
  type SyntheticEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { escapeRegExp } from "../utils";
import { calcFirstHiddenIndex } from "./internal/calcFirstHiddenIndex";
import { useResizeObserver } from "./internal/useResizeObserver";
import { getPadding, useWidth } from "./internal/useWidth";
import type { TokenizedInputNextProps } from "./TokenizedInputNext";

export interface TokenizedInputNextState<Item> {
  activeIndices: number[];
  expanded: boolean | undefined;
  highlightedIndex: number | undefined;
  selectedItems: Item[];
  value: string | undefined;
}

export interface TokenizedInputNextHelpers<Item> {
  setHighlightedIndex: (value?: number) => void;
  setValue: (value: string) => void;
  setSelectedItems: (selectedItems: Item[]) => void;
  updateExpanded: (event: SyntheticEvent, expanded: boolean) => void;
}

export interface TokenizedInputNextRefs {
  textAreaRef: Ref<HTMLTextAreaElement>;
  pillsRef: MutableRefObject<Record<number, number | undefined>>;
  clearButtonRef: (newNode: HTMLButtonElement) => void;
  expandButtonRef: Ref<HTMLButtonElement>;
  statusAdornmentRef: Ref<SVGSVGElement>;
  containerRef: Ref<HTMLDivElement>;
}

const getCursorPosition = (
  inputRef: MutableRefObject<HTMLTextAreaElement | null>,
) => {
  if (inputRef.current) {
    const { selectionStart, selectionEnd } = inputRef.current;

    // if there is no selection range
    if (selectionStart != null && selectionStart === selectionEnd) {
      return selectionStart;
    }
  }

  return -1;
};

const isCtrlModifier = (event: KeyboardEvent<HTMLTextAreaElement>) => {
  return (
    event.ctrlKey ||
    event.metaKey ||
    ["CONTROL", "META"].indexOf(event.key.toUpperCase()) !== -1
  );
};

function isValidItem<Item>(data: unknown): data is Item {
  return (
    (typeof data === "string" && Boolean(data.length)) ||
    (typeof data !== "string" && data != null)
  );
}

interface useTokenizedInputNextResult<Item> {
  /**
   * The tokenized input state
   */
  state: TokenizedInputNextState<Item>;
  /**
   * First hidden element when collapsed
   */
  firstHiddenIndex: number | null;
  /**
   * Utility functions for modifying tokenized input state
   */
  helpers: TokenizedInputNextHelpers<Item>;
  /**
   * Refs for tokenized input items.
   */
  refs: TokenizedInputNextRefs;
  /**
   * Properties applied to a basic tokenized input component
   */
  inputProps: Omit<TokenizedInputNextProps<Item>, "helpers" | "onChange">;
}

export function useTokenizedInputNext<Item>(
  props: TokenizedInputNextProps<Item>,
): useTokenizedInputNextResult<Item> {
  const {
    disabled: formFieldDisabled,
    readOnly,
    necessity,
    validationStatus,
    a11yProps: {
      "aria-describedby": ariaDescribedBy,
      "aria-labelledby": ariaLabelledBy,
    } = {},
  } = useFormFieldProps();

  const {
    delimiters = [","],
    defaultSelected = [],
    disabled = formFieldDisabled,
    readOnly: readOnlyProp,
    validationStatus: validationStatusProp,
    disableAddOnBlur,
    onBlur,
    onClick,
    onExpand,
    onCollapse,
    onKeyDown,
    onInputChange,
    onInputFocus,
    onInputBlur,
    onClear,
    onChange,
    id: idProp,
    value: valueProp,
    expanded: expandedProp,
    selectedItems: selectedItemsProp,
    "aria-label": ariaLabel,
    "aria-describedby": ariaDescribedByProp,
    expandButtonRef: expandButtonRefProp,
    ...restProps
  } = props;

  const density = useDensity();
  const id = useId(idProp);

  const [focused, setFocused] = useState(false);
  const [pillGroupWidth, setPillGroupWidth] = useState<number | null>(null);
  const [firstHiddenIndex, setFirstHiddenIndex] = useState<number | null>(null);
  const [activeIndices, setActiveIndices] = useState<number[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState<number | undefined>(
    undefined,
  );

  const [expandButtonHookRef, expandButtonWidth] = useWidth(density);
  const [clearButtonRef, clearButtonWidth] = useWidth(density);
  const [statusAdornmentRef, statusAdornmentWidth] = useWidth(density);
  const [inputRef, inputWidth] = useWidth(density);

  const containerRef = useRef<HTMLDivElement>(null);
  const pillsRef = useRef<Record<number, number | undefined>>({});
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const preventBlurOnCopy = useRef(false);
  const expandButtonRef = useForkRef(expandButtonHookRef, expandButtonRefProp);

  const hasActiveItems = Boolean(activeIndices.length);
  const primaryDelimiter = delimiters[0];
  const delimiterRegex = useMemo(
    () => new RegExp(delimiters.map(escapeRegExp).join("|"), "gi"),
    [delimiters],
  );

  const [value, setValue, isInputControlled] = useControlled<
    string | undefined
  >({
    controlled: valueProp,
    default: "",
    name: "TokenizedInputNext",
    state: "value",
  });

  const [selectedItems = [], setSelectedItems, isSelectionControlled] =
    useControlled<Item[] | undefined>({
      controlled: selectedItemsProp,
      default: defaultSelected,
      name: "TokenizedInputNext",
      state: "selectedItems",
    });

  const [expanded, setExpanded, isExpandedControlled] = useControlled<boolean>({
    controlled: expandedProp,
    default: false,
    name: "TokenizedInputNext",
    state: "expanded",
  });

  const widthOffset =
    inputWidth +
    statusAdornmentWidth +
    (expanded ? clearButtonWidth : expandButtonWidth);

  const containerObserverRef = useResizeObserver<HTMLDivElement>(
    useCallback(
      ([{ contentRect }]) => {
        const padding = getPadding(containerRef.current);
        setPillGroupWidth(contentRect.width - padding - widthOffset);
      },
      [widthOffset],
    ),
  );

  useIsomorphicLayoutEffect(
    () => () => {
      // When density changes, set hidden index to null so that pills are in their
      // readonly state before they are measured.
      setFirstHiddenIndex(null);
    },
    [density],
  );

  // useIsomorphicLayoutEffect because of potential layout change
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
              Boolean,
            ) as number[],
          }),
        );
      }
    },
    // Additional dependency on selectedItems is for the controlled version
    [expanded, pillGroupWidth, selectedItems],
  );

  const focusInput = useCallback(() => {
    if (textAreaRef.current) {
      textAreaRef.current.focus();
    }
  }, []);

  const updateInputValue = (newValue: string | undefined) => {
    if (!isInputControlled) {
      setValue(newValue);
    }
  };

  const updateSelectedItems = useCallback(
    (event: SyntheticEvent, action: SetStateAction<Item[] | undefined>) => {
      if (!isSelectionControlled) {
        setSelectedItems((prevSelectedItems?: Item[]) => {
          const newItems =
            typeof action === "function" ? action(prevSelectedItems) : action;

          if (newItems !== prevSelectedItems) {
            onChange?.(event, newItems);
          }
          return newItems;
        });
      } else {
        onChange?.(
          event,
          typeof action === "function" ? action(selectedItems) : action,
        );
      }
    },
    [isSelectionControlled, onChange, selectedItems],
  );

  const updateExpanded = (event: SyntheticEvent, newExpanded: boolean) => {
    if (!isExpandedControlled) {
      setExpanded(newExpanded);
    }

    if (newExpanded) {
      focusInput();
      onExpand?.(event);
    } else {
      onCollapse?.(event);
    }
  };

  const resetInput = () => {
    updateInputValue("");
    setHighlightedIndex(undefined);
    setActiveIndices([]);
  };

  const removeItems = useCallback(
    (event: SyntheticEvent, itemIndices: number[]) => {
      updateSelectedItems(
        event,
        (prevSelectedItems) =>
          prevSelectedItems &&
          (prevSelectedItems.length === 0
            ? prevSelectedItems
            : prevSelectedItems.filter(
                (_, index) => itemIndices.indexOf(index) === -1,
              )),
      );
    },
    [updateSelectedItems],
  );

  const handleInputFocus = (event: FocusEvent<HTMLTextAreaElement>) => {
    event.stopPropagation();

    // The input will lose focus when building the text to copy in a temporary
    // DOM node. This is particularly visible in a slower browser, i.e. IE 11.
    // This is to prevent a blur in that scenario.
    if (preventBlurOnCopy.current) {
      preventBlurOnCopy.current = false;
      setActiveIndices(
        Array.from(
          { length: selectedItems ? selectedItems.length : 0 },
          (_, index) => index,
        ),
      );
      return;
    }

    onInputFocus?.(event);
    updateExpanded(event, true);
    setFocused(true);
  };

  const handleBlur = (
    event: FocusEvent<HTMLTextAreaElement | HTMLButtonElement>,
  ) => {
    onBlur?.(event);
    setFocused(false);
    updateExpanded(event, false);
  };

  const handleInputBlur = (event: FocusEvent<HTMLTextAreaElement>) => {
    // Check if the related target inside TokenizedInput
    const container = containerRef?.current;
    const eventTarget = event.relatedTarget;
    event.preventDefault();
    event.stopPropagation();
    setHighlightedIndex(undefined);
    setActiveIndices([]);
    if (!disableAddOnBlur) {
      handleAddItems(event, value);
    }
    onInputBlur?.(event);
    if (
      eventTarget !== container &&
      !container?.contains(eventTarget as Node)
    ) {
      handleBlur(event);
    }
  };

  const handleClick = (event: SyntheticEvent<HTMLElement>) => {
    updateExpanded(event, true);
    setActiveIndices([]);
    onClick?.(event);
  };

  const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setHighlightedIndex(undefined);

    onInputChange?.(event);

    const newValue = event.target.value;

    if (delimiterRegex.test(newValue)) {
      // Process value with delimiters
      handleAddItems(event, newValue);
    } else {
      // Just update input value if there is no delimiter
      updateInputValue(newValue);
    }
  };

  const handleAddItems = (
    event: SyntheticEvent,
    newValue: string | undefined,
    appendOnly?: boolean,
  ) => {
    if (!newValue || newValue.length === 0) {
      return;
    }

    resetInput();

    const newItems = newValue
      .split(delimiterRegex)
      .reduce<Item[]>((values, item) => {
        const newItem = item.trim();
        return isValidItem<Item>(newItem) ? values.concat(newItem) : values;
      }, []);

    if (newItems.length) {
      updateSelectedItems(event, (prevSelectedItems = []) =>
        hasActiveItems && !appendOnly
          ? newItems
          : prevSelectedItems.concat(newItems),
      );
    }
  };

  const handleRemoveItem = (event: SyntheticEvent, itemIndex?: number) => {
    focusInput();
    if (itemIndex !== undefined && !readOnly && !readOnlyProp) {
      removeItems(event, [itemIndex]);
    }
  };

  const handleClear = (event: ChangeEvent<HTMLTextAreaElement>) => {
    updateSelectedItems(event, []);
    resetInput();
    focusInput();
    onClear?.(event);
  };

  const cursorAtInputStart = () =>
    getCursorPosition(textAreaRef) === 0 && Boolean(selectedItems.length);

  const highlightAtPillGroupEnd = () =>
    highlightedIndex === selectedItems.length - 1;

  const pillGroupKeyDownHandlers: Record<
    string,
    KeyboardEventHandler<HTMLTextAreaElement>
  > = {
    ArrowLeft: (event) => {
      event.preventDefault();
      setHighlightedIndex((prevHighlightedIndex) =>
        prevHighlightedIndex == null
          ? selectedItems.length - 1
          : Math.max(0, prevHighlightedIndex - 1),
      );
    },
    ArrowRight: (event) => {
      if (highlightAtPillGroupEnd()) {
        return setHighlightedIndex(undefined);
      }

      event.preventDefault();
      setHighlightedIndex((prevHighlightedIndex) =>
        prevHighlightedIndex == null
          ? prevHighlightedIndex
          : Math.min(selectedItems.length - 1, prevHighlightedIndex + 1),
      );
    },
    Backspace: (event) => {
      event.preventDefault();
      handleRemoveItem(event, highlightedIndex);
      setHighlightedIndex((prevHighlightedIndex) =>
        prevHighlightedIndex == null
          ? prevHighlightedIndex
          : Math.max(0, prevHighlightedIndex - 1),
      );
    },
    Home: (event) => {
      event.preventDefault();
      setHighlightedIndex(0);
    },
    End: (event) => {
      event.preventDefault();
      setHighlightedIndex(selectedItems.length - 1);
    },
    Enter: (event) => {
      event.preventDefault();
      handleRemoveItem(event, highlightedIndex);
    },
    Delete: (event) => {
      event.preventDefault();
      handleRemoveItem(event, highlightedIndex);
    },
    " ": (event) => {
      event.preventDefault();
      handleRemoveItem(event, highlightedIndex);
    },
  };

  const inputKeyDownHandlers: Record<
    string,
    KeyboardEventHandler<HTMLTextAreaElement>
  > = {
    ArrowLeft: (event) => {
      if (cursorAtInputStart()) {
        event.preventDefault();
        setHighlightedIndex(selectedItems.length - 1);
      }
    },
    Backspace: (event) => {
      if (hasActiveItems) {
        removeItems(event, activeIndices);
      } else if (cursorAtInputStart()) {
        setHighlightedIndex(selectedItems.length - 1);
      }
    },
    Delete: (event) => {
      if (hasActiveItems) {
        removeItems(event, activeIndices);
      }
    },
    Enter: (event) => {
      event.preventDefault();

      if (hasActiveItems) {
        removeItems(event, activeIndices);
      } else {
        handleAddItems(event, value);
      }
    },
  };

  const handleCtrlModifierKeyDown: InputHTMLAttributes<HTMLTextAreaElement>["onKeyDown"] =
    (event) => {
      const win = ownerWindow(event.target as HTMLElement);
      const supportClipboard = win.navigator?.clipboard;

      switch (event.key.toUpperCase()) {
        case "A":
          // Select all
          setHighlightedIndex(undefined);
          setActiveIndices(
            Array.from({ length: selectedItems.length }, (_, index) => index),
          );
          break;
        case "C": {
          // Copy
          const textToCopy =
            activeIndices.length > 0
              ? activeIndices
                  .map((index) => String(selectedItems[index]))
                  .concat(value != null ? String(value).trim() : "")
                  .filter(Boolean)
                  .join(primaryDelimiter)
              : highlightedIndex !== undefined
                ? String(`${selectedItems[highlightedIndex]},`)
                : "";
          copy(textToCopy)
            .then((result) => {
              preventBlurOnCopy.current = !supportClipboard;
              return result;
            })
            .catch((error) => {
              console.error(error);
            });
          break;
        }
        case "V":
          // Paste - do nothing and let handleChange deal with it
          break;
        case "ARROWLEFT":
          pillGroupKeyDownHandlers.ArrowLeft(event);
          break;
        case "ARROWRIGHT":
          pillGroupKeyDownHandlers.ArrowRight(event);
          break;
        case "BACKSPACE":
          if (cursorAtInputStart()) {
            handleRemoveItem(event, selectedItems.length - 1);
          }
          break;
        case "CONTROL":
        case "META":
          // Do nothing
          break;
        default:
          // Otherwise, reset active items
          setActiveIndices([]);
      }
    };

  const handleCommonKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    const eventKey = event.key.toUpperCase();
    if (eventKey === "ESCAPE") {
      event.preventDefault();
      resetInput();
    } else if (eventKey === "TAB" && !disableAddOnBlur) {
      // Pressing Tab adds a new value
      handleAddItems(event, value);
    }
  };

  const handleKeyDown: InputHTMLAttributes<HTMLTextAreaElement>["onKeyDown"] = (
    event,
  ) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) {
      return;
    }
    if (isCtrlModifier(event)) {
      handleCtrlModifierKeyDown(event);
    } else {
      let handler: KeyboardEventHandler<HTMLTextAreaElement> | undefined;
      if (highlightedIndex == null) {
        handler = inputKeyDownHandlers[event.key];
        setActiveIndices([]);
      } else {
        handler = pillGroupKeyDownHandlers[event.key];
      }

      if (handler != null) {
        handler(event);
      } else {
        handleCommonKeyDown(event);
      }
    }
  };

  const state: TokenizedInputNextState<Item> = {
    value,
    selectedItems,
    activeIndices,
    highlightedIndex,
    expanded,
  };

  const eventHandlers = {
    // onFocus is a focus on the expand button
    // It can also be triggered by a focus on the input
    // onBlur is a blur from the expand button when it's collapsed
    // It can also be triggered by the clear button
    onBlur: expanded ? handleBlur : onBlur,
    onClick: handleClick,
    onInputChange: handleInputChange,
    onInputFocus: handleInputFocus,
    onInputBlur: handleInputBlur,
    onKeyDown: handleKeyDown,
    onRemoveItem: handleRemoveItem,
    onClear: handleClear,
  };

  return {
    state,
    firstHiddenIndex,
    refs: {
      textAreaRef: useForkRef(textAreaRef, inputRef),
      pillsRef,
      clearButtonRef,
      expandButtonRef,
      statusAdornmentRef,
      containerRef: useForkRef(containerRef, containerObserverRef),
    },
    helpers: {
      setValue,
      setSelectedItems,
      setHighlightedIndex,
      updateExpanded,
    },
    inputProps: {
      id,
      disabled,
      validationStatus: validationStatus ?? validationStatusProp,
      readOnly: readOnly ?? readOnlyProp,
      necessity: necessity,
      focused,
      "aria-labelledby": ariaLabelledBy,
      "aria-label": ariaLabel,
      "aria-describedby": ariaDescribedBy ?? ariaDescribedByProp,
      ...state,
      ...restProps,
      ...(disabled ? {} : eventHandlers),
    },
  };
}
