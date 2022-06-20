//TODO remove when popout code has been migrated
/* eslint-disable @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access */
import { useControlled, useDensity } from "@jpmorganchase/uitk-core";
import copy from "clipboard-copy";
import {
  ChangeEvent,
  FocusEvent,
  InputHTMLAttributes,
  KeyboardEvent,
  KeyboardEventHandler,
  Ref,
  SetStateAction,
  SyntheticEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import warning from "warning";
import { useFormFieldProps } from "../form-field-context";
import { escapeRegExp, ownerWindow, useEventCallback, useId } from "../utils";
import { defaultItemToString } from "./internal/defaultItemToString";
import { getCursorPosition } from "./internal/getCursorPosition";
import { TokenizedInputProps } from "./TokenizedInput";
import { TokenizedInputBaseProps } from "./TokenizedInputBase";

export interface TokenizedInputState<Item> {
  activeIndices: Array<number>;
  expanded: boolean | undefined;
  focused: boolean;
  highlightedIndex: number | undefined;
  selectedItems: Array<Item>;
  value: string | undefined;
}

export interface TokenizedInputHelpers<Item> {
  cancelBlur: () => void;
  setFocused: (expanded: boolean) => void;
  setHighlightedIndex: (value?: number) => void;
  setValue: (value: string) => void;
  setSelectedItems: (selectedItems: Array<Item>) => void;
  updateExpanded: (expanded: boolean) => void;
}

// Timeout to accommodate blur from the input and a click inside of the container
const BLUR_TIMEOUT = 200;

/**
 * Map of the height of TokenizedInput in different density.
 * We have to keep a map of this as we can't always measure the height of the input in it's
 * collapsed state, e.g. in a controlled 'expanded' state.
 */
const SINGLE_LINE_HEIGHT_MAP = {
  touch: 45,
  low: 36,
  medium: 28,
  high: 23,
};

function isValidItem<Item>(data: unknown): data is Item {
  return (
    (typeof data === "string" && Boolean(data.length)) ||
    (typeof data !== "string" && data != null)
  );
}

type useTokenizedInputResult<Item> = {
  /**
   * Used to do auto focus. It should be set to the actual input node.
   */
  inputRef: Ref<HTMLInputElement>;
  /**
   * The tokenized input state
   */
  state: TokenizedInputState<Item>;
  /**
   * Utility functions for modifying tokenized input state
   */
  helpers: TokenizedInputHelpers<Item>;
  /**
   * Properties applied to a basic tokenized input component
   */
  inputProps: Omit<TokenizedInputBaseProps<Item>, "helpers">;
};

export function useTokenizedInput<Item>(
  props: TokenizedInputProps<Item>
): useTokenizedInputResult<Item> {
  validateProps(props);

  const {
    inFormField,
    // @ts-ignore
    popoutMode,
    // @ts-ignore
    popoutActions,
    // @ts-ignore
    setIsPoppedOut,
    // @ts-ignore
    setManagedPopout,
    // @ts-ignore
    setIntendedHeight,
    a11yProps: {
      "aria-labelledby": ariaLabelledBy,
      disabled: formFieldDisabled,
    } = {},
  } = useFormFieldProps(); // FIXME: FormField Props

  const density = useDensity();

  const {
    delimiter = ",",
    initialSelectedItems = [],
    itemToString = defaultItemToString,
    stringToItem = (_, value) => value.trim(),
    disabled = formFieldDisabled,
    disableAddOnBlur,
    onFocus,
    onBlur,
    onClick,
    onExpand,
    onCollapse,
    onKeyUp,
    onKeyDown,
    onInputSelect,
    onInputChange,
    onInputFocus,
    onInputBlur,
    onClear,
    id: idProp,
    value: valueProp,
    expanded: expandedProp,
    selectedItems: selectedItemsProp,
    onChange: onChangeProp,
    "aria-label": ariaLabel,
    ...restProps
  } = props;

  const id = useId(idProp);

  const [value, setValue, isInputControlled] = useControlled<
    string | undefined
  >({
    controlled: valueProp,
    default: "",
    name: "TokenizedInput",
    state: "value",
  });

  const [
    // TODO: Check whether defaultValue of [] changes the logic
    selectedItems = [],
    setSelectedItems,
    isSelectionControlled,
  ] = useControlled<Item[] | undefined>({
    controlled: selectedItemsProp,
    default: initialSelectedItems,
    name: "TokenizedInput",
    state: "selectedItems",
  });

  const [expanded, setExpanded, isExpandedControlled] = useControlled<boolean>({
    controlled: expandedProp,
    default: false,
    name: "TokenizedInput",
    state: "expanded",
  });

  const [activeIndices, setActiveIndices] = useState<number[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState<number | undefined>(
    undefined
  );
  const [focused, setFocusedState] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const blurTimeout = useRef<number | null>(null);
  const preventBlurOnCopy = useRef(false);
  const hasActiveItems = Boolean(activeIndices.length);

  const delimiters = ([] as string[]).concat(delimiter);
  const primaryDelimiter = delimiters[0];
  const delimiterRegex = new RegExp(
    delimiters.map(escapeRegExp).join("|"),
    "gi"
  );

  const onChange = useEventCallback((selectedItems: Item[] | undefined) => {
    if (onChangeProp) {
      onChangeProp(selectedItems);
    }
  });

  const cancelBlur = useCallback(() => {
    if (blurTimeout.current) {
      clearTimeout(blurTimeout.current);
    }
    blurTimeout.current = null;
  }, []);

  const focusInput = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.focus();

      if (popoutMode && setIsPoppedOut) {
        setIsPoppedOut(true);
      }
    }
  }, [popoutMode, setIsPoppedOut]);

  useEffect(
    () => () => {
      cancelBlur();
    },
    [cancelBlur]
  );

  useEffect(() => {
    if (expanded) {
      focusInput();
    }
  }, [expanded, focusInput]);

  useEffect(() => {
    if (popoutMode && setManagedPopout) {
      setManagedPopout(true);

      setIntendedHeight(SINGLE_LINE_HEIGHT_MAP[density]);
    }
  }, [density, popoutMode, setIntendedHeight, setManagedPopout]);

  const updateInputValue = (newValue: string | undefined) => {
    if (!isInputControlled) {
      setValue(newValue);
    }
  };

  const updateSelectedItems = useCallback(
    (action: SetStateAction<Item[] | undefined>) => {
      if (!isSelectionControlled) {
        setSelectedItems((prevSelectedItems?: Item[]) => {
          const newItems =
            typeof action === "function" ? action(prevSelectedItems) : action;

          if (newItems !== prevSelectedItems) {
            onChange(newItems);
          }

          return newItems;
        });
      } else {
        onChange(typeof action === "function" ? action(selectedItems) : action);
      }
    },
    [isSelectionControlled, setSelectedItems, onChange, selectedItems]
  );

  const updateExpanded = (newExpanded: boolean) => {
    if (!isExpandedControlled) {
      setExpanded(newExpanded);
    }

    if (newExpanded) {
      onExpand && onExpand();
    } else {
      onCollapse && onCollapse();
    }

    if (popoutMode && popoutActions) {
      popoutActions.refresh();
    }
  };

  const setFocused = (newState: boolean) => {
    setFocusedState(newState);
  };

  const resetInput = () => {
    updateInputValue("");
    setHighlightedIndex(undefined);
    setActiveIndices([]);
  };

  const removeItems = useCallback(
    (itemIndices: number[]) => {
      updateSelectedItems(
        (prevSelectedItems) =>
          prevSelectedItems &&
          (prevSelectedItems.length === 0
            ? prevSelectedItems
            : prevSelectedItems.filter(
                (_, index) => itemIndices.indexOf(index) === -1
              ))
      );
    },
    [updateSelectedItems]
  );

  const handleInputFocus = (event: FocusEvent<HTMLInputElement>) => {
    event.stopPropagation();

    // The input will lose focus when building the text to copy in a temporary
    // DOM node. This is particularly visible in a slower browser, i.e. IE 11.
    // This is to prevent a blur in that scenario.
    if (preventBlurOnCopy.current) {
      preventBlurOnCopy.current = false;
      setActiveIndices(
        Array.from(
          { length: selectedItems ? selectedItems.length : 0 },
          (_, index) => index
        )
      );
      return;
    }

    setFocused(true);

    if (onInputFocus) {
      onInputFocus(event);
    }

    if (blurTimeout.current !== null) {
      cancelBlur();
    } else {
      updateExpanded(true);

      if (onFocus) {
        onFocus(event);
      }
    }
  };

  const handleInputBlur = (event: FocusEvent<HTMLInputElement>) => {
    event.stopPropagation();

    setFocused(false);
    setHighlightedIndex(undefined);
    setActiveIndices([]);

    if (onInputBlur) {
      onInputBlur(event);
    }

    handleBlur(event);
  };

  const handleBlur = (
    event: FocusEvent<HTMLInputElement | HTMLButtonElement>
  ) => {
    if (preventBlurOnCopy.current) {
      return focusInput();
    }

    event.persist();

    blurTimeout.current = setTimeout(() => {
      blurTimeout.current = null;
      updateExpanded(false);

      if (!disableAddOnBlur) {
        handleAddItems(value, true);
      }

      if (onBlur) {
        onBlur(event);
      }

      if (popoutMode && setIsPoppedOut) {
        setIsPoppedOut(false);
      }
    }, BLUR_TIMEOUT) as unknown as number;
  };

  const handleClick = (event: SyntheticEvent<HTMLElement>) => {
    updateExpanded(true);
    setActiveIndices([]);
    focusInput();

    if (onClick) {
      onClick(event);
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setHighlightedIndex(undefined);

    if (onInputChange) {
      onInputChange(event);
    }

    const newValue = event.target.value;

    if (delimiterRegex.test(newValue)) {
      // Process value with delimiters
      handleAddItems(newValue);
    } else {
      // Just update input value if there is no delimiter
      updateInputValue(newValue);
    }
  };

  const handleAddItems = (
    newValue: string | undefined,
    appendOnly?: boolean
  ) => {
    if (!newValue || newValue.length === 0) {
      return;
    }

    resetInput();

    const newItems = newValue
      .split(delimiterRegex)
      .reduce<Item[]>((values, part) => {
        const newItem = stringToItem(
          hasActiveItems ? values : selectedItems.concat(values),
          part
        );
        return isValidItem<Item>(newItem) ? values.concat(newItem) : values;
      }, []);

    if (newItems.length) {
      updateSelectedItems((prevSelectedItems = []) =>
        hasActiveItems && !appendOnly
          ? newItems
          : prevSelectedItems.concat(newItems)
      );
    }
  };

  const handleRemoveItem = useCallback(
    (itemIndex) => {
      focusInput();
      removeItems([itemIndex]);
    },
    [focusInput, removeItems]
  );

  const handleClear = (event: ChangeEvent<HTMLInputElement>) => {
    updateSelectedItems([]);
    resetInput();
    focusInput();

    if (onClear) {
      onClear(event);
    }

    if (popoutMode && popoutActions) {
      popoutActions.refresh();
    }
  };

  const cursorAtInputStart = () =>
    getCursorPosition(inputRef) === 0 && Boolean(selectedItems.length);

  const highlightAtPillGroupEnd = () =>
    highlightedIndex === selectedItems.length - 1;

  const pillGroupKeyDownHandlers: {
    [key: string]: KeyboardEventHandler<HTMLInputElement>;
  } = {
    ArrowLeft: (event) => {
      event.preventDefault();
      setHighlightedIndex((prevHighlightedIndex) =>
        prevHighlightedIndex == null
          ? selectedItems.length - 1
          : Math.max(0, prevHighlightedIndex - 1)
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
          : Math.min(selectedItems.length - 1, prevHighlightedIndex + 1)
      );
    },
    Backspace: (event) => {
      event.preventDefault();
      handleRemoveItem(highlightedIndex);
      setHighlightedIndex((prevHighlightedIndex) =>
        prevHighlightedIndex == null
          ? prevHighlightedIndex
          : Math.max(0, prevHighlightedIndex - 1)
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
      handleRemoveItem(highlightedIndex);
    },
    Delete: (event) => {
      event.preventDefault();
      handleRemoveItem(highlightedIndex);
    },
    " ": (event) => {
      event.preventDefault();
      handleRemoveItem(highlightedIndex);
    },
  };

  const inputKeyDownHandlers: {
    [key: string]: KeyboardEventHandler<HTMLInputElement>;
  } = {
    ArrowLeft: (event) => {
      if (cursorAtInputStart()) {
        event.preventDefault();
        setHighlightedIndex(selectedItems.length - 1);
      }
    },
    Backspace: () => {
      if (hasActiveItems) {
        removeItems(activeIndices);
      } else if (cursorAtInputStart()) {
        setHighlightedIndex(selectedItems.length - 1);
      }
    },
    Delete: () => {
      if (hasActiveItems) {
        removeItems(activeIndices);
      }
    },
    Enter: (event) => {
      event.preventDefault();

      if (hasActiveItems) {
        removeItems(activeIndices);
      } else {
        handleAddItems(value);
      }
    },
  };

  const handleCtrlModifierKeyDown: InputHTMLAttributes<HTMLInputElement>["onKeyDown"] =
    (event) => {
      const win = ownerWindow(event.target as HTMLElement);
      const supportClipboard = win.navigator && win.navigator.clipboard;

      switch (event.key.toUpperCase()) {
        case "A":
          // Select all
          setHighlightedIndex(undefined);
          setActiveIndices(
            Array.from({ length: selectedItems.length }, (_, index) => index)
          );
          break;
        case "C":
          // Copy
          copy(
            activeIndices
              .map((index) => itemToString(selectedItems[index]))
              .concat(value != null ? String(value).trim() : "")
              .filter(Boolean)
              .join(primaryDelimiter)
          )
            .then((result) => {
              preventBlurOnCopy.current = !supportClipboard;
              return result;
            })
            .catch((error) => {
              warning(false, error);
            });
          break;
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
            handleRemoveItem(selectedItems.length - 1);
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

  const handleCommonKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const eventKey = event.key.toUpperCase();

    if (eventKey === "ESCAPE") {
      event.preventDefault();
      resetInput();
    } else if (eventKey === "TAB" && !disableAddOnBlur) {
      // Pressing Tab adds a new value
      handleAddItems(value);
    }
  };

  const handleKeyDown: InputHTMLAttributes<HTMLInputElement>["onKeyDown"] = (
    event
  ) => {
    if (onKeyDown) {
      onKeyDown(event);
    }
    if (event.defaultPrevented) {
      return;
    }
    if (
      event.ctrlKey ||
      event.metaKey ||
      ["CONTROL", "META"].indexOf(event.key.toUpperCase()) !== -1
    ) {
      handleCtrlModifierKeyDown(event);
    } else {
      let handler;

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

    if (popoutMode && popoutActions) {
      popoutActions.refresh();
    }
  };

  const state: TokenizedInputState<Item> = {
    value,
    selectedItems,
    activeIndices,
    highlightedIndex,
    expanded,
    focused: !inFormField && focused,
  };

  const eventHandlers = {
    // onFocus is a focus on the expand button
    // It can also be triggered by a focus on the input
    onFocus,
    // onBlur is a blur from the expand button when it's collapsed
    // It can also be triggered by the clear button
    onBlur: expanded ? handleBlur : onBlur,
    onClick: handleClick,
    onInputSelect,
    onInputChange: handleInputChange,
    onInputFocus: handleInputFocus,
    onInputBlur: handleInputBlur,
    onKeyDown: handleKeyDown,
    onRemoveItem: handleRemoveItem,
    onClear: handleClear,
  };

  return {
    inputRef,
    state,
    helpers: {
      cancelBlur,
      setValue,
      setSelectedItems,
      setHighlightedIndex,
      setFocused,
      updateExpanded,
    },
    inputProps: {
      id,
      itemToString,
      disabled,
      "aria-labelledby": ariaLabelledBy,
      "aria-label": ariaLabel,
      ...state,
      ...restProps,
      ...(disabled ? {} : eventHandlers),
    },
  };
}

const validateProps = function validateProps<Item>(
  props: TokenizedInputProps<Item>
) {
  if (process.env.NODE_ENV !== "production") {
    const { delimiter } = props;

    /* eslint-disable react-hooks/rules-of-hooks */
    useEffect(() => {
      warning(
        delimiter == null ||
          isValidDelimiter(delimiter) ||
          (Array.isArray(delimiter) && delimiter.every(isValidDelimiter)),
        "TokenizedInput delimiter should be a single character or an array of single characters"
      );
    }, [delimiter]);
    /* eslint-enable react-hooks/rules-of-hooks */
  }
};

const isValidDelimiter = (value: unknown) =>
  typeof value === "string" && value.length === 1;
