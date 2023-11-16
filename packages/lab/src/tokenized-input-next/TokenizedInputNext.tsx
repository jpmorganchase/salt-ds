import {
  ChangeEvent, createRef, FocusEvent,
  forwardRef,
  KeyboardEvent,
  MouseEvent, useCallback, useRef,
  useState
} from "react";
import {
  Button,
  makePrefixer,
  MultilineInput,
  Tooltip, useForkRef,
  useIsFocusVisible
} from "@salt-ds/core";
import {useTokenizedInputContext} from "./TokenizedInputNextContext";
import {CloseIcon} from "@salt-ds/icons";

import tokenizedInputNextCss from "./TokenizedInputNext.css";
import {useWindow} from "@salt-ds/window";
import {useComponentCssInjection} from "@salt-ds/styles";
import {getCursorPosition} from "../tokenized-input/internal/getCursorPosition";
import {InputPillNext} from "./InputPill";
import {clsx} from "clsx";

const withBaseName = makePrefixer("saltTokenizedInputNext");

export interface TokenizedInputNextProps {
  delimiter: string | string[],

  onClear?: (event) => void;
  onKeyDown?: (event) => void;
}

export const TokenizedInputNext = forwardRef<HTMLDivElement, TokenizedInputNextProps>(function TokenizedInputNext(
  {
    delimiter = ',',
    selected,
    initialSelectedItems = [],
    disabled,
    expanded,
    className,
    onKeyDown,
    onClear,
    onChange,
    onBlur: onBlurProp,
    onFocus: onFocusProp,
    ...rest
  }, ref
) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-tokenized-input-next",
    css: tokenizedInputNextCss,
    window: targetWindow,
  });

  const {
    isFocusVisibleRef,
    ref: focusVisibleRef,
    onFocus,
    onBlur,
  } = useIsFocusVisible<HTMLDivElement>();

  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const [selectedItems, setSelectedItems] = useState<string[]>(initialSelectedItems);
  const [isFocused, setIsFocused] = useState(false);
  const [isFocusVisible, setIsFocusVisible] = useState(false);
  const [value, setValue] = useState<string>('');
  const [highlightedIndex, setHighlightedIndex] = useState<number | undefined>(
    undefined
  );

  const cursorAtInputStart = () =>
    getCursorPosition(inputRef) === 0 && Boolean(selectedItems.length);

  // Handlers
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const {key, ctrlKey, metaKey} = event;

    onKeyDown?.(event);

    if (event.defaultPrevented) {
      return;
    }
    // TODO: enter only is a delimiter if focus is inside the input, not in buttons
    if (!cursorAtInputStart() && [","].includes(event.key)) {
      event.preventDefault();

      // if (value && isValid(value)) {
      if (value) {
        setSelectedItems([...selectedItems, value]);
        setValue('');
        console.log(value)
      }
      return;
    }
    switch (key) {
      case "ArrowLeft":
        if (cursorAtInputStart()) {
          event.preventDefault();
          setHighlightedIndex(selectedItems.length - 1);
        }
        break;
      default:
        break;
    }

  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setValue(value);
    onChange?.(event);
  };
  const resetInput = () => {
    setValue("");
    setSelectedItems([]);
    setHighlightedIndex(undefined);
    // setActiveIndices([]);
  };

  const handleClear = (event: MouseEvent<HTMLButtonElement>) => {
    console.log('clearing')
    resetInput();
    onClear?.(event);
    focusInput();
  };

  const handleRemoveItem = (event: { stopPropagation: () => void; }) => {
    event.stopPropagation();
    console.log(event)
    // setSelectedItems(selectedItems.filter(i => i !== item));
    focusInput();
  };
  const focusInput = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  const handleFocus = (event: FocusEvent<HTMLDivElement>) => {
    if (onFocusProp) {
      onFocusProp(event);
    }
    onFocus(event);
    setIsFocused(true);
    setIsFocusVisible(isFocusVisibleRef.current);
  }

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (onBlurProp) {
      onBlurProp(event);
    }
    onBlur();
    setIsFocused(false);
    setIsFocusVisible(false);
  }

  const tokenizedInputContext = useTokenizedInputContext();

  const hasSelectedItems = selectedItems.length > 0;

  return (
    <MultilineInput
      className={clsx(withBaseName(), isFocused && withBaseName("expanded"), className)}
      rows={1}
      startAdornment={
        //TODO: pass the on close conditional to if there is focus on the input, this way the pill button will iterate
        hasSelectedItems ? selectedItems.map(item => {
          // TODO: focusVisible could live in context and would not need to be passed in props
          return <InputPillNext key={item} content={item} onClose={handleRemoveItem}
                                focusVisible={isFocusVisible}
                                className={withBaseName('pill')}/>
        }) : null
      }
      value={value}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onChange={handleChange}
      endAdornment={
        // todo: remove x button if the input is read only
        hasSelectedItems &&
        <Button variant="secondary"
                onClick={(event) => handleClear(event)}><CloseIcon/></Button>
      }
      ref={useForkRef(ref, focusVisibleRef)}
      textAreaRef={inputRef}
      {...rest}
    />
  );
});
